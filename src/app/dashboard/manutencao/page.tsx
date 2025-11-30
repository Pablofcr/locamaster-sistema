'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

const manutencoesMock = [
  {
    id: 1,
    equipamento: 'Escavadeira Caterpillar 320D',
    codigo: 'ESC-001',
    tipo: 'preventiva',
    status: 'agendada',
    dataAgendada: '2024-12-15',
    dataRealizada: '',
    tecnico: 'João Silva',
    descricao: 'Troca de óleo e filtros',
    custo: 850.00,
    proximaManutencao: '2025-03-15',
    observacoes: 'Manutenção dos 1500h'
  },
  {
    id: 2,
    equipamento: 'Gerador Diesel 50KVA',
    codigo: 'GER-001',
    tipo: 'corretiva',
    status: 'em_andamento',
    dataAgendada: '2024-11-20',
    dataRealizada: '',
    tecnico: 'Pedro Costa',
    descricao: 'Reparo no sistema de ignição',
    custo: 1200.00,
    proximaManutencao: '2024-12-20',
    observacoes: 'Falha no sistema elétrico'
  },
  {
    id: 3,
    equipamento: 'Betoneira B350',
    codigo: 'BET-001',
    tipo: 'preventiva',
    status: 'concluida',
    dataAgendada: '2024-11-01',
    dataRealizada: '2024-11-01',
    tecnico: 'Maria Santos',
    descricao: 'Limpeza geral e lubrificação',
    custo: 150.00,
    proximaManutencao: '2025-02-01',
    observacoes: 'Manutenção realizada conforme planejado'
  },
  {
    id: 4,
    equipamento: 'Compressor de Ar 60 PCM',
    codigo: 'COM-001',
    tipo: 'preventiva',
    status: 'vencida',
    dataAgendada: '2024-11-10',
    dataRealizada: '',
    tecnico: '',
    descricao: 'Revisão geral do sistema',
    custo: 400.00,
    proximaManutencao: '2024-11-10',
    observacoes: 'URGENTE - Manutenção vencida'
  }
]

const tecnicosDisponiveis = [
  'João Silva - Mecânico',
  'Pedro Costa - Eletricista', 
  'Maria Santos - Técnica Geral',
  'Carlos Lima - Especialista Hidráulica'
]

