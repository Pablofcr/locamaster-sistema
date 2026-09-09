import { supabase } from '@/lib/supabase'
import {
  extrairSequencial,
  formatarNumeroLocacao,
  numeroLocacaoDoOrcamento,
  proximoSequencial,
} from '@/lib/numeracao'
import { hojeISO } from '@/lib/data'

export interface DisponibilidadeEquipamento {
  disponivel: boolean
  quantidade_disponivel: number
  locado_ate?: string
}

/**
 * Verifica disponibilidade de equipamentos para um periodo,
 * considerando locacoes ativas/pendentes E orcamentos aprovados que conflitam.
 */
export async function verificarDisponibilidade(
  dataInicio: string,
  dataFim: string,
  locacaoIdExcluir?: number,
  orcamentoIdExcluir?: number
): Promise<Record<number, DisponibilidadeEquipamento>> {
  const mapa: Record<number, DisponibilidadeEquipamento> = {}

  if (!dataInicio || !dataFim) return mapa

  // Buscar locacoes E orcamentos aprovados em paralelo
  const [locRes, orcRes] = await Promise.all([
    supabase
      .from('locacoes')
      .select('id, data_inicio, data_fim, equipamento_id, quantidade, itens, status')
      .in('status', ['pendente', 'ativo']),
    supabase
      .from('orcamentos')
      .select('id, data_inicio_locacao, data_fim_locacao, itens, status')
      .eq('status', 'aprovado')
  ])

  const locacoes = locRes.data || []
  const orcamentos = orcRes.data || []

  // Coletar IDs de orcamentos que ja tem locacao vinculada para nao contar 2x
  const orcamentosComLocacao = new Set<number>()
  for (const loc of locacoes) {
    if ((loc as any).orcamento_id) orcamentosComLocacao.add((loc as any).orcamento_id)
  }

  // Helper para acumular comprometimento no mapa
  const acumular = (eqId: number, qtd: number, dataFimRef: string) => {
    if (!mapa[eqId]) {
      mapa[eqId] = { disponivel: true, quantidade_disponivel: 0, locado_ate: dataFimRef }
    }
    mapa[eqId].quantidade_disponivel += qtd
    if (dataFimRef > (mapa[eqId].locado_ate || '')) {
      mapa[eqId].locado_ate = dataFimRef
    }
  }

  // Processar locacoes conflitantes
  const locacoesConflitantes = locacoes.filter(loc => {
    if (locacaoIdExcluir && loc.id === locacaoIdExcluir) return false
    if (!loc.data_inicio || !loc.data_fim) return false
    return loc.data_inicio <= dataFim && loc.data_fim >= dataInicio
  })

  for (const loc of locacoesConflitantes) {
    let itensLocacao: any[] = []
    try {
      if (loc.itens) {
        itensLocacao = typeof loc.itens === 'string' ? JSON.parse(loc.itens) : loc.itens
      }
    } catch { /* ignore */ }

    if (itensLocacao.length > 0) {
      for (const item of itensLocacao) {
        acumular(item.equipamento_id, item.quantidade || 1, loc.data_fim)
      }
    } else if (loc.equipamento_id) {
      acumular(loc.equipamento_id, loc.quantidade || 1, loc.data_fim)
    }
  }

  // Processar orcamentos aprovados que NAO tem locacao vinculada (evitar contagem dupla)
  const orcamentosConflitantes = orcamentos.filter(orc => {
    if (orcamentoIdExcluir && orc.id === orcamentoIdExcluir) return false
    if (orcamentosComLocacao.has(orc.id)) return false
    if (!orc.data_inicio_locacao || !orc.data_fim_locacao) return false
    return orc.data_inicio_locacao <= dataFim && orc.data_fim_locacao >= dataInicio
  })

  for (const orc of orcamentosConflitantes) {
    let itensOrc: any[] = []
    try {
      if (orc.itens) {
        itensOrc = typeof orc.itens === 'string' ? JSON.parse(orc.itens) : orc.itens
      }
    } catch { /* ignore */ }

    for (const item of itensOrc) {
      acumular(item.equipamento_id, item.quantidade || 1, orc.data_fim_locacao)
    }
  }

  // Agora buscar dados dos equipamentos para calcular disponibilidade real
  const equipIds = Object.keys(mapa).map(Number)
  if (equipIds.length > 0) {
    const { data: equipamentos } = await supabase
      .from('equipamentos')
      .select('id, controle_quantidade, quantidade_total, quantidade_disponivel')
      .in('id', equipIds)

    for (const eq of equipamentos || []) {
      if (mapa[eq.id]) {
        const qtdComprometida = mapa[eq.id].quantidade_disponivel
        if (eq.controle_quantidade) {
          const realDisponivel = (eq.quantidade_total || 0) - qtdComprometida
          mapa[eq.id].quantidade_disponivel = Math.max(realDisponivel, 0)
          mapa[eq.id].disponivel = realDisponivel > 0
        } else {
          // Equipamento individual - se tem qualquer locacao conflitante, nao esta disponivel
          mapa[eq.id].quantidade_disponivel = 0
          mapa[eq.id].disponivel = false
        }
      }
    }
  }

  return mapa
}

