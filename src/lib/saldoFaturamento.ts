/**
 * Composicao do faturamento de um contrato num mes de referencia.
 *
 * Um mes pode ja ter fatura e ainda assim ter valor a cobrar: quando o
 * contrato e renovado depois de o mes ter sido faturado, a fatura cobriu so os
 * dias do periodo antigo e os dias da renovacao ficaram de fora. Por isso o
 * mes nao e "ja faturado" por ter uma fatura — e pelo quanto ela cobriu.
 *
 * Aqui o mes e dividido nas partes de cada periodo do contrato (original,
 * renovacao 1, 2...) e cada fatura emitida e associada as partes que cobriu,
 * para a tela mostrar o que ja foi faturado e o que falta.
 *
 * Fica fora de faturamento.ts, que importa o supabase, para poder ser
 * verificado por scripts/verificar-saldo-faturamento.js.
 */

export interface FaturaDoPeriodo {
  numero?: string | null
  status?: string | null
  locacao_id: number | null
  locacao_numero: string | null
  valor: number | string | null
  valor_original: number | string | null
  observacoes?: string | null
}

export interface PeriodoDoContrato {
  data_inicio: string
  data_fim: string
  valor_total: number
}

/** Os dias de um periodo do contrato que caem no mes. valor sem arredondar. */
export interface ParteDoMes {
  rotulo: string
  data_inicio: string
  data_fim: string
  dias: number
  diaria: number
  valor: number
}

/** A parte de um contrato numa fatura ja emitida no mes. */
export interface FaturaDoContrato {
  numero: string
  status: string
  valor: number
}

export interface ComposicaoDoMes {
  faturadas: (FaturaDoContrato & { rotulo: string; data_inicio: string; data_fim: string })[]
  pendente: { rotulo: string; data_inicio: string; data_fim: string; valor: number } | null
}

/**
 * Diferenca abaixo disto e arredondamento entre medicao e fatura, nao dia sem
 * cobrar — uma parte de verdade vale ao menos uma diaria.
 */
const TOLERANCIA_ARREDONDAMENTO = 0.1

function arredondar(v: number): number {
  return Math.round(v * 100) / 100
}

// Datas em UTC: so contam dias, entao fuso nao pode deslocar o resultado
function paraUTC(dataISO: string): number {
  const [a, m, d] = dataISO.split('-').map(Number)
  return Date.UTC(a, m - 1, d)
}

function diffDias(inicio: string, fim: string): number {
  return Math.round((paraUTC(fim) - paraUTC(inicio)) / 86400000) + 1
}

function somarDias(dataISO: string, dias: number): string {
  return new Date(paraUTC(dataISO) + dias * 86400000).toISOString().slice(0, 10)
}

/** Meses de referencia (YYYY-MM) que o intervalo toca, do primeiro ao ultimo. */
export function mesesDoIntervalo(dataInicio: string, dataFim: string): string[] {
  if (!dataInicio || !dataFim || dataFim < dataInicio) return []
  const meses: string[] = []
  let [ano, mes] = dataInicio.split('-').map(Number)
  const [anoFim, mesFim] = dataFim.split('-').map(Number)
  while (ano < anoFim || (ano === anoFim && mes <= mesFim)) {
    meses.push(`${ano}-${String(mes).padStart(2, '0')}`)
    mes++
    if (mes > 12) { mes = 1; ano++ }
  }
  return meses
}

function rotuloDoPeriodo(indice: number): string {
  return indice === 0 ? 'Contrato original' : `Renovação ${indice}`
}

/**
 * Divide o mes nas partes de cada periodo do contrato (mes comercial, V3):
 * diaria = valor_mensal / 30 e dias faturaveis = min(dias do mes, 30).
 */
export function partesDoMes(periodos: PeriodoDoContrato[], periodoReferencia: string): ParteDoMes[] {
  const [ano, mes] = periodoReferencia.split('-').map(Number)
  const diasFaturaveis = Math.min(new Date(ano, mes, 0).getDate(), 30)
  const mesStr = String(mes).padStart(2, '0')
  const inicioMes = `${ano}-${mesStr}-01`
  const fimMesFaturavel = `${ano}-${mesStr}-${String(diasFaturaveis).padStart(2, '0')}`

  const partes: ParteDoMes[] = []
  periodos.forEach((periodo, indice) => {
    if (periodo.data_fim < inicioMes || periodo.data_inicio > fimMesFaturavel) return

    const inicio = periodo.data_inicio > inicioMes ? periodo.data_inicio : inicioMes
    const fim = periodo.data_fim < fimMesFaturavel ? periodo.data_fim : fimMesFaturavel
    const dias = diffDias(inicio, fim)
    if (dias <= 0) return

    const diaria = periodo.valor_total / 30
    partes.push({ rotulo: rotuloDoPeriodo(indice), data_inicio: inicio, data_fim: fim, dias, diaria, valor: diaria * dias })
  })
  return partes
}

