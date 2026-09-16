/**
 * Formas de pagamento que saem nas faturas: PIX e contas bancarias.
 *
 * A configuracao guardava uma conta so, em quatro colunas (banco_nome,
 * banco_agencia, banco_conta, banco_titular). Empresas costumam receber em
 * mais de um banco, entao a lista passou a ser gravada na coluna `bancos`
 * (JSONB) — e as colunas antigas continuam sendo lidas quando a lista esta
 * vazia, para nenhuma configuracao ja salva sumir do PDF.
 *
 * Fica fora de faturamento.ts, que importa o supabase, para poder ser
 * verificado por scripts/verificar-configuracao-pagamento.js.
 */

export interface ContaBancaria {
  nome: string
  agencia: string
  conta: string
  titular: string
  /** A conta que sai nas faturas quando nenhuma outra e escolhida na hora do PDF */
  principal?: boolean
}

export interface StatusConfiguracao {
  temPix: boolean
  temBanco: boolean
  temObservacoes: boolean
  /** Sem PIX e sem banco, a fatura sai sem como o cliente pagar. */
  semFormaDePagamento: boolean
}

function texto(v: any): string {
  return typeof v === 'string' ? v.trim() : v == null ? '' : String(v).trim()
}

/** Descarta entradas em branco: banco sem nome nem conta nao vai para o PDF. */
function contaPreenchida(c: ContaBancaria): boolean {
  return Boolean(c.nome || c.agencia || c.conta || c.titular)
}

/**
 * As contas bancarias da configuracao, na ordem em que devem aparecer.
 * Usa a coluna `bancos`; se ela estiver vazia, cai para as colunas antigas.
 */
export function lerContasBancarias(config: any): ContaBancaria[] {
  if (!config) return []

  let lista: any[] = []
  const bruto = config.bancos
  try {
    lista = typeof bruto === 'string' ? JSON.parse(bruto) : (bruto || [])
  } catch { lista = [] }
  if (!Array.isArray(lista)) lista = []

  const contas = lista
    .map(b => ({
      nome: texto(b?.nome),
      agencia: texto(b?.agencia),
      conta: texto(b?.conta),
      titular: texto(b?.titular),
      principal: Boolean(b?.principal),
    }))
    .filter(contaPreenchida)

  if (contas.length > 0) return contas

  const antiga: ContaBancaria = {
    nome: texto(config.banco_nome),
    agencia: texto(config.banco_agencia),
    conta: texto(config.banco_conta),
    titular: texto(config.banco_titular),
    principal: true,
  }
  return contaPreenchida(antiga) ? [antiga] : []
}

/**
 * A conta que vai na fatura por padrao: a marcada como principal ou, se
 * nenhuma estiver marcada, a primeira da lista — nunca nenhuma quando ha
 * conta cadastrada, senao a fatura sairia sem dados para deposito.
 */
export function contaPrincipal(config: any): ContaBancaria | null {
  const contas = lerContasBancarias(config)
  if (contas.length === 0) return null
  return contas.find(c => c.principal) || contas[0]
}

/**
 * Qual conta vai no PDF desta fatura, em ordem de prioridade:
 *
 * 1. a escolhida agora no seletor — troca deliberada do usuario;
 * 2. a que ja foi enviada ao cliente nesta fatura — o cliente recebeu esses
 *    dados, entao a segunda via nao pode mudar de conta sozinha;
 * 3. a principal da configuracao.
 */
export function escolherContaDoPDF(
  contaSelecionada: ContaBancaria | null | undefined,
  contaDaFatura: any,
  config: any
): ContaBancaria | null {
  if (contaSelecionada) return contaSelecionada

  let gravada: any = contaDaFatura
  try {
    if (typeof gravada === 'string') gravada = JSON.parse(gravada)
  } catch { gravada = null }

  if (gravada && (gravada.nome || gravada.agencia || gravada.conta || gravada.titular)) {
    return {
      nome: texto(gravada.nome),
      agencia: texto(gravada.agencia),
      conta: texto(gravada.conta),
      titular: texto(gravada.titular),
      principal: Boolean(gravada.principal),
    }
  }

  return contaPrincipal(config)
}

/** Uma linha por conta: "Itau | Ag: 1234 | Cc: 56789-0 | BRALOC LTDA" */
export function descreverConta(conta: ContaBancaria): string {
  return `${conta.nome || '-'} | Ag: ${conta.agencia || '-'} | Cc: ${conta.conta || '-'}${conta.titular ? ` | ${conta.titular}` : ''}`
}

/** O que ja esta configurado e o que falta, para o lembrete na tela. */
export function statusConfiguracao(config: any): StatusConfiguracao {
  const temPix = Boolean(texto(config?.pix_chave))
  const temBanco = lerContasBancarias(config).length > 0
  return {
    temPix,
    temBanco,
    temObservacoes: Boolean(texto(config?.observacoes_padrao)),
    semFormaDePagamento: !temPix && !temBanco,
  }
}