/**
 * Busca todos os numeros ja emitidos, em orcamentos e contratos.
 * O sequencial e unico entre os dois documentos, entao o contador precisa
 * enxergar as duas tabelas.
 */
async function buscarNumerosEmitidos(): Promise<{ todos: string[]; locacoes: string[] }> {
  const [orcRes, locRes] = await Promise.all([
    supabase.from('orcamentos').select('numero_orcamento'),
    supabase.from('locacoes').select('numero'),
  ])
  const orcamentos = (orcRes.data || []).map((r: any) => r.numero_orcamento)
  const locacoes = (locRes.data || []).map((r: any) => r.numero)
  return { todos: [...orcamentos, ...locacoes], locacoes }
}

/**
 * Gera o numero de um contrato de locacao: LOC-YYYY-NNNN
 *
 * Quando nasce de um orcamento, HERDA o sequencial dele (ORC-0012 ->
 * LOC-2026-0012), para que o mesmo negocio carregue o mesmo numero do
 * orcamento ao contrato. Contrato avulso consome o proximo sequencial livre.
 *
 * O contador olha o MAIOR numero ja emitido, nunca a contagem de linhas:
 * apagar um registro nao pode liberar um numero que ja circulou assinado.
 */
export async function gerarNumeroLocacao(numeroOrcamento?: string | null): Promise<string> {
  const ano = new Date().getFullYear()
  const { todos, locacoes } = await buscarNumerosEmitidos()

  // Herda o numero do orcamento de origem, se ele ainda estiver livre
  const herdado = numeroLocacaoDoOrcamento(numeroOrcamento, ano)
  if (herdado) {
    const seqHerdado = extrairSequencial(herdado)
    const jaUsado = locacoes.some((n) => extrairSequencial(n) === seqHerdado)
    if (!jaUsado) return herdado
  }

  return formatarNumeroLocacao(proximoSequencial(todos), ano)
}

/**
 * Cria uma locacao automaticamente a partir de um orcamento aprovado
 */