function escaparRegex(texto: string): string {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Le a parte de um contrato nas observacoes da fatura unificada: "LOC-2026-001: R$ 3.220,00 | ..." */
function parteNaUnificada(observacoes: string | null | undefined, numero: string): number | null {
  if (!observacoes) return null
  const regex = new RegExp(`(?:^|\\|)\\s*${escaparRegex(numero)}:\\s*R\\$\\s*([\\d.]+,\\d{2})`)
  const achado = observacoes.match(regex)
  if (!achado) return null
  return Number(achado[1].replace(/\./g, '').replace(',', '.'))
}

/**
 * As faturas do mes (nao canceladas) que incluem o contrato, com a parte dele
 * em cada uma.
 *
 * Usa valor_original — o valor calculado na geracao — e nao valor, que muda
 * quando a fatura e editada (desconto, acerto): editar uma fatura nao pode
 * reabrir o mes para faturamento.
 *
 * Retorna null quando uma fatura unificada inclui o contrato mas nao da para
 * saber a parte dele.
 */
export function faturasDoContrato(
  faturas: FaturaDoPeriodo[],
  locacao: { id: number; numero: string }
): FaturaDoContrato[] | null {
  const doContrato: FaturaDoContrato[] = []
  for (const f of faturas) {
    const numeros = (f.locacao_numero || '').split(',').map(n => n.trim()).filter(Boolean)
    const incluiContrato = numeros.includes(locacao.numero) || (numeros.length === 0 && f.locacao_id === locacao.id)
    if (!incluiContrato) continue

    const valor = numeros.length <= 1
      ? Number(f.valor_original ?? f.valor) || 0
      : parteNaUnificada(f.observacoes, locacao.numero)
    if (valor === null) return null

    doContrato.push({ numero: f.numero || '', status: f.status || '', valor })
  }
  return doContrato
}

/**
 * Quanto do contrato ja foi faturado no mes. Infinity quando nao da para
 * saber: na duvida o mes fica fechado.
 */
export function valorFaturadoDoContrato(
  faturas: FaturaDoPeriodo[],
  locacao: { id: number; numero: string }
): number {
  const doContrato = faturasDoContrato(faturas, locacao)
  if (doContrato === null) return Infinity
  return arredondar(doContrato.reduce((s, f) => s + f.valor, 0))
}

/** Medicao do mes menos o ja faturado; nunca negativo. */
export function saldoAFaturar(valorMedicao: number, valorFaturado: number): number {
  if (!isFinite(valorFaturado)) return 0
  const saldo = arredondar(valorMedicao - valorFaturado)
  return saldo < TOLERANCIA_ARREDONDAMENTO ? 0 : saldo
}

/**
 * Os dias do mes que uma fatura cobriu, pela mesma distribuicao de comporMes.
 * null quando a fatura nao esta entre as do contrato (ex.: cancelada).
 */
export function periodoCobertoPelaFatura(
  partes: ParteDoMes[],
  faturas: FaturaDoContrato[],
  numeroFatura: string
): { data_inicio: string; data_fim: string } | null {
  const fatura = comporMes(partes, faturas, 0).faturadas.find(f => f.numero === numeroFatura)
  if (!fatura || !fatura.data_inicio) return null
  return { data_inicio: fatura.data_inicio, data_fim: fatura.data_fim }
}

/**
 * Associa cada fatura as partes do mes que ela cobriu e diz o que falta.
 *
 * A fatura nao guarda as datas que cobriu, entao os valores sao distribuidos
 * pelas partes em ordem cronologica — as faturas sao emitidas nessa ordem:
 * primeiro o periodo em vigor, depois o que a renovacao acrescentou.
 */
export function comporMes(partes: ParteDoMes[], faturas: FaturaDoContrato[], saldo: number): ComposicaoDoMes {
  // Posicao ate onde ja foi faturado: parte atual e dias dela ja cobertos
  let parte = 0
  let diasCobertos = 0

  const dataDaPosicao = () => somarDias(partes[parte].data_inicio, diasCobertos)

  const faturadas: ComposicaoDoMes['faturadas'] = []
  for (const fatura of faturas) {
    let restante = fatura.valor
    const rotulos: string[] = []
    let inicio = ''
    let fim = ''

    while (restante >= TOLERANCIA_ARREDONDAMENTO && parte < partes.length) {
      const atual = partes[parte]
      const diasRestantes = atual.dias - diasCobertos
      const valorRestante = atual.diaria * diasRestantes
      const dias = restante >= valorRestante - TOLERANCIA_ARREDONDAMENTO
        ? diasRestantes
        : Math.round(restante / atual.diaria)
      if (dias <= 0) break

      if (!inicio) inicio = dataDaPosicao()
      fim = somarDias(atual.data_inicio, diasCobertos + dias - 1)
      if (!rotulos.includes(atual.rotulo)) rotulos.push(atual.rotulo)

      restante -= atual.diaria * dias
      diasCobertos += dias
      if (diasCobertos >= atual.dias) {
        parte++
        diasCobertos = 0
      }
    }

    faturadas.push({ ...fatura, rotulo: rotulos.join(' + '), data_inicio: inicio, data_fim: fim })
  }

  if (saldo <= 0 || partes.length === 0) return { faturadas, pendente: null }

  // Os dias ja foram todos cobertos mas sobrou saldo: atribui a ultima parte
  if (parte >= partes.length) {
    parte = partes.length - 1
    diasCobertos = 0
  }
  const pendentes = partes.slice(parte)
  return {
    faturadas,
    pendente: {
      rotulo: pendentes.map(p => p.rotulo).join(' + '),
      data_inicio: dataDaPosicao(),
      data_fim: pendentes[pendentes.length - 1].data_fim,
      valor: saldo,
    },
  }
}
