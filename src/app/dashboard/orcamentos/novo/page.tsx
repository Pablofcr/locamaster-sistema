'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { gerarPDFOrcamento } from '@/lib/gerarPDFOrcamento'
import { verificarDisponibilidade, DisponibilidadeEquipamento } from '@/lib/verificarDisponibilidade'
import { formatarNumeroOrcamento, proximoSequencial } from '@/lib/numeracao'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { useRouter } from 'next/navigation'

interface Cliente {
  id: number
  nome: string
  nome_fantasia?: string
  contato?: string
  endereco?: string
  documento?: string
  cpf_cnpj?: string
  email?: string
  telefone?: string
}

interface Equipamento {
  id: number
  nome: string
  numero_patrimonio?: string
  asset_id?: string
  marca?: string
  modelo?: string
  categoria?: string
  preco_dia?: number
  preco_mensal?: number
  preco_unitario_dia?: number
  status: string
  controle_quantidade?: boolean
  quantidade_total?: number
  quantidade_disponivel?: number
}

interface ItemOrcamento {
  equipamento_id: number
  equipamento_nome: string
  equipamento_marca: string
  equipamento_modelo: string
  quantidade: number
  preco_unitario: number
  dias_locacao: number
  tipo_desconto_item: 'percentual' | 'valor'
  desconto_percentual: number
  desconto_valor_item: number
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
  const { empresa } = useEmpresa()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([])
  const [loading, setLoading] = useState(false)
  const [numeroOrcamento, setNumeroOrcamento] = useState('')
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
  const [localObra, setLocalObra] = useState('')
  const [formaPagamento, setFormaPagamento] = useState('pix')
  const [condicaoPagamento, setCondicaoPagamento] = useState('50_ato_30')
  const [disponibilidadeMap, setDisponibilidadeMap] = useState<Record<number, DisponibilidadeEquipamento>>({})
  const [carregandoDisponibilidade, setCarregandoDisponibilidade] = useState(false)

  useEffect(() => { carregarDadosIniciais() }, [])

  useEffect(() => {
    if (dataInicio && modalidadeLocacao) calcularDataFim()
  }, [dataInicio, modalidadeLocacao])

  const carregarDisponibilidade = async () => {
    setCarregandoDisponibilidade(true)
    try {
      // Se nao tem datas definidas, usa hoje + 30 dias como referencia
      const inicio = dataInicio || new Date().toISOString().split('T')[0]
      const fim = dataFim || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
      const mapa = await verificarDisponibilidade(inicio, fim)
      setDisponibilidadeMap(mapa)
    } catch (err) {
      console.error('Erro ao verificar disponibilidade:', err)
    } finally {
      setCarregandoDisponibilidade(false)
    }
  }

  const carregarDadosIniciais = async () => {
    setLoading(true)
    try {
      const [clientesRes, equipRes, orcNumRes, locNumRes] = await Promise.all([
        supabase.from('clientes').select('*').order('nome'),
        supabase.from('equipamentos').select('*').eq('ativo', true).order('nome'),
        supabase.from('orcamentos').select('numero_orcamento'),
        supabase.from('locacoes').select('numero')
      ])
      if (clientesRes.data) setClientes(clientesRes.data)
      if (equipRes.data) setEquipamentos(equipRes.data)
      // Sequencial unico entre orcamentos e contratos, baseado no maior numero
      // ja emitido — apagar um registro nao libera um numero ja usado.
      const numerosEmitidos = [
        ...(orcNumRes.data || []).map((r: any) => r.numero_orcamento),
        ...(locNumRes.data || []).map((r: any) => r.numero)
      ]
      setNumeroOrcamento(formatarNumeroOrcamento(proximoSequencial(numerosEmitidos)))
    } catch (error) {
      showToast('Erro ao carregar dados iniciais', 'error')
    } finally {
      setLoading(false)
    }
  }

