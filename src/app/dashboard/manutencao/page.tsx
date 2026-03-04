'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'

export default function ManutencaoPage() {
  const { showToast } = useToast()
  const [manutencoes, setManutencoes] = useState<any[]>([])
  const [equipamentos, setEquipamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const [stats, setStats] = useState({ agendadas: 0, em_andamento: 0, vencidas: 0, custoMes: 0 })

  const [formData, setFormData] = useState({
    equipamento_id: '', tipo: 'preventiva', data_agendada: '', tecnico: '',
    custo: '', descricao: '', observacoes: '', proxima_manutencao: ''
  })

  useEffect(() => { carregarDados() }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [manRes, eqRes] = await Promise.all([
        supabase.from('manutencoes').select('*').order('data_agendada', { ascending: false }),
        supabase.from('equipamentos').select('id, nome, numero_patrimonio').eq('ativo', true).order('nome')
      ])

      const data = manRes.data || []
      setManutencoes(data)
      setEquipamentos(eqRes.data || [])

      setStats({
        agendadas: data.filter(m => m.status === 'agendada').length,
        em_andamento: data.filter(m => m.status === 'em_andamento').length,
        vencidas: data.filter(m => m.status === 'vencida').length,
        custoMes: data.reduce((s, m) => s + (Number(m.custo) || 0), 0)
      })
    } catch { showToast('Erro ao carregar manutenções', 'error') }
    finally { setLoading(false) }
  }

  const agendarManutencao = async () => {
    if (!formData.equipamento_id || !formData.data_agendada) {
      showToast('Preencha os campos obrigatórios', 'warning'); return
    }
    try {
      const eq = equipamentos.find(e => e.id === parseInt(formData.equipamento_id))
      const { error } = await supabase.from('manutencoes').insert({
        equipamento_id: parseInt(formData.equipamento_id),
        equipamento_nome: eq?.nome || '',
        equipamento_codigo: eq?.numero_patrimonio || '',
        tipo: formData.tipo, status: 'agendada',
        data_agendada: formData.data_agendada, tecnico: formData.tecnico,
        custo: parseFloat(formData.custo) || 0, descricao: formData.descricao,
        observacoes: formData.observacoes,
        proxima_manutencao: formData.proxima_manutencao || null
      })
      if (error) throw error

      showToast('Manutenção agendada!', 'success')
      setShowForm(false)
      setFormData({ equipamento_id: '', tipo: 'preventiva', data_agendada: '', tecnico: '', custo: '', descricao: '', observacoes: '', proxima_manutencao: '' })
      carregarDados()
    } catch (error: any) { showToast('Erro: ' + error.message, 'error') }
  }

  const iniciarManutencao = async (m: any) => {
    try {
      await supabase.from('manutencoes').update({ status: 'em_andamento', updated_at: new Date().toISOString() }).eq('id', m.id)
      if (m.equipamento_id) {
        await supabase.from('equipamentos').update({ status: 'manutencao' }).eq('id', m.equipamento_id)
      }
      showToast('Manutenção iniciada!', 'success')
      carregarDados()
    } catch { showToast('Erro ao iniciar manutenção', 'error') }
  }

  const concluirManutencao = async (m: any) => {
    try {
      await supabase.from('manutencoes').update({
        status: 'concluida', data_realizada: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      }).eq('id', m.id)
      if (m.equipamento_id) {
        await supabase.from('equipamentos').update({ status: 'disponivel' }).eq('id', m.equipamento_id)
      }
      showToast('Manutenção concluída!', 'success')
      carregarDados()
    } catch { showToast('Erro ao concluir manutenção', 'error') }
  }

  const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const getStatusBadge = (status: string) => {
    const c: Record<string, { label: string; color: string }> = {
      agendada: { label: 'Agendada', color: 'bg-blue-100 text-blue-800' },
      em_andamento: { label: 'Em Andamento', color: 'bg-yellow-100 text-yellow-800' },
      concluida: { label: 'Concluída', color: 'bg-green-100 text-green-800' },
      vencida: { label: 'Vencida', color: 'bg-red-100 text-red-800' },
      cancelada: { label: 'Cancelada', color: 'bg-gray-100 text-gray-500' }
    }
    const cfg = c[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return <Badge className={cfg.color}>{cfg.label}</Badge>
  }

  const getTipoBadge = (tipo: string) => {
    return tipo === 'preventiva'
      ? <Badge className="bg-blue-50 text-blue-600">Preventiva</Badge>
      : <Badge className="bg-orange-50 text-orange-600">Corretiva</Badge>
  }

  const filtradas = manutencoes.filter(m => {
    const matchSearch = !searchTerm ||
      (m.equipamento_nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.equipamento_codigo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.tecnico || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchTipo = filtroTipo === 'todos' || m.tipo === filtroTipo
    const matchStatus = filtroStatus === 'todos' || m.status === filtroStatus
    return matchSearch && matchTipo && matchStatus
  })

  const vencidas = manutencoes.filter(m => m.status === 'vencida')
  const emAndamento = manutencoes.filter(m => m.status === 'em_andamento')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando manutenções...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manutenção</h1>
          <p className="text-gray-600">Controle preventivo e corretivo</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>+ Agendar Manutenção</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Agendadas</div><div className="text-2xl font-bold text-blue-600">{stats.agendadas}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Em Andamento</div><div className="text-2xl font-bold text-yellow-600">{stats.em_andamento}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Vencidas</div><div className="text-2xl font-bold text-red-600">{stats.vencidas}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Custo Total</div><div className="text-2xl font-bold text-green-600">{formatarMoeda(stats.custoMes)}</div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Programação</CardTitle>
              <div className="flex space-x-2">
                <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="todos">Todos Tipos</option>
                  <option value="preventiva">Preventiva</option>
                  <option value="corretiva">Corretiva</option>
                </select>
                <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="todos">Todos Status</option>
                  <option value="agendada">Agendadas</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluídas</option>
                  <option value="vencida">Vencidas</option>
                </select>
              </div>
            </div>
            <Input placeholder="Buscar por equipamento, código ou técnico..." value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md mt-2" />
          </CardHeader>
          <CardContent>
            {filtradas.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Nenhuma manutenção encontrada</div>
            ) : (
              <div className="space-y-4">
                {filtradas.map(m => (
                  <div key={m.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">{m.equipamento_nome}</h3>
                          {getStatusBadge(m.status)}
                          {getTipoBadge(m.tipo)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {m.equipamento_codigo && <><span className="font-medium">Código:</span> {m.equipamento_codigo} - </>}
                          <span className="font-medium">Técnico:</span> {m.tecnico || 'Não definido'}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                      <div><span className="font-medium">Agendada:</span><div>{m.data_agendada ? new Date(m.data_agendada).toLocaleDateString('pt-BR') : '-'}</div></div>
                      <div><span className="font-medium">Custo:</span><div className="text-green-600 font-medium">{formatarMoeda(Number(m.custo) || 0)}</div></div>
                      {m.proxima_manutencao && <div><span className="font-medium">Próxima:</span><div>{new Date(m.proxima_manutencao).toLocaleDateString('pt-BR')}</div></div>}
                      {m.descricao && <div><span className="font-medium">Descrição:</span><div className="text-xs">{m.descricao}</div></div>}
                    </div>

                    {m.observacoes && (
                      <div className="mb-4 p-2 bg-yellow-50 rounded text-sm">
                        <span className="font-medium text-yellow-800">Obs:</span> {m.observacoes}
                      </div>
                    )}

                    <div className="flex space-x-2">
                      {m.status === 'agendada' && (
                        <Button variant="outline" size="sm" onClick={() => iniciarManutencao(m)} className="text-yellow-600 border-yellow-300">Iniciar</Button>
                      )}
                      {m.status === 'em_andamento' && (
                        <Button variant="outline" size="sm" onClick={() => concluirManutencao(m)} className="text-green-600 border-green-300">Concluir</Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-orange-600">Alertas</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {vencidas.length > 0 && (
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-800">Vencidas</h4>
                  <p className="text-sm text-red-600">{vencidas.length} manutenção(ões) vencida(s)</p>
                  {vencidas.slice(0, 3).map(v => (
                    <p key={v.id} className="text-xs text-red-500">{v.equipamento_nome} - {v.equipamento_codigo}</p>
                  ))}
                </div>
              )}
              {emAndamento.length > 0 && (
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800">Em Andamento</h4>
                  <p className="text-sm text-blue-600">{emAndamento.length} em execução</p>
                  {emAndamento.slice(0, 3).map(v => (
                    <p key={v.id} className="text-xs text-blue-500">{v.equipamento_nome} - {v.tecnico || 'Sem técnico'}</p>
                  ))}
                </div>
              )}
              {vencidas.length === 0 && emAndamento.length === 0 && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800">Tudo em dia!</h4>
                  <p className="text-sm text-green-600">Nenhum alerta de manutenção</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Agendar Nova Manutenção</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select value={formData.equipamento_id} onChange={(e) => setFormData({ ...formData, equipamento_id: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Selecionar Equipamento</option>
                {equipamentos.map(e => <option key={e.id} value={e.id}>{e.nome} {e.numero_patrimonio ? `(${e.numero_patrimonio})` : ''}</option>)}
              </select>
              <select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
              </select>
              <Input placeholder="Data Agendada" type="date" value={formData.data_agendada} onChange={(e) => setFormData({ ...formData, data_agendada: e.target.value })} />
              <Input placeholder="Técnico Responsável" value={formData.tecnico} onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })} />
              <Input placeholder="Custo Estimado (R$)" type="number" value={formData.custo} onChange={(e) => setFormData({ ...formData, custo: e.target.value })} />
              <Input placeholder="Próxima Manutenção" type="date" value={formData.proxima_manutencao} onChange={(e) => setFormData({ ...formData, proxima_manutencao: e.target.value })} />
            </div>
            <div className="mt-4 space-y-3">
              <Input placeholder="Descrição dos serviços..." value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} />
              <Input placeholder="Observações especiais..." value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
            </div>
            <div className="mt-6 flex space-x-3">
              <Button onClick={agendarManutencao}>Agendar Manutenção</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
