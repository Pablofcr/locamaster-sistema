'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

interface Cliente {
  id: number
  nome: string
  contato: string
  telefone: string
  email: string
  cnpj?: string
  cidade: string
  status: 'ativo' | 'inativo'
  locacoes: number
  totalGasto: number
}

const clientesIniciais: Cliente[] = [
  {
    id: 1,
    nome: 'Construtora Alpha Ltda',
    contato: 'João Silva',
    telefone: '(85) 99999-1111',
    email: 'joao@alpha.com.br',
    cnpj: '12.345.678/0001-90',
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
    cnpj: '98.765.432/0001-10',
    cidade: 'Caucaia',
    status: 'ativo',
    locacoes: 1,
    totalGasto: 8500.00
  }
]

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>(clientesIniciais)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null)

  // Formulário simplificado
  const [nome, setNome] = useState('')
  const [contato, setContato] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [cidade, setCidade] = useState('')

  console.log('🔍 Estado atual:', { clientes, showModal, modalMode })

  const clientesFiltrados = clientes.filter(cliente => {
    const matchSearch = cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cliente.contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       cliente.cidade.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchStatus = filtroStatus === 'todos' || cliente.status === filtroStatus
    
    return matchSearch && matchStatus
  })

  const stats = [
    { name: 'Total Clientes', value: clientes.length, icon: '👥', color: 'text-blue-600' },
    { name: 'Clientes Ativos', value: clientes.filter(c => c.status === 'ativo').length, icon: '✅', color: 'text-green-600' },
    { name: 'Locações Ativas', value: clientes.reduce((sum, c) => sum + c.locacoes, 0), icon: '📄', color: 'text-yellow-600' },
    { name: 'Receita Total', value: `R$ ${clientes.reduce((sum, c) => sum + c.totalGasto, 0).toLocaleString()}`, icon: '💰', color: 'text-emerald-600' }
  ]

  const abrirModalCriar = () => {
    console.log('📝 Abrindo modal para criar')
    setModalMode('create')
    setClienteEditando(null)
    setNome('')
    setContato('')
    setTelefone('')
    setEmail('')
    setCidade('')
    setShowModal(true)
  }

  const abrirModalEditar = (cliente: Cliente) => {
    console.log('✏️ Abrindo modal para editar:', cliente.nome)
    setModalMode('edit')
    setClienteEditando(cliente)
    setNome(cliente.nome)
    setContato(cliente.contato)
    setTelefone(cliente.telefone)
    setEmail(cliente.email)
    setCidade(cliente.cidade)
    setShowModal(true)
  }

  const fecharModal = () => {
    console.log('❌ Fechando modal')
    setShowModal(false)
    setClienteEditando(null)
    setNome('')
    setContato('')
    setTelefone('')
    setEmail('')
    setCidade('')
  }

  const salvarCliente = () => {
    console.log('💾 Tentando salvar cliente:', { nome, contato, telefone, email, cidade })

    // Validação simples
    if (!nome || !contato || !telefone || !email || !cidade) {
      alert('Preencha todos os campos!')
      return
    }

    if (modalMode === 'create') {
      const novoCliente: Cliente = {
        id: Math.max(...clientes.map(c => c.id)) + 1,
        nome,
        contato,
        telefone,
        email,
        cidade,
        status: 'ativo',
        locacoes: 0,
        totalGasto: 0
      }
      
      console.log('➕ Criando novo cliente:', novoCliente)
      setClientes([...clientes, novoCliente])
      alert('Cliente criado com sucesso!')
    } else if (clienteEditando) {
      const clienteAtualizado = {
        ...clienteEditando,
        nome,
        contato,
        telefone,
        email,
        cidade
      }
      
      console.log('✏️ Editando cliente:', clienteAtualizado)
      setClientes(clientes.map(c => 
        c.id === clienteEditando.id ? clienteAtualizado : c
      ))
      alert('Cliente atualizado com sucesso!')
    }

    fecharModal()
  }

  const testarBotao = (acao: string) => {
    console.log(`🔘 Botão ${acao} clicado!`)
    alert(`Botão ${acao} funcionou!`)
  }

  const abrirWhatsApp = (cliente: Cliente) => {
    console.log('📞 Abrindo WhatsApp para:', cliente.nome)
    const telefone = cliente.telefone.replace(/\D/g, '')
    const mensagem = `Olá ${cliente.contato}, tudo bem? Aqui é da LocaSys Pro!`
    window.open(`https://wa.me/55${telefone}?text=${encodeURIComponent(mensagem)}`, '_blank')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">👥 Clientes</h1>
          <p className="text-gray-600">Gerencie clientes e relacionamentos</p>
        </div>
        <button 
          onClick={abrirModalCriar}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          ➕ Novo Cliente
        </button>
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
            <CardTitle>Lista de Clientes ({clientes.length})</CardTitle>
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
          <Input
            placeholder="🔍 Buscar por nome, contato ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {clientesFiltrados.map((cliente) => (
              <div key={cliente.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-lg">{cliente.nome}</h3>
                      <Badge variant={cliente.status === 'ativo' ? 'primary' : 'secondary'}>
                        {cliente.status === 'ativo' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Contato:</span> {cliente.contato}
                      </div>
                      <div>
                        <span className="font-medium">Telefone:</span> {cliente.telefone}
                      </div>
                      <div>
                        <span className="font-medium">Email:</span> {cliente.email}
                      </div>
                      <div>
                        <span className="font-medium">Cidade:</span> {cliente.cidade}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center space-x-6 text-sm">
                      <span className="text-blue-600">📄 {cliente.locacoes} locações</span>
                      <span className="text-green-600">💰 R$ {cliente.totalGasto.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => abrirModalEditar(cliente)}
                      className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      onClick={() => testarBotao('Orçamento')}
                      className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
                    >
                      📋 Orçamento
                    </button>
                    <button 
                      onClick={() => abrirWhatsApp(cliente)}
                      className="bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-sm"
                    >
                      📞 WhatsApp
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Simplificado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {modalMode === 'create' ? '➕ Novo Cliente' : '✏️ Editar Cliente'}
                </h2>
                <button 
                  onClick={fecharModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ❌
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nome da Empresa *"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Nome do Contato *"
                  value={contato}
                  onChange={(e) => setContato(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Telefone *"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="email"
                  placeholder="Email *"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                <input
                  type="text"
                  placeholder="Cidade *"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              <div className="mt-6 flex space-x-3">
                <button 
                  onClick={salvarCliente}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                >
                  💾 {modalMode === 'create' ? 'Criar' : 'Salvar'}
                </button>
                <button 
                  onClick={fecharModal}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                >
                  ❌ Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}