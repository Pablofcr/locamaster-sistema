'use client'

import { useState, useEffect, Fragment } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import {
  formatarMoeda,
  formatarData,
  gerarFatura,
  gerarFaturasLote,
  gerarFaturaUnificada,
  gerarParcelas,
  atualizarFaturasVencidas,
  obterEstatisticasFinanceiras,
  obterLocacoesElegiveis,
  registrarPagamento,
  cancelarFatura,
  calcularValorMedicao,
  obterPeriodoCobertoPelaFatura,
} from '@/lib/faturamento'
import { faturasDoContrato } from '@/lib/saldoFaturamento'
import { lerContasBancarias, contaPrincipal, statusConfiguracao } from '@/lib/configuracaoPagamento'
import {
  carregarRegras,
  executarReguaCobranca,
  obterLogCobranca,
  processarTemplate,
  abrirWhatsApp,
} from '@/lib/cobranca'
import { gerarPDFFatura } from '@/lib/gerarPDFFatura'
import { gerarPDFConsolidado } from '@/lib/gerarPDFConsolidado'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { hojeISO } from '@/lib/data'

type TabType = 'dashboard' | 'faturas' | 'gerar' | 'cobranca' | 'relatorios'

export default function FaturamentoPage() {
  const { showToast } = useToast()
  const router = useRouter()
  const { empresa } = useEmpresa()
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [loading, setLoading] = useState(true)

  // Dashboard state
  const [stats, setStats] = useState<any>(null)

  // Faturas state
  const [faturas, setFaturas] = useState<any[]>([])
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroDataDe, setFiltroDataDe] = useState('')
  const [filtroDataAte, setFiltroDataAte] = useState('')
  const [filtroCliente, setFiltroCliente] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [pagina, setPagina] = useState(1)
  const [selectedFaturas, setSelectedFaturas] = useState<Set<number>>(new Set())

  // Gerar state
  const [subTab, setSubTab] = useState<'automatica' | 'parcelas' | 'avulsa'>('automatica')
  const [periodoRef, setPeriodoRef] = useState(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  })
  const [locacoesElegiveis, setLocacoesElegiveis] = useState<any[]>([])
  const [locacoes, setLocacoes] = useState<any[]>([])
  const [gerandoLote, setGerandoLote] = useState(false)
  const [gerandoConsolidado, setGerandoConsolidado] = useState(false)
  const [configPagamento, setConfigPagamento] = useState<any>(null)
  const [indiceContaPDF, setIndiceContaPDF] = useState(0)
  const [locacoesSelecionadas, setLocacoesSelecionadas] = useState<Set<number>>(new Set())

  // Parcelas state
  const [parcelaLocacao, setParcelaLocacao] = useState('')
  const [parcelaQtd, setParcelaQtd] = useState('3')
  const [parcelaVencimento, setParcelaVencimento] = useState('')
  const [parcelaValor, setParcelaValor] = useState('')

  // Avulsa state
  const [avulsaForm, setAvulsaForm] = useState({
    locacao_id: '', valor: '', data_vencimento: '', forma_pagamento: '', observacoes: ''
  })

  // Cobranca state
  const [regras, setRegras] = useState<any[]>([])
  const [regraForm, setRegraForm] = useState({
    nome: '', dias_antes_vencimento: '0', dias_apos_vencimento: '0',
    tipo_acao: 'whatsapp', template_mensagem: '', ativo: true,
  })
  const [editandoRegra, setEditandoRegra] = useState<number | null>(null)
  const [showRegraForm, setShowRegraForm] = useState(false)

  // Baixa em lote: a data e perguntada, nunca assumida como hoje
  const [showBaixaLote, setShowBaixaLote] = useState(false)
  const [baixaEscolhendoData, setBaixaEscolhendoData] = useState(false)
  const [baixaData, setBaixaData] = useState('')
  const [baixaForma, setBaixaForma] = useState('')
  const [baixando, setBaixando] = useState(false)
  const [logCobranca, setLogCobranca] = useState<any[]>([])
  const [executandoRegua, setExecutandoRegua] = useState(false)

  // Relatórios state
  const [relatorioTipo, setRelatorioTipo] = useState<'aging' | 'projecao' | 'cliente' | 'periodo'>('aging')

  // ============ LOAD DATA ============
  useEffect(() => {
    carregarDados()
  }, [])

  useEffect(() => {
    if (activeTab === 'dashboard') carregarEstatisticas()
    else if (activeTab === 'faturas') carregarFaturas()
    else if (activeTab === 'gerar') carregarLocacoes()
    else if (activeTab === 'cobranca') carregarCobranca()
  }, [activeTab])

  const carregarDados = async () => {
    setLoading(true)
    try {
      await atualizarFaturasVencidas()
      await carregarEstatisticas()
      await carregarConfigPagamento()
    } catch { /* ignore */ }
    setLoading(false)
  }

  /**
   * A conta que vai no PDF: a principal, ou outra escolhida no seletor.
   * A escolha vale para os PDFs gerados agora e volta para a principal ao
   * recarregar a tela — ela nao fica gravada na fatura.
   */
  const contasDisponiveis = lerContasBancarias(configPagamento)
  const contaEscolhida = (config: any) =>
    contasDisponiveis[indiceContaPDF] || contaPrincipal(config)

  // Sem PIX nem banco, a fatura sai sem como o cliente pagar — a tela avisa
  const carregarConfigPagamento = async () => {
    try {
      const { data } = await supabase.from('configuracoes_faturamento').select('*').limit(1)
      const config = data?.[0] || null
      setConfigPagamento(config)
      const contas = lerContasBancarias(config)
      const principal = contas.findIndex(c => c.principal)
      setIndiceContaPDF(principal >= 0 ? principal : 0)
    } catch { /* o aviso so nao aparece */ }
  }

  const carregarEstatisticas = async () => {
    try {
      const data = await obterEstatisticasFinanceiras()
      setStats(data)
    } catch { showToast('Erro ao carregar estatísticas', 'error') }
  }

  const carregarFaturas = async () => {
    try {
      const { data } = await supabase
        .from('faturas')
        .select('*')
        .order('created_at', { ascending: false })
      setFaturas(data || [])
    } catch { showToast('Erro ao carregar faturas', 'error') }
  }

  const carregarLocacoes = async () => {
    try {
      const { data } = await supabase
        .from('locacoes')
        .select('*')
        .order('created_at', { ascending: false })
      setLocacoes(data || [])

      if (periodoRef) {
        const elegiveis = await obterLocacoesElegiveis(periodoRef)
        setLocacoesElegiveis(elegiveis)
        setLocacoesSelecionadas(new Set(elegiveis.map((l: any) => l.id)))
      }
    } catch { showToast('Erro ao carregar locações', 'error') }
  }

  const carregarCobranca = async () => {
    try {
      const [r, l] = await Promise.all([carregarRegras(), obterLogCobranca()])
      setRegras(r)
      setLogCobranca(l)
    } catch { showToast('Erro ao carregar cobrança', 'error') }
  }

  // ============ FATURAS ACTIONS ============

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' | 'secondary' | 'default' }> = {
      pago: { label: 'Pago', variant: 'success' },
      pendente: { label: 'Pendente', variant: 'warning' },
      vencido: { label: 'Vencido', variant: 'danger' },
      emitido: { label: 'Emitido', variant: 'primary' },
      parcial: { label: 'Parcial', variant: 'warning' },
      cancelado: { label: 'Cancelado', variant: 'default' },
    }
    const cfg = map[status] || { label: status, variant: 'default' as const }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const calcularDiasVencimento = (dataVenc: string) => {
    return Math.ceil((new Date(dataVenc + 'T12:00:00').getTime() - Date.now()) / 86400000)
  }

  const faturasFiltradas = faturas.filter(f => {
    if (filtroStatus !== 'todos' && f.status !== filtroStatus) return false
    if (filtroTipo !== 'todos' && f.tipo !== filtroTipo) return false
    if (filtroDataDe && f.data_vencimento < filtroDataDe) return false
    if (filtroDataAte && f.data_vencimento > filtroDataAte) return false
    if (filtroCliente && !(f.cliente_nome || '').toLowerCase().includes(filtroCliente.toLowerCase())) return false
    if (searchTerm) {
      const s = searchTerm.toLowerCase()
      return (f.numero || '').toLowerCase().includes(s) ||
        (f.cliente_nome || '').toLowerCase().includes(s) ||
        (f.locacao_numero || '').toLowerCase().includes(s)
    }
    return true
  })

  const totalPaginas = Math.ceil(faturasFiltradas.length / 20)
  const faturasPaginadas = faturasFiltradas.slice((pagina - 1) * 20, pagina * 20)

  const toggleSelecao = (id: number) => {
    const novo = new Set(selectedFaturas)
    if (novo.has(id)) novo.delete(id); else novo.add(id)
    setSelectedFaturas(novo)
  }

  const toggleTodos = () => {
    if (selectedFaturas.size === faturasPaginadas.length) {
      setSelectedFaturas(new Set())
    } else {
      setSelectedFaturas(new Set(faturasPaginadas.map(f => f.id)))
    }
  }

  /** Faturas da selecao que ainda podem receber baixa. */
  const faturasParaBaixa = () =>
    Array.from(selectedFaturas)
      .map(id => faturas.find(f => f.id === id))
      .filter(f => f && f.status !== 'pago' && f.status !== 'cancelado')

  const abrirBaixaLote = () => {
    if (selectedFaturas.size === 0) return
    setBaixaEscolhendoData(false)
    setBaixaData('')
    setBaixaForma('')
    setShowBaixaLote(true)
  }

  /**
   * Baixa as faturas selecionadas na data informada.
   *
   * A data e sempre escolhida pelo usuario — ou confirmando que foi hoje, ou
   * pelo calendario. E ela que define em qual mes a receita aparece em
   * Recebimentos e Relatorios, entao assumir "hoje" jogava o valor no mes
   * errado quando a baixa era lancada depois do recebimento.
   */
  const acaoLoteMarcarPago = async (dataPagamento: string) => {
    const alvo = faturasParaBaixa()
    if (alvo.length === 0) { showToast('Nenhuma fatura da selecao pode ser baixada', 'warning'); return }
    setBaixando(true)
    try {
      for (const fatura of alvo) {
        await registrarPagamento({
          fatura_id: fatura.id,
          valor: Number(fatura.valor) - Number(fatura.valor_pago || 0),
          data_pagamento: dataPagamento,
          forma_pagamento: baixaForma || undefined,
        })
      }
      showToast(`${alvo.length} fatura(s) baixada(s) em ${formatarData(dataPagamento)}`, 'success')
      setShowBaixaLote(false)
      setSelectedFaturas(new Set())
      carregarFaturas()
    } catch { showToast('Erro ao processar lote', 'error') }
    finally { setBaixando(false) }
  }

  const acaoLoteCancelar = async () => {
    if (selectedFaturas.size === 0) return
    if (!confirm('Cancelar as faturas selecionadas?')) return
    try {
      for (const id of selectedFaturas) {
        await cancelarFatura(id, 'Cancelamento em lote')
      }
      showToast(`${selectedFaturas.size} faturas canceladas`, 'success')
      setSelectedFaturas(new Set())
      carregarFaturas()
    } catch { showToast('Erro ao cancelar em lote', 'error') }
  }

  const handleGerarPDF = async (fatura: any) => {
    try {
      const locacaoNumeros = (fatura.locacao_numero || '').split(',').map((s: string) => s.trim()).filter(Boolean)
      const isUnificada = locacaoNumeros.length > 1

      let locacaoPrincipal: any = null
      let itens: any[] = []
      let todasLocacoes: any[] = []

      if (isUnificada) {
        // Fatura unificada: buscar todas as locacoes pelos numeros
        const { data: locacoesUnificadas } = await supabase
          .from('locacoes')
          .select('*, equipamentos(nome, marca, modelo)')
          .in('numero', locacaoNumeros)

        if (locacoesUnificadas && locacoesUnificadas.length > 0) {
          locacaoPrincipal = locacoesUnificadas[0]
          todasLocacoes = locacoesUnificadas
          itens = locacoesUnificadas.map(loc => {
            // A parte do contrato gravada na fatura; numa renovacao e menor que a medicao do mes
            const parteNaFatura = faturasDoContrato([fatura], loc)?.[0]?.valor
            const valorMedicao = parteNaFatura !== undefined
              ? parteNaFatura
              : fatura.periodo_referencia
                ? calcularValorMedicao(loc, fatura.periodo_referencia)
                : Number(loc.valor_total) || 0
            return {
              equipamento_nome: `${loc.numero} - ${loc.equipamento_nome || loc.equipamentos?.nome || ''}`,
              equipamento_marca: loc.equipamentos?.marca || '',
              equipamento_modelo: loc.equipamentos?.modelo || '',
              quantidade: loc.quantidade || 1,
              valor_unitario: Number(loc.valor_total) || 0,
              subtotal: valorMedicao > 0 ? valorMedicao : Number(loc.valor_total) || 0,
            }
          })
        }
      } else {
        // Fatura individual: buscar locacao unica
        const { data: locacao } = await supabase
          .from('locacoes')
          .select('*, equipamentos(nome, marca, modelo)')
          .eq('id', fatura.locacao_id)
          .single()

        locacaoPrincipal = locacao
        if (locacao) todasLocacoes = [locacao]
        if (locacao) {
          itens = [{
            equipamento_nome: locacao.equipamento_nome || locacao.equipamentos?.nome || '',
            equipamento_marca: locacao.equipamentos?.marca || '',
            equipamento_modelo: locacao.equipamentos?.modelo || '',
            quantidade: locacao.quantidade || 1,
            valor_unitario: Number(locacao.valor_dia || locacao.valor_total) || 0,
            subtotal: Number(fatura.valor) || 0,
          }]
        }
      }

      const { data: cliente } = await supabase
        .from('clientes')
        .select('cpf_cnpj, email, telefone')
        .eq('id', fatura.cliente_id)
        .single()

      const { data: configArr } = await supabase
        .from('configuracoes_faturamento')
        .select('*')
        .limit(1)
      const config = configArr?.[0]

      // Período de medição para exibição no PDF: os dias que a fatura cobriu
      let periodoMedicao = await obterPeriodoCobertoPelaFatura(fatura)
      if (!periodoMedicao && fatura.periodo_referencia && todasLocacoes.length > 0) {
        const [anoRef, mesRef] = fatura.periodo_referencia.split('-').map(Number)
        const ultimoDiaMes = new Date(anoRef, mesRef, 0).getDate()
        const fimMes = `${anoRef}-${String(mesRef).padStart(2, '0')}-${String(ultimoDiaMes).padStart(2, '0')}`

        // Data inicial = data mais antiga dentre as datas iniciais dos contratos
        const datasInicio = todasLocacoes.map(l => l.data_inicio).filter(Boolean).sort()
        const inicio = datasInicio[0] || fimMes

        // Data final = fechamento da medição (último dia do mês ou data_fim mais tardia se todos terminam antes)
        const datasFim = todasLocacoes.map(l => l.data_fim).filter(Boolean).sort()
        const maxDataFim = datasFim.length > 0 ? datasFim[datasFim.length - 1] : fimMes
        const fim = maxDataFim < fimMes ? maxDataFim : fimMes

        const fmtData = (d: string) => {
          const parts = d.split('-')
          return `${parts[2]}/${parts[1]}/${parts[0]}`
        }
        periodoMedicao = `${fmtData(inicio)} a ${fmtData(fim)}`
      }

      gerarPDFFatura({
        numero: fatura.numero,
        data_emissao: fatura.data_emissao,
        data_vencimento: fatura.data_vencimento,
        tipo: fatura.tipo || 'avulsa',
        parcela_numero: fatura.parcela_numero,
        parcela_total: fatura.parcela_total,
        periodo_referencia: fatura.periodo_referencia,
        forma_pagamento: fatura.forma_pagamento,
        observacoes: fatura.observacoes,
        cliente_nome: fatura.cliente_nome,
        cliente_documento: cliente?.cpf_cnpj || '',
        cliente_email: cliente?.email || fatura.cliente_email || '',
        cliente_telefone: cliente?.telefone || fatura.cliente_telefone || '',
        locacao_numero: fatura.locacao_numero,
        locacao_data_inicio: locacaoPrincipal?.data_inicio,
        locacao_data_fim: locacaoPrincipal?.data_fim,
        periodo_medicao: periodoMedicao || undefined,
        itens,
        valor_original: Number(fatura.valor_original || fatura.valor) || 0,
        valor_desconto: Number(fatura.valor_desconto) || 0,
        valor_juros: Number(fatura.valor_juros) || 0,
        valor_multa: Number(fatura.valor_multa) || 0,
        valor_total: Number(fatura.valor) || 0,
        valor_pago: Number(fatura.valor_pago) || 0,
      }, empresa ? {
        razao_social: empresa.razao_social,
        nome_fantasia: empresa.nome_fantasia,
        cnpj: empresa.cnpj,
        email: empresa.email,
        telefone: empresa.telefone,
        logo_base64: empresa.logo_base64,
      } : undefined, config ? {
        pix_chave: config.pix_chave,
        pix_tipo: config.pix_tipo,
        banco_nome: config.banco_nome,
        banco_agencia: config.banco_agencia,
        banco_conta: config.banco_conta,
        banco_titular: config.banco_titular,
        bancos: lerContasBancarias(config),
        conta: contaEscolhida(config),
        juros_mora: config.juros_mora,
        multa_atraso: config.multa_atraso,
      } : undefined)

      showToast('PDF gerado com sucesso!', 'success')
    } catch { showToast('Erro ao gerar PDF', 'error') }
  }

  /**
   * Um PDF so com as faturas selecionadas, para o cliente receber um
   * documento — e nao um arquivo por fatura quando o ciclo da locacao
   * atravessa dois meses. As faturas em si nao mudam.
   */
  const handleGerarPDFConsolidado = async () => {
    const selecionadas = faturas.filter(f => selectedFaturas.has(f.id))
    if (selecionadas.length === 0) return

    const clientes = new Set(selecionadas.map(f => f.cliente_id))
    if (clientes.size > 1) {
      showToast('Selecione faturas de um mesmo cliente para o PDF consolidado', 'warning')
      return
    }
    if (selecionadas.some(f => f.status === 'cancelado')) {
      showToast('Fatura cancelada nao entra no PDF consolidado', 'warning')
      return
    }

    setGerandoConsolidado(true)
    try {
      const primeira = selecionadas[0]
      const { data: cliente } = await supabase
        .from('clientes')
        .select('cpf_cnpj, documento, email, telefone')
        .eq('id', primeira.cliente_id)
        .single()

      const { data: configArr } = await supabase.from('configuracoes_faturamento').select('*').limit(1)
      const config = configArr?.[0]

      const ordenadas = [...selecionadas].sort((a, b) => (a.data_vencimento || '').localeCompare(b.data_vencimento || ''))
      const comPeriodo = await Promise.all(ordenadas.map(async f => ({
        numero: f.numero || `#${f.id}`,
        periodo: await obterPeriodoCobertoPelaFatura(f),
        locacao_numero: f.locacao_numero || '',
        data_vencimento: f.data_vencimento,
        valor: Number(f.valor) || 0,
        valor_pago: Number(f.valor_pago) || 0,
        status: f.status,
      })))

      gerarPDFConsolidado({
        cliente_nome: primeira.cliente_nome || '',
        cliente_documento: cliente?.cpf_cnpj || cliente?.documento || '',
        cliente_email: cliente?.email || primeira.cliente_email || '',
        cliente_telefone: cliente?.telefone || primeira.cliente_telefone || '',
        faturas: comPeriodo,
      }, empresa ? {
        razao_social: empresa.razao_social,
        nome_fantasia: empresa.nome_fantasia,
        cnpj: empresa.cnpj,
        email: empresa.email,
        telefone: empresa.telefone,
        logo_base64: empresa.logo_base64,
      } : undefined, config ? {
        pix_chave: config.pix_chave,
        pix_tipo: config.pix_tipo,
        banco_nome: config.banco_nome,
        banco_agencia: config.banco_agencia,
        banco_conta: config.banco_conta,
        banco_titular: config.banco_titular,
        bancos: lerContasBancarias(config),
        conta: contaEscolhida(config),
        juros_mora: config.juros_mora,
        multa_atraso: config.multa_atraso,
      } : undefined)
    } catch {
      showToast('Erro ao gerar PDF consolidado', 'error')
    }
    setGerandoConsolidado(false)
  }

  // ============ GERAR ACTIONS ============

  const handleGerarLote = async () => {
    if (locacoesSelecionadas.size === 0) {
      showToast('Selecione ao menos uma locação', 'warning')
      return
    }
    setGerandoLote(true)
    try {
      const ids = Array.from(locacoesSelecionadas)
      const result = await gerarFaturaUnificada(periodoRef, ids)
      if (result.gerada) {
        showToast('Fatura gerada com sucesso!', 'success')
      } else if (result.erros.length > 0) {
        showToast(result.erros[0], 'warning')
      }
      carregarLocacoes()
    } catch { showToast('Erro ao gerar fatura', 'error') }
    setGerandoLote(false)
  }

  const handleGerarParcelas = async () => {
    if (!parcelaLocacao || !parcelaQtd || !parcelaVencimento) {
      showToast('Preencha todos os campos', 'warning')
      return
    }
    const locacao = locacoes.find(l => l.id === parseInt(parcelaLocacao))
    const valorTotal = parcelaValor ? parseFloat(parcelaValor) : Number(locacao?.valor_total || 0)
    try {
      const parcelas = await gerarParcelas({
        locacao_id: parseInt(parcelaLocacao),
        numero_parcelas: parseInt(parcelaQtd),
        valor_total: valorTotal,
        primeiro_vencimento: parcelaVencimento,
      })
      showToast(`${parcelas.length} parcelas geradas com sucesso!`, 'success')
      setParcelaLocacao('')
      setParcelaQtd('3')
      setParcelaVencimento('')
      setParcelaValor('')
    } catch (err: any) { showToast('Erro: ' + err.message, 'error') }
  }

  const handleCriarAvulsa = async () => {
    if (!avulsaForm.locacao_id || !avulsaForm.valor || !avulsaForm.data_vencimento) {
      showToast('Preencha os campos obrigatórios', 'warning')
      return
    }
    try {
      await gerarFatura({
        locacao_id: parseInt(avulsaForm.locacao_id),
        valor: parseFloat(avulsaForm.valor),
        data_vencimento: avulsaForm.data_vencimento,
        forma_pagamento: avulsaForm.forma_pagamento,
        observacoes: avulsaForm.observacoes,
        tipo: 'avulsa',
      })
      showToast('Fatura avulsa criada!', 'success')
      setAvulsaForm({ locacao_id: '', valor: '', data_vencimento: '', forma_pagamento: '', observacoes: '' })
    } catch (err: any) { showToast('Erro: ' + err.message, 'error') }
  }

  // ============ COBRANCA ACTIONS ============

  const handleSalvarRegra = async () => {
    if (!regraForm.nome || !regraForm.template_mensagem) {
      showToast('Preencha nome e template', 'warning')
      return
    }
    try {
      const dados = {
        nome: regraForm.nome,
        dias_antes_vencimento: parseInt(regraForm.dias_antes_vencimento) || 0,
        dias_apos_vencimento: parseInt(regraForm.dias_apos_vencimento) || 0,
        tipo_acao: regraForm.tipo_acao,
        template_mensagem: regraForm.template_mensagem,
        ativo: regraForm.ativo,
      }
      if (editandoRegra) {
        await supabase.from('regua_cobranca').update(dados).eq('id', editandoRegra)
      } else {
        await supabase.from('regua_cobranca').insert(dados)
      }
      showToast('Regra salva!', 'success')
      setShowRegraForm(false)
      setEditandoRegra(null)
      setRegraForm({ nome: '', dias_antes_vencimento: '0', dias_apos_vencimento: '0', tipo_acao: 'whatsapp', template_mensagem: '', ativo: true })
      carregarCobranca()
    } catch { showToast('Erro ao salvar regra', 'error') }
  }

  const handleEditarRegra = (regra: any) => {
    setRegraForm({
      nome: regra.nome,
      dias_antes_vencimento: String(regra.dias_antes_vencimento || 0),
      dias_apos_vencimento: String(regra.dias_apos_vencimento || 0),
      tipo_acao: regra.tipo_acao,
      template_mensagem: regra.template_mensagem,
      ativo: regra.ativo,
    })
    setEditandoRegra(regra.id)
    setShowRegraForm(true)
  }

  const handleExcluirRegra = async (id: number) => {
    if (!confirm('Excluir esta regra?')) return
    await supabase.from('regua_cobranca').delete().eq('id', id)
    showToast('Regra excluída', 'success')
    carregarCobranca()
  }

  const handleExecutarRegua = async () => {
    setExecutandoRegua(true)
    try {
      const result = await executarReguaCobranca()
      if (result.processadas === 0) {
        showToast('Nenhuma cobrança a enviar hoje', 'info')
      } else {
        for (const acao of result.acoes) {
          if (acao.telefone) {
            abrirWhatsApp(acao.telefone, acao.mensagem)
          }
        }
        showToast(`${result.processadas} cobranças processadas!`, 'success')
      }
      carregarCobranca()
    } catch { showToast('Erro ao executar régua', 'error') }
    setExecutandoRegua(false)
  }

  // ============ VALIDACAO MESMO CLIENTE ============
  const clientesSelecionados = new Set(
    locacoesElegiveis.filter(l => locacoesSelecionadas.has(l.id)).map(l => l.cliente_id)
  )
  const mesmoCliente = clientesSelecionados.size <= 1

  // ============ TABS ============

  const tabs: { key: TabType; label: string; icon: string }[] = [
    { key: 'dashboard', label: 'Dashboard', icon: '📊' },
    { key: 'faturas', label: 'Faturas', icon: '📄' },
    { key: 'gerar', label: 'Gerar Faturas', icon: '⚡' },
    { key: 'cobranca', label: 'Régua de Cobrança', icon: '📢' },
    { key: 'relatorios', label: 'Relatórios', icon: '📈' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando faturamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faturamento</h1>
          <p className="text-gray-600">Controle financeiro completo</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/faturamento/configuracoes')}>
          Configuracoes
        </Button>
      </div>

      {/* Lembrete: configuracao de pagamento incompleta */}
      {statusConfiguracao(configPagamento).semFormaDePagamento && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="text-sm text-amber-900">
            <strong>Suas faturas estao saindo sem instrucoes de pagamento.</strong>
            <p className="text-xs mt-0.5">
              Cadastre a chave PIX ou as contas bancarias para que apareçam no PDF da fatura e do demonstrativo.
            </p>
          </div>
          <Button size="sm" onClick={() => router.push('/dashboard/faturamento/configuracoes')}>
            Configurar agora
          </Button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-1 overflow-x-auto">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setPagina(1) }}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ============ ABA: DASHBOARD ============ */}
      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card><CardContent className="p-4">
              <div className="text-xs text-gray-500 mb-1">Receita Confirmada</div>
              <div className="text-xl font-bold text-green-600">{formatarMoeda(stats.receitaConfirmada)}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs text-gray-500 mb-1">A Receber</div>
              <div className="text-xl font-bold text-yellow-600">{formatarMoeda(stats.aReceber)}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs text-gray-500 mb-1">Vencidas</div>
              <div className="text-xl font-bold text-red-600">{formatarMoeda(stats.vencidas)}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs text-gray-500 mb-1">Taxa de Recebimento</div>
              <div className="text-xl font-bold text-blue-600">{stats.taxaRecebimento}%</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs text-gray-500 mb-1">Faturas Emitidas</div>
              <div className="text-xl font-bold text-gray-700">{stats.totalEmitidas}</div>
            </CardContent></Card>
            <Card><CardContent className="p-4">
              <div className="text-xs text-gray-500 mb-1">Mes Atual vs Anterior</div>
              <div className="text-xl font-bold text-blue-600">{formatarMoeda(stats.receitaMesAtual)}</div>
              <div className="text-xs text-gray-400">Ant: {formatarMoeda(stats.receitaMesAnterior)}</div>
            </CardContent></Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Grafico de barras CSS */}
            <Card>
              <CardHeader><CardTitle>Receita Mensal</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.receitaMensal.map((m: any) => {
                    const maxVal = Math.max(...stats.receitaMensal.map((x: any) => x.valor), 1)
                    const pct = (m.valor / maxVal) * 100
                    return (
                      <div key={m.mes} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-gray-600 text-right">{m.mes}</div>
                        <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                          <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${pct}%` }}></div>
                        </div>
                        <div className="w-28 text-sm font-medium text-right">{formatarMoeda(m.valor)}</div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Top Clientes + Aging */}
            <div className="space-y-6">
              <Card>
                <CardHeader><CardTitle>Top 5 Clientes</CardTitle></CardHeader>
                <CardContent>
                  {stats.topClientes.length === 0 ? (
                    <p className="text-gray-400 text-sm">Nenhum dado disponivel</p>
                  ) : (
                    <div className="space-y-2">
                      {stats.topClientes.map((c: any, i: number) => (
                        <div key={i} className="flex justify-between items-center py-1 border-b border-gray-100 last:border-0">
                          <span className="text-sm text-gray-700">{i + 1}. {c.nome}</span>
                          <span className="text-sm font-semibold text-green-600">{formatarMoeda(c.total)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Aging de Recebiveis</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2">
                    {Object.entries(stats.aging).map(([faixa, valor]) => (
                      <div key={faixa} className="text-center p-2 rounded bg-gray-50">
                        <div className="text-xs text-gray-500 mb-1">{faixa} dias</div>
                        <div className="text-sm font-bold text-gray-700">{formatarMoeda(valor as number)}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ============ ABA: FATURAS ============ */}
      {activeTab === 'faturas' && (
        <div className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                <Input placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                <select value={filtroStatus} onChange={e => { setFiltroStatus(e.target.value); setPagina(1) }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="todos">Todos Status</option>
                  <option value="emitido">Emitidas</option>
                  <option value="pendente">Pendentes</option>
                  <option value="parcial">Parciais</option>
                  <option value="pago">Pagas</option>
                  <option value="vencido">Vencidas</option>
                  <option value="cancelado">Canceladas</option>
                </select>
                <select value={filtroTipo} onChange={e => { setFiltroTipo(e.target.value); setPagina(1) }}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="todos">Todos Tipos</option>
                  <option value="avulsa">Avulsa</option>
                  <option value="recorrente">Recorrente</option>
                  <option value="parcela">Parcela</option>
                </select>
                <Input type="date" value={filtroDataDe} onChange={e => setFiltroDataDe(e.target.value)} placeholder="De" />
                <Input type="date" value={filtroDataAte} onChange={e => setFiltroDataAte(e.target.value)} placeholder="Até" />
                <Input placeholder="Cliente..." value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} />
              </div>

              {/* A conta que sai no PDF; so aparece quando ha mais de uma cadastrada */}
              {contasDisponiveis.length > 1 && (
                <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t">
                  <label className="text-sm text-gray-600">Conta para o PDF:</label>
                  <select value={indiceContaPDF} onChange={e => setIndiceContaPDF(Number(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    {contasDisponiveis.map((c, i) => (
                      <option key={i} value={i}>
                        {c.nome || `Conta ${i + 1}`}{c.conta ? ` - ${c.conta}` : ''}{c.principal ? ' (principal)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Acoes em lote */}
          {selectedFaturas.size > 0 && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-sm font-medium text-blue-700">{selectedFaturas.size} selecionadas</span>
              <Button size="sm" onClick={abrirBaixaLote}>Marcar Pagas</Button>
              <Button size="sm" variant="outline" onClick={handleGerarPDFConsolidado} disabled={gerandoConsolidado}>
                {gerandoConsolidado ? 'Gerando...' : 'PDF Consolidado'}
              </Button>
              <Button size="sm" variant="danger" onClick={acaoLoteCancelar}>Cancelar</Button>
              <Button size="sm" variant="outline" onClick={() => setSelectedFaturas(new Set())}>Limpar</Button>
            </div>
          )}

          {/* Lista */}
          <Card>
            <CardContent className="p-0">
              {faturasPaginadas.length === 0 ? (
                <div className="text-center py-12 text-gray-500">Nenhuma fatura encontrada</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="p-3 text-left">
                          <input type="checkbox" checked={selectedFaturas.size === faturasPaginadas.length && faturasPaginadas.length > 0}
                            onChange={toggleTodos} className="rounded" />
                        </th>
                        <th className="p-3 text-left">Numero</th>
                        <th className="p-3 text-left">Cliente</th>
                        <th className="p-3 text-left">Locacao</th>
                        <th className="p-3 text-right">Valor</th>
                        <th className="p-3 text-left">Vencimento</th>
                        <th className="p-3 text-center">Dias</th>
                        <th className="p-3 text-center">Status</th>
                        <th className="p-3 text-center">Parcela</th>
                        <th className="p-3 text-center">Acoes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {faturasPaginadas.map(f => {
                        const dias = f.data_vencimento ? calcularDiasVencimento(f.data_vencimento) : null
                        return (
                          <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-3">
                              <input type="checkbox" checked={selectedFaturas.has(f.id)}
                                onChange={() => toggleSelecao(f.id)} className="rounded" />
                            </td>
                            <td className="p-3 font-medium text-blue-600 cursor-pointer hover:underline"
                              onClick={() => router.push(`/dashboard/faturamento/${f.id}`)}>
                              <div className="flex items-center gap-1">
                                {f.numero || `#${f.id}`}
                                {f.tipo === 'indenizacao' && (
                                  <span className="text-[10px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-semibold uppercase leading-none">Indenizacao</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-gray-700">{f.cliente_nome}</td>
                            <td className="p-3 text-gray-500">{f.locacao_numero || '-'}</td>
                            <td className="p-3 text-right font-semibold">{formatarMoeda(Number(f.valor))}</td>
                            <td className="p-3 text-gray-600">{f.data_vencimento ? formatarData(f.data_vencimento) : '-'}</td>
                            <td className="p-3 text-center">
                              {dias !== null && f.status !== 'pago' && f.status !== 'cancelado' && (
                                <span className={`text-xs px-2 py-1 rounded ${
                                  dias > 0 ? 'bg-green-50 text-green-700' :
                                  dias === 0 ? 'bg-yellow-50 text-yellow-700' :
                                  'bg-red-50 text-red-700'
                                }`}>
                                  {dias > 0 ? `${dias}d` : dias === 0 ? 'Hoje' : `${Math.abs(dias)}d atraso`}
                                </span>
                              )}
                            </td>
                            <td className="p-3 text-center">{getStatusBadge(f.status)}</td>
                            <td className="p-3 text-center text-xs text-gray-500">
                              {f.parcela_numero && f.parcela_total ? `${f.parcela_numero}/${f.parcela_total}` : '-'}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => router.push(`/dashboard/faturamento/${f.id}`)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Ver detalhes">
                                  👁
                                </button>
                                <button onClick={() => handleGerarPDF(f)}
                                  className="p-1 text-gray-600 hover:bg-gray-50 rounded" title="PDF">
                                  📄
                                </button>
                                {f.status === 'vencido' && f.cliente_telefone && (
                                  <button onClick={() => {
                                    const msg = `Olá ${f.cliente_nome}, a fatura ${f.numero} no valor de ${formatarMoeda(Number(f.valor))} está vencida. Por favor, regularize o pagamento.`
                                    abrirWhatsApp(f.cliente_telefone, msg)
                                  }} className="p-1 text-green-600 hover:bg-green-50 rounded" title="WhatsApp">
                                    💬
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Paginacao */}
              {totalPaginas > 1 && (
                <div className="flex items-center justify-between p-4 border-t">
                  <span className="text-sm text-gray-500">
                    {faturasFiltradas.length} faturas | Pag {pagina} de {totalPaginas}
                  </span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={pagina <= 1} onClick={() => setPagina(p => p - 1)}>Anterior</Button>
                    <Button size="sm" variant="outline" disabled={pagina >= totalPaginas} onClick={() => setPagina(p => p + 1)}>Proxima</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============ ABA: GERAR FATURAS ============ */}
      {activeTab === 'gerar' && (
        <div className="space-y-4">
          {/* Sub-tabs */}
          <div className="flex gap-2">
            {[
              { key: 'automatica' as const, label: 'Geracao Automatica' },
              { key: 'parcelas' as const, label: 'Parcelas' },
              { key: 'avulsa' as const, label: 'Fatura Avulsa' },
            ].map(st => (
              <button key={st.key} onClick={() => setSubTab(st.key)}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                  subTab === st.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {st.label}
              </button>
            ))}
          </div>

          {/* Geracao Automatica */}
          {subTab === 'automatica' && (
            <Card>
              <CardHeader><CardTitle>Geracao Automatica por Periodo</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Periodo de Referencia</label>
                    <Input type="month" value={periodoRef} onChange={e => {
                      setPeriodoRef(e.target.value)
                      obterLocacoesElegiveis(e.target.value).then(el => {
                        setLocacoesElegiveis(el)
                        setLocacoesSelecionadas(new Set(el.map((l: any) => l.id)))
                      })
                    }} />
                  </div>
                  <div className="relative group">
                    <Button onClick={handleGerarLote} disabled={gerandoLote || locacoesSelecionadas.size === 0 || !mesmoCliente}>
                      {gerandoLote ? 'Gerando...' : 'Gerar Fatura'}
                    </Button>
                    {!mesmoCliente && (
                      <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        Selecione apenas contratos do mesmo cliente para gerar uma fatura unica.
                      </div>
                    )}
                  </div>
                </div>

                {locacoesElegiveis.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhuma locacao ativa elegivel para este periodo (ou ja foram faturadas).</p>
                ) : (
                  <>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>{locacoesSelecionadas.size} de {locacoesElegiveis.length} selecionada(s)</span>
                      <span className="text-gray-300">|</span>
                      <button className="text-blue-600 hover:underline" onClick={() =>
                        setLocacoesSelecionadas(new Set(locacoesElegiveis.map(l => l.id)))
                      }>Selecionar todas</button>
                      <button className="text-blue-600 hover:underline" onClick={() =>
                        setLocacoesSelecionadas(new Set())
                      }>Limpar selecao</button>
                      {locacoesSelecionadas.size > 0 && (
                        <>
                          <span className="text-gray-300">|</span>
                          <span className="font-medium">Total Medicao: {formatarMoeda(
                            locacoesElegiveis.filter(l => locacoesSelecionadas.has(l.id))
                              .reduce((s, l) => s + Number(l.valor_medicao || l.valor_total || 0), 0)
                          )}</span>
                        </>
                      )}
                    </div>
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-3 text-center w-10">
                              <input type="checkbox"
                                checked={locacoesSelecionadas.size === locacoesElegiveis.length && locacoesElegiveis.length > 0}
                                onChange={() => {
                                  if (locacoesSelecionadas.size === locacoesElegiveis.length) {
                                    setLocacoesSelecionadas(new Set())
                                  } else {
                                    setLocacoesSelecionadas(new Set(locacoesElegiveis.map(l => l.id)))
                                  }
                                }} className="rounded" />
                            </th>
                            <th className="p-3 text-left">Locacao</th>
                            <th className="p-3 text-left">Cliente</th>
                            <th className="p-3 text-left">Periodo</th>
                            <th className="p-3 text-right">Valor Contrato</th>
                            <th className="p-3 text-right">Valor Medicao</th>
                            <th className="p-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {locacoesElegiveis.map(l => (
                            <Fragment key={l.id}>
                            {/* Faturas ja emitidas no mes para o contrato: so consulta, em cinza */}
                            {(l.composicao?.faturadas || []).map((f: any, i: number) => (
                              <tr key={`${l.id}-faturada-${i}`} className="bg-gray-100 text-gray-400">
                                <td className="p-3"></td>
                                <td className="p-3 font-medium">{l.numero}</td>
                                <td className="p-3">{l.cliente_nome}</td>
                                <td className="p-3 text-xs">
                                  <div className="font-medium">{f.rotulo || 'Fatura do mes'}{f.data_inicio && ` · ${formatarData(f.data_inicio)} a ${formatarData(f.data_fim)}`}</div>
                                  <div>{f.numero}</div>
                                </td>
                                <td className="p-3 text-right">-</td>
                                <td className="p-3 text-right">{formatarMoeda(Number(f.valor))}</td>
                                <td className="p-3 text-center opacity-60">{getStatusBadge(f.status)}</td>
                              </tr>
                            ))}
                            <tr className={`hover:bg-gray-50 transition-colors ${locacoesSelecionadas.has(l.id) ? 'bg-blue-50' : ''}`}>
                              <td className="p-3 text-center">
                                <input type="checkbox" checked={locacoesSelecionadas.has(l.id)}
                                  onChange={() => {
                                    const novo = new Set(locacoesSelecionadas)
                                    if (novo.has(l.id)) novo.delete(l.id); else novo.add(l.id)
                                    setLocacoesSelecionadas(novo)
                                  }} className="rounded" />
                              </td>
                              <td className="p-3 font-medium">{l.numero}</td>
                              <td className="p-3">{l.cliente_nome}</td>
                              <td className="p-3 text-gray-500 text-xs">
                                {l.composicao?.pendente ? (
                                  <span className="font-medium text-gray-700">
                                    {l.composicao.pendente.rotulo} · {formatarData(l.composicao.pendente.data_inicio)} a {formatarData(l.composicao.pendente.data_fim)}
                                  </span>
                                ) : (
                                  <>{l.data_inicio ? formatarData(l.data_inicio) : '-'} a {l.data_fim ? formatarData(l.data_fim) : 'Indefinido'}</>
                                )}
                              </td>
                              <td className="p-3 text-right text-gray-500">{formatarMoeda(Number(l.valor_total))}</td>
                              <td className="p-3 text-right font-medium text-green-700">{formatarMoeda(Number(l.valor_medicao || l.valor_total))}</td>
                              <td className="p-3 text-center">
                                {l.composicao?.pendente ? (
                                  <Badge variant="warning">A faturar</Badge>
                                ) : (
                                  <Badge variant={l.status === 'ativo' ? 'success' : 'default'}>
                                    {l.status === 'ativo' ? 'Ativa' : l.status}
                                  </Badge>
                                )}
                              </td>
                            </tr>
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Parcelas */}
          {subTab === 'parcelas' && (
            <Card>
              <CardHeader><CardTitle>Gerar Parcelas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Locacao</label>
                    <select value={parcelaLocacao} onChange={e => {
                      setParcelaLocacao(e.target.value)
                      const loc = locacoes.find(l => l.id === parseInt(e.target.value))
                      if (loc) setParcelaValor(String(loc.valor_total || ''))
                    }} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="">Selecionar locacao...</option>
                      {locacoes.filter(l => l.status === 'ativo').map(l => (
                        <option key={l.id} value={l.id}>{l.numero} - {l.cliente_nome} ({formatarMoeda(Number(l.valor_total))})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
                    <Input type="number" value={parcelaValor} onChange={e => setParcelaValor(e.target.value)} placeholder="Valor total" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Numero de Parcelas</label>
                    <select value={parcelaQtd} onChange={e => setParcelaQtd(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      {[2,3,4,5,6,7,8,9,10,11,12].map(n => (
                        <option key={n} value={n}>{n}x de {parcelaValor ? formatarMoeda(parseFloat(parcelaValor) / n) : '-'}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Primeiro Vencimento</label>
                    <Input type="date" value={parcelaVencimento} onChange={e => setParcelaVencimento(e.target.value)} />
                  </div>
                </div>
                <Button onClick={handleGerarParcelas}>Gerar Parcelas</Button>
              </CardContent>
            </Card>
          )}

          {/* Avulsa */}
          {subTab === 'avulsa' && (
            <Card>
              <CardHeader><CardTitle>Nova Fatura Avulsa</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select value={avulsaForm.locacao_id} onChange={e => setAvulsaForm({ ...avulsaForm, locacao_id: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option value="">Selecionar Locacao</option>
                    {locacoes.map(l => <option key={l.id} value={l.id}>{l.numero} - {l.cliente_nome}</option>)}
                  </select>
                  <Input type="number" placeholder="Valor (R$)" value={avulsaForm.valor}
                    onChange={e => setAvulsaForm({ ...avulsaForm, valor: e.target.value })} />
                  <Input type="date" placeholder="Vencimento" value={avulsaForm.data_vencimento}
                    onChange={e => setAvulsaForm({ ...avulsaForm, data_vencimento: e.target.value })} />
                  <select value={avulsaForm.forma_pagamento} onChange={e => setAvulsaForm({ ...avulsaForm, forma_pagamento: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option value="">Forma de Pagamento</option>
                    <option value="PIX">PIX</option>
                    <option value="Boleto">Boleto</option>
                    <option value="Transferência">Transferencia</option>
                    <option value="Dinheiro">Dinheiro</option>
                  </select>
                </div>
                <Input placeholder="Observacoes..." value={avulsaForm.observacoes}
                  onChange={e => setAvulsaForm({ ...avulsaForm, observacoes: e.target.value })} />
                <Button onClick={handleCriarAvulsa}>Gerar Fatura</Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ============ ABA: REGUA DE COBRANCA ============ */}
      {activeTab === 'cobranca' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Regras de Cobranca</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => {
                setShowRegraForm(true)
                setEditandoRegra(null)
                setRegraForm({ nome: '', dias_antes_vencimento: '0', dias_apos_vencimento: '0', tipo_acao: 'whatsapp', template_mensagem: '', ativo: true })
              }}>+ Nova Regra</Button>
              <Button onClick={handleExecutarRegua} disabled={executandoRegua}>
                {executandoRegua ? 'Executando...' : 'Executar Regua'}
              </Button>
            </div>
          </div>

          {/* Form nova regra */}
          {showRegraForm && (
            <Card>
              <CardHeader><CardTitle>{editandoRegra ? 'Editar Regra' : 'Nova Regra'}</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input placeholder="Nome da regra" value={regraForm.nome}
                    onChange={e => setRegraForm({ ...regraForm, nome: e.target.value })} />
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Dias antes do vencimento</label>
                    <Input type="number" value={regraForm.dias_antes_vencimento}
                      onChange={e => setRegraForm({ ...regraForm, dias_antes_vencimento: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Dias apos vencimento</label>
                    <Input type="number" value={regraForm.dias_apos_vencimento}
                      onChange={e => setRegraForm({ ...regraForm, dias_apos_vencimento: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Template (use: {`{{cliente_nome}}, {{numero}}, {{valor}}, {{data_vencimento}}, {{valor_atualizado}}`})
                  </label>
                  <textarea value={regraForm.template_mensagem}
                    onChange={e => setRegraForm({ ...regraForm, template_mensagem: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-24 resize-none" />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={regraForm.ativo}
                      onChange={e => setRegraForm({ ...regraForm, ativo: e.target.checked })} className="rounded" />
                    <span className="text-sm">Ativa</span>
                  </label>
                  <div className="flex-1"></div>
                  <Button variant="outline" onClick={() => setShowRegraForm(false)}>Cancelar</Button>
                  <Button onClick={handleSalvarRegra}>Salvar</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de regras */}
          <Card>
            <CardContent className="p-0">
              {regras.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Nenhuma regra configurada</div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="p-3 text-left">Nome</th>
                      <th className="p-3 text-center">Momento</th>
                      <th className="p-3 text-center">Tipo</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-center">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {regras.map(r => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="p-3 font-medium">{r.nome}</td>
                        <td className="p-3 text-center text-gray-600">
                          {r.dias_antes_vencimento > 0
                            ? `${r.dias_antes_vencimento}d antes`
                            : r.dias_apos_vencimento > 0
                            ? `${r.dias_apos_vencimento}d apos`
                            : 'No dia'}
                        </td>
                        <td className="p-3 text-center capitalize">{r.tipo_acao}</td>
                        <td className="p-3 text-center">
                          <Badge variant={r.ativo ? 'success' : 'default'}>{r.ativo ? 'Ativa' : 'Inativa'}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex justify-center gap-1">
                            <button onClick={() => handleEditarRegra(r)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">Editar</button>
                            <button onClick={() => handleExcluirRegra(r.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">Excluir</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Log de cobranca recente */}
          <Card>
            <CardHeader><CardTitle>Log de Cobranca Recente</CardTitle></CardHeader>
            <CardContent>
              {logCobranca.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhuma cobranca registrada</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {logCobranca.slice(0, 20).map(log => (
                    <div key={log.id} className="flex items-center justify-between p-2 border-b border-gray-100">
                      <div>
                        <span className="text-sm font-medium">{(log.regua_cobranca as any)?.nome || log.tipo_acao}</span>
                        <span className="text-xs text-gray-500 ml-2">Fatura #{log.fatura_id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={log.status === 'enviado' ? 'success' : log.status === 'manual' ? 'primary' : 'default'}>
                          {log.status}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(log.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ============ ABA: RELATORIOS ============ */}
      {activeTab === 'relatorios' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {[
              { key: 'aging' as const, label: 'Aging Recebiveis' },
              { key: 'projecao' as const, label: 'Projecao de Caixa' },
              { key: 'cliente' as const, label: 'Receita por Cliente' },
              { key: 'periodo' as const, label: 'Receita por Periodo' },
            ].map(r => (
              <button key={r.key} onClick={() => setRelatorioTipo(r.key)}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                  relatorioTipo === r.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                {r.label}
              </button>
            ))}
          </div>

          {/* Aging */}
          {relatorioTipo === 'aging' && stats && (
            <Card>
              <CardHeader><CardTitle>Aging de Contas a Receber</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 mb-6">
                  {Object.entries(stats.aging).map(([faixa, valor]) => (
                    <div key={faixa} className={`p-4 rounded-lg text-center ${
                      faixa === '0-30' ? 'bg-yellow-50 border border-yellow-200' :
                      faixa === '31-60' ? 'bg-orange-50 border border-orange-200' :
                      faixa === '61-90' ? 'bg-red-50 border border-red-200' :
                      'bg-red-100 border border-red-300'
                    }`}>
                      <div className="text-sm font-medium text-gray-600">{faixa} dias</div>
                      <div className="text-xl font-bold mt-1">{formatarMoeda(valor as number)}</div>
                    </div>
                  ))}
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">Total vencido: </span>
                  <span className="text-lg font-bold text-red-600">
                    {formatarMoeda(Object.values(stats.aging as Record<string, number>).reduce((s, v) => s + v, 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Projecao de Caixa */}
          {relatorioTipo === 'projecao' && (
            <Card>
              <CardHeader><CardTitle>Projecao de Caixa - Proximos 30 dias</CardTitle></CardHeader>
              <CardContent>
                <ProjecaoCaixa faturas={faturas} />
              </CardContent>
            </Card>
          )}

          {/* Receita por Cliente */}
          {relatorioTipo === 'cliente' && stats && (
            <Card>
              <CardHeader><CardTitle>Receita por Cliente</CardTitle></CardHeader>
              <CardContent>
                <ReceitaPorCliente faturas={faturas} />
              </CardContent>
            </Card>
          )}

          {/* Receita por Periodo */}
          {relatorioTipo === 'periodo' && stats && (
            <Card>
              <CardHeader><CardTitle>Receita por Periodo</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.receitaMensal.map((m: any) => (
                    <div key={m.mes} className="flex items-center justify-between p-3 border-b border-gray-100">
                      <span className="text-sm font-medium">{m.mes}</span>
                      <span className="text-lg font-bold text-green-600">{formatarMoeda(m.valor)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ============ MODAL: BAIXA EM LOTE ============ */}
      {showBaixaLote && (() => {
        const alvo = faturasParaBaixa()
        const total = alvo.reduce((s, f) => s + (Number(f.valor) - Number(f.valor_pago || 0)), 0)
        const ignoradas = selectedFaturas.size - alvo.length
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold mb-4">
                Marcar {alvo.length} fatura{alvo.length === 1 ? '' : 's'} como paga{alvo.length === 1 ? '' : 's'}
              </h3>

              <div className="border rounded-lg divide-y mb-4 max-h-48 overflow-y-auto">
                {alvo.map(f => (
                  <div key={f.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <span className="font-medium text-gray-700">{f.numero}</span>
                    <span className="text-gray-600">{formatarMoeda(Number(f.valor) - Number(f.valor_pago || 0))}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 py-2 text-sm bg-gray-50">
                  <span className="font-semibold text-gray-700">Total</span>
                  <span className="font-bold text-green-600">{formatarMoeda(total)}</span>
                </div>
              </div>

              {ignoradas > 0 && (
                <p className="text-xs text-yellow-700 bg-yellow-50 rounded px-3 py-2 mb-4">
                  {ignoradas} fatura(s) da selecao ja estao pagas ou canceladas e serao ignoradas.
                </p>
              )}

              {!baixaEscolhendoData ? (
                <>
                  <p className="text-sm font-medium text-gray-700 mb-3">O pagamento foi recebido hoje?</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button className="flex-1" disabled={baixando}
                      onClick={() => acaoLoteMarcarPago(hojeISO())}>
                      Sim - {formatarData(hojeISO())}
                    </Button>
                    <Button className="flex-1" variant="outline" disabled={baixando}
                      onClick={() => setBaixaEscolhendoData(true)}>
                      Nao, outra data
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Em que dia o pagamento foi recebido?
                  </label>
                  {/* Sem data pre-preenchida: a escolha tem que ser deliberada */}
                  <Input type="date" value={baixaData} max={hojeISO()}
                    onChange={e => setBaixaData(e.target.value)} />
                  <p className="text-xs text-gray-500 mt-1 mb-4">
                    Esta data define em qual mes o valor entra em Recebimentos e Relatorios.
                  </p>
                  <Button className="w-full" disabled={!baixaData || baixando}
                    onClick={() => acaoLoteMarcarPago(baixaData)}>
                    Confirmar baixa
                  </Button>
                </>
              )}

              <div className="mt-4">
                <label className="block text-xs text-gray-500 mb-1">Forma de pagamento (opcional)</label>
                <select value={baixaForma} onChange={e => setBaixaForma(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">Selecionar...</option>
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartao">Cartao</option>
                </select>
              </div>

              <div className="flex justify-end mt-4">
                <Button variant="outline" disabled={baixando} onClick={() => setShowBaixaLote(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

// ============ COMPONENTES AUXILIARES ============

function ProjecaoCaixa({ faturas }: { faturas: any[] }) {
  const hoje = new Date()
  const em30 = new Date(hoje.getTime() + 30 * 86400000)

  const aReceber = faturas.filter(f =>
    ['emitido', 'pendente', 'parcial'].includes(f.status) &&
    f.data_vencimento &&
    new Date(f.data_vencimento) >= hoje &&
    new Date(f.data_vencimento) <= em30
  )

  const total = aReceber.reduce((s, f) => s + Number(f.valor) - Number(f.valor_pago || 0), 0)

  if (aReceber.length === 0) {
    return <p className="text-gray-400 text-sm">Nenhuma fatura a vencer nos proximos 30 dias</p>
  }

  // Agrupar por semana
  const semanas: Record<string, { label: string; valor: number; faturas: any[] }> = {}
  aReceber.forEach(f => {
    const venc = new Date(f.data_vencimento)
    const diffDias = Math.ceil((venc.getTime() - hoje.getTime()) / 86400000)
    const semana = Math.floor(diffDias / 7)
    const key = `s${semana}`
    if (!semanas[key]) {
      semanas[key] = { label: `Semana ${semana + 1} (${diffDias <= 7 ? 'esta semana' : `${semana * 7 + 1}-${(semana + 1) * 7} dias`})`, valor: 0, faturas: [] }
    }
    semanas[key].valor += Number(f.valor) - Number(f.valor_pago || 0)
    semanas[key].faturas.push(f)
  })

  return (
    <div className="space-y-4">
      {Object.values(semanas).map((s, i) => (
        <div key={i} className="p-3 bg-gray-50 rounded-lg">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">{s.label}</span>
            <span className="text-sm font-bold text-blue-600">{formatarMoeda(s.valor)}</span>
          </div>
          <div className="text-xs text-gray-500">{s.faturas.length} fatura(s)</div>
        </div>
      ))}
      <div className="flex justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
        <span className="font-medium">Total Projetado</span>
        <span className="font-bold text-blue-700">{formatarMoeda(total)}</span>
      </div>
    </div>
  )
}

function ReceitaPorCliente({ faturas }: { faturas: any[] }) {
  const porCliente: Record<string, { nome: string; pago: number; pendente: number; total: number }> = {}

  faturas.filter(f => f.status !== 'cancelado').forEach(f => {
    const nome = f.cliente_nome || 'Desconhecido'
    if (!porCliente[nome]) porCliente[nome] = { nome, pago: 0, pendente: 0, total: 0 }
    porCliente[nome].total += Number(f.valor)
    if (f.status === 'pago') porCliente[nome].pago += Number(f.valor)
    else porCliente[nome].pendente += Number(f.valor)
  })

  const lista = Object.values(porCliente).sort((a, b) => b.total - a.total)

  if (lista.length === 0) {
    return <p className="text-gray-400 text-sm">Nenhum dado disponivel</p>
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50">
        <tr>
          <th className="p-3 text-left">Cliente</th>
          <th className="p-3 text-right">Pago</th>
          <th className="p-3 text-right">Pendente</th>
          <th className="p-3 text-right">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y">
        {lista.map(c => (
          <tr key={c.nome}>
            <td className="p-3 font-medium">{c.nome}</td>
            <td className="p-3 text-right text-green-600">{formatarMoeda(c.pago)}</td>
            <td className="p-3 text-right text-yellow-600">{formatarMoeda(c.pendente)}</td>
            <td className="p-3 text-right font-bold">{formatarMoeda(c.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
