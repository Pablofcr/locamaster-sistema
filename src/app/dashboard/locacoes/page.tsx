'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'

export default function LocacoesPage() {
  const { showToast } = useToast()
  const [locacoes, setLocacoes] = useState<any[]>([])
  const [clientes, setClientes] = useState<any[]>([])
  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const [stats, setStats] = useState({ total: 0, ativos: 0, pendentes: 0, valorTotal: 0 })

  const [formData, setFormData] = useState({
    cliente_id: '', equipamento_id: '', data_inicio: '', data_fim: '',
    local_entrega: '', valor_dia: '', observacoes: ''
  })

  useEffect(() => { carregarDados() }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [locRes, cliRes, eqRes] = await Promise.all([
        supabase.from('locacoes').select('*').order('created_at', { ascending: false }),
        supabase.from('clientes').select('id, nome').order('nome'),
        supabase.from('equipamentos').select('id, nome, preco_unitario_dia, preco_dia').eq('status', 'disponivel').eq('ativo', true).order('nome')
      ])

      const data = locRes.data || []
      setLocacoes(data)
      setClientes(cliRes.data || [])
      setEquipamentos(eqRes.data || [])

      setStats({
        total: data.length,
        ativos: data.filter(l => l.status === 'ativo').length,
        pendentes: data.filter(l => l.status === 'pendente').length,
        valorTotal: data.reduce((s, l) => s + (Number(l.valor_total) || 0), 0)
      })
    } catch (error) {
      showToast('Erro ao carregar locações', 'error')
    } finally {
      setLoading(false)
    }
  }

  const criarLocacao = async () => {
    if (!formData.cliente_id || !formData.equipamento_id || !formData.data_inicio || !formData.data_fim) {
      showToast('Preencha todos os campos obrigatórios', 'warning')
      return
    }
    try {
      const cliente = clientes.find(c => c.id === parseInt(formData.cliente_id))
      const equipamento = equipamentos.find(e => e.id === parseInt(formData.equipamento_id))
      const valorDia = Number(formData.valor_dia) || Number(equipamento?.preco_unitario_dia) || Number(equipamento?.preco_dia) || 0
      const inicio = new Date(formData.data_inicio)
      const fim = new Date(formData.data_fim)
      const dias = Math.ceil((fim.getTime() - inicio.getTime()) / 86400000)

      const countRes = await supabase.from('locacoes').select('*', { count: 'exact', head: true })
      const numero = `LOC-${new Date().getFullYear()}-${String((countRes.count || 0) + 1).padStart(3, '0')}`

      const { error } = await supabase.from('locacoes').insert({
        numero, cliente_id: parseInt(formData.cliente_id), cliente_nome: cliente?.nome || '',
        equipamento_id: parseInt(formData.equipamento_id), equipamento_nome: equipamento?.nome || '',
        data_inicio: formData.data_inicio, data_fim: formData.data_fim,
        dias_total: dias, valor_dia: valorDia, valor_total: valorDia * dias,
        status: 'pendente', local_entrega: formData.local_entrega, observacoes: formData.observacoes
      })

      if (error) throw error

      await supabase.from('equipamentos').update({ status: 'locado' }).eq('id', parseInt(formData.equipamento_id))

      showToast('Locação criada com sucesso!', 'success')
      setShowForm(false)
      setFormData({ cliente_id: '', equipamento_id: '', data_inicio: '', data_fim: '', local_entrega: '', valor_dia: '', observacoes: '' })
      carregarDados()
    } catch (error: any) {
      showToast('Erro ao criar locação: ' + error.message, 'error')
    }
  }

  const finalizarLocacao = async (locacao: any) => {
    try {
      await supabase.from('locacoes').update({ status: 'finalizado', updated_at: new Date().toISOString() }).eq('id', locacao.id)
      if (locacao.equipamento_id) {
        await supabase.from('equipamentos').update({ status: 'disponivel' }).eq('id', locacao.equipamento_id)
      }
      showToast('Locação finalizada!', 'success')
      carregarDados()
    } catch { showToast('Erro ao finalizar locação', 'error') }
  }

  const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const getStatusBadge = (status: string) => {
    const c: Record<string, { label: string; color: string }> = {
      ativo: { label: 'Ativo', color: 'bg-green-100 text-green-800' },
      pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      finalizado: { label: 'Finalizado', color: 'bg-blue-100 text-blue-800' },
      vencido: { label: 'Vencido', color: 'bg-red-100 text-red-800' },
      cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500' }
    }
    const cfg = c[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return <Badge className={cfg.color}>{cfg.label}</Badge>
  }

  const calcularDiasRestantes = (dataFim: string) => {
    const diff = new Date(dataFim).getTime() - Date.now()
    return Math.ceil(diff / 86400000)
  }

  const locacoesFiltradas = locacoes.filter(l => {
    const matchSearch = !searchTerm ||
      (l.numero || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.cliente_nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.equipamento_nome || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filtroStatus === 'todos' || l.status === filtroStatus
    return matchSearch && matchStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando locações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Locações</h1>
          <p className="text-gray-600">Contratos e acompanhamento de locações</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>+ Nova Locação</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Total</div><div className="text-2xl font-bold text-blue-600">{stats.total}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Ativos</div><div className="text-2xl font-bold text-green-600">{stats.ativos}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Pendentes</div><div className="text-2xl font-bold text-yellow-600">{stats.pendentes}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Valor Total</div><div className="text-2xl font-bold text-emerald-600">{formatarMoeda(stats.valorTotal)}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contratos de Locação</CardTitle>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="todos">Todos Status</option>
              <option value="ativo">Ativos</option>
              <option value="pendente">Pendentes</option>
              <option value="finalizado">Finalizados</option>
              <option value="vencido">Vencidos</option>
            </select>
          </div>
          <Input placeholder="Buscar por contrato, cliente ou equipamento..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md mt-2" />
        </CardHeader>
        <CardContent>
          {locacoesFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhuma locação encontrada</div>
          ) : (
            <div className="space-y-4">
              {locacoesFiltradas.map(loc => (
                <div key={loc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{loc.numero || `#${loc.id}`}</h3>
                        {getStatusBadge(loc.status)}
                        {loc.status === 'ativo' && loc.data_fim && (
                          <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                            {calcularDiasRestantes(loc.data_fim)} dias restantes
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Cliente:</span> {loc.cliente_nome} -
                        <span className="font-medium"> Equipamento:</span> {loc.equipamento_nome}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Período:</span>
                      <div>{loc.data_inicio ? new Date(loc.data_inicio).toLocaleDateString('pt-BR') : '-'} - {loc.data_fim ? new Date(loc.data_fim).toLocaleDateString('pt-BR') : '-'}</div>
                      <div className="text-xs text-gray-500">{loc.dias_total} dias</div>
                    </div>
                    <div>
                      <span className="font-medium">Valor:</span>
                      <div>{formatarMoeda(Number(loc.valor_dia) || 0)}/dia</div>
                      <div className="text-lg font-bold text-green-600">{formatarMoeda(Number(loc.valor_total) || 0)}</div>
                    </div>
                    <div>
                      <span className="font-medium">Local:</span>
                      <div>{loc.local_entrega || '-'}</div>
                    </div>
                    {loc.observacoes && (
                      <div>
                        <span className="font-medium">Observações:</span>
                        <div className="text-xs">{loc.observacoes}</div>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {loc.status === 'ativo' && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => finalizarLocacao(loc)}>Finalizar</Button>
                      </>
                    )}
                    {loc.status === 'pendente' && (
                      <Button variant="outline" size="sm" onClick={async () => {
                        await supabase.from('locacoes').update({ status: 'ativo' }).eq('id', loc.id)
                        showToast('Locação ativada!', 'success')
                        carregarDados()
                      }}>Ativar</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nova Locação</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select value={formData.cliente_id} onChange={(e) => setFormData({ ...formData, cliente_id: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Selecionar Cliente</option>
                {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              <select value={formData.equipamento_id} onChange={(e) => setFormData({ ...formData, equipamento_id: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Selecionar Equipamento</option>
                {equipamentos.map(e => <option key={e.id} value={e.id}>{e.nome} ({formatarMoeda(Number(e.preco_unitario_dia) || Number(e.preco_dia) || 0)}/dia)</option>)}
              </select>
              <Input placeholder="Data Início" type="date" value={formData.data_inicio} onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })} />
              <Input placeholder="Data Fim" type="date" value={formData.data_fim} onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })} />
              <Input placeholder="Local de Entrega" value={formData.local_entrega} onChange={(e) => setFormData({ ...formData, local_entrega: e.target.value })} />
              <Input placeholder="Valor por Dia (R$)" type="number" value={formData.valor_dia} onChange={(e) => setFormData({ ...formData, valor_dia: e.target.value })} />
            </div>
            <div className="mt-4">
              <Input placeholder="Observações do contrato..." value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
            </div>
            <div className="mt-6 flex space-x-3">
              <Button onClick={criarLocacao}>Criar Contrato</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
