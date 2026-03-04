'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface Cliente {
  id: number
  nome: string
  contato?: string
  endereco?: string
  documento?: string
  email?: string
  telefone?: string
}

interface Equipamento {
  id: number
  nome: string
  numero_patrimonio?: string
  marca?: string
  modelo?: string
  categoria?: string
  preco_dia?: number
  preco_mensal?: number
  preco_unitario_dia?: number
  status: string
}

interface ItemOrcamento {
  equipamento_id: number
  equipamento_nome: string
  equipamento_marca: string
  equipamento_modelo: string
  quantidade: number
  preco_unitario: number
  dias_locacao: number
  subtotal: number
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-gray-700 mb-1">{children}</label>
}

function Select({ value, onChange, children, className = "" }: {
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <select value={value} onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}>
      {children}
    </select>
  )
}

export default function NovoOrcamentoPage() {
  const router = useRouter()
  const { showToast } = useToast()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [loading, setLoading] = useState(false)
  const [clienteId, setClienteId] = useState('')
  const [modalidadeLocacao, setModalidadeLocacao] = useState('mensal')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')
  const [diasLocacao, setDiasLocacao] = useState(30)
  const [observacoes, setObservacoes] = useState('')
  const [incluiFrete, setIncluiFrete] = useState(false)
  const [freteResponsavel, setFreteResponsavel] = useState('cliente')
  const [valorFrete, setValorFrete] = useState(0)
  const [tipoDesconto, setTipoDesconto] = useState('percentual')
  const [descontoPercentual, setDescontoPercentual] = useState(0)
  const [descontoValor, setDescontoValor] = useState(0)
  const [itensOrcamento, setItensOrcamento] = useState<ItemOrcamento[]>([])
  const [modalSeletorAberto, setModalSeletorAberto] = useState(false)
  const [equipamentosSelecionados, setEquipamentosSelecionados] = useState<Record<number, number>>({})

  useEffect(() => { carregarDadosIniciais() }, [])

  useEffect(() => {
    if (dataInicio && modalidadeLocacao) calcularDataFim()
  }, [dataInicio, modalidadeLocacao])

  const carregarDadosIniciais = async () => {
    setLoading(true)
    try {
      const [clientesRes, equipRes] = await Promise.all([
        supabase.from('clientes').select('*').order('nome'),
        supabase.from('equipamentos').select('*').eq('status', 'disponivel').eq('ativo', true).order('nome')
      ])
      if (clientesRes.data) setClientes(clientesRes.data)
      if (equipRes.data) setEquipamentos(equipRes.data)
    } catch (error) {
      showToast('Erro ao carregar dados iniciais', 'error')
    } finally {
      setLoading(false)
    }
  }

  const calcularDataFim = () => {
    if (!dataInicio) return
    const inicio = new Date(dataInicio)
    const fim = new Date(inicio)
    let dias = 1
    switch (modalidadeLocacao) {
      case 'diaria': dias = 1; fim.setDate(fim.getDate() + 1); break
      case 'semanal': dias = 7; fim.setDate(fim.getDate() + 7); break
      case 'quinzenal': dias = 15; fim.setDate(fim.getDate() + 15); break
      case 'mensal': dias = 30; fim.setMonth(fim.getMonth() + 1); fim.setDate(fim.getDate() - 1); break
    }
    setDiasLocacao(dias)
    setDataFim(fim.toISOString().split('T')[0])
  }

  const calcularPrecoModalidade = (eq: Equipamento) => {
    const precoDia = Number(eq.preco_dia) || Number(eq.preco_unitario_dia) || Number(eq.preco_mensal) / 30 || 100
    const precoMensal = Number(eq.preco_mensal) || precoDia * 30
    switch (modalidadeLocacao) {
      case 'diaria': return precoDia
      case 'semanal': return precoMensal / 30 * 7
      case 'quinzenal': return precoMensal / 30 * 15
      case 'mensal': return precoMensal
      default: return precoDia
    }
  }

  const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const adicionarEquipamento = (eq: Equipamento, qtd: number) => {
    const preco = calcularPrecoModalidade(eq)
    setItensOrcamento([...itensOrcamento, {
      equipamento_id: eq.id, equipamento_nome: eq.nome,
      equipamento_marca: eq.marca || '', equipamento_modelo: eq.modelo || '',
      quantidade: qtd, preco_unitario: preco, dias_locacao: diasLocacao, subtotal: preco * qtd
    }])
  }

  const removerItem = (i: number) => setItensOrcamento(itensOrcamento.filter((_, idx) => idx !== i))

  const calcularTotais = () => {
    const subtotal = itensOrcamento.reduce((s, item) => s + item.subtotal, 0)
    const desc = tipoDesconto === 'percentual' ? (subtotal * descontoPercentual) / 100 : descontoValor
    const frete = incluiFrete && freteResponsavel === 'locadora' ? valorFrete : 0
    return { subtotal, desconto: desc, frete, total: subtotal - desc + frete }
  }

  const salvarOrcamento = async () => {
    const cliente = clientes.find(c => c.id === parseInt(clienteId))
    if (!cliente || itensOrcamento.length === 0) {
      showToast('Selecione um cliente e adicione equipamentos', 'warning')
      return
    }
    setLoading(true)
    try {
      const totais = calcularTotais()
      const countRes = await supabase.from('orcamentos').select('*', { count: 'exact', head: true })
      const numero = `ORC-${String((countRes.count || 0) + 1).padStart(4, '0')}`

      const { error } = await supabase.from('orcamentos').insert({
        numero_orcamento: numero,
        cliente_id: cliente.id,
        cliente_nome: cliente.nome,
        cliente_contato: cliente.telefone || cliente.contato || '',
        cliente_telefone: cliente.telefone || cliente.contato || '',
        cliente_email: cliente.email || '',
        status: 'rascunho',
        data_orcamento: new Date().toISOString().split('T')[0],
        data_validade: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        modalidade_locacao: modalidadeLocacao,
        data_inicio_locacao: dataInicio || null,
        data_fim_locacao: dataFim || null,
        dias_locacao: diasLocacao,
        subtotal: totais.subtotal,
        desconto_valor: totais.desconto,
        valor_total: totais.total,
        observacoes: observacoes || '',
        frete_responsavel: freteResponsavel,
        valor_frete: totais.frete,
        inclui_frete: incluiFrete,
        itens: JSON.stringify(itensOrcamento)
      }).select().single()

      if (error) { showToast('Erro ao salvar: ' + error.message, 'error'); return }
      showToast('Orçamento criado com sucesso!', 'success')
      router.push('/dashboard/orcamentos')
    } catch { showToast('Erro ao salvar orçamento', 'error') }
    finally { setLoading(false) }
  }

  const totais = calcularTotais()
  const clienteSelecionado = clientes.find(c => c.id === parseInt(clienteId))

  if (loading && clientes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Orçamento</h1>
          <p className="text-gray-600">Criar um novo orçamento para locação</p>
        </div>
        <Button onClick={() => router.push('/dashboard/orcamentos')} variant="outline">Voltar</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Seleção do Cliente</CardTitle></CardHeader>
            <CardContent>
              <Label>Cliente *</Label>
              <Select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Selecione um cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nome} {c.telefone ? `- ${c.telefone}` : ''}</option>
                ))}
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Modalidade de Locação</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Modalidade *</Label>
                  <Select value={modalidadeLocacao} onChange={(e) => setModalidadeLocacao(e.target.value)}>
                    <option value="mensal">Mensal</option>
                    <option value="quinzenal">Quinzenal</option>
                    <option value="semanal">Semanal</option>
                    <option value="diaria">Diária</option>
                  </Select>
                </div>
                <div>
                  <Label>Data Início *</Label>
                  <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
                </div>
                <div>
                  <Label>Data Fim</Label>
                  <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
                </div>
              </div>
              {dataInicio && dataFim && (
                <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
                  Período: {diasLocacao} dias - Modalidade: <strong>{modalidadeLocacao}</strong>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Equipamentos
                <Button onClick={() => setModalSeletorAberto(true)} className="ml-2">+ Selecionar</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {itensOrcamento.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum equipamento selecionado</p>
                  <Button onClick={() => setModalSeletorAberto(true)} variant="outline" className="mt-2">+ Adicionar</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {itensOrcamento.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.equipamento_nome}</h4>
                        <p className="text-sm text-gray-600">{item.equipamento_marca} {item.equipamento_modelo && `- ${item.equipamento_modelo}`}</p>
                        <p className="text-sm font-medium">{formatarMoeda(item.preco_unitario)}/{modalidadeLocacao} x {item.quantidade} = {formatarMoeda(item.subtotal)}</p>
                      </div>
                      <Button onClick={() => removerItem(i)} variant="outline" size="sm">Remover</Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Frete e Entrega</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center">
                <input type="checkbox" checked={incluiFrete} onChange={(e) => setIncluiFrete(e.target.checked)} className="mr-2" />
                Incluir frete no orçamento
              </label>
              {incluiFrete && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Responsável</Label>
                    <Select value={freteResponsavel} onChange={(e) => setFreteResponsavel(e.target.value)}>
                      <option value="cliente">Cliente</option>
                      <option value="locadora">Locadora</option>
                    </Select>
                  </div>
                  {freteResponsavel === 'locadora' && (
                    <div>
                      <Label>Valor do Frete</Label>
                      <Input type="number" step="0.01" value={valorFrete} onChange={(e) => setValorFrete(parseFloat(e.target.value) || 0)} />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
            <CardContent>
              <textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Observações do orçamento..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24" rows={4} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {clienteSelecionado && (
            <Card>
              <CardHeader><CardTitle className="text-lg">Cliente</CardTitle></CardHeader>
              <CardContent>
                <p className="font-medium">{clienteSelecionado.nome}</p>
                {clienteSelecionado.telefone && <p className="text-sm text-gray-600">{clienteSelecionado.telefone}</p>}
                {clienteSelecionado.email && <p className="text-sm text-gray-600">{clienteSelecionado.email}</p>}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-lg">Resumo</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between"><span>Subtotal:</span><span>{formatarMoeda(totais.subtotal)}</span></div>
                <div className="space-y-2">
                  <Select value={tipoDesconto} onChange={(e) => setTipoDesconto(e.target.value)} className="text-sm">
                    <option value="percentual">% Desconto</option>
                    <option value="valor">Valor Fixo</option>
                  </Select>
                  <Input type="number" step={tipoDesconto === 'percentual' ? "1" : "0.01"}
                    value={tipoDesconto === 'percentual' ? descontoPercentual : descontoValor}
                    onChange={(e) => { const v = parseFloat(e.target.value) || 0; tipoDesconto === 'percentual' ? setDescontoPercentual(v) : setDescontoValor(v) }}
                    placeholder="0" />
                  {totais.desconto > 0 && <div className="flex justify-between text-red-600"><span>Desconto:</span><span>-{formatarMoeda(totais.desconto)}</span></div>}
                </div>
                {totais.frete > 0 && <div className="flex justify-between"><span>Frete:</span><span>+{formatarMoeda(totais.frete)}</span></div>}
                <hr />
                <div className="flex justify-between text-lg font-bold"><span>Total:</span><span>{formatarMoeda(totais.total)}</span></div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button onClick={salvarOrcamento} className="w-full bg-green-600 hover:bg-green-700" disabled={!clienteId || itensOrcamento.length === 0 || loading}>
              Salvar Orçamento
            </Button>
            <Button onClick={() => router.push('/dashboard/orcamentos')} variant="outline" className="w-full">Cancelar</Button>
          </div>
        </div>
      </div>

      {modalSeletorAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Selecionar Equipamentos</h2>
                <Button onClick={() => setModalSeletorAberto(false)} variant="outline">Fechar</Button>
              </div>
              {equipamentos.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nenhum equipamento disponível</p>
              ) : (
                <div className="space-y-4">
                  {equipamentos.map(eq => (
                    <div key={eq.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{eq.nome}</h4>
                        <p className="text-sm text-gray-600">{eq.marca} {eq.modelo && `- ${eq.modelo}`} {eq.categoria && `- ${eq.categoria}`}</p>
                        <p className="text-sm font-medium text-green-600">{formatarMoeda(calcularPrecoModalidade(eq))}/{modalidadeLocacao}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Input type="number" min="0" placeholder="Qtd"
                          value={equipamentosSelecionados[eq.id] || ''}
                          onChange={(e) => setEquipamentosSelecionados({ ...equipamentosSelecionados, [eq.id]: parseInt(e.target.value) || 0 })}
                          className="w-20" />
                        <Button onClick={() => {
                          const qtd = equipamentosSelecionados[eq.id] || 1
                          if (qtd > 0) { adicionarEquipamento(eq, qtd); setEquipamentosSelecionados({ ...equipamentosSelecionados, [eq.id]: 0 }) }
                        }} disabled={!equipamentosSelecionados[eq.id]} size="sm">Adicionar</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end mt-6">
                <Button onClick={() => setModalSeletorAberto(false)}>Concluir Seleção</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
