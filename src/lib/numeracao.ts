/**
 * Numeracao unificada de orcamentos e contratos de locacao.
 *
 * Regra do negocio (a partir de 2026-09):
 * - Existe UM sequencial mestre, global e que nao reseta na virada do ano.
 * - O orcamento consome o proximo sequencial: ORC-0012
 * - O contrato gerado a partir dele HERDA o mesmo sequencial: LOC-2026-0012
 * - Contrato avulso (sem orcamento) consome o proximo sequencial livre.
 * - Renovacao nao consome sequencial: recebe sufixo -R1, -R2, ... sobre o
 *   numero do contrato original.
 *
 * Contratos anteriores a essa regra usam 3 digitos e sequencia propria
 * (LOC-2026-009). Sao lidos normalmente, mas nunca reescritos.
 */

/** Largura do sequencial em numeros novos. Os antigos (3 digitos) continuam validos. */
const PADDING = 4

/**
 * Extrai o sequencial de um numero de documento, seja ele orcamento,
 * contrato ou renovacao. Retorna null se o texto nao for um numero valido.
 *
 * ORC-0012          -> 12
 * LOC-2026-0012     -> 12
 * LOC-2026-0012-R2  -> 12
 * LOC-2026-009      -> 9   (formato legado)
 */
export function extrairSequencial(numero: string | null | undefined): number | null {
  if (!numero) return null
  const partes = String(numero).trim().toUpperCase().split('-')
  if (partes.length < 2) return null

  const prefixo = partes[0]
  if (prefixo !== 'ORC' && prefixo !== 'LOC' && prefixo !== 'FAT') return null

  // Descarta um eventual sufixo de renovacao no fim (R1, R2, ...)
  if (/^R\d+$/.test(partes[partes.length - 1])) partes.pop()

  // O sequencial e sempre o ultimo campo restante
  const bruto = partes[partes.length - 1]
  if (!/^\d+$/.test(bruto)) return null

  return parseInt(bruto, 10)
}

/**
 * Dado tudo que ja foi emitido (orcamentos e contratos), devolve o proximo
 * sequencial livre. Baseado no MAIOR numero ja usado, nunca em contagem de
 * linhas: apagar um registro nao pode liberar um numero que ja circulou
 * assinado com o cliente.
 */
export function proximoSequencial(numerosExistentes: (string | null | undefined)[]): number {
  let maior = 0
  for (const n of numerosExistentes) {
    const seq = extrairSequencial(n)
    if (seq !== null && seq > maior) maior = seq
  }
  return maior + 1
}

/** Formata o numero de um orcamento: 12 -> ORC-0012 */
export function formatarNumeroOrcamento(sequencial: number): string {
  return `ORC-${String(sequencial).padStart(PADDING, '0')}`
}

/**
 * Formata o numero de um contrato: (12, 2026) -> LOC-2026-0012
 * O ano indica a emissao; o sequencial atravessa os anos sem reiniciar.
 */
export function formatarNumeroLocacao(sequencial: number, ano: number = new Date().getFullYear()): string {
  return `LOC-${ano}-${String(sequencial).padStart(PADDING, '0')}`
}

/**
 * Numero do documento de uma renovacao, derivado do contrato original.
 * (LOC-2026-0012, 1) -> LOC-2026-0012-R1
 *
 * `indiceRenovacao` e 1-based: a primeira renovacao do contrato e R1.
 * Renovacoes nao geram registro proprio no banco; o numero existe para
 * identificar o documento que o cliente assina em cada prorrogacao.
 */
export function formatarNumeroRenovacao(numeroContrato: string, indiceRenovacao: number): string {
  return `${numeroContrato}-R${indiceRenovacao}`
}

/**
 * Converte o numero de um orcamento no numero do contrato correspondente,
 * preservando o sequencial. Usado quando um orcamento aprovado vira contrato.
 * Devolve null se o orcamento nao tiver numero legivel — nesse caso o chamador
 * deve cair no proximo sequencial livre.
 */
export function numeroLocacaoDoOrcamento(
  numeroOrcamento: string | null | undefined,
  ano: number = new Date().getFullYear()
): string | null {
  const seq = extrairSequencial(numeroOrcamento)
  if (seq === null) return null
  return formatarNumeroLocacao(seq, ano)
}

/**
 * Compara dois numeros ignorando formatacao, para a busca na tela.
 * Permite achar o contrato LOC-2026-0012 digitando "ORC-0012", "12" ou
 * "LOC-2026-0012-R1".
 */
export function numeroCorrespondeBusca(numeroDoc: string | null | undefined, termo: string): boolean {
  const busca = termo.trim().toLowerCase()
  if (!busca) return true

  const doc = String(numeroDoc || '').toLowerCase()
  if (doc.includes(busca)) return true

  // Busca pelo sequencial: casa ORC-0012 com LOC-2026-0012 e vice-versa
  const seqDoc = extrairSequencial(numeroDoc)
  if (seqDoc === null) return false

  const seqBusca = extrairSequencial(termo)
  if (seqBusca !== null) return seqDoc === seqBusca

  // Termo puramente numerico ("12" ou "0012")
  if (/^\d+$/.test(busca)) return seqDoc === parseInt(busca, 10)

  return false
}

/**
 * Formato de cada documento, como exibido na tela de Configuracoes.
 *
 * Fica aqui, junto das funcoes que geram os numeros, para que a tela nunca
 * possa divergir do que o sistema realmente faz — foi o que aconteceu antes,
 * quando a tela anunciava ORC-YYYY-NNN e o codigo gerava ORC-NNNN.
 *
 * Os exemplos usam um sequencial ficticio so para ilustrar o formato.
 */
export const FORMATOS_NUMERACAO = {
  orcamento: {
    rotulo: 'Orcamentos',
    formato: `ORC-${'N'.repeat(PADDING)}`,
    exemplo: formatarNumeroOrcamento(12),
    nota: 'Sequencial unico, compartilhado com os contratos.',
  },
  locacao: {
    rotulo: 'Contratos de locacao',
    formato: `LOC-AAAA-${'N'.repeat(PADDING)}`,
    exemplo: formatarNumeroLocacao(12, 2026),
    nota: 'Herda o numero do orcamento que deu origem ao contrato.',
  },
  renovacao: {
    rotulo: 'Renovacoes',
    formato: `LOC-AAAA-${'N'.repeat(PADDING)}-RN`,
    exemplo: formatarNumeroRenovacao(formatarNumeroLocacao(12, 2026), 1),
    nota: 'Sufixo -R1, -R2 sobre o contrato original. Nao consome sequencial.',
  },
  fatura: {
    rotulo: 'Faturas',
    formato: 'FAT-AAAA-NNN',
    exemplo: 'FAT-2026-001',
    nota: 'Sequencial proprio, reiniciado a cada ano.',
  },
} as const
