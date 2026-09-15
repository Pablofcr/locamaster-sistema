/**
 * Saldo a faturar de um contrato num mes de referencia.
 *
 * Um mes pode ja ter fatura e ainda assim ter valor a cobrar: quando o
 * contrato e renovado depois de o mes ter sido faturado, a fatura cobriu so os
 * dias do periodo antigo e os dias do periodo novo ficaram de fora. Por isso o
 * mes nao e "ja faturado" por ter uma fatura — e pelo quanto ela cobriu.
 *
 * Fica fora de faturamento.ts, que importa o supabase, para poder ser
 * verificado por scripts/verificar-saldo-faturamento.js.
 */

export interface FaturaDoPeriodo {
  locacao_id: number | null
  locacao_numero: string | null
  valor: number | string | null
  valor_original: number | string | null
  observacoes?: string | null
}

function arredondar(v: number): number {
  return Math.round(v * 100) / 100
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
 * Quanto do contrato ja foi faturado nas faturas do mes (nao canceladas).
 *
 * Usa valor_original — o valor calculado na geracao — e nao valor, que muda
 * quando a fatura e editada (desconto, acerto): editar uma fatura nao pode
 * reabrir o mes para faturamento.
 *
 * Retorna Infinity quando uma fatura unificada inclui o contrato mas nao da
 * para saber a parte dele; na duvida o mes fica fechado, como era antes.
 */
export function valorFaturadoDoContrato(
  faturas: FaturaDoPeriodo[],
  locacao: { id: number; numero: string }
): number {
  let total = 0
  for (const f of faturas) {
    const numeros = (f.locacao_numero || '').split(',').map(n => n.trim()).filter(Boolean)
    const incluiContrato = numeros.includes(locacao.numero) || (numeros.length === 0 && f.locacao_id === locacao.id)
    if (!incluiContrato) continue

    if (numeros.length <= 1) {
      total += Number(f.valor_original ?? f.valor) || 0
      continue
    }

    const parte = parteNaUnificada(f.observacoes, locacao.numero)
    if (parte === null) return Infinity
    total += parte
  }
  return arredondar(total)
}

/**
 * Diferenca abaixo disto e arredondamento entre medicao e fatura, nao dia sem
 * cobrar — um complemento de verdade vale ao menos uma diaria.
 */
const TOLERANCIA_ARREDONDAMENTO = 0.1

/** Medicao do mes menos o ja faturado; nunca negativo. */
export function saldoAFaturar(valorMedicao: number, valorFaturado: number): number {
  if (!isFinite(valorFaturado)) return 0
  const saldo = arredondar(valorMedicao - valorFaturado)
  return saldo < TOLERANCIA_ARREDONDAMENTO ? 0 : saldo
}
