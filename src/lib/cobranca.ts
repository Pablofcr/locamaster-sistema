import { supabase } from './supabase'
import { formatarMoeda, formatarData } from './faturamento'

// ============ CARREGAR REGRAS ============

export async function carregarRegras() {
  const { data, error } = await supabase
    .from('regua_cobranca')
    .select('*')
    .order('dias_antes_vencimento', { ascending: false })
    .order('dias_apos_vencimento', { ascending: true })

  if (error) throw error
  return data || []
}

// ============ PROCESSAR TEMPLATE ============

export function processarTemplate(template: string, fatura: any, config?: any): string {
  const juros = Number(config?.juros_mora || 2)
  const multa = Number(config?.multa_atraso || 2)
  const valor = Number(fatura.valor) || 0
  const diasVencido = fatura.data_vencimento
    ? Math.max(0, Math.floor((Date.now() - new Date(fatura.data_vencimento).getTime()) / 86400000))
    : 0

  const valorMulta = diasVencido > 0 ? valor * (multa / 100) : 0
  const valorJuros = diasVencido > 0 ? valor * (juros / 100 / 30) * diasVencido : 0
  const valorAtualizado = valor + valorMulta + valorJuros

  return template
    .replace(/\{\{cliente_nome\}\}/g, fatura.cliente_nome || '')
    .replace(/\{\{numero\}\}/g, fatura.numero || '')
    .replace(/\{\{valor\}\}/g, formatarMoeda(valor))
    .replace(/\{\{data_vencimento\}\}/g, fatura.data_vencimento ? formatarData(fatura.data_vencimento) : '')
    .replace(/\{\{valor_atualizado\}\}/g, formatarMoeda(valorAtualizado))
    .replace(/\{\{dias_vencido\}\}/g, String(diasVencido))
    .replace(/\{\{locacao\}\}/g, fatura.locacao_numero || '')
}

// ============ EXECUTAR REGUA DE COBRANCA ============

export async function executarReguaCobranca() {
  const regras = await carregarRegras()
  const regrasAtivas = regras.filter(r => r.ativo)

  if (regrasAtivas.length === 0) return { processadas: 0, acoes: [] as any[] }

  const { data: faturas } = await supabase
    .from('faturas')
    .select('*')
    .in('status', ['emitido', 'pendente', 'vencido', 'parcial'])

  if (!faturas || faturas.length === 0) return { processadas: 0, acoes: [] as any[] }

  const { data: configArr } = await supabase
    .from('configuracoes_faturamento')
    .select('*')
    .limit(1)
  const config = configArr?.[0]

  // Verificar cobranças já realizadas hoje
  const hoje = new Date().toISOString().split('T')[0]
  const { data: logsHoje } = await supabase
    .from('cobranca_log')
    .select('fatura_id, regra_id')
    .gte('created_at', hoje + 'T00:00:00')

  const jaEnviados = new Set((logsHoje || []).map(l => `${l.fatura_id}-${l.regra_id}`))

  const acoes: any[] = []
  const agora = Date.now()

  for (const fatura of faturas) {
    if (!fatura.data_vencimento) continue
    const vencimento = new Date(fatura.data_vencimento + 'T12:00:00').getTime()
    const diasParaVencer = Math.ceil((vencimento - agora) / 86400000)

    for (const regra of regrasAtivas) {
      const chave = `${fatura.id}-${regra.id}`
      if (jaEnviados.has(chave)) continue

      let match = false
      if (regra.dias_antes_vencimento > 0 && diasParaVencer === regra.dias_antes_vencimento) {
        match = true
      } else if (regra.dias_antes_vencimento === 0 && regra.dias_apos_vencimento === 0 && diasParaVencer === 0) {
        match = true
      } else if (regra.dias_apos_vencimento > 0 && diasParaVencer === -regra.dias_apos_vencimento) {
        match = true
      }

      if (match) {
        const mensagem = processarTemplate(regra.template_mensagem, fatura, config)

        await supabase.from('cobranca_log').insert({
          fatura_id: fatura.id,
          regra_id: regra.id,
          tipo_acao: regra.tipo_acao,
          mensagem,
          destinatario: fatura.cliente_telefone || fatura.cliente_email || '',
          status: 'pendente',
        })

        acoes.push({
          fatura,
          regra,
          mensagem,
          telefone: fatura.cliente_telefone,
        })
      }
    }
  }

  return { processadas: acoes.length, acoes }
}

// ============ OBTER LOG DE COBRANCA ============

export async function obterLogCobranca(faturaId?: number) {
  let query = supabase
    .from('cobranca_log')
    .select('*, regua_cobranca(nome)')
    .order('created_at', { ascending: false })

  if (faturaId) {
    query = query.eq('fatura_id', faturaId)
  } else {
    query = query.limit(50)
  }

  const { data, error } = await query
  if (error) throw error
  return data || []
}

// ============ REGISTRAR ACAO MANUAL ============

export async function registrarAcaoManual(params: {
  fatura_id: number
  tipo_acao: string
  mensagem?: string
  observacoes?: string
}) {
  const { error } = await supabase.from('cobranca_log').insert({
    fatura_id: params.fatura_id,
    tipo_acao: params.tipo_acao,
    mensagem: params.mensagem || '',
    observacoes: params.observacoes || '',
    status: 'manual',
  })
  if (error) throw error
}

// ============ ABRIR WHATSAPP ============

export function abrirWhatsApp(telefone: string, mensagem: string) {
  const phone = telefone.replace(/\D/g, '')
  if (!phone) return false
  const msg = encodeURIComponent(mensagem)
  window.open(`https://wa.me/55${phone}?text=${msg}`, '_blank')
  return true
}
