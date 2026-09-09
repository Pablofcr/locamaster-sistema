/**
 * Datas do dia a dia do sistema, sempre no fuso local.
 *
 * O sistema guarda datas como texto YYYY-MM-DD (colunas DATE do Postgres),
 * sem hora. O jeito natural de produzir esse texto em JavaScript —
 * `new Date().toISOString().split('T')[0]` — devolve a data em UTC, nao a
 * data local. No horario de Brasilia (UTC-3), a partir das 21h o UTC ja
 * esta no dia seguinte, entao uma baixa lancada as 22h do dia 9 era gravada
 * como dia 10.
 *
 * Nao e um erro visivel: some no meio do expediente e so aparece em quem
 * trabalha a noite, e mesmo assim de forma silenciosa — o valor entra no
 * mes errado no fechamento, sem nenhum aviso.
 *
 * Use `hojeISO()` no lugar de `new Date().toISOString()` e `paraISO(d)` para
 * converter um Date qualquer.
 *
 * Datas construidas a partir de texto seguem usando `<data> + 'T12:00:00'`,
 * padrao ja adotado no restante do codigo: ao ancorar no meio-dia, somar ou
 * subtrair dias nunca cruza a meia-noite por diferenca de fuso.
 */

/** Converte um Date para YYYY-MM-DD no fuso local (nunca em UTC). */
export function paraISO(data: Date): string {
  const semFuso = new Date(data.getTime() - data.getTimezoneOffset() * 60000)
  return semFuso.toISOString().split('T')[0]
}

/** Data de hoje no fuso local, como YYYY-MM-DD. */
export function hojeISO(): string {
  return paraISO(new Date())
}

/**
 * Data de hoje deslocada em N dias, como YYYY-MM-DD.
 * Aceita valores negativos para datas passadas.
 */
export function hojeMaisDias(dias: number): string {
  const d = new Date()
  d.setDate(d.getDate() + dias)
  return paraISO(d)
}

/**
 * Converte um texto YYYY-MM-DD em Date ancorado ao meio-dia local, de forma
 * que somar ou subtrair dias no resultado nunca mude o dia por fuso.
 */
export function doISO(dataISO: string): Date {
  return new Date(dataISO + 'T12:00:00')
}