export default function ManutencaoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const manutencoesFiltradas = manutencoesMock.filter(manutencao => {
    const matchSearch = manutencao.equipamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       manutencao.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       manutencao.tecnico.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchTipo = filtroTipo === 'todos' || manutencao.tipo === filtroTipo
    const matchStatus = filtroStatus === 'todos' || manutencao.status === filtroStatus
    
    return matchSearch && matchTipo && matchStatus
  })

  const stats = [
    { 
      name: 'Agendadas', 
      value: manutencoesMock.filter(m => m.status === 'agendada').length, 
      icon: '📅', 
      color: 'text-blue-600' 
    },
    { 
      name: 'Em Andamento', 
      value: manutencoesMock.filter(m => m.status === 'em_andamento').length, 
      icon: '🔧', 
      color: 'text-yellow-600' 
    },
    { 
      name: 'Vencidas', 
      value: manutencoesMock.filter(m => m.status === 'vencida').length, 
      icon: '⚠️', 
      color: 'text-red-600' 
    },
    { 
      name: 'Custo Mês', 
      value: `R$ ${manutencoesMock.reduce((sum, m) => sum + m.custo, 0).toLocaleString()}`, 
      icon: '💰', 
      color: 'text-green-600' 
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'agendada':
        return <Badge className="bg-blue-100 text-blue-800">📅 Agendada</Badge>
      case 'em_andamento':
        return <Badge className="bg-yellow-100 text-yellow-800">🔧 Em Andamento</Badge>
      case 'concluida':
        return <Badge className="bg-green-100 text-green-800">✅ Concluída</Badge>
      case 'vencida':
        return <Badge className="bg-red-100 text-red-800">⚠️ Vencida</Badge>
      default:
        return <Badge variant="secondary">❓ Indefinido</Badge>
    }
  }

  const getTipoBadge = (tipo: string) => {
    switch (tipo) {
      case 'preventiva':
        return <Badge variant="secondary" className="border-blue-300 text-blue-600">🛡️ Preventiva</Badge>
      case 'corretiva':
        return <Badge variant="secondary" className="border-orange-300 text-orange-600">🔨 Corretiva</Badge>
      default:
        return <Badge variant="secondary">❓ Indefinido</Badge>
    }
  }

  const calcularDiasRestantes = (dataAgendada: string) => {
    const hoje = new Date()
    const agendada = new Date(dataAgendada)
    const diffTime = agendada.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🔧 Manutenção</h1>
          <p className="text-gray-600">Controle preventivo e corretivo de equipamentos</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          ➕ Agendar Manutenção
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-l-4 border-blue-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className="text-2xl">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Programação de Manutenções</CardTitle>
              <div className="flex space-x-2">
                <select 
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="todos">Todos os Tipos</option>
                  <option value="preventiva">Preventiva</option>
                  <option value="corretiva">Corretiva</option>
                </select>
                <select 
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="todos">Todos Status</option>
                  <option value="agendada">Agendadas</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluídas</option>
                  <option value="vencida">Vencidas</option>
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                placeholder="🔍 Buscar por equipamento, código ou técnico..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {manutencoesFiltradas.map((manutencao) => (
                <div key={manutencao.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{manutencao.equipamento}</h3>
                        {getStatusBadge(manutencao.status)}
                        {getTipoBadge(manutencao.tipo)}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Código:</span> {manutencao.codigo} • 
                        <span className="font-medium"> Técnico:</span> {manutencao.tecnico || 'Não definido'}
                      </div>
                    </div>
                    <div className="text-right">
                      {manutencao.status === 'agendada' && (
                        <div className="text-sm">
                          <span className="text-blue-600">
                            {calcularDiasRestantes(manutencao.dataAgendada) >= 0 
                              ? `${calcularDiasRestantes(manutencao.dataAgendada)} dias`
                              : `${Math.abs(calcularDiasRestantes(manutencao.dataAgendada))} dias atrasado`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">📅 Agendada:</span>
                      <div>{new Date(manutencao.dataAgendada).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="font-medium">💰 Custo:</span>
                      <div className="text-green-600 font-medium">R$ {manutencao.custo.toFixed(2)}</div>
                    </div>
                    <div>
                      <span className="font-medium">🔄 Próxima:</span>
                      <div>{new Date(manutencao.proximaManutencao).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="font-medium">📝 Descrição:</span>
                      <div className="text-xs">{manutencao.descricao}</div>
                    </div>
                  </div>

                  {manutencao.observacoes && (
                    <div className="mb-4 p-2 bg-yellow-50 rounded text-sm">
                      <span className="font-medium text-yellow-800">⚠️ Observações:</span> {manutencao.observacoes}
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">✏️ Editar</Button>
                    {manutencao.status === 'agendada' && (
                      <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-300">🔧 Iniciar</Button>
                    )}
                    {manutencao.status === 'em_andamento' && (
                      <Button variant="outline" size="sm" className="text-green-600 border-green-300">✅ Concluir</Button>
                    )}
                    {manutencao.status === 'concluida' && (
                      <Button variant="outline" size="sm">📄 Relatório</Button>
                    )}
                    <Button variant="outline" size="sm">📞 Contato</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">⚠️ Alertas de Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <h4 className="font-medium text-red-800">🚨 Vencidas</h4>
                <p className="text-sm text-red-600">1 equipamento com manutenção vencida</p>
                <p className="text-xs text-red-500">Compressor COM-001 - 14 dias</p>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium text-yellow-800">⏰ Próximas (7 dias)</h4>
                <p className="text-sm text-yellow-600">1 manutenção agendada</p>
                <p className="text-xs text-yellow-500">Escavadeira ESC-001 - 5 dias</p>
              </div>

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-800">🔧 Em Andamento</h4>
                <p className="text-sm text-blue-600">1 manutenção em execução</p>
                <p className="text-xs text-blue-500">Gerador GER-001 - Pedro Costa</p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <h4 className="font-medium mb-3">📊 Estatísticas do Mês</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Concluídas:</span>
                  <span className="font-medium text-green-600">8</span>
                </div>
                <div className="flex justify-between">
                  <span>Preventivas:</span>
                  <span className="font-medium">75%</span>
                </div>
                <div className="flex justify-between">
                  <span>Tempo Médio:</span>
                  <span className="font-medium">2.5 dias</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo Total:</span>
                  <span className="font-medium text-green-600">R$ 2.600</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>🔧 Agendar Nova Manutenção</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Selecionar Equipamento</option>
                <option value="esc001">Escavadeira Cat 320D (ESC-001)</option>
                <option value="bet001">Betoneira B350 (BET-001)</option>
                <option value="ger001">Gerador 50KVA (GER-001)</option>
                <option value="com001">Compressor 60 PCM (COM-001)</option>
              </select>
              
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Tipo de Manutenção</option>
                <option value="preventiva">Preventiva</option>
                <option value="corretiva">Corretiva</option>
              </select>

              <Input placeholder="Data Agendada" type="date" />
              
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Técnico Responsável</option>
                {tecnicosDisponiveis.map((tecnico, index) => (
                  <option key={index} value={tecnico}>{tecnico}</option>
                ))}
              </select>

              <Input placeholder="Custo Estimado (R$)" type="number" />
              <Input placeholder="Data Próxima Manutenção" type="date" />
            </div>
            
            <div className="mt-4 space-y-3">
              <Input placeholder="Descrição dos serviços..." />
              <Input placeholder="Observações especiais..." />
            </div>

            <div className="mt-6 flex space-x-3">
              <Button className="bg-blue-600 hover:bg-blue-700">🔧 Agendar Manutenção</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>❌ Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}