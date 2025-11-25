'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

const locacoesMock = [
  {
    id: 1,
    numero: 'LOC-2024-001',
    cliente: 'Construtora Alpha Ltda',
    equipamento: 'Escavadeira Caterpillar 320D',
    dataInicio: '2024-11-01',
    dataFim: '2024-12-15',
    diasTotal: 44,
    valorDia: 850.00,
    valorTotal: 37400.00,
    status: 'ativo',
    localEntrega: 'Obra Centro - Fortaleza',
    observacoes: 'Obra de fundação, uso intensivo'
  },
  {
    id: 2,
    numero: 'LOC-2024-002',
    cliente: 'Beta Engenharia',
    equipamento: 'Betoneira B350',
    dataInicio: '2024-11-10',
    dataFim: '2024-11-25',
    diasTotal: 15,
    valorDia: 45.00,
    valorTotal: 675.00,
    status: 'finalizado',
    localEntrega: 'Residencial Caucaia',
    observacoes: 'Concretagem lajes'
  },
  {
    id: 3,
    numero: 'LOC-2024-003',
    cliente: 'Construtora Gama',
    equipamento: 'Gerador Diesel 50KVA',
    dataInicio: '2024-11-20',
    dataFim: '2024-12-05',
    diasTotal: 15,
    valorDia: 120.00,
    valorTotal: 1800.00,
    status: 'pendente',
    localEntrega: 'Obra Maracanaú',
    observacoes: 'Aguardando liberação da obra'
  },
  {
    id: 4,
    numero: 'LOC-2024-004',
    cliente: 'Alpha Construções',
    equipamento: 'Vibrador de Concreto CV-2200',
    dataInicio: '2024-11-18',
    dataFim: '2024-11-24',
    diasTotal: 6,
    valorDia: 25.00,
    valorTotal: 150.00,
    status: 'vencido',
    localEntrega: 'Residencial Messejana',
    observacoes: 'Contrato vencido - aguardando devolução'
  }
]

export default function LocacoesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const locacoesFiltradas = locacoesMock.filter(locacao => {
    const matchSearch = locacao.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       locacao.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       locacao.equipamento.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchStatus = filtroStatus === 'todos' || locacao.status === filtroStatus
    
    return matchSearch && matchStatus
  })

  const stats = [
    { 
      name: 'Total Contratos', 
      value: locacoesMock.length, 
      icon: '📄', 
      color: 'text-blue-600' 
    },
    { 
      name: 'Ativos', 
      value: locacoesMock.filter(l => l.status === 'ativo').length, 
      icon: '✅', 
      color: 'text-green-600' 
    },
    { 
      name: 'Pendentes', 
      value: locacoesMock.filter(l => l.status === 'pendente').length, 
      icon: '⏳', 
      color: 'text-yellow-600' 
    },
    { 
      name: 'Valor Total', 
      value: `R$ ${locacoesMock.reduce((sum, l) => sum + l.valorTotal, 0).toLocaleString()}`, 
      icon: '💰', 
      color: 'text-emerald-600' 
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ativo':
        return <Badge className="bg-green-100 text-green-800">✅ Ativo</Badge>
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pendente</Badge>
      case 'finalizado':
        return <Badge className="bg-blue-100 text-blue-800">✔️ Finalizado</Badge>
      case 'vencido':
        return <Badge className="bg-red-100 text-red-800">⚠️ Vencido</Badge>
      default:
        return <Badge variant="secondary">❓ Indefinido</Badge>
    }
  }

  const calcularDiasRestantes = (dataFim: string) => {
    const hoje = new Date()
    const fim = new Date(dataFim)
    const diffTime = fim.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📄 Locações</h1>
          <p className="text-gray-600">Contratos e acompanhamento de locações</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          ➕ Nova Locação
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

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Contratos de Locação</CardTitle>
            <div className="flex space-x-2">
              <select 
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="todos">Todos Status</option>
                <option value="ativo">Ativos</option>
                <option value="pendente">Pendentes</option>
                <option value="finalizado">Finalizados</option>
                <option value="vencido">Vencidos</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="🔍 Buscar por contrato, cliente ou equipamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {locacoesFiltradas.map((locacao) => (
              <div key={locacao.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{locacao.numero}</h3>
                      {getStatusBadge(locacao.status)}
                      {locacao.status === 'ativo' && (
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                          {calcularDiasRestantes(locacao.dataFim)} dias restantes
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Cliente:</span> {locacao.cliente} • 
                      <span className="font-medium"> Equipamento:</span> {locacao.equipamento}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">📅 Período:</span>
                    <div>{new Date(locacao.dataInicio).toLocaleDateString()} - {new Date(locacao.dataFim).toLocaleDateString()}</div>
                    <div className="text-xs text-gray-500">{locacao.diasTotal} dias</div>
                  </div>
                  <div>
                    <span className="font-medium">💰 Valor:</span>
                    <div>R$ {locacao.valorDia.toFixed(2)}/dia</div>
                    <div className="text-lg font-bold text-green-600">R$ {locacao.valorTotal.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="font-medium">📍 Local:</span>
                    <div>{locacao.localEntrega}</div>
                  </div>
                  <div>
                    <span className="font-medium">📝 Observações:</span>
                    <div className="text-xs">{locacao.observacoes}</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">📄 Contrato</Button>
                  <Button variant="outline" size="sm">✏️ Editar</Button>
                  {locacao.status === 'ativo' && (
                    <>
                      <Button variant="outline" size="sm">🔄 Renovar</Button>
                      <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">✔️ Finalizar</Button>
                    </>
                  )}
                  {locacao.status === 'vencido' && (
                    <Button variant="outline" size="sm" className="text-red-600 border-red-300">⚠️ Cobrar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {locacoesFiltradas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <p>Nenhuma locação encontrada com os filtros aplicados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>➕ Nova Locação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Selecionar Cliente</option>
                <option value="alpha">Construtora Alpha Ltda</option>
                <option value="beta">Beta Engenharia</option>
                <option value="gama">Construtora Gama</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Selecionar Equipamento</option>
                <option value="esc">Escavadeira Cat 320D (R$ 850/dia)</option>
                <option value="bet">Betoneira B350 (R$ 45/dia)</option>
                <option value="ger">Gerador 50KVA (R$ 120/dia)</option>
              </select>
              <Input placeholder="Data Início" type="date" />
              <Input placeholder="Data Fim" type="date" />
              <Input placeholder="Local de Entrega" />
              <Input placeholder="Valor por Dia (R$)" type="number" />
            </div>
            <div className="mt-4">
              <Input placeholder="Observações do contrato..." />
            </div>
            <div className="mt-6 flex space-x-3">
              <Button className="bg-blue-600 hover:bg-blue-700">💾 Criar Contrato</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>❌ Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}