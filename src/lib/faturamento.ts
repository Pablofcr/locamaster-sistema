import { supabase } from './supabase'

// ============ HELPERS ============

export function formatarMoeda(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

export function formatarData(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR')
}

// ============ GERAR NUMERO SEQUENCIAL ============

export async function gerarNumeroFatura(): Promise<string> {
  const ano = new Date().getFullYear()
  const { count } = await supabase
    .from('faturas')
    .select('*', { count: 'exact', head: true })
    .like('numero', `FAT-${ano}-%`)

  const sequencial = (count || 0) + 1
  return `FAT-${ano}-${String(sequencial).padStart(3, '0')}`
}

// ============ CALCULO PRO RATA ============

export function calcularProRata(valorMensal: number, dataInicio: string, dataFim: string): number {
  const inicio = new Date(dataInicio + 'T12:00:00')
  const fim = new Date(dataFim + 'T12:00:00')
  const diasNoMes = new Date(inicio.getFullYear(), inicio.getMonth() + 1, 0).getDate()
  const diasUtilizados = Math.ceil((fim.getTime() - inicio.getTime()) / 86400000) + 1
  return Math.round((valorMensal / diasNoMes) * diasUtilizados * 100) / 100
}

// ============ PERIODOS DE CONTRATO ============

export interface PeriodoContrato {
  data_inicio: string
  data_fim: string
  valor_total: number
  dias: number
}

function diffDias(d1: string, d2: string): number {
  const a = new Date(d1 + 'T12:00:00')
  const b = new Date(d2 + 'T12:00:00')
  return Math.round((b.getTime() - a.getTime()) / 86400000) + 1
}

export function obterPeriodosContrato(locacao: any): PeriodoContrato[] {
  let historico: any[] = []
  try {
    historico = typeof locacao.historico_renovacoes === 'string'
      ? JSON.parse(locacao.historico_renovacoes)
      : (locacao.historico_renovacoes || [])
  } catch { historico = [] }

  if (!historico || historico.length === 0) {
    const dias = diffDias(locacao.data_inicio, locacao.data_fim)
    return [{ data_inicio: locacao.data_inicio, data_fim: locacao.data_fim, valor_total: Number(locacao.valor_total), dias }]
  }

  const periodos: PeriodoContrato[] = []

  // Primeiro periodo: do historico[0].periodo_anterior
  const p0 = historico[0].periodo_anterior
  if (p0?.data_inicio && p0?.data_fim) {
    const valor = Number(historico[0].valor_total_anterior) || Number(locacao.valor_total)
    const dias = diffDias(p0.data_inicio, p0.data_fim)
    periodos.push({ data_inicio: p0.data_inicio, data_fim: p0.data_fim, valor_total: valor, dias })
  }

  // Periodos intermediarios
  for (let i = 1; i < historico.length; i++) {
    const prevFim = historico[i - 1].periodo_anterior?.data_fim
    const currFim = historico[i].periodo_anterior?.data_fim
    if (prevFim && currFim) {
      const dInicio = proximoDia(prevFim)
      const valor = Number(historico[i].valor_total_anterior) || Number(locacao.valor_total)
      const dias = diffDias(dInicio, currFim)
      periodos.push({ data_inicio: dInicio, data_fim: currFim, valor_total: valor, dias })
    }
  }

  // Periodo final (atual): do ultimo historico.data_fim + 1 ate locacao.data_fim
  const ultimoFim = historico[historico.length - 1].periodo_anterior?.data_fim
  if (ultimoFim && locacao.data_fim) {
    const dInicio = proximoDia(ultimoFim)
    const dias = diffDias(dInicio, locacao.data_fim)
    periodos.push({ data_inicio: dInicio, data_fim: locacao.data_fim, valor_total: Number(locacao.valor_total), dias })
  }

  return periodos
}

function proximoDia(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

// ============ CALCULO VALOR MEDICAO (MES COMERCIAL 30 DIAS) ============
//
// Regra de calculo (V3 - Mês Comercial):
// Diária = valor_mensal / 30 (sempre fixo, mês comercial)
// Dias faturáveis = min(dias_reais_do_mês, 30) — dia 31 é desconsiderado
// Fevereiro = 30 dias comerciais — contrato ativo o mês inteiro cobra cheio
// Medição = diária × dias_utilizados (dentro dos dias faturáveis)

export function calcularValorMedicao(locacao: any, periodoReferencia: string): number {
  const [ano, mes] = periodoReferencia.split('-').map(Number)
  const diasReais = new Date(ano, mes, 0).getDate()
  const diasFaturaveis = Math.min(diasReais, 30)

  const mesStr = String(mes).padStart(2, '0')
  const inicioMes = `${ano}-${mesStr}-01`
  const fimMesFaturavel = `${ano}-${mesStr}-${String(diasFaturaveis).padStart(2, '0')}`

  const periodos = obterPeriodosContrato(locacao)
  if (periodos.length === 0) return 0

  let valorTotal = 0
  for (const periodo of periodos) {
    // Pular periodos que nao sobrepoem o intervalo faturavel
    if (periodo.data_fim < inicioMes || periodo.data_inicio > fimMesFaturavel) continue

    // Calcular dias efetivos do periodo dentro do intervalo faturavel
    const inicioNoMes = periodo.data_inicio > inicioMes ? periodo.data_inicio : inicioMes
    const fimNoMes = periodo.data_fim < fimMesFaturavel ? periodo.data_fim : fimMesFaturavel
    const diasUtilizados = diffDias(inicioNoMes, fimNoMes)

    if (diasUtilizados > 0) {
      // Diária fixa = valor_mensal / 30
      valorTotal += (periodo.valor_total / 30) * diasUtilizados
    }
  }

  return Math.round(valorTotal * 100) / 100
}

// ============ CALCULAR DATA VENCIMENTO POR CONDICAO ============

export function calcularDataVencimentoPorCondicao(
  periodoReferencia: string,
  condicao: string,
  diaFaturamento: number,
  diasParaVencimento: number
): string {
  const [ano, mes] = periodoReferencia.split('-').map(Number)
  const ultimoDiaMes = new Date(ano, mes, 0).getDate()

  let dataVenc: Date

  switch (condicao) {
    case 'antecipado':
      // Vencimento no 1o dia do mes de referencia
      dataVenc = new Date(ano, mes - 1, 1)
      break
    case 'final_periodo':
      // Ultimo dia do periodo (mes de referencia)
      dataVenc = new Date(ano, mes - 1, ultimoDiaMes)
      break
    case '5_dias_apos':
      // 5 dias apos o ultimo dia do periodo
      dataVenc = new Date(ano, mes - 1, ultimoDiaMes)
      dataVenc.setDate(dataVenc.getDate() + 5)
      break
    case '50_ato_30':
    default:
      // Dia de faturamento + dias para vencimento da config
      const dia = Math.min(diaFaturamento, ultimoDiaMes)
      dataVenc = new Date(ano, mes - 1, dia)
      dataVenc.setDate(dataVenc.getDate() + diasParaVencimento)
      break
  }

  return dataVenc.toISOString().split('T')[0]
}

// ============ PROXIMO FATURAMENTO ============

export function calcularProximoFaturamento(dataBase: string, diaFaturamento: number): string {
  const base = new Date(dataBase + 'T12:00:00')
  let ano = base.getFullYear()
  let mes = base.getMonth() + 1

  if (base.getDate() >= diaFaturamento) {
    mes += 1
    if (mes > 12) { mes = 1; ano += 1 }
  }

  const ultimoDiaMes = new Date(ano, mes, 0).getDate()
  const dia = Math.min(diaFaturamento, ultimoDiaMes)
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`
}

// ============ GERAR FATURA INDIVIDUAL ============

export async function gerarFatura(params: {
  locacao_id: number
  valor: number
  data_vencimento: string
  tipo?: string
  periodo_referencia?: string
  parcela_numero?: number
  parcela_total?: number
  fatura_pai_id?: number
  forma_pagamento?: string
  observacoes?: string
  gerada_automaticamente?: boolean
}) {
  const { data: locacao } = await supabase
    .from('locacoes')
    .select('*, clientes(telefone, email)')
    .eq('id', params.locacao_id)
    .single()

  if (!locacao) throw new Error('Locação não encontrada')

  const numero = await gerarNumeroFatura()
  const cliente = locacao.clientes as any

  const fatura = {
    numero,
    cliente_id: locacao.cliente_id,
    cliente_nome: locacao.cliente_nome,
    cliente_telefone: cliente?.telefone || '',
    cliente_email: cliente?.email || '',
    locacao_id: params.locacao_id,
    locacao_numero: locacao.numero,
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: params.data_vencimento,
    valor: params.valor,
    valor_original: params.valor,
    valor_pago: 0,
    status: 'emitido',
    tipo: params.tipo || 'avulsa',
    periodo_referencia: params.periodo_referencia || null,
    parcela_numero: params.parcela_numero || null,
    parcela_total: params.parcela_total || null,
    fatura_pai_id: params.fatura_pai_id || null,
    forma_pagamento: params.forma_pagamento || '',
    observacoes: params.observacoes || '',
    gerada_automaticamente: params.gerada_automaticamente || false,
  }

  const { data, error } = await supabase.from('faturas').insert(fatura).select().single()
  if (error) throw error
  return data
}

// ============ GERAR FATURAS EM LOTE ============

export async function gerarFaturasLote(periodoReferencia: string, locacaoIds?: number[]) {
  const [ano, mes] = periodoReferencia.split('-').map(Number)
  const inicioMes = `${ano}-${String(mes).padStart(2, '0')}-01`
  const fimMes = `${ano}-${String(mes).padStart(2, '0')}-${new Date(ano, mes, 0).getDate()}`

  // Buscar locações ativas OU finalizadas que cobrem o período
  const { data: locacoes } = await supabase
    .from('locacoes')
    .select('*, clientes(telefone, email)')
    .in('status', ['ativo', 'finalizado'])
    .lte('data_inicio', fimMes)

  if (!locacoes || locacoes.length === 0) return { geradas: 0, erros: [] as string[] }

  // Filtrar locações que estão vigentes no período selecionado
  const locacoesVigentes = locacoes.filter(l => {
    if (!l.data_inicio) return false
    // A locação precisa ter começado antes do fim do mês
    // E não ter terminado antes do início do mês (se tiver data_fim)
    if (l.data_fim && l.data_fim < inicioMes) return false
    return true
  })

  // Se foram passados IDs específicos, filtrar apenas esses
  const locacoesFiltradas = locacaoIds && locacaoIds.length > 0
    ? locacoesVigentes.filter(l => locacaoIds.includes(l.id))
    : locacoesVigentes

  if (locacoesFiltradas.length === 0) return { geradas: 0, erros: [] as string[] }

  const { data: configArr } = await supabase
    .from('configuracoes_faturamento')
    .select('*')
    .limit(1)
  const config = configArr?.[0]
  const diasVencimento = config?.dias_para_vencimento || 10

  // Verificar faturas já geradas para este periodo
  const { data: existentes } = await supabase
    .from('faturas')
    .select('locacao_id, locacao_numero')
    .eq('periodo_referencia', periodoReferencia)
    .neq('status', 'cancelado')

  const locacoesJaFaturadas = new Set((existentes || []).map(f => f.locacao_id))
  const numerosJaFaturados = new Set<string>()
  ;(existentes || []).forEach(f => {
    if (f.locacao_numero) {
      f.locacao_numero.split(',').map((s: string) => s.trim()).filter(Boolean).forEach((n: string) => numerosJaFaturados.add(n))
    }
  })

  let geradas = 0
  const erros: string[] = []

  for (const locacao of locacoesFiltradas) {
    if (locacoesJaFaturadas.has(locacao.id) || numerosJaFaturados.has(locacao.numero)) continue

    try {
      const diaFat = locacao.dia_faturamento || 1
      const condicao = locacao.condicao_pagamento || ''
      const dataVencStr = calcularDataVencimentoPorCondicao(periodoReferencia, condicao, diaFat, diasVencimento)

      const valorMedicao = calcularValorMedicao(locacao, periodoReferencia)

      await gerarFatura({
        locacao_id: locacao.id,
        valor: valorMedicao > 0 ? valorMedicao : (Number(locacao.valor_total) || 0),
        data_vencimento: dataVencStr,
        tipo: 'recorrente',
        periodo_referencia: periodoReferencia,
        gerada_automaticamente: true,
      })
      geradas++
    } catch (err: any) {
      erros.push(`Locação ${locacao.numero}: ${err.message}`)
    }
  }

  return { geradas, erros }
}

// ============ GERAR FATURA UNIFICADA (MULTIPLOS CONTRATOS, MESMO CLIENTE) ============

export async function gerarFaturaUnificada(periodoReferencia: string, locacaoIds: number[]) {
  const [ano, mes] = periodoReferencia.split('-').map(Number)
  const inicioMes = `${ano}-${String(mes).padStart(2, '0')}-01`
  const fimMes = `${ano}-${String(mes).padStart(2, '0')}-${new Date(ano, mes, 0).getDate()}`

  // Buscar locacoes selecionadas com dados do cliente
  const { data: locacoes } = await supabase
    .from('locacoes')
    .select('*, clientes(telefone, email)')
    .in('id', locacaoIds)

  if (!locacoes || locacoes.length === 0) return { gerada: false, erros: ['Nenhuma locacao encontrada'] }

  // Verificar que todas sao do mesmo cliente
  const clienteIds = new Set(locacoes.map(l => l.cliente_id))
  if (clienteIds.size > 1) {
    return { gerada: false, erros: ['Locacoes de clientes diferentes nao podem ser unificadas'] }
  }

  // Verificar duplicatas (faturas ja existentes no periodo)
  const { data: existentes } = await supabase
    .from('faturas')
    .select('locacao_id, locacao_numero')
    .eq('periodo_referencia', periodoReferencia)
    .neq('status', 'cancelado')

  const jaFaturadas = new Set((existentes || []).map(f => f.locacao_id))
  const numerosJaFaturados = new Set<string>()
  ;(existentes || []).forEach(f => {
    if (f.locacao_numero) {
      f.locacao_numero.split(',').map((s: string) => s.trim()).filter(Boolean).forEach((n: string) => numerosJaFaturados.add(n))
    }
  })
  const locacoesValidas = locacoes.filter(l => !jaFaturadas.has(l.id) && !numerosJaFaturados.has(l.numero))

  if (locacoesValidas.length === 0) {
    return { gerada: false, erros: ['Todas as locacoes selecionadas ja foram faturadas neste periodo'] }
  }

  // Buscar config de faturamento
  const { data: configArr } = await supabase
    .from('configuracoes_faturamento')
    .select('*')
    .limit(1)
  const config = configArr?.[0]
  const diasVencimento = config?.dias_para_vencimento || 10

  // Calcular valores individuais e total
  const detalhes: { numero: string; valor: number }[] = []
  let valorTotal = 0

  for (const locacao of locacoesValidas) {
    const valorMedicao = calcularValorMedicao(locacao, periodoReferencia)
    const valor = valorMedicao > 0 ? valorMedicao : (Number(locacao.valor_total) || 0)
    detalhes.push({ numero: locacao.numero, valor })
    valorTotal += valor
  }

  // Calcular data de vencimento baseado na condicao_pagamento da primeira locacao
  const primeiraLocacao = locacoesValidas[0]
  const condicao = primeiraLocacao.condicao_pagamento || ''
  const diaFat = primeiraLocacao.dia_faturamento || 1
  const dataVencStr = calcularDataVencimentoPorCondicao(periodoReferencia, condicao, diaFat, diasVencimento)

  // Montar campos da fatura unificada
  const locacaoNumeros = locacoesValidas.map(l => l.numero).join(', ')
  const observacoes = detalhes.map(d => `${d.numero}: ${formatarMoeda(d.valor)}`).join(' | ')
  const cliente = primeiraLocacao.clientes as any

  const numero = await gerarNumeroFatura()

  const fatura = {
    numero,
    cliente_id: primeiraLocacao.cliente_id,
    cliente_nome: primeiraLocacao.cliente_nome,
    cliente_telefone: cliente?.telefone || '',
    cliente_email: cliente?.email || '',
    locacao_id: primeiraLocacao.id,
    locacao_numero: locacaoNumeros,
    data_emissao: new Date().toISOString().split('T')[0],
    data_vencimento: dataVencStr,
    valor: valorTotal,
    valor_original: valorTotal,
    valor_pago: 0,
    status: 'emitido',
    tipo: 'recorrente',
    periodo_referencia: periodoReferencia,
    parcela_numero: null,
    parcela_total: null,
    fatura_pai_id: null,
    forma_pagamento: '',
    observacoes,
    gerada_automaticamente: true,
  }

  const { error } = await supabase.from('faturas').insert(fatura)
  if (error) return { gerada: false, erros: [error.message] }

  return { gerada: true, erros: [] as string[] }
}

// ============ GERAR PARCELAS ============

export async function gerarParcelas(params: {
  locacao_id: number
  numero_parcelas: number
  valor_total: number
  primeiro_vencimento: string
}) {
  const valorParcela = Math.round((params.valor_total / params.numero_parcelas) * 100) / 100
  const diferenca = Math.round((params.valor_total - valorParcela * params.numero_parcelas) * 100) / 100

  // Criar fatura pai
  const faturaPai = await gerarFatura({
    locacao_id: params.locacao_id,
    valor: params.valor_total,
    data_vencimento: params.primeiro_vencimento,
    tipo: 'parcela',
    parcela_numero: 0,
    parcela_total: params.numero_parcelas,
  })

  const parcelas = []
  for (let i = 1; i <= params.numero_parcelas; i++) {
    const dataVenc = new Date(params.primeiro_vencimento + 'T12:00:00')
    dataVenc.setMonth(dataVenc.getMonth() + (i - 1))

    let valor = valorParcela
    if (i === params.numero_parcelas) valor += diferenca

    const parcela = await gerarFatura({
      locacao_id: params.locacao_id,
      valor,
      data_vencimento: dataVenc.toISOString().split('T')[0],
      tipo: 'parcela',
      parcela_numero: i,
      parcela_total: params.numero_parcelas,
      fatura_pai_id: faturaPai.id,
    })
    parcelas.push(parcela)
  }

  // Cancelar a fatura pai (é apenas agrupadora)
  await supabase.from('faturas').update({ status: 'cancelado', motivo_cancelamento: 'Fatura agrupadora de parcelas' }).eq('id', faturaPai.id)

  return parcelas
}

// ============ ATUALIZAR FATURAS VENCIDAS ============

export async function atualizarFaturasVencidas() {
  const hoje = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('faturas')
    .update({ status: 'vencido', updated_at: new Date().toISOString() })
    .in('status', ['emitido', 'pendente'])
    .lt('data_vencimento', hoje)
    .select()

  if (error) throw error
  return data?.length || 0
}

// ============ REGISTRAR PAGAMENTO ============

export async function registrarPagamento(params: {
  fatura_id: number
  valor: number
  data_pagamento: string
  forma_pagamento?: string
  observacoes?: string
}) {
  // Inserir pagamento
  const { error: pgError } = await supabase.from('pagamentos').insert({
    fatura_id: params.fatura_id,
    valor: params.valor,
    data_pagamento: params.data_pagamento,
    forma_pagamento: params.forma_pagamento || '',
    observacoes: params.observacoes || '',
  })
  if (pgError) throw pgError

  // Calcular total pago
  const { data: pagamentos } = await supabase
    .from('pagamentos')
    .select('valor')
    .eq('fatura_id', params.fatura_id)

  const totalPago = (pagamentos || []).reduce((s, p) => s + Number(p.valor), 0)

  // Obter fatura
  const { data: fatura } = await supabase
    .from('faturas')
    .select('valor, valor_juros, valor_multa, valor_desconto')
    .eq('id', params.fatura_id)
    .single()

  if (!fatura) throw new Error('Fatura não encontrada')

  const valorTotal = Number(fatura.valor) + Number(fatura.valor_juros || 0) + Number(fatura.valor_multa || 0) - Number(fatura.valor_desconto || 0)
  const novoStatus = totalPago >= valorTotal ? 'pago' : 'parcial'

  await supabase.from('faturas').update({
    valor_pago: totalPago,
    status: novoStatus,
    data_pagamento: novoStatus === 'pago' ? params.data_pagamento : null,
    forma_pagamento: params.forma_pagamento || undefined,
    updated_at: new Date().toISOString(),
  }).eq('id', params.fatura_id)

  return { totalPago, status: novoStatus }
}

// ============ CORRIGIR DATA DE UM PAGAMENTO ============

/**
 * Corrige a data de um pagamento ja lancado.
 *
 * A data do pagamento e o que define em qual mes a receita aparece nas telas
 * de Recebimentos e Relatorios, entao lancar a data errada joga o valor no mes
 * errado. Esta funcao permite corrigir sem apagar e relancar o pagamento.
 *
 * A fatura guarda em data_pagamento a data do pagamento que a quitou — a mais
 * recente. Por isso ela e recalculada a partir de todos os pagamentos, e nao
 * simplesmente sobrescrita com a nova data.
 */
export async function corrigirDataPagamento(pagamentoId: number, faturaId: number, novaData: string) {
  if (!novaData) throw new Error('Informe a nova data do pagamento')

  const { error } = await supabase
    .from('pagamentos')
    .update({ data_pagamento: novaData })
    .eq('id', pagamentoId)
  if (error) throw error

  const { data: pagamentos } = await supabase
    .from('pagamentos')
    .select('data_pagamento')
    .eq('fatura_id', faturaId)

  const datas = (pagamentos || []).map((p: any) => p.data_pagamento).filter(Boolean).sort()
  const dataQuitacao = datas.length > 0 ? datas[datas.length - 1] : null

  const { data: fatura } = await supabase
    .from('faturas')
    .select('status')
    .eq('id', faturaId)
    .single()

  // Só a fatura quitada carrega data_pagamento; parcial ou cancelada segue sem.
  if (fatura?.status === 'pago') {
    await supabase.from('faturas').update({
      data_pagamento: dataQuitacao,
      updated_at: new Date().toISOString(),
    }).eq('id', faturaId)
  }
}

// ============ CANCELAR FATURA ============

export async function cancelarFatura(faturaId: number, motivo: string) {
  const { error } = await supabase.from('faturas').update({
    status: 'cancelado',
    motivo_cancelamento: motivo,
    updated_at: new Date().toISOString(),
  }).eq('id', faturaId)

  if (error) throw error
}

// ============ ESTATÍSTICAS FINANCEIRAS ============

export async function obterEstatisticasFinanceiras() {
  const { data: faturas } = await supabase
    .from('faturas')
    .select('*')
    .neq('status', 'cancelado')

  const todas = faturas || []
  const hoje = new Date()
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
  const mesAnteriorDate = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1)
  const mesAnterior = `${mesAnteriorDate.getFullYear()}-${String(mesAnteriorDate.getMonth() + 1).padStart(2, '0')}`

  // KPIs
  const receitaConfirmada = todas.filter(f => f.status === 'pago').reduce((s, f) => s + Number(f.valor), 0)
  const aReceber = todas.filter(f => ['emitido', 'pendente', 'parcial'].includes(f.status)).reduce((s, f) => s + Number(f.valor) - Number(f.valor_pago || 0), 0)
  const vencidas = todas.filter(f => f.status === 'vencido').reduce((s, f) => s + Number(f.valor) - Number(f.valor_pago || 0), 0)
  const totalEmitidas = todas.filter(f => f.tipo !== 'parcela' || f.parcela_numero).length

  const pagas = todas.filter(f => f.status === 'pago').length
  const taxaRecebimento = totalEmitidas > 0 ? Math.round((pagas / totalEmitidas) * 100) : 0

  // Receita mês atual vs anterior
  const receitaMesAtual = todas.filter(f => f.status === 'pago' && f.data_pagamento?.startsWith(mesAtual)).reduce((s, f) => s + Number(f.valor), 0)
  const receitaMesAnterior = todas.filter(f => f.status === 'pago' && f.data_pagamento?.startsWith(mesAnterior)).reduce((s, f) => s + Number(f.valor), 0)

  // Aging
  const agora = Date.now()
  const faturasVencidas = todas.filter(f => ['vencido', 'pendente', 'emitido', 'parcial'].includes(f.status) && f.data_vencimento && new Date(f.data_vencimento).getTime() < agora)
  const aging = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 }

  faturasVencidas.forEach(f => {
    const dias = Math.floor((agora - new Date(f.data_vencimento).getTime()) / 86400000)
    const saldo = Number(f.valor) - Number(f.valor_pago || 0)
    if (dias <= 30) aging['0-30'] += saldo
    else if (dias <= 60) aging['31-60'] += saldo
    else if (dias <= 90) aging['61-90'] += saldo
    else aging['90+'] += saldo
  })

  // Top clientes
  const porCliente: Record<string, { nome: string; total: number }> = {}
  todas.filter(f => f.status === 'pago').forEach(f => {
    const key = f.cliente_nome || 'Desconhecido'
    if (!porCliente[key]) porCliente[key] = { nome: key, total: 0 }
    porCliente[key].total += Number(f.valor)
  })
  const topClientes = Object.values(porCliente).sort((a, b) => b.total - a.total).slice(0, 5)

  // Receita mensal (últimos 6 meses)
  const receitaMensal: { mes: string; valor: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    const mesKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const valor = todas
      .filter(f => f.status === 'pago' && f.data_pagamento?.startsWith(mesKey))
      .reduce((s, f) => s + Number(f.valor), 0)
    const nomesMes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    receitaMensal.push({ mes: `${nomesMes[d.getMonth()]}/${d.getFullYear()}`, valor })
  }

  return {
    receitaConfirmada,
    aReceber,
    vencidas,
    totalEmitidas,
    taxaRecebimento,
    receitaMesAtual,
    receitaMesAnterior,
    aging,
    topClientes,
    receitaMensal,
  }
}

// ============ SIMULAR DISTRIBUICAO EM CASCATA ============

export function simularDistribuicao(
  faturas: any[],
  valorRecebido: number
): Array<{
  fatura_id: number
  numero: string
  saldo_anterior: number
  valor_aplicado: number
  novo_saldo: number
  novo_status: string
}> {
  const resultado: Array<{
    fatura_id: number
    numero: string
    saldo_anterior: number
    valor_aplicado: number
    novo_saldo: number
    novo_status: string
  }> = []

  let restante = valorRecebido

  for (const fatura of faturas) {
    if (restante <= 0) break

    const valorTotal = Number(fatura.valor) + Number(fatura.valor_juros || 0) + Number(fatura.valor_multa || 0) - Number(fatura.valor_desconto || 0)
    const saldoDevedor = valorTotal - Number(fatura.valor_pago || 0)

    if (saldoDevedor <= 0) continue

    const valorAplicado = Math.min(restante, saldoDevedor)
    const novoSaldo = Math.round((saldoDevedor - valorAplicado) * 100) / 100
    const novoStatus = novoSaldo <= 0 ? 'pago' : 'parcial'

    resultado.push({
      fatura_id: fatura.id,
      numero: fatura.numero || `#${fatura.id}`,
      saldo_anterior: Math.round(saldoDevedor * 100) / 100,
      valor_aplicado: Math.round(valorAplicado * 100) / 100,
      novo_saldo: novoSaldo,
      novo_status: novoStatus,
    })

    restante = Math.round((restante - valorAplicado) * 100) / 100
  }

  return resultado
}

