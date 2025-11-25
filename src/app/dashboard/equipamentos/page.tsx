'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

const equipamentosMock = [
  {
    id: 1,
    nome: 'Escavadeira Caterpillar 320D',
    codigo: 'ESC-001',
    categoria: 'Escavação',
    precoDia: 850.00,
    status: 'disponivel',
    localizacao: 'Pátio A',
    ultimaManutencao: '2024-10-15',
    proximaManutencao: '2024-12-15',
    horasUso: 1250
  },
  {
    id: 2,
    nome: 'Betoneira B350',
    codigo: 'BET-001',
    categoria: 'Concreto',
    precoDia: 45.00,
    status: 'locado',
    localizacao: 'Obra Centro',
    ultimaManutencao: '2024-11-01',
    proximaManutencao: '2025-01-01',
    horasUso: 890
  },
  {
    id: 3,
    nome: 'Gerador Diesel 50KVA',
    codigo: 'GER-001',
    categoria: 'Energia',
    precoDia: 120.00,
    status: 'manutencao',
    localizacao: 'Oficina',
    ultimaManutencao: '2024-11-20',
    proximaManutencao: '2024-12-20',
    horasUso: 2100
  },
  {
    id: 4,
    nome: 'Vibrador de Concreto CV-2200',
    codigo: 'VIB-001',
    categoria: 'Concreto',
    precoDia: 25.00,
    status: 'disponivel',
    localizacao: 'Pátio B',
    ultimaManutencao: '2024-09-10',
    proximaManutencao: '2024-11-10',
    horasUso: 560
  },
  {
    id: 5,
    nome: 'Compressor de Ar 60 PCM',
    codigo: 'COM-001',
    categoria: 'Pneumática',
    precoDia: 80.00,
    status: 'disponivel',
    localizacao: 'Pátio A',
    ultimaManutencao: '2024-10-20',
    proximaManutencao: '2024-12-20',
    horasUso: 780
  }
]

export default function EquipamentosPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')

  const categorias = [...new Set(equipamentosMock.map(eq => eq.categoria))]

  const equipamentosFiltrados = equipamentosMock.filter(equipamento => {
    const matchSearch = equipamento.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       equipamento.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       equipamento.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchStatus = filtroStatus === 'todos' || equipamento.status === filtroStatus
    const matchCategoria = filtroCategoria === 'todas' || equipamento.categoria === filtroCategoria
    
    return matchSearch && matchStatus && matchCategoria
  })

  const stats = [
    { 
      name: 'Total Equipamentos', 
      value: equipamentosMock.length, 
      icon: '📦', 
      color: 'text-blue-600' 
    },
    { 
      name: 'Disponíveis', 
      value: equipamentosMock.filter(e => e.status === 'disponivel').length, 
      icon: '✅', 
      color: 'text-green-600' 
    },
    { 
      name: 'Locados', 
      value: equipamentosMock.filter(e => e.status === 'locado').length, 
      icon: '🚚', 
      color: 'text-yellow-600' 
    },
    { 
      name: 'Manutenção', 
      value: equipamentosMock.filter(e => e.status === 'manutencao').length, 
      icon: '🔧', 
      color: 'text-red-600' 
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'disponivel':
        return <Badge className="bg-green-100 text-green-800">✅ Disponível</Badge>
      case 'locado':
        return <Badge className="bg-yellow-100 text-yellow-800">🚚 Locado</Badge>
      case 'manutencao':
        return <Badge className="bg-red-100 text-red-800">🔧 Manutenção</Badge>
      default:
        return <Badge variant="secondary">❓ Indefinido</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📦 Equipamentos</h1>
          <p className="text-gray-600">Controle de estoque e disponibilidade</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          ➕ Novo Equipamento
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
            <CardTitle>Controle de Equipamentos</CardTitle>
            <div className="flex space-x-2">
              <select 
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="todos">Todos Status</option>
                <option value="disponivel">Disponíveis</option>
                <option value="locado">Locados</option>
                <option value="manutencao">Manutenção</option>
              </select>
              <select 
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="todas">Todas Categorias</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="🔍 Buscar por nome, código ou categoria..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {equipamentosFiltrados.map((equipamento) => (
              <div key={equipamento.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{equipamento.nome}</h3>
                      {getStatusBadge(equipamento.status)}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Código:</span> {equipamento.codigo} • 
                      <span className="font-medium"> Categoria:</span> {equipamento.categoria}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">💰 Preço/dia:</span>
                    <div className="text-lg font-bold text-green-600">R$ {equipamento.precoDia.toFixed(2)}</div>
                  </div>
                  <div>
                    <span className="font-medium">📍 Localização:</span>
                    <div>{equipamento.localizacao}</div>
                  </div>
                  <div>
                    <span className="font-medium">🕒 Horas de uso:</span>
                    <div>{equipamento.horasUso}h</div>
                  </div>
                  <div>
                    <span className="font-medium">🔧 Próxima manutenção:</span>
                    <div>{new Date(equipamento.proximaManutencao).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">✏️ Editar</Button>
                  <Button variant="outline" size="sm">📋 Orçamento</Button>
                  <Button variant="outline" size="sm">🔧 Manutenção</Button>
                  {equipamento.status === 'disponivel' && (
                    <Button variant="outline" size="sm" className="text-green-600 border-green-300">🚚 Locar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {equipamentosFiltrados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <p>Nenhum equipamento encontrado com os filtros aplicados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>➕ Novo Equipamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Nome do Equipamento" />
              <Input placeholder="Código (ex: ESC-002)" />
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Selecionar Categoria</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Input placeholder="Preço por dia (R$)" type="number" />
              <Input placeholder="Localização" />
              <Input placeholder="Marca/Modelo" />
            </div>
            <div className="mt-6 flex space-x-3">
              <Button className="bg-blue-600 hover:bg-blue-700">💾 Salvar Equipamento</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>❌ Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}