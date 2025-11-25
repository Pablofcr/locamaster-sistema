'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

const clientesMock = [
  {
    id: 1,
    nome: 'Construtora Alpha Ltda',
    contato: 'João Silva',
    telefone: '(85) 99999-1111',
    email: 'joao@alpha.com.br',
    cidade: 'Fortaleza',
    status: 'ativo',
    locacoes: 3,
    totalGasto: 15420.00
  },
  {
    id: 2,
    nome: 'Beta Engenharia',
    contato: 'Maria Santos',
    telefone: '(85) 99999-2222',
    email: 'maria@beta.com.br',
    cidade: 'Caucaia',
    status: 'ativo',
    locacoes: 1,
    totalGasto: 8500.00
  },
  {
    id: 3,
    nome: 'Construtora Gama',
    contato: 'Pedro Costa',
    telefone: '(85) 99999-3333',
    email: 'pedro@gama.com.br',
    cidade: 'Maracanaú',
    status: 'inativo',
    locacoes: 0,
    totalGasto: 5200.00
  }
]

export default function ClientesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('todos')

  const clientesFiltrados = clientesMock.filter(cliente => {
    const matchSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cliente.contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cliente.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchStatus = filtroStatus === 'todos' || cliente.status === filtroStatus
    
    return matchSearch && matchStatus
  })

  const stats = [
    { name: 'Total Clientes', value: clientesMock.length, icon: '👥', color: 'text-blue-600' },
    { name: 'Clientes Ativos', value: clientesMock.filter(c => c.status === 'ativo').length, icon: '✅', color: 'text-green-600' },
    { name: 'Locações Ativas', value: clientesMock.reduce((sum, c) => sum + c.locacoes, 0), icon: '📄', color: 'text-yellow-600' },
    { name: 'Receita Total', value: `R$ ${clientesMock.reduce((sum, c) => sum + c.totalGasto, 0).toLocaleString()}`, icon: '💰', color: 'text-emerald-600' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 Clientes</h1>
          <p className="text-gray-600">Gerencie clientes e relacionamentos</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          ➕ Novo Cliente
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
            <CardTitle>Lista de Clientes</CardTitle>
            <div className="flex space-x-2">
              <select 
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="todos">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="🔍 Buscar por nome, contato ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientesFiltrados.map((cliente) => (
              <div key={cliente.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg text-gray-900">{cliente.nome}</h3>
                      <Badge variant={cliente.status === 'ativo' ? 'primary' : 'secondary'}>
                        {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Contato:</span>
                        <div>{cliente.contato}</div>
                      </div>
                      <div>
                        <span className="font-medium">Telefone:</span>
                        <div>{cliente.telefone}</div>
                      </div>
                      <div>
                        <span className="font-medium">Email:</span>
                        <div>{cliente.email}</div>
                      </div>
                      <div>
                        <span className="font-medium">Cidade:</span>
                        <div>{cliente.cidade}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-6 text-sm">
                      <span className="text-blue-600">📄 {cliente.locacoes} locações ativas</span>
                      <span className="text-green-600">💰 R$ {cliente.totalGasto.toLocaleString()} total</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">✏️ Editar</Button>
                    <Button variant="outline" size="sm">📋 Orçamento</Button>
                    <Button variant="outline" size="sm">📞 WhatsApp</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {clientesFiltrados.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <p>Nenhum cliente encontrado com os filtros aplicados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>➕ Novo Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Nome da Empresa" />
              <Input placeholder="Nome do Contato" />
              <Input placeholder="Telefone" />
              <Input placeholder="Email" />
              <Input placeholder="CNPJ" />
              <Input placeholder="Cidade" />
            </div>
            <div className="mt-6 flex space-x-3">
              <Button className="bg-blue-600 hover:bg-blue-700">💾 Salvar Cliente</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>❌ Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}