// ============ DISTRIBUIR PAGAMENTO EM CASCATA ============

export async function distribuirPagamento(params: {
  cliente_id: number
  valor: number
  data_pagamento: string
  forma_pagamento?: string
  observacoes?: string
}): Promise<{
  distribuicao: Array<{
    fatura_id: number
    numero: string
    valor_aplicado: number
    novo_status: string
  }>
  troco: number
}> {
  // Buscar faturas em aberto do cliente
  const { data: faturas, error } = await supabase
    .from('faturas')
    .select('*')
    .eq('cliente_id', params.cliente_id)
    .in('status', ['emitido', 'vencido', 'parcial'])
    .order('data_vencimento', { ascending: true })

  if (error) throw error
  if (!faturas || faturas.length === 0) throw new Error('Nenhuma fatura em aberto para este cliente')

  const simulacao = simularDistribuicao(faturas, params.valor)

  const distribuicao: Array<{
    fatura_id: number
    numero: string
    valor_aplicado: number
    novo_status: string
  }> = []

  for (const item of simulacao) {
    await registrarPagamento({
      fatura_id: item.fatura_id,
      valor: item.valor_aplicado,
      data_pagamento: params.data_pagamento,
      forma_pagamento: params.forma_pagamento,
      observacoes: params.observacoes,
    })

    distribuicao.push({
      fatura_id: item.fatura_id,
      numero: item.numero,
      valor_aplicado: item.valor_aplicado,
      novo_status: item.novo_status,
    })
  }

  const totalAplicado = distribuicao.reduce((s, d) => s + d.valor_aplicado, 0)
  const troco = Math.round((params.valor - totalAplicado) * 100) / 100

  return { distribuicao, troco }
}

// ============ OBTER LOCACOES ELEGIVEIS ============

export async function obterLocacoesElegiveis(periodoReferencia: string) {
  const [ano, mes] = periodoReferencia.split('-').map(Number)
  const inicioMes = `${ano}-${String(mes).padStart(2, '0')}-01`
  const fimMes = `${ano}-${String(mes).padStart(2, '0')}-${new Date(ano, mes, 0).getDate()}`

  const { data: locacoes } = await supabase
    .from('locacoes')
    .select('*')
    .in('status', ['ativo', 'finalizado'])
    .lte('data_inicio', fimMes)

  // Filtrar locações vigentes no período
  const vigentes = (locacoes || []).filter(l => {
    if (!l.data_inicio) return false
    if (l.data_fim && l.data_fim < inicioMes) return false
    return true
  })

  const { data: existentes } = await supabase
    .from('faturas')
    .select('locacao_id, locacao_numero')
    .eq('periodo_referencia', periodoReferencia)
    .neq('status', 'cancelado')

  const jaFaturadas = new Set((existentes || []).map(f => f.locacao_id))
  // Também verificar números de locação em faturas unificadas (campo locacao_numero com múltiplos valores)
  const numerosJaFaturados = new Set<string>()
  ;(existentes || []).forEach(f => {
    if (f.locacao_numero) {
      f.locacao_numero.split(',').map((s: string) => s.trim()).filter(Boolean).forEach((n: string) => numerosJaFaturados.add(n))
    }
  })

  return vigentes
    .filter(l => !jaFaturadas.has(l.id) && !numerosJaFaturados.has(l.numero))
    .map(l => ({
      ...l,
      valor_medicao: calcularValorMedicao(l, periodoReferencia),
    }))
}
