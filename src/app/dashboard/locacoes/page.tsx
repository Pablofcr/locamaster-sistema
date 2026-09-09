'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { verificarDisponibilidade, gerarNumeroLocacao } from '@/lib/verificarDisponibilidade'
import { gerarContratoLocacao } from '@/lib/gerarContratoLocacao'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { gerarFatura } from '@/lib/faturamento'
import { formatarNumeroRenovacao, numeroCorrespondeBusca } from '@/lib/numeracao'

export default function LocacoesPage() {
  const { showToast } = useToast()
  const { empresa } = useEmpresa()
  const [locacoes, setLocacoes] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [stats, setStats] = useState({ total: 0, ativos: 0, pendentes: 0, vencidos: 0, valorTotal: 0 })

  // Form para criacao manual
  const [formClienteId, setFormClienteId] = useState('')
  const [formDataInicio, setFormDataInicio] = useState('')
  const [formDataFim, setFormDataFim] = useState('')
  const [formModalidade, setFormModalidade] = useState('mensal')
  const [formLocalEntrega, setFormLocalEntrega] = useState('')
  const [formObservacoes, setFormObservacoes] = useState('')
  const [formItens, setFormItens] = useState<any[]>([])
  const [formModalSeletor, setFormModalSeletor] = useState(false)
  const [formEqSelecionados, setFormEqSelecionados] = useState<Record<number, number>>({})

  // Renovacao
  const [showRenovacao, setShowRenovacao] = useState(false)
  const [locacaoRenovar, setLocacaoRenovar] = useState<any>(null)
  const [renovarTodos, setRenovarTodos] = useState(true)
  const [renovarNovaDataFim, setRenovarNovaDataFim] = useState('')
  const [renovarItens, setRenovarItens] = useState<any[]>([])
  const [renovarItensManter, setRenovarItensManter] = useState<Record<number, boolean>>({})

  // Devolucao
  const [showDevolucao, setShowDevolucao] = useState(false)
  const [locacaoDevolucao, setLocacaoDevolucao] = useState<any>(null)
  const [itensDevolucao, setItensDevolucao] = useState<any[]>([])
  const [processandoDevolucao, setProcessandoDevolucao] = useState(false)
  const [alertaAvaria, setAlertaAvaria] = useState<{ show: boolean, clienteNome: string, locacaoNumero: string, itens: any[] }>({ show: false, clienteNome: '', locacaoNumero: '', itens: [] })
  const [ultimaDataVencimento, setUltimaDataVencimento] = useState('')

  useEffect(() => { carregarDados() }, [])

  const calcularStatusDinamico = (loc: any) => {
    if (loc.status === 'finalizado' || loc.status === 'cancelado') return loc.status
    const hoje = new Date().toISOString().split('T')[0]
    if (loc.data_fim && loc.data_fim < hoje) return 'vencido'
    if (loc.data_inicio && loc.data_inicio <= hoje) return 'ativo'
    return 'pendente'
  }

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [locRes, cliRes, eqRes, orcRes] = await Promise.all([
        supabase.from('locacoes').select('*').order('created_at', { ascending: false }),
        supabase.from('clientes').select('id, nome').order('nome'),
        supabase.from('equipamentos').select('*').eq('ativo', true).order('nome'),
        supabase.from('orcamentos').select('id, numero_orcamento')
      ])

      // Numero do orcamento de origem, para exibir e permitir busca cruzada
      const mapaOrcamento: Record<number, string> = {}
      for (const orc of orcRes.data || []) {
        if (orc.numero_orcamento) mapaOrcamento[orc.id] = orc.numero_orcamento
      }

      const data = (locRes.data || []).map(loc => ({
        ...loc,
        status_calculado: calcularStatusDinamico(loc),
        numero_orcamento: loc.orcamento_id ? mapaOrcamento[loc.orcamento_id] || null : null
      }))
      setLocacoes(data)
      setClientes(cliRes.data || [])
      setEquipamentos(eqRes.data || [])

      const ativos = data.filter(l => l.status_calculado === 'ativo')
      setStats({
        total: data.length,
        ativos: ativos.length,
        pendentes: data.filter(l => l.status_calculado === 'pendente').length,
        vencidos: data.filter(l => l.status_calculado === 'vencido').length,
        valorTotal: ativos.reduce((s, l) => s + (Number(l.valor_total) || 0), 0)
      })
    } catch (error) {
      showToast('Erro ao carregar locacoes', 'error')
    } finally {
      setLoading(false)
    }
  }

  const getItensLocacao = (loc: any): any[] => {
    try {
      if (loc.itens) {
        return typeof loc.itens === 'string' ? JSON.parse(loc.itens) : loc.itens
      }
    } catch { /* ignore */ }
    // Fallback para formato legado
    if (loc.equipamento_id) {
      return [{
        equipamento_id: loc.equipamento_id,
        equipamento_nome: loc.equipamento_nome,
        quantidade: loc.quantidade || 1,
        preco_unitario: Number(loc.valor_dia) || 0,
        subtotal: Number(loc.valor_total) || 0
      }]
    }
    return []
  }

  const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const calcularDiasRestantes = (dataFim: string) => {
    const diff = new Date(dataFim).getTime() - Date.now()
    return Math.ceil(diff / 86400000)
  }

  const getStatusBadge = (status: string) => {
    const c: Record<string, { label: string; variant: string }> = {
      ativo: { label: 'Ativo', variant: 'success' },
      pendente: { label: 'Pendente', variant: 'warning' },
      finalizado: { label: 'Finalizado', variant: 'primary' },
      vencido: { label: 'Vencido', variant: 'danger' },
      cancelado: { label: 'Cancelado', variant: 'default' }
    }
    const cfg = c[status] || { label: status, variant: 'default' }
    return <Badge variant={cfg.variant as any}>{cfg.label}</Badge>
  }

  // ---- CRIACAO MANUAL ----
  const calcularPrecoModalidade = (eq: any) => {
    const precoDia = Math.round((Number(eq.preco_dia) || Number(eq.preco_unitario_dia) || Number(eq.preco_mensal) / 30 || 100) * 100) / 100
    const precoMensal = Math.round((Number(eq.preco_mensal) || precoDia * 30) * 100) / 100
    switch (formModalidade) {
      case 'diaria': return precoDia
      case 'semanal': return Math.round(precoMensal / 30 * 7 * 100) / 100
      case 'quinzenal': return Math.round(precoMensal / 30 * 15 * 100) / 100
      case 'mensal': return precoMensal
      default: return precoDia
    }
  }

  const adicionarItemForm = (eq: any, qtd: number) => {
    const preco = calcularPrecoModalidade(eq)
    setFormItens([...formItens, {
      equipamento_id: eq.id,
      equipamento_nome: eq.nome,
      equipamento_marca: eq.marca || '',
      equipamento_modelo: eq.modelo || '',
      quantidade: qtd,
      preco_unitario: preco,
      subtotal: Math.round(preco * qtd * 100) / 100
    }])
  }

  const criarLocacaoManual = async () => {
    if (!formClienteId || !formDataInicio || !formDataFim || formItens.length === 0) {
      showToast('Preencha todos os campos e adicione equipamentos', 'warning')
      return
    }
    try {
      const cliente = clientes.find(c => c.id === parseInt(formClienteId))
      const numero = await gerarNumeroLocacao(null)
      const hoje = new Date().toISOString().split('T')[0]
      const status = formDataInicio <= hoje ? 'ativo' : 'pendente'
      const d1 = new Date(formDataInicio)
      const d2 = new Date(formDataFim)
      const diasTotal = Math.ceil((d2.getTime() - d1.getTime()) / 86400000)
      const valorTotal = formItens.reduce((s: number, i: any) => s + i.subtotal, 0)

      const { error } = await supabase.from('locacoes').insert({
        numero,
        cliente_id: parseInt(formClienteId),
        cliente_nome: cliente?.nome || '',
        equipamento_id: formItens[0]?.equipamento_id || null,
        equipamento_nome: formItens.map((i: any) => i.equipamento_nome).join(', '),
        quantidade: formItens.reduce((s: number, i: any) => s + (i.quantidade || 1), 0),
        itens: JSON.stringify(formItens),
        modalidade_locacao: formModalidade,
        data_inicio: formDataInicio,
        data_fim: formDataFim,
        dias_total: diasTotal,
        valor_dia: 0,
        valor_total: valorTotal,
        subtotal: valorTotal,
        desconto: 0,
        frete: 0,
        local_entrega: formLocalEntrega,
        local_obra: formLocalEntrega,
        status,
        observacoes: formObservacoes,
        historico_renovacoes: JSON.stringify([])
      })

      if (error) throw error

      // Atualizar equipamentos
      for (const item of formItens) {
        const eq = equipamentos.find(e => e.id === item.equipamento_id)
        if (eq?.controle_quantidade) {
          const novoDisp = Math.max((eq.quantidade_disponivel || 0) - (item.quantidade || 1), 0)
          await supabase.from('equipamentos').update({
            quantidade_disponivel: novoDisp,
            status: novoDisp <= 0 ? 'locado' : 'disponivel'
          }).eq('id', item.equipamento_id)
        } else {
          await supabase.from('equipamentos').update({ status: 'locado' }).eq('id', item.equipamento_id)
        }
      }

      showToast('Locacao criada com sucesso!', 'success')
      setShowForm(false)
      setFormItens([])
      setFormClienteId('')
      setFormDataInicio('')
      setFormDataFim('')
      setFormLocalEntrega('')
      setFormObservacoes('')
      carregarDados()
    } catch (error: any) {
      showToast('Erro ao criar locacao: ' + error.message, 'error')
    }
  }

  // ---- FINALIZACAO ----
  const finalizarLocacao = async (locacao: any) => {
    if (!confirm('Tem certeza que deseja finalizar esta locacao? Os equipamentos voltarao para disponivel.')) return
    try {
      await supabase.from('locacoes').update({
        status: 'finalizado',
        updated_at: new Date().toISOString()
      }).eq('id', locacao.id)

      const itensLoc = getItensLocacao(locacao)

      for (const item of itensLoc) {
        const { data: eqData } = await supabase.from('equipamentos')
          .select('controle_quantidade, quantidade_disponivel, quantidade_total')
          .eq('id', item.equipamento_id).single()

        if (eqData?.controle_quantidade) {
          const qtdDevolvida = item.quantidade || 1
          const novoDisp = Math.min((eqData.quantidade_disponivel || 0) + qtdDevolvida, eqData.quantidade_total || 0)
          await supabase.from('equipamentos').update({
            quantidade_disponivel: novoDisp,
            status: 'disponivel'
          }).eq('id', item.equipamento_id)
        } else {
          await supabase.from('equipamentos').update({ status: 'disponivel' }).eq('id', item.equipamento_id)
        }
      }

      showToast('Locacao finalizada! Equipamentos disponiveis.', 'success')
      carregarDados()
    } catch { showToast('Erro ao finalizar locacao', 'error') }
  }

  // ---- DEVOLUCAO ----
  const abrirDevolucao = async (loc: any) => {
    const itens = getItensLocacao(loc)
    const hoje = new Date().toISOString().split('T')[0]

    // Buscar data de vencimento da última fatura da locação
    let dataVencPadrao = hoje
    try {
      const { data: ultimaFatura } = await supabase
        .from('faturas')
        .select('data_vencimento')
        .eq('locacao_id', loc.id)
        .order('data_vencimento', { ascending: false })
        .limit(1)
      if (ultimaFatura && ultimaFatura.length > 0 && ultimaFatura[0].data_vencimento) {
        dataVencPadrao = ultimaFatura[0].data_vencimento
      }
    } catch (e) {
      // fallback: usa hoje
    }
    setUltimaDataVencimento(dataVencPadrao)

    const itensMapeados = itens.map((item: any) => ({
      equipamento_id: item.equipamento_id,
      equipamento_nome: item.equipamento_nome,
      equipamento_marca: item.equipamento_marca || '',
      equipamento_modelo: item.equipamento_modelo || '',
      quantidade: item.quantidade || 1,
      devolvido: item.devolvido || false,
      data_devolucao_anterior: item.data_devolucao || null,
      devolver: !item.devolvido,
      qtd_devolver: item.devolvido ? 0 : (item.quantidade || 1),
      data_devolucao: hoje,
      tem_avaria: false,
      grau_avaria: '' as '' | 'leve' | 'moderada' | 'grave' | 'furto_roubo',
      descricao_avaria: '',
      valor_indenizacao: 0,
      cobrar_indenizacao: false,
      data_vencimento_indenizacao: ''
    }))
    setItensDevolucao(itensMapeados)
    setLocacaoDevolucao(loc)
    setShowDevolucao(true)
  }

  const confirmarDevolucao = async () => {
    if (!locacaoDevolucao) return

    const itensParaDevolver = itensDevolucao.filter(i => i.devolver && !i.devolvido)
    if (itensParaDevolver.length === 0) {
      showToast('Selecione ao menos um item para devolver', 'warning')
      return
    }

    // Validar valor de aquisição para itens que geram fatura de indenização
    const itensComIndenizacao = itensParaDevolver.filter(i =>
      i.grau_avaria === 'furto_roubo' ||
      i.grau_avaria === 'grave' ||
      (i.cobrar_indenizacao && (i.grau_avaria === 'leve' || i.grau_avaria === 'moderada'))
    )
    for (const item of itensComIndenizacao) {
      const eq = equipamentos.find((e: any) => e.id === item.equipamento_id)
      if (!eq?.valor_aquisicao_unitario || Number(eq.valor_aquisicao_unitario) <= 0) {
        const tipoLabel = item.grau_avaria === 'furto_roubo' ? 'furto/roubo' : item.grau_avaria === 'grave' ? 'avaria grave' : 'cobranca de indenizacao'
        showToast(`Equipamento "${item.equipamento_nome}" nao possui valor de aquisicao cadastrado. Cadastre antes de registrar ${tipoLabel}.`, 'warning')
        return
      }
    }

    setProcessandoDevolucao(true)
    const itensComAvaria: any[] = []
    try {
      for (const item of itensParaDevolver) {
        const { data: eqData } = await supabase.from('equipamentos')
          .select('id, nome, asset_id, controle_quantidade, quantidade_disponivel, quantidade_total, valor_aquisicao_unitario')
          .eq('id', item.equipamento_id).single()

        if (!eqData) continue

        if (item.tem_avaria) {
          // Determinar status baseado no grau da avaria
          const grauLabel = item.grau_avaria === 'leve' ? 'Leve (nao impede uso)' : item.grau_avaria === 'moderada' ? 'Moderada (necessita reparo)' : item.grau_avaria === 'furto_roubo' ? 'Furto/Roubo/Desaparecimento' : 'Grave (equipamento inutilizado / perda total)'

          if (item.grau_avaria === 'furto_roubo') {
            // Furto/roubo -> baixado + fatura de indenização
            await supabase.from('equipamentos').update({
              status: 'baixado'
            }).eq('id', item.equipamento_id)

            // Criar registro de manutenção
            await supabase.from('manutencoes').insert({
              equipamento_id: item.equipamento_id,
              equipamento_nome: eqData.nome,
              equipamento_codigo: eqData.asset_id || '',
              tipo: 'corretiva',
              status: 'cancelada',
              data_agendada: item.data_devolucao,
              descricao: `[Furto/Roubo/Desaparecimento] ${item.descricao_avaria || 'Equipamento furtado, roubado ou desaparecido'}`,
              observacoes: `FURTO/ROUBO/DESAPARECIMENTO - Equipamento baixado. Registrado na devolucao da locacao ${locacaoDevolucao.numero || '#' + locacaoDevolucao.id}`
            })

            // Gerar fatura de indenização
            const valorAquisicao = Number(eqData.valor_aquisicao_unitario) || 0
            if (valorAquisicao > 0) {
              const valorIndenizacao = item.valor_indenizacao > 0 ? item.valor_indenizacao : Math.round(valorAquisicao * 2 * 100) / 100
              const hoje = new Date().toISOString().split('T')[0]
              const vencimentoIndenizacao = item.data_vencimento_indenizacao || ultimaDataVencimento || hoje
              try {
                const faturaGerada = await gerarFatura({
                  locacao_id: locacaoDevolucao.id,
                  valor: valorIndenizacao,
                  data_vencimento: vencimentoIndenizacao,
                  tipo: 'indenizacao',
                  observacoes: `Indenizacao por furto/roubo/desaparecimento - ${eqData.nome} (${eqData.asset_id || 'S/C'}) - Valor a ser indenizado: ${formatarMoeda(valorIndenizacao)}`,
                  gerada_automaticamente: true
                })
                itensComAvaria.push({
                  nome: eqData.nome,
                  codigo: eqData.asset_id || '',
                  grau: 'furto_roubo',
                  grauLabel,
                  descricao: item.descricao_avaria,
                  faturaNumero: faturaGerada?.numero || '',
                  valorIndenizacao
                })
              } catch (errFat: any) {
                itensComAvaria.push({
                  nome: eqData.nome,
                  codigo: eqData.asset_id || '',
                  grau: 'furto_roubo',
                  grauLabel,
                  descricao: item.descricao_avaria,
                  erroFatura: errFat.message
                })
              }
            } else {
              itensComAvaria.push({
                nome: eqData.nome,
                codigo: eqData.asset_id || '',
                grau: 'furto_roubo',
                grauLabel,
                descricao: item.descricao_avaria,
                erroFatura: 'Valor de aquisicao nao cadastrado - fatura nao gerada'
              })
            }
          } else if (item.grau_avaria === 'leve') {
            // Avaria leve -> disponivel (nao impede uso)
            if (eqData.controle_quantidade) {
              const qtdDevolvida = item.qtd_devolver || 1
              const novoDisp = Math.min((eqData.quantidade_disponivel || 0) + qtdDevolvida, eqData.quantidade_total || 0)
              await supabase.from('equipamentos').update({
                quantidade_disponivel: novoDisp,
                status: 'disponivel'
              }).eq('id', item.equipamento_id)
            } else {
              await supabase.from('equipamentos').update({
                status: 'disponivel'
              }).eq('id', item.equipamento_id)
            }
          } else if (item.grau_avaria === 'moderada') {
            // Avaria moderada -> manutencao (necessita reparo)
            await supabase.from('equipamentos').update({
              status: 'manutencao'
            }).eq('id', item.equipamento_id)
          } else if (item.grau_avaria === 'grave') {
            // Avaria grave -> baixado (perda total)
            await supabase.from('equipamentos').update({
              status: 'baixado'
            }).eq('id', item.equipamento_id)
          }

          // Criar registro de manutencao para avaria moderada e grave (furto_roubo já cria acima)
          if (item.grau_avaria === 'moderada' || item.grau_avaria === 'grave') {
            await supabase.from('manutencoes').insert({
              equipamento_id: item.equipamento_id,
              equipamento_nome: eqData.nome,
              equipamento_codigo: eqData.asset_id || '',
              tipo: 'corretiva',
              status: item.grau_avaria === 'grave' ? 'cancelada' : 'agendada',
              data_agendada: item.data_devolucao,
              descricao: `[${grauLabel}] ${item.descricao_avaria}`,
              observacoes: item.grau_avaria === 'grave'
                ? `PERDA TOTAL - Equipamento baixado. Avaria registrada na devolucao da locacao ${locacaoDevolucao.numero || '#' + locacaoDevolucao.id}`
                : `Avaria registrada na devolucao da locacao ${locacaoDevolucao.numero || '#' + locacaoDevolucao.id}`
            })
          }

          // Gerar fatura de indenização para avaria grave (automatico) ou leve/moderada (quando cobrar_indenizacao)
          if (item.grau_avaria !== 'furto_roubo' && (item.grau_avaria === 'grave' || item.cobrar_indenizacao)) {
            const valorAquisicao = Number(eqData.valor_aquisicao_unitario) || 0
            if (valorAquisicao > 0) {
              const valorIndenizacao = item.valor_indenizacao > 0 ? item.valor_indenizacao : Math.round(valorAquisicao * 2 * 100) / 100
              const hoje = new Date().toISOString().split('T')[0]
              const vencimentoIndenizacao = item.data_vencimento_indenizacao || ultimaDataVencimento || hoje
              try {
                const faturaGerada = await gerarFatura({
                  locacao_id: locacaoDevolucao.id,
                  valor: valorIndenizacao,
                  data_vencimento: vencimentoIndenizacao,
                  tipo: 'indenizacao',
                  observacoes: `Indenizacao por avaria ${item.grau_avaria} - ${eqData.nome} (${eqData.asset_id || 'S/C'}) - Valor a ser indenizado: ${formatarMoeda(valorIndenizacao)}`,
                  gerada_automaticamente: true
                })
                itensComAvaria.push({
                  nome: eqData.nome,
                  codigo: eqData.asset_id || '',
                  grau: item.grau_avaria,
                  grauLabel,
                  descricao: item.descricao_avaria,
                  faturaNumero: faturaGerada?.numero || '',
                  valorIndenizacao
                })
              } catch (errFat: any) {
                itensComAvaria.push({
                  nome: eqData.nome,
                  codigo: eqData.asset_id || '',
                  grau: item.grau_avaria,
                  grauLabel,
                  descricao: item.descricao_avaria,
                  erroFatura: errFat.message
                })
              }
            } else {
              itensComAvaria.push({
                nome: eqData.nome,
                codigo: eqData.asset_id || '',
                grau: item.grau_avaria,
                grauLabel,
                descricao: item.descricao_avaria,
                erroFatura: 'Valor de aquisicao nao cadastrado - fatura nao gerada'
              })
            }
          } else if (item.grau_avaria !== 'furto_roubo') {
            // Registrar item com avaria para alerta (sem fatura)
            itensComAvaria.push({
              nome: eqData.nome,
              codigo: eqData.asset_id || '',
              grau: item.grau_avaria,
              grauLabel,
              descricao: item.descricao_avaria
            })
          }
        } else {
          // Sem avaria -> disponivel
          if (eqData.controle_quantidade) {
            const qtdDevolvida = item.qtd_devolver || 1
            const novoDisp = Math.min((eqData.quantidade_disponivel || 0) + qtdDevolvida, eqData.quantidade_total || 0)
            await supabase.from('equipamentos').update({
              quantidade_disponivel: novoDisp,
              status: 'disponivel'
            }).eq('id', item.equipamento_id)
          } else {
            await supabase.from('equipamentos').update({
              status: 'disponivel'
            }).eq('id', item.equipamento_id)
          }
        }
      }

      // Atualizar itens da locacao com flags de devolvido
      const itensOriginais = getItensLocacao(locacaoDevolucao)
      const itensAtualizados = itensOriginais.map((item: any) => {
        const itemDev = itensParaDevolver.find(d => d.equipamento_id === item.equipamento_id)
        if (itemDev) {
          return {
            ...item,
            devolvido: true,
            data_devolucao: itemDev.data_devolucao,
            tem_avaria: itemDev.tem_avaria,
            grau_avaria: itemDev.grau_avaria || undefined,
            descricao_avaria: itemDev.descricao_avaria || undefined
          }
        }
        return item
      })

      // Verificar se todos os itens foram devolvidos
      const todosDevolvidos = itensAtualizados.every((item: any) => item.devolvido)

      if (todosDevolvidos) {
        await supabase.from('locacoes').update({
          status: 'finalizado',
          itens: JSON.stringify(itensAtualizados),
          updated_at: new Date().toISOString()
        }).eq('id', locacaoDevolucao.id)
        showToast('Locacao finalizada! Todos os equipamentos devolvidos.', 'success')
      } else {
        await supabase.from('locacoes').update({
          itens: JSON.stringify(itensAtualizados),
          updated_at: new Date().toISOString()
        }).eq('id', locacaoDevolucao.id)
        showToast('Devolucao parcial registrada. Locacao continua ativa.', 'success')
      }

      // Alerta de cobranca de avaria
      if (itensComAvaria.length > 0) {
        setAlertaAvaria({
          show: true,
          clienteNome: locacaoDevolucao.cliente_nome,
          locacaoNumero: locacaoDevolucao.numero || '#' + locacaoDevolucao.id,
          itens: itensComAvaria
        })
      }

      setShowDevolucao(false)
      setLocacaoDevolucao(null)
      setItensDevolucao([])
      carregarDados()
    } catch (error: any) {
      showToast('Erro ao processar devolucao: ' + error.message, 'error')
    } finally {
      setProcessandoDevolucao(false)
    }
  }

  // ---- RENOVACAO ----
  const abrirRenovacao = (loc: any) => {
    setLocacaoRenovar(loc)
    setRenovarTodos(true)

    // Nova data inicio = data_fim + 1
    const dataFimAtual = new Date(loc.data_fim + 'T12:00:00')
    const novaDataInicio = new Date(dataFimAtual)
    novaDataInicio.setDate(novaDataInicio.getDate() + 1)

    // Calcular nova data fim baseado na modalidade
    const novaDataFim = new Date(novaDataInicio)
    switch (loc.modalidade_locacao || 'mensal') {
      case 'diaria': novaDataFim.setDate(novaDataFim.getDate() + 1); break
      case 'semanal': novaDataFim.setDate(novaDataFim.getDate() + 7); break
      case 'quinzenal': novaDataFim.setDate(novaDataFim.getDate() + 15); break
      case 'mensal': default: novaDataFim.setMonth(novaDataFim.getMonth() + 1); novaDataFim.setDate(novaDataFim.getDate() - 1); break
    }

    setRenovarNovaDataFim(novaDataFim.toISOString().split('T')[0])

    const itensAtuais = getItensLocacao(loc)
    setRenovarItens(itensAtuais)
    const manterMap: Record<number, boolean> = {}
    itensAtuais.forEach((item: any) => { manterMap[item.equipamento_id] = true })
    setRenovarItensManter(manterMap)

    setShowRenovacao(true)
  }

  const confirmarRenovacao = async () => {
    if (!locacaoRenovar || !renovarNovaDataFim) return

    try {
      const itensAnteriores = getItensLocacao(locacaoRenovar)
      let itensNovos: any[]

      if (renovarTodos) {
        itensNovos = itensAnteriores
      } else {
        itensNovos = renovarItens.filter((item: any) => renovarItensManter[item.equipamento_id])
      }

      if (itensNovos.length === 0) {
        showToast('Selecione ao menos um equipamento para renovar', 'warning')
        return
      }

      // Itens removidos
      const itensRemovidos = itensAnteriores.filter(
        (ant: any) => !itensNovos.find((novo: any) => novo.equipamento_id === ant.equipamento_id)
      )

      // Itens adicionados (que nao existiam antes)
      const itensAdicionados = itensNovos.filter(
        (novo: any) => !itensAnteriores.find((ant: any) => ant.equipamento_id === novo.equipamento_id)
      )

      // Registrar historico
      let historico: any[] = []
      try {
        historico = typeof locacaoRenovar.historico_renovacoes === 'string'
          ? JSON.parse(locacaoRenovar.historico_renovacoes)
          : (locacaoRenovar.historico_renovacoes || [])
      } catch { historico = [] }

      // Calcular data_inicio do periodo anterior:
      // Se ja houve renovacoes, o inicio do periodo eh o dia seguinte ao data_fim da ultima renovacao
      let inicioPerAnterior = locacaoRenovar.data_inicio
      if (historico.length > 0) {
        const ultimaRenov = historico[historico.length - 1]
        if (ultimaRenov.periodo_anterior?.data_fim) {
          const dFim = new Date(ultimaRenov.periodo_anterior.data_fim + 'T12:00:00')
          dFim.setDate(dFim.getDate() + 1)
          inicioPerAnterior = dFim.toISOString().split('T')[0]
        }
      }

      historico.push({
        data: new Date().toISOString(),
        periodo_anterior: { data_inicio: inicioPerAnterior, data_fim: locacaoRenovar.data_fim },
        valor_total_anterior: Number(locacaoRenovar.valor_total),
        itens_removidos: itensRemovidos.map((i: any) => i.equipamento_nome),
        itens_adicionados: itensAdicionados.map((i: any) => i.equipamento_nome)
      })

      const valorTotal = itensNovos.reduce((s: number, i: any) => s + (i.subtotal || 0), 0)

      // Atualizar locacao
      await supabase.from('locacoes').update({
        data_fim: renovarNovaDataFim,
        itens: JSON.stringify(itensNovos),
        equipamento_nome: itensNovos.map((i: any) => i.equipamento_nome).join(', '),
        equipamento_id: itensNovos[0]?.equipamento_id || null,
        quantidade: itensNovos.reduce((s: number, i: any) => s + (i.quantidade || 1), 0),
        valor_total: valorTotal,
        subtotal: valorTotal,
        status: 'ativo',
        historico_renovacoes: JSON.stringify(historico),
        updated_at: new Date().toISOString()
      }).eq('id', locacaoRenovar.id)

      // Devolver equipamentos removidos
      for (const item of itensRemovidos) {
        const { data: eqData } = await supabase.from('equipamentos')
          .select('controle_quantidade, quantidade_disponivel, quantidade_total')
          .eq('id', item.equipamento_id).single()

        if (eqData?.controle_quantidade) {
          const novoDisp = Math.min((eqData.quantidade_disponivel || 0) + (item.quantidade || 1), eqData.quantidade_total || 0)
          await supabase.from('equipamentos').update({
            quantidade_disponivel: novoDisp,
            status: 'disponivel'
          }).eq('id', item.equipamento_id)
        } else {
          await supabase.from('equipamentos').update({ status: 'disponivel' }).eq('id', item.equipamento_id)
        }
      }

      // Marcar equipamentos adicionados como locados
      for (const item of itensAdicionados) {
        const eq = equipamentos.find(e => e.id === item.equipamento_id)
        if (eq?.controle_quantidade) {
          const novoDisp = Math.max((eq.quantidade_disponivel || 0) - (item.quantidade || 1), 0)
          await supabase.from('equipamentos').update({
            quantidade_disponivel: novoDisp,
            status: novoDisp <= 0 ? 'locado' : 'disponivel'
          }).eq('id', item.equipamento_id)
        } else {
          await supabase.from('equipamentos').update({ status: 'locado' }).eq('id', item.equipamento_id)
        }
      }

      showToast('Locacao renovada com sucesso!', 'success')
      setShowRenovacao(false)
      setLocacaoRenovar(null)
      carregarDados()
    } catch (error: any) {
      showToast('Erro ao renovar: ' + error.message, 'error')
    }
  }

  // ---- FILTRO ----
  const locacoesFiltradas = locacoes.filter(l => {
    const matchSearch = !searchTerm ||
      numeroCorrespondeBusca(l.numero, searchTerm) ||
      numeroCorrespondeBusca(l.numero_orcamento, searchTerm) ||
      (l.cliente_nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.equipamento_nome || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filtroStatus === 'todos' || l.status_calculado === filtroStatus
    return matchSearch && matchStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando locacoes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locacoes</h1>
          <p className="text-gray-600">Contratos e acompanhamento de locacoes</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>+ Nova Locacao</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Total</div><div className="text-2xl font-bold text-blue-600">{stats.total}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Ativos</div><div className="text-2xl font-bold text-green-600">{stats.ativos}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Pendentes</div><div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Vencidos</div><div className="text-2xl font-bold text-red-600">{stats.vencidos}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Valor Ativos</div><div className="text-2xl font-bold text-emerald-600">{formatarMoeda(stats.valorTotal)}</div></CardContent></Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contratos de Locacao</CardTitle>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="todos">Todos Status</option>
              <option value="ativo">Ativos</option>
              <option value="pendente">Pendentes</option>
              <option value="vencido">Vencidos</option>
              <option value="finalizado">Finalizados</option>
            </select>
          </div>
          <Input placeholder="Buscar por contrato, cliente ou equipamento..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md mt-2" />
        </CardHeader>
        <CardContent>
          {locacoesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhuma locacao encontrada</div>
          ) : (
            <div className="space-y-4">
              {locacoesFiltradas.map(loc => {
                const itensLoc = getItensLocacao(loc)
                const statusCalc = loc.status_calculado
                const diasRestantes = loc.data_fim ? calcularDiasRestantes(loc.data_fim) : 0
                const isExpanded = expandedId === loc.id

                return (
                  <div key={loc.id} className="border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    {/* Header */}
                    <div className="p-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : loc.id)}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="font-semibold text-lg text-gray-900">{loc.numero || `#${loc.id}`}</h3>
                            {getStatusBadge(statusCalc)}
                            {statusCalc === 'ativo' && loc.data_fim && (
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                diasRestantes <= 5 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {diasRestantes} dias restantes
                              </span>
                            )}
                            {statusCalc === 'vencido' && loc.data_fim && (
                              <span className="text-xs px-2 py-1 rounded font-medium bg-red-50 text-red-700">
                                Vencida ha {Math.abs(diasRestantes)} dias
                              </span>
                            )}
                            {loc.orcamento_id && (
                              <span className="text-xs px-2 py-0.5 rounded bg-purple-50 text-purple-700">
                                {loc.numero_orcamento || `Orc. #${loc.orcamento_id}`}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Cliente:</span> {loc.cliente_nome}
                            {' - '}
                            <span className="font-medium">Periodo:</span>{' '}
                            {loc.data_inicio ? new Date(loc.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR') : '-'} a{' '}
                            {loc.data_fim ? new Date(loc.data_fim + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                            {loc.modalidade_locacao && (
                              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{loc.modalidade_locacao}</span>
                            )}
                          </div>
                          <div className="text-sm mt-1">
                            <span className="font-medium text-gray-600">Itens:</span>{' '}
                            <span className="text-gray-700">{itensLoc.length} equipamento(s)</span>
                            {' - '}
                            <span className="font-bold text-green-600">{formatarMoeda(Number(loc.valor_total) || 0)}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expanded: Itens + Acoes */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        {/* Lista de itens */}
                        <div className="mb-4">
                          <h4 className="text-sm font-semibold text-gray-700 mb-2">Equipamentos da locacao:</h4>
                          <div className="space-y-2">
                            {itensLoc.map((item: any, idx: number) => (
                              <div key={idx} className={`flex items-center justify-between bg-white p-3 rounded border text-sm ${item.devolvido ? 'opacity-60' : ''}`}>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{item.equipamento_nome}</span>
                                  {item.equipamento_marca && <span className="text-gray-500">{item.equipamento_marca} {item.equipamento_modelo}</span>}
                                  {item.devolvido && (
                                    <Badge variant="success">
                                      Devolvido{item.data_devolucao ? ` em ${new Date(item.data_devolucao + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''}
                                    </Badge>
                                  )}
                                  {item.tem_avaria && <Badge variant={item.grau_avaria === 'furto_roubo' ? 'danger' : item.grau_avaria === 'grave' ? 'danger' : item.grau_avaria === 'moderada' ? 'warning' : 'default'}>{item.grau_avaria === 'furto_roubo' ? 'Furto/Roubo' : item.grau_avaria === 'leve' ? 'Avaria Leve' : item.grau_avaria === 'moderada' ? 'Avaria Moderada' : item.grau_avaria === 'grave' ? 'Avaria Grave' : 'Avaria'}</Badge>}
                                </div>
                                <div className="text-right">
                                  <span className="text-gray-600">{item.quantidade || 1}x</span>
                                  {item.preco_unitario && <span className="ml-2 text-gray-600">{formatarMoeda(item.preco_unitario)}</span>}
                                  <span className="ml-2 font-bold text-green-600">{formatarMoeda(item.subtotal || 0)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Info adicional */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-600 mb-4">
                          {(loc.local_entrega || loc.local_obra) && (
                            <div><span className="font-medium">Local:</span> {loc.local_entrega || loc.local_obra}</div>
                          )}
                          {loc.forma_pagamento && (
                            <div><span className="font-medium">Pagamento:</span> {loc.forma_pagamento}</div>
                          )}
                          {loc.observacoes && (
                            <div className="col-span-2"><span className="font-medium">Obs:</span> {loc.observacoes}</div>
                          )}
                        </div>

                        {/* Historico de renovacoes */}
                        {(() => {
                          let hist: any[] = []
                          try {
                            hist = typeof loc.historico_renovacoes === 'string' ? JSON.parse(loc.historico_renovacoes) : (loc.historico_renovacoes || [])
                          } catch { /* ignore */ }
                          if (hist.length === 0) return null

                          // Reconstruir periodos para o botao Gerar Contrato de cada renovacao
                          const periodosRenov: { data_inicio: string; data_fim: string }[] = []
                          for (let ri = 0; ri < hist.length; ri++) {
                            const prevFim = hist[ri].periodo_anterior?.data_fim
                            let nextFim: string
                            if (ri < hist.length - 1) {
                              nextFim = hist[ri + 1].periodo_anterior?.data_fim
                            } else {
                              nextFim = loc.data_fim
                            }
                            if (prevFim && nextFim) {
                              const d = new Date(prevFim + 'T12:00:00')
                              d.setDate(d.getDate() + 1)
                              periodosRenov.push({ data_inicio: d.toISOString().split('T')[0], data_fim: nextFim })
                            }
                          }

                          const gerarContratoRenovacao = async (dataInicioRenov: string, dataFimRenov: string, indiceRenov: number) => {
                            try {
                              const { data: cliente } = await supabase.from('clientes').select('*').eq('id', loc.cliente_id).single()
                              const itensLoc = getItensLocacao(loc)
                              const empresaEnd = empresa
                                ? [empresa.logradouro, empresa.numero, empresa.complemento, empresa.bairro, empresa.cidade, empresa.estado, empresa.cep].filter(Boolean).join(', ')
                                : ''
                              const clienteEnd = cliente
                                ? [cliente.logradouro, cliente.numero, cliente.complemento, cliente.bairro, cliente.cidade, cliente.estado, cliente.cep].filter(Boolean).join(', ')
                                : ''
                              gerarContratoLocacao({
                                numeroOrcamento: formatarNumeroRenovacao(loc.numero || `LOC-${loc.id}`, indiceRenov),
                                empresaNome: empresa?.nome_fantasia || empresa?.razao_social || '',
                                empresaRazaoSocial: empresa?.razao_social || '',
                                empresaCnpj: empresa?.cnpj || '',
                                empresaEndereco: empresaEnd,
                                empresaEmail: empresa?.email || '',
                                empresaTelefone: empresa?.telefone || '',
                                empresaLogo: empresa?.logo_base64 || undefined,
                                clienteNome: cliente?.nome || loc.cliente_nome || '',
                                clienteNomeFantasia: cliente?.nome_fantasia || '',
                                clienteDocumento: cliente?.cpf_cnpj || '',
                                clienteEndereco: clienteEnd,
                                clienteEmail: cliente?.email || '',
                                clienteTelefone: cliente?.telefone || '',
                                localObra: loc.local_obra || loc.local_entrega || '',
                                modalidade: loc.modalidade_locacao || 'mensal',
                                diasLocacao: loc.dias_total || 30,
                                dataInicio: dataInicioRenov,
                                dataFim: dataFimRenov,
                                itens: itensLoc,
                                subtotal: Number(loc.subtotal) || Number(loc.valor_total) || 0,
                                desconto: Number(loc.desconto) || 0,
                                frete: Number(loc.frete) || 0,
                                total: Number(loc.valor_total) || 0,
                                formaPagamento: loc.forma_pagamento || 'pix',
                                condicaoPagamento: loc.condicao_pagamento || '50_ato_30',
                                prazoNaoDevolucaoDias: 15,
                              })
                              showToast('Contrato PDF gerado!', 'success')
                            } catch { showToast('Erro ao gerar contrato', 'error') }
                          }

                          return (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Historico de renovacoes:</h4>
                              <div className="space-y-1">
                                {hist.map((h: any, i: number) => (
                                  <div key={i} className="text-xs bg-white p-2 rounded border flex items-center justify-between">
                                    <div>
                                      <span className="font-semibold text-gray-900 mr-2">
                                        {formatarNumeroRenovacao(loc.numero || `LOC-${loc.id}`, i + 1)}
                                      </span>
                                      <span className="text-gray-500">{new Date(h.data).toLocaleDateString('pt-BR')}</span>
                                      {' - Periodo anterior: '}
                                      {h.periodo_anterior?.data_inicio ? new Date(h.periodo_anterior.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR') : '-'} a{' '}
                                      {h.periodo_anterior?.data_fim ? new Date(h.periodo_anterior.data_fim + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                                      {h.itens_removidos?.length > 0 && <span className="text-red-600 ml-2">Removidos: {h.itens_removidos.join(', ')}</span>}
                                      {h.itens_adicionados?.length > 0 && <span className="text-green-600 ml-2">Adicionados: {h.itens_adicionados.join(', ')}</span>}
                                    </div>
                                    {periodosRenov[i] && (
                                      <Button size="sm" variant="outline" onClick={() => gerarContratoRenovacao(periodosRenov[i].data_inicio, periodosRenov[i].data_fim, i + 1)}>
                                        Gerar Contrato
                                      </Button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })()}

                        {/* Acoes */}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={async () => {
                            try {
                              const { data: cliente } = await supabase.from('clientes').select('*').eq('id', loc.cliente_id).single()
                              const itensLoc = getItensLocacao(loc)
                              const empresaEnd = empresa
                                ? [empresa.logradouro, empresa.numero, empresa.complemento, empresa.bairro, empresa.cidade, empresa.estado, empresa.cep].filter(Boolean).join(', ')
                                : ''
                              const clienteEnd = cliente
                                ? [cliente.logradouro, cliente.numero, cliente.complemento, cliente.bairro, cliente.cidade, cliente.estado, cliente.cep].filter(Boolean).join(', ')
                                : ''
                              gerarContratoLocacao({
                                numeroOrcamento: loc.numero || `LOC-${loc.id}`,
                                empresaNome: empresa?.nome_fantasia || empresa?.razao_social || '',
                                empresaRazaoSocial: empresa?.razao_social || '',
                                empresaCnpj: empresa?.cnpj || '',
                                empresaEndereco: empresaEnd,
                                empresaEmail: empresa?.email || '',
                                empresaTelefone: empresa?.telefone || '',
                                empresaLogo: empresa?.logo_base64 || undefined,
                                clienteNome: cliente?.nome || loc.cliente_nome || '',
                                clienteNomeFantasia: cliente?.nome_fantasia || '',
                                clienteDocumento: cliente?.cpf_cnpj || '',
                                clienteEndereco: clienteEnd,
                                clienteEmail: cliente?.email || '',
                                clienteTelefone: cliente?.telefone || '',
                                localObra: loc.local_obra || loc.local_entrega || '',
                                modalidade: loc.modalidade_locacao || 'mensal',
                                diasLocacao: loc.dias_total || 30,
                                dataInicio: loc.data_inicio || undefined,
                                dataFim: loc.data_fim || undefined,
                                itens: itensLoc,
                                subtotal: Number(loc.subtotal) || Number(loc.valor_total) || 0,
                                desconto: Number(loc.desconto) || 0,
                                frete: Number(loc.frete) || 0,
                                total: Number(loc.valor_total) || 0,
                                formaPagamento: loc.forma_pagamento || 'pix',
                                condicaoPagamento: loc.condicao_pagamento || '50_ato_30',
                                prazoNaoDevolucaoDias: 15,
                              })
                              showToast('Contrato PDF gerado!', 'success')
                            } catch (err) {
                              showToast('Erro ao gerar contrato', 'error')
                            }
                          }}>
                            Gerar Contrato
                          </Button>
                          {(statusCalc === 'ativo' || statusCalc === 'vencido') && (
                            <>
                              <Button size="sm" onClick={() => abrirRenovacao(loc)}>
                                Renovar
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => abrirDevolucao(loc)}>
                                Finalizar
                              </Button>
                            </>
                          )}
                          {statusCalc === 'pendente' && (
                            <>
                              <Button size="sm" onClick={async () => {
                                await supabase.from('locacoes').update({ status: 'ativo' }).eq('id', loc.id)
                                showToast('Locacao ativada!', 'success')
                                carregarDados()
                              }}>Ativar</Button>
                              <Button variant="outline" size="sm" onClick={() => abrirDevolucao(loc)}>
                                Cancelar / Finalizar
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Criacao Manual */}
      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nova Locacao Manual</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                <select value={formClienteId} onChange={(e) => setFormClienteId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="">Selecionar Cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modalidade</label>
                <select value={formModalidade} onChange={(e) => setFormModalidade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="mensal">Mensal</option>
                  <option value="quinzenal">Quinzenal</option>
                  <option value="semanal">Semanal</option>
                  <option value="diaria">Diaria</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicio *</label>
                <Input type="date" value={formDataInicio} onChange={(e) => setFormDataInicio(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim *</label>
                <Input type="date" value={formDataFim} onChange={(e) => setFormDataFim(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local de Entrega</label>
                <Input value={formLocalEntrega} onChange={(e) => setFormLocalEntrega(e.target.value)} placeholder="Endereco da entrega" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                <Input value={formObservacoes} onChange={(e) => setFormObservacoes(e.target.value)} placeholder="Observacoes..." />
              </div>
            </div>

            {/* Itens selecionados */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700">Equipamentos</h4>
                <Button size="sm" onClick={() => setFormModalSeletor(true)}>+ Adicionar Equipamento</Button>
              </div>
              {formItens.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum equipamento adicionado</p>
              ) : (
                <div className="space-y-2">
                  {formItens.map((item: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                      <div>
                        <span className="font-medium">{item.equipamento_nome}</span>
                        <span className="text-sm text-gray-600 ml-2">
                          {item.quantidade}x {formatarMoeda(item.preco_unitario)} = {formatarMoeda(item.subtotal)}
                        </span>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setFormItens(formItens.filter((_, i) => i !== idx))}>Remover</Button>
                    </div>
                  ))}
                  <div className="text-right font-bold text-green-600">
                    Total: {formatarMoeda(formItens.reduce((s: number, i: any) => s + i.subtotal, 0))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <Button onClick={criarLocacaoManual}>Criar Locacao</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setFormItens([]) }}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Seletor de Equipamentos (criacao manual) */}
      {formModalSeletor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Selecionar Equipamentos</h2>
                <Button onClick={() => setFormModalSeletor(false)} variant="outline">Fechar</Button>
              </div>
              <div className="space-y-4">
                {equipamentos.map(eq => (
                  <div key={eq.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {eq.asset_id && <span className="font-mono text-blue-700 mr-2">[{eq.asset_id}]</span>}
                        {eq.nome}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {eq.marca} {eq.modelo && `- ${eq.modelo}`}
                        {eq.numero_patrimonio && <span className="ml-2 text-gray-500">| Pat: {eq.numero_patrimonio}</span>}
                      </p>
                      <p className="text-sm font-medium text-green-600">{formatarMoeda(calcularPrecoModalidade(eq))}/{formModalidade}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Input type="number" min="0"
                        max={eq.controle_quantidade ? (eq.quantidade_disponivel || 0) : 1}
                        placeholder="Qtd"
                        value={formEqSelecionados[eq.id] || ''}
                        onChange={(e) => setFormEqSelecionados({ ...formEqSelecionados, [eq.id]: parseInt(e.target.value) || 0 })}
                        className="w-20" />
                      <Button onClick={() => {
                        const qtd = formEqSelecionados[eq.id] || 1
                        const max = eq.controle_quantidade ? (eq.quantidade_disponivel || 0) : 1
                        if (qtd > max) { showToast(`Maximo: ${max}`, 'warning'); return }
                        if (qtd > 0) {
                          adicionarItemForm(eq, qtd)
                          setFormEqSelecionados({ ...formEqSelecionados, [eq.id]: 0 })
                        }
                      }} disabled={!formEqSelecionados[eq.id]} size="sm">Adicionar</Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={() => setFormModalSeletor(false)}>Concluir</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Devolucao */}
      {showDevolucao && locacaoDevolucao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Devolucao de Equipamentos</h2>
                <Button onClick={() => { setShowDevolucao(false); setLocacaoDevolucao(null); setItensDevolucao([]) }} variant="outline">Fechar</Button>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg text-sm mb-4">
                <strong>Locacao:</strong> {locacaoDevolucao.numero || `#${locacaoDevolucao.id}`} - <strong>Cliente:</strong> {locacaoDevolucao.cliente_nome}
              </div>

              <div className="space-y-4">
                {itensDevolucao.map((item: any, idx: number) => (
                  <div key={idx} className={`border rounded-lg p-4 ${item.devolvido ? 'bg-gray-100 opacity-60' : 'bg-white'}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <input
                        type="checkbox"
                        checked={item.devolver}
                        disabled={item.devolvido}
                        onChange={(e) => {
                          const novos = [...itensDevolucao]
                          novos[idx] = { ...novos[idx], devolver: e.target.checked }
                          setItensDevolucao(novos)
                        }}
                        className="w-4 h-4"
                      />
                      <span className="font-medium text-gray-900">{item.equipamento_nome}</span>
                      {item.equipamento_marca && <span className="text-sm text-gray-500">{item.equipamento_marca} {item.equipamento_modelo}</span>}
                      {item.devolvido && <Badge variant="success">Devolvido{item.data_devolucao_anterior ? ` em ${new Date(item.data_devolucao_anterior + 'T12:00:00').toLocaleDateString('pt-BR')}` : ''}</Badge>}
                    </div>

                    {!item.devolvido && item.devolver && (
                      <div className="ml-7 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {/* Quantidade - so mostra para controle_quantidade */}
                          {(() => {
                            const eq = equipamentos.find((e: any) => e.id === item.equipamento_id)
                            if (eq?.controle_quantidade && item.quantidade > 1) {
                              return (
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade a devolver</label>
                                  <div className="flex items-center gap-2">
                                    <Input
                                      type="number"
                                      min={1}
                                      max={item.quantidade}
                                      value={item.qtd_devolver}
                                      onChange={(e) => {
                                        const novos = [...itensDevolucao]
                                        novos[idx] = { ...novos[idx], qtd_devolver: Math.min(Math.max(parseInt(e.target.value) || 1, 1), item.quantidade) }
                                        setItensDevolucao(novos)
                                      }}
                                      className="w-24"
                                    />
                                    <span className="text-sm text-gray-500">de {item.quantidade}</span>
                                  </div>
                                </div>
                              )
                            }
                            return null
                          })()}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Data da devolucao</label>
                            <Input
                              type="date"
                              value={item.data_devolucao}
                              onChange={(e) => {
                                const novos = [...itensDevolucao]
                                novos[idx] = { ...novos[idx], data_devolucao: e.target.value }
                                setItensDevolucao(novos)
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <span className="block text-sm font-medium text-gray-700 mb-2">Possui avarias?</span>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`avaria-${idx}`}
                                checked={!item.tem_avaria}
                                onChange={() => {
                                  const novos = [...itensDevolucao]
                                  novos[idx] = { ...novos[idx], tem_avaria: false, grau_avaria: '', descricao_avaria: '', cobrar_indenizacao: false, valor_indenizacao: 0 }
                                  setItensDevolucao(novos)
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">Nao, sem avarias</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`avaria-${idx}`}
                                checked={item.grau_avaria === 'leve'}
                                onChange={() => {
                                  const novos = [...itensDevolucao]
                                  novos[idx] = { ...novos[idx], tem_avaria: true, grau_avaria: 'leve', cobrar_indenizacao: false, valor_indenizacao: 0 }
                                  setItensDevolucao(novos)
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">Sim, avaria leve <span className="text-gray-400">(nao impede uso)</span></span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`avaria-${idx}`}
                                checked={item.grau_avaria === 'moderada'}
                                onChange={() => {
                                  const novos = [...itensDevolucao]
                                  novos[idx] = { ...novos[idx], tem_avaria: true, grau_avaria: 'moderada', cobrar_indenizacao: false, valor_indenizacao: 0 }
                                  setItensDevolucao(novos)
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">Sim, avaria moderada <span className="text-gray-400">(necessita reparo)</span></span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name={`avaria-${idx}`}
                                checked={item.grau_avaria === 'grave'}
                                onChange={() => {
                                  const novos = [...itensDevolucao]
                                  const eq = equipamentos.find((e: any) => e.id === item.equipamento_id)
                                  const valorAquisicao = Number(eq?.valor_aquisicao_unitario) || 0
                                  novos[idx] = { ...novos[idx], tem_avaria: true, grau_avaria: 'grave', cobrar_indenizacao: true, valor_indenizacao: Math.round(valorAquisicao * 2 * 100) / 100, data_vencimento_indenizacao: ultimaDataVencimento || new Date().toISOString().split('T')[0] }
                                  setItensDevolucao(novos)
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-700">Sim, avaria grave <span className="text-gray-400">(equipamento inutilizado / perda total)</span></span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer bg-red-900 bg-opacity-10 p-2 rounded-lg border border-red-300">
                              <input
                                type="radio"
                                name={`avaria-${idx}`}
                                checked={item.grau_avaria === 'furto_roubo'}
                                onChange={() => {
                                  const novos = [...itensDevolucao]
                                  const eq = equipamentos.find((e: any) => e.id === item.equipamento_id)
                                  const valorAquisicao = Number(eq?.valor_aquisicao_unitario) || 0
                                  novos[idx] = { ...novos[idx], tem_avaria: true, grau_avaria: 'furto_roubo', valor_indenizacao: Math.round(valorAquisicao * 2 * 100) / 100, data_vencimento_indenizacao: ultimaDataVencimento || new Date().toISOString().split('T')[0] }
                                  setItensDevolucao(novos)
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm font-medium text-red-800">Furto, roubo ou desaparecimento <span className="text-red-600 font-normal">(indenizacao automatica)</span></span>
                            </label>
                          </div>
                        </div>

                        {item.tem_avaria && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descreva as avarias</label>
                            <textarea
                              value={item.descricao_avaria}
                              onChange={(e) => {
                                const novos = [...itensDevolucao]
                                novos[idx] = { ...novos[idx], descricao_avaria: e.target.value }
                                setItensDevolucao(novos)
                              }}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Descreva as avarias encontradas..."
                            />
                          </div>
                        )}

                        {/* Checkbox de cobrança de indenização para avaria leve/moderada */}
                        {item.tem_avaria && (item.grau_avaria === 'leve' || item.grau_avaria === 'moderada') && (
                          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={item.cobrar_indenizacao || false}
                                onChange={(e) => {
                                  const novos = [...itensDevolucao]
                                  const eq = equipamentos.find((eqItem: any) => eqItem.id === item.equipamento_id)
                                  const valorAquisicao = Number(eq?.valor_aquisicao_unitario) || 0
                                  novos[idx] = {
                                    ...novos[idx],
                                    cobrar_indenizacao: e.target.checked,
                                    valor_indenizacao: e.target.checked ? Math.round(valorAquisicao * 2 * 100) / 100 : 0,
                                    data_vencimento_indenizacao: e.target.checked ? (ultimaDataVencimento || new Date().toISOString().split('T')[0]) : ''
                                  }
                                  setItensDevolucao(novos)
                                }}
                                className="w-4 h-4"
                              />
                              <span className="text-sm font-medium text-orange-800">Cobrar indenizacao ao cliente por esta avaria?</span>
                            </label>
                            {item.cobrar_indenizacao && (() => {
                              const eq = equipamentos.find((eqItem: any) => eqItem.id === item.equipamento_id)
                              const valorAquisicao = Number(eq?.valor_aquisicao_unitario) || 0
                              return valorAquisicao > 0 ? (
                                <div className="mt-2 ml-6 space-y-2">
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs font-normal text-orange-800">Valor a ser indenizado:</label>
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={item.valor_indenizacao || Math.round(valorAquisicao * 2 * 100) / 100}
                                      onChange={(e) => {
                                        const novos = [...itensDevolucao]
                                        novos[idx] = { ...novos[idx], valor_indenizacao: Number(e.target.value) }
                                        setItensDevolucao(novos)
                                      }}
                                      className="w-40 px-2 py-1 border border-orange-300 rounded text-sm bg-white text-orange-900 font-bold"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs font-normal text-orange-800">Vencimento da indenizacao:</label>
                                    <input
                                      type="date"
                                      value={item.data_vencimento_indenizacao || ultimaDataVencimento || new Date().toISOString().split('T')[0]}
                                      onChange={(e) => {
                                        const novos = [...itensDevolucao]
                                        novos[idx] = { ...novos[idx], data_vencimento_indenizacao: e.target.value }
                                        setItensDevolucao(novos)
                                      }}
                                      className="w-44 px-2 py-1 border border-orange-300 rounded text-sm bg-white text-orange-900"
                                    />
                                  </div>
                                </div>
                              ) : (
                                <p className="mt-2 ml-6 text-xs text-red-600 font-medium">
                                  Valor de aquisicao nao cadastrado! Cadastre antes de prosseguir.
                                </p>
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {itensDevolucao.some(i => i.devolver && !i.devolvido && i.tem_avaria) && (
                <div className="mt-4 space-y-2">
                  {itensDevolucao.some(i => i.devolver && !i.devolvido && i.grau_avaria === 'leve') && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                      <strong>Avaria leve:</strong> Equipamento retorna como <strong>Disponivel</strong> (nao impede uso).
                    </div>
                  )}
                  {itensDevolucao.some(i => i.devolver && !i.devolvido && i.grau_avaria === 'moderada') && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                      <strong>Avaria moderada:</strong> Equipamento sera encaminhado para <strong>Manutencao</strong> corretiva automaticamente.
                    </div>
                  )}
                  {itensDevolucao.some(i => i.devolver && !i.devolvido && i.grau_avaria === 'grave') && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                      <strong>Avaria grave:</strong>
                      <ul className="list-disc ml-5 mt-1 space-y-1">
                        <li>Equipamento sera <strong>Baixado</strong> do patrimonio (perda total)</li>
                        <li>Sera gerada <strong>fatura de indenizacao automatica</strong></li>
                        {itensDevolucao.filter(i => i.devolver && !i.devolvido && i.grau_avaria === 'grave').map((item, idx) => {
                          const eq = equipamentos.find((e: any) => e.id === item.equipamento_id)
                          const valorAquisicao = Number(eq?.valor_aquisicao_unitario) || 0
                          const itemIdx = itensDevolucao.findIndex(i => i.equipamento_id === item.equipamento_id)
                          return valorAquisicao > 0 ? (
                            <li key={idx} className="font-medium">
                              <div className="mt-1">
                                <span>{item.equipamento_nome}:</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <label className="text-xs font-normal text-red-800">Valor a ser indenizado:</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.valor_indenizacao || Math.round(valorAquisicao * 2 * 100) / 100}
                                    onChange={(e) => {
                                      const novos = [...itensDevolucao]
                                      novos[itemIdx] = { ...novos[itemIdx], valor_indenizacao: Number(e.target.value) }
                                      setItensDevolucao(novos)
                                    }}
                                    className="w-40 px-2 py-1 border border-red-300 rounded text-sm bg-white text-red-900 font-bold"
                                  />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <label className="text-xs font-normal text-red-800">Vencimento da indenizacao:</label>
                                  <input
                                    type="date"
                                    value={item.data_vencimento_indenizacao || ultimaDataVencimento || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => {
                                      const novos = [...itensDevolucao]
                                      novos[itemIdx] = { ...novos[itemIdx], data_vencimento_indenizacao: e.target.value }
                                      setItensDevolucao(novos)
                                    }}
                                    className="w-44 px-2 py-1 border border-red-300 rounded text-sm bg-white text-red-900"
                                  />
                                </div>
                              </div>
                            </li>
                          ) : (
                            <li key={idx} className="text-orange-700 font-medium">
                              {item.equipamento_nome}: Valor de aquisicao nao cadastrado! Cadastre antes de prosseguir.
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  {itensDevolucao.some(i => i.devolver && !i.devolvido && i.grau_avaria === 'furto_roubo') && (
                    <div className="p-3 bg-red-100 border border-red-400 rounded-lg text-sm text-red-900">
                      <strong>Furto / Roubo / Desaparecimento:</strong>
                      <ul className="list-disc ml-5 mt-1 space-y-1">
                        <li>Equipamento sera <strong>Baixado</strong> do patrimonio</li>
                        <li>Sera gerada <strong>fatura de indenizacao automatica</strong></li>
                        {itensDevolucao.filter(i => i.devolver && !i.devolvido && i.grau_avaria === 'furto_roubo').map((item, idx) => {
                          const eq = equipamentos.find((e: any) => e.id === item.equipamento_id)
                          const valorAquisicao = eq?.valor_aquisicao_unitario
                          const itemIdx = itensDevolucao.findIndex(i => i.equipamento_id === item.equipamento_id)
                          return valorAquisicao ? (
                            <li key={idx} className="font-medium">
                              <div className="mt-1">
                                <span>{item.equipamento_nome}:</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <label className="text-xs font-normal text-red-800">Valor a ser indenizado:</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={item.valor_indenizacao || Math.round(valorAquisicao * 2 * 100) / 100}
                                    onChange={(e) => {
                                      const novos = [...itensDevolucao]
                                      novos[itemIdx] = { ...novos[itemIdx], valor_indenizacao: Number(e.target.value) }
                                      setItensDevolucao(novos)
                                    }}
                                    className="w-40 px-2 py-1 border border-red-300 rounded text-sm bg-white text-red-900 font-bold"
                                  />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                  <label className="text-xs font-normal text-red-800">Vencimento da indenizacao:</label>
                                  <input
                                    type="date"
                                    value={item.data_vencimento_indenizacao || ultimaDataVencimento || new Date().toISOString().split('T')[0]}
                                    onChange={(e) => {
                                      const novos = [...itensDevolucao]
                                      novos[itemIdx] = { ...novos[itemIdx], data_vencimento_indenizacao: e.target.value }
                                      setItensDevolucao(novos)
                                    }}
                                    className="w-44 px-2 py-1 border border-red-300 rounded text-sm bg-white text-red-900"
                                  />
                                </div>
                              </div>
                            </li>
                          ) : (
                            <li key={idx} className="text-orange-700 font-medium">
                              {item.equipamento_nome}: Valor de aquisicao nao cadastrado! Cadastre antes de prosseguir.
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  )}
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                    Um alerta de cobranca de avaria sera gerado apos a confirmacao.
                  </div>
                </div>
              )}

              <div className="flex space-x-3 pt-6">
                <Button onClick={confirmarDevolucao} disabled={processandoDevolucao}>
                  {processandoDevolucao ? 'Processando...' : 'Confirmar Devolucao'}
                </Button>
                <Button variant="outline" onClick={() => { setShowDevolucao(false); setLocacaoDevolucao(null); setItensDevolucao([]) }}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alerta de Cobranca de Avaria */}
      {alertaAvaria.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-lg w-full mx-4">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Cobranca de Avaria Necessaria</h2>
                  <p className="text-sm text-gray-500">Locacao {alertaAvaria.locacaoNumero} - {alertaAvaria.clienteNome}</p>
                </div>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-orange-800 mb-3">
                  Os seguintes equipamentos foram devolvidos com avaria. Providencie a cobranca ao cliente:
                </p>
                <div className="space-y-2">
                  {alertaAvaria.itens.map((item: any, idx: number) => (
                    <div key={idx} className={`bg-white rounded p-3 border ${item.grau === 'furto_roubo' ? 'border-red-300' : 'border-orange-100'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-gray-900">{item.nome}</span>
                          {item.codigo && <span className="text-xs text-gray-500 ml-2">({item.codigo})</span>}
                        </div>
                        <Badge variant={item.grau === 'furto_roubo' ? 'danger' : item.grau === 'grave' ? 'danger' : item.grau === 'moderada' ? 'warning' : 'default'}>
                          {item.grau === 'furto_roubo' ? 'Furto/Roubo' : item.grau === 'leve' ? 'Leve' : item.grau === 'moderada' ? 'Moderada' : 'Grave'}
                        </Badge>
                      </div>
                      {item.descricao && <p className="text-xs text-gray-600 mt-1">{item.descricao}</p>}
                      {item.grau === 'grave' && (
                        <div className="mt-2">
                          <p className="text-xs text-red-600 font-medium">Perda total - Equipamento baixado do patrimonio</p>
                          {item.faturaNumero ? (
                            <p className="text-xs text-green-700 font-medium mt-1">
                              Fatura de indenizacao gerada: {item.faturaNumero} - {formatarMoeda(item.valorIndenizacao)}
                            </p>
                          ) : item.erroFatura ? (
                            <p className="text-xs text-red-700 font-medium mt-1">
                              Erro ao gerar fatura: {item.erroFatura}
                            </p>
                          ) : null}
                        </div>
                      )}
                      {(item.grau === 'leve' || item.grau === 'moderada') && item.faturaNumero && (
                        <div className="mt-2">
                          <p className="text-xs text-green-700 font-medium">
                            Fatura de indenizacao gerada: {item.faturaNumero} - {formatarMoeda(item.valorIndenizacao)}
                          </p>
                        </div>
                      )}
                      {(item.grau === 'leve' || item.grau === 'moderada') && item.erroFatura && (
                        <p className="text-xs text-red-700 font-medium mt-1">
                          Erro ao gerar fatura: {item.erroFatura}
                        </p>
                      )}
                      {item.grau === 'furto_roubo' && (
                        <div className="mt-2">
                          <p className="text-xs text-red-600 font-medium">Equipamento baixado do patrimonio</p>
                          {item.faturaNumero ? (
                            <p className="text-xs text-green-700 font-medium mt-1">
                              Fatura de indenizacao gerada: {item.faturaNumero} - {formatarMoeda(item.valorIndenizacao)}
                            </p>
                          ) : item.erroFatura ? (
                            <p className="text-xs text-red-700 font-medium mt-1">
                              Erro ao gerar fatura: {item.erroFatura}
                            </p>
                          ) : null}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  Acesse <strong>Faturamento</strong> para gerar uma cobranca de avaria para o cliente <strong>{alertaAvaria.clienteNome}</strong>.
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setAlertaAvaria({ show: false, clienteNome: '', locacaoNumero: '', itens: [] })}>
                  Entendido
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Renovacao */}
      {showRenovacao && locacaoRenovar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Renovar Locacao</h2>
                <Button onClick={() => { setShowRenovacao(false); setLocacaoRenovar(null) }} variant="outline">Fechar</Button>
              </div>

              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg text-sm">
                  <strong>Locacao:</strong> {locacaoRenovar.numero} - <strong>Cliente:</strong> {locacaoRenovar.cliente_nome}
                  <br />
                  <strong>Periodo atual:</strong>{' '}
                  {locacaoRenovar.data_inicio ? new Date(locacaoRenovar.data_inicio + 'T12:00:00').toLocaleDateString('pt-BR') : '-'} a{' '}
                  {locacaoRenovar.data_fim ? new Date(locacaoRenovar.data_fim + 'T12:00:00').toLocaleDateString('pt-BR') : '-'}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nova Data Fim *</label>
                  <Input type="date" value={renovarNovaDataFim} onChange={(e) => setRenovarNovaDataFim(e.target.value)} />
                  <p className="text-xs text-gray-500 mt-1">
                    O periodo sera estendido ate a nova data fim. Data inicio mantem-se igual.
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={renovarTodos} onChange={(e) => setRenovarTodos(e.target.checked)} />
                    <span className="text-sm font-medium text-gray-700">Renovar todos os equipamentos</span>
                  </label>
                </div>

                {!renovarTodos && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Selecione os equipamentos para manter:</h4>
                    <div className="space-y-2">
                      {renovarItens.map((item: any, idx: number) => (
                        <label key={idx} className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={renovarItensManter[item.equipamento_id] || false}
                            onChange={(e) => setRenovarItensManter({
                              ...renovarItensManter,
                              [item.equipamento_id]: e.target.checked
                            })}
                          />
                          <div className="flex-1">
                            <span className="font-medium">{item.equipamento_nome}</span>
                            <span className="text-sm text-gray-600 ml-2">
                              {item.quantidade || 1}x - {formatarMoeda(item.subtotal || 0)}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3 pt-4">
                  <Button onClick={confirmarRenovacao}>
                    Confirmar Renovacao
                  </Button>
                  <Button variant="outline" onClick={() => { setShowRenovacao(false); setLocacaoRenovar(null) }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