  const calcularDataFim = () => {
    if (!dataInicio) return
    const inicio = new Date(dataInicio + 'T12:00:00')
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
    const precoDia = Math.round((Number(eq.preco_dia) || Number(eq.preco_unitario_dia) || Number(eq.preco_mensal) / 30 || 100) * 100) / 100
    const precoMensal = Math.round((Number(eq.preco_mensal) || precoDia * 30) * 100) / 100
    switch (modalidadeLocacao) {
      case 'diaria': return precoDia
      case 'semanal': return Math.round(precoMensal / 30 * 7 * 100) / 100
      case 'quinzenal': return Math.round(precoMensal / 30 * 15 * 100) / 100
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
      quantidade: qtd, preco_unitario: preco, dias_locacao: diasLocacao,
      tipo_desconto_item: 'percentual', desconto_percentual: 0, desconto_valor_item: 0, subtotal: Math.round(preco * qtd * 100) / 100
    }])
  }

  const removerItem = (i: number) => setItensOrcamento(itensOrcamento.filter((_, idx) => idx !== i))

  const calcularSubtotalItem = (item: ItemOrcamento, tipoDesc: 'percentual' | 'valor', descPct: number, descVal: number) => {
    const bruto = Math.round(item.preco_unitario * item.quantidade * 100) / 100
    if (tipoDesc === 'percentual') {
      return Math.round(bruto * (1 - Math.min(Math.max(descPct, 0), 100) / 100) * 100) / 100
    }
    return Math.round(Math.max(bruto - Math.max(descVal, 0), 0) * 100) / 100
  }

  const atualizarTipoDescontoItem = (index: number, tipo: 'percentual' | 'valor') => {
    setItensOrcamento(itensOrcamento.map((item, i) => {
      if (i !== index) return item
      const updated = { ...item, tipo_desconto_item: tipo, desconto_percentual: 0, desconto_valor_item: 0 }
      return { ...updated, subtotal: Math.round(item.preco_unitario * item.quantidade * 100) / 100 }
    }))
  }

  const atualizarDescontoItem = (index: number, desconto: number) => {
    setItensOrcamento(itensOrcamento.map((item, i) => {
      if (i !== index) return item
      const descPct = item.tipo_desconto_item === 'percentual' ? desconto : item.desconto_percentual
      const descVal = item.tipo_desconto_item === 'valor' ? desconto : item.desconto_valor_item
      const subtotal = calcularSubtotalItem(item, item.tipo_desconto_item, descPct, descVal)
      return {
        ...item,
        desconto_percentual: item.tipo_desconto_item === 'percentual' ? Math.min(Math.max(desconto, 0), 100) : item.desconto_percentual,
        desconto_valor_item: item.tipo_desconto_item === 'valor' ? Math.max(desconto, 0) : item.desconto_valor_item,
        subtotal
      }
    }))
  }

  const calcularTotais = () => {
    const subtotal = Math.round(itensOrcamento.reduce((s, item) => s + item.subtotal, 0) * 100) / 100
    const desc = Math.round((tipoDesconto === 'percentual' ? (subtotal * descontoPercentual) / 100 : descontoValor) * 100) / 100
    const frete = incluiFrete && freteResponsavel === 'locadora' ? valorFrete : 0
    return { subtotal, desconto: desc, frete, total: Math.round((subtotal - desc + frete) * 100) / 100 }
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

      const { error } = await supabase.from('orcamentos').insert({
        numero_orcamento: numeroOrcamento,
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
        local_obra: localObra || null,
        forma_pagamento: formaPagamento,
        condicao_pagamento: condicaoPagamento,
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
              <div>
                <Label>Local da Obra (endereco)</Label>
                <Input value={localObra} onChange={(e) => setLocalObra(e.target.value)} placeholder="Endereco completo da obra (opcional)" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Equipamentos
                <Button onClick={() => { setModalSeletorAberto(true); carregarDisponibilidade() }} className="ml-2">+ Selecionar</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {itensOrcamento.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>Nenhum equipamento selecionado</p>
                  <Button onClick={() => { setModalSeletorAberto(true); carregarDisponibilidade() }} variant="outline" className="mt-2">+ Adicionar</Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {itensOrcamento.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.equipamento_nome}</h4>
                        <p className="text-sm text-gray-600">{item.equipamento_marca} {item.equipamento_modelo && `- ${item.equipamento_modelo}`}</p>
                        <div className="flex items-center gap-3 mt-1 flex-wrap">
                          <p className="text-sm font-medium">{formatarMoeda(item.preco_unitario)}/{modalidadeLocacao} x {item.quantidade}</p>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Desc:</span>
                            <select value={item.tipo_desconto_item || 'percentual'}
                              onChange={(e) => atualizarTipoDescontoItem(i, e.target.value as 'percentual' | 'valor')}
                              className="px-1 py-0.5 text-xs border border-gray-300 rounded">
                              <option value="percentual">%</option>
                              <option value="valor">R$</option>
                            </select>
                            <input type="number" min="0"
                              max={item.tipo_desconto_item === 'percentual' ? 100 : undefined}
                              step={item.tipo_desconto_item === 'percentual' ? "1" : "0.01"}
                              value={(item.tipo_desconto_item === 'percentual' ? item.desconto_percentual : item.desconto_valor_item) || ''}
                              onChange={(e) => atualizarDescontoItem(i, parseFloat(e.target.value) || 0)}
                              placeholder="0"
                              className="w-16 px-1 py-0.5 text-xs border border-gray-300 rounded text-center" />
                          </div>
                          <p className="text-sm font-bold">= {formatarMoeda(item.subtotal)}</p>
                          {(item.desconto_percentual > 0 || item.desconto_valor_item > 0) && (
                            <span className="text-xs text-red-600">
                              (-{item.tipo_desconto_item === 'percentual' ? `${item.desconto_percentual}%` : formatarMoeda(item.desconto_valor_item)})
                            </span>
                          )}
                        </div>
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
            <CardHeader><CardTitle>Pagamento</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Forma de Pagamento</Label>
                  <Select value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
                    <option value="pix">PIX</option>
                    <option value="cartao_credito">Cartao de Credito</option>
                    <option value="deposito_bancario">Deposito Bancario</option>
                  </Select>
                </div>
                <div>
                  <Label>Condicoes de Pagamento</Label>
                  <Select value={condicaoPagamento} onChange={(e) => setCondicaoPagamento(e.target.value)}>
                    <option value="antecipado">Antecipado</option>
                    <option value="50_ato_30">50% no ato + 50% para 30 dias</option>
                    <option value="final_periodo">Ultimo dia do periodo contratado</option>
                    <option value="5_dias_apos">5 dias apos o vencimento do contrato</option>
                  </Select>
                </div>
              </div>
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
            <Button onClick={() => gerarPDFOrcamento({
              numero: numeroOrcamento || undefined,
              clienteNome: clienteSelecionado?.nome || '',
              clienteNomeFantasia: clienteSelecionado?.nome_fantasia || '',
              clienteTelefone: clienteSelecionado?.telefone || '',
              clienteEmail: clienteSelecionado?.email || '',
              clienteDocumento: clienteSelecionado?.cpf_cnpj || clienteSelecionado?.documento || '',
              modalidade: modalidadeLocacao,
              diasLocacao,
              dataInicio: dataInicio || undefined,
              dataFim: dataFim || undefined,
              itens: itensOrcamento,
              subtotal: totais.subtotal,
              desconto: totais.desconto,
              frete: totais.frete,
              total: totais.total,
              observacoes: observacoes || undefined,
              formaPagamento,
              condicaoPagamento,
            }, empresa || undefined)} variant="outline" className="w-full" disabled={!clienteId || itensOrcamento.length === 0}>
              Baixar PDF
            </Button>
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
              {carregandoDisponibilidade && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500">Verificando disponibilidade...</p>
                </div>
              )}
              {(() => {
                const equipamentosDisponiveis = equipamentos.filter(eq => {
                  const disp = disponibilidadeMap[eq.id]
                  // Equipamento ja com status locado/manutencao no banco
                  if (eq.status === 'locado' || eq.status === 'manutencao') {
                    // Para controle_quantidade, verificar se ainda tem unidades
                    if (eq.controle_quantidade && (eq.quantidade_disponivel || 0) > 0) {
                      // Pode ter unidades disponiveis mesmo com status parcial
                    } else {
                      return false
                    }
                  }
                  // Verificar conflito com locacoes/orcamentos aprovados
                  if (disp) {
                    if (eq.controle_quantidade) {
                      const dispReal = Math.min(eq.quantidade_disponivel || 0, disp.quantidade_disponivel)
                      return dispReal > 0
                    } else {
                      return disp.disponivel
                    }
                  }
                  return true
                })
                // Tambem remover equipamentos ja adicionados ao orcamento atual (individuais)
                const jaAdicionados = new Set(itensOrcamento.filter(item => {
                  const eq = equipamentos.find(e => e.id === item.equipamento_id)
                  return eq && !eq.controle_quantidade
                }).map(item => item.equipamento_id))

                const equipamentosFinal = equipamentosDisponiveis.filter(eq => !jaAdicionados.has(eq.id))

                return equipamentosFinal.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">Nenhum equipamento disponivel para o periodo selecionado</p>
                ) : (
                  <div className="space-y-4">
                    {equipamentosFinal.map(eq => {
                      const disp = disponibilidadeMap[eq.id]
                      let maxDisponivelPeriodo = eq.controle_quantidade ? (eq.quantidade_disponivel || 0) : 1
                      if (disp && eq.controle_quantidade) {
                        maxDisponivelPeriodo = Math.min(maxDisponivelPeriodo, disp.quantidade_disponivel)
                      }
                      // Descontar qtd ja adicionada no orcamento atual
                      const qtdJaNoOrcamento = itensOrcamento.filter(i => i.equipamento_id === eq.id).reduce((s, i) => s + i.quantidade, 0)
                      maxDisponivelPeriodo = Math.max(maxDisponivelPeriodo - qtdJaNoOrcamento, 0)
                      if (maxDisponivelPeriodo <= 0) return null

                      return (
                      <div key={eq.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium">
                            {eq.asset_id && <span className="font-mono text-blue-700 mr-2">[{eq.asset_id}]</span>}
                            {eq.nome}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {eq.marca} {eq.modelo && `- ${eq.modelo}`} {eq.categoria && `- ${eq.categoria}`}
                            {eq.numero_patrimonio && <span className="ml-2 text-gray-500">| Pat: {eq.numero_patrimonio}</span>}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-green-600">{formatarMoeda(calcularPrecoModalidade(eq))}/{modalidadeLocacao}</p>
                            {eq.controle_quantidade && (
                              <span className="text-xs px-2 py-0.5 rounded font-medium bg-emerald-100 text-emerald-800">
                                Disponivel: {maxDisponivelPeriodo} / {eq.quantidade_total}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Input type="number" min="1"
                            max={eq.controle_quantidade ? maxDisponivelPeriodo : 1}
                            placeholder="Qtd"
                            value={equipamentosSelecionados[eq.id] || ''}
                            onChange={(e) => setEquipamentosSelecionados({ ...equipamentosSelecionados, [eq.id]: parseInt(e.target.value) || 0 })}
                            className="w-20" />
                          <Button onClick={() => {
                            const qtd = equipamentosSelecionados[eq.id] || 1
                            if (qtd > maxDisponivelPeriodo) {
                              showToast(`Maximo disponivel no periodo: ${maxDisponivelPeriodo}`, 'warning')
                              return
                            }
                            if (qtd > 0) { adicionarEquipamento(eq, qtd); setEquipamentosSelecionados({ ...equipamentosSelecionados, [eq.id]: 0 }) }
                          }} disabled={!equipamentosSelecionados[eq.id]} size="sm">Adicionar</Button>
                        </div>
                      </div>
                      )
                    })}
                  </div>
                )
              })()}
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