export async function criarLocacaoDoOrcamento(orcamento: any): Promise<{ success: boolean; error?: string }> {
  try {
    let itens: any[] = []
    try {
      itens = typeof orcamento.itens === 'string' ? JSON.parse(orcamento.itens) : (orcamento.itens || [])
    } catch { itens = [] }

    if (itens.length === 0) {
      return { success: false, error: 'Orcamento sem itens' }
    }

    // Verificar disponibilidade antes de criar
    const disponibilidade = await verificarDisponibilidade(
      orcamento.data_inicio_locacao,
      orcamento.data_fim_locacao
    )

    // Buscar dados dos equipamentos para checar controle_quantidade
    const eqIds = itens.map((i: any) => i.equipamento_id)
    const { data: equipamentosDb } = await supabase
      .from('equipamentos')
      .select('id, controle_quantidade, quantidade_total, quantidade_disponivel')
      .in('id', eqIds)
    const eqMap = new Map((equipamentosDb || []).map(e => [e.id, e]))

    for (const item of itens) {
      const disp = disponibilidade[item.equipamento_id]
      const eq = eqMap.get(item.equipamento_id)
      if (disp) {
        if (!eq?.controle_quantidade && !disp.disponivel) {
          return {
            success: false,
            error: `Equipamento "${item.equipamento_nome}" esta locado ate ${new Date((disp.locado_ate || '') + 'T12:00:00').toLocaleDateString('pt-BR')}. Nao e possivel aprovar.`
          }
        }
        if (eq?.controle_quantidade && disp.quantidade_disponivel < item.quantidade) {
          return {
            success: false,
            error: `Equipamento "${item.equipamento_nome}" tem apenas ${disp.quantidade_disponivel} unidade(s) disponivel(is) no periodo. Solicitado: ${item.quantidade}.`
          }
        }
      }
    }

    // Gerar numero herdando o sequencial do orcamento de origem
    const numero = await gerarNumeroLocacao(orcamento.numero_orcamento)

    // Calcular status baseado na data
    const hoje = hojeISO()
    let status = 'pendente'
    if (orcamento.data_inicio_locacao && orcamento.data_inicio_locacao <= hoje) {
      status = 'ativo'
    }

    // Calcular dias
    let diasTotal = orcamento.dias_locacao || 30
    if (orcamento.data_inicio_locacao && orcamento.data_fim_locacao) {
      const d1 = new Date(orcamento.data_inicio_locacao + 'T12:00:00')
      const d2 = new Date(orcamento.data_fim_locacao + 'T12:00:00')
      diasTotal = Math.ceil((d2.getTime() - d1.getTime()) / 86400000)
    }

    // Inserir locacao
    const { error: insertError } = await supabase.from('locacoes').insert({
      numero,
      orcamento_id: orcamento.id,
      cliente_id: orcamento.cliente_id,
      cliente_nome: orcamento.cliente_nome,
      // Manter compatibilidade com campos legados (preencher com primeiro item)
      equipamento_id: itens[0]?.equipamento_id || null,
      equipamento_nome: itens.map((i: any) => i.equipamento_nome).join(', '),
      quantidade: itens.reduce((s: number, i: any) => s + (i.quantidade || 1), 0),
      // Novos campos multi-item
      itens: JSON.stringify(itens),
      modalidade_locacao: orcamento.modalidade_locacao || 'mensal',
      data_inicio: orcamento.data_inicio_locacao,
      data_fim: orcamento.data_fim_locacao,
      dias_total: diasTotal,
      valor_dia: 0,
      valor_total: Number(orcamento.valor_total) || 0,
      subtotal: Number(orcamento.subtotal) || 0,
      desconto: Number(orcamento.desconto_valor) || 0,
      frete: Number(orcamento.valor_frete) || 0,
      forma_pagamento: orcamento.forma_pagamento || '',
      condicao_pagamento: orcamento.condicao_pagamento || '',
      local_obra: orcamento.local_obra || '',
      local_entrega: orcamento.local_obra || '',
      status,
      observacoes: orcamento.observacoes || '',
      historico_renovacoes: JSON.stringify([])
    })

    if (insertError) {
      return { success: false, error: insertError.message }
    }

    // Atualizar status/quantidade dos equipamentos
    for (const item of itens) {
      const eq = eqMap.get(item.equipamento_id)
      if (eq?.controle_quantidade) {
        const novoDisponivel = Math.max((eq.quantidade_disponivel || 0) - (item.quantidade || 1), 0)
        await supabase.from('equipamentos').update({
          quantidade_disponivel: novoDisponivel,
          status: novoDisponivel <= 0 ? 'locado' : 'disponivel'
        }).eq('id', item.equipamento_id)
        // Atualizar cache local
        eq.quantidade_disponivel = novoDisponivel
      } else {
        await supabase.from('equipamentos').update({ status: 'locado' }).eq('id', item.equipamento_id)
      }
    }

    return { success: true }
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro desconhecido' }
  }
}
