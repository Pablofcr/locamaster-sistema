'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

const faturasMock = [
  {
    id: 1,
    numero: 'FAT-2024-001',
    cliente: 'Construtora Alpha Ltda',
    dataVencimento: '2024-11-30',
    dataEmissao: '2024-11-01',
    valor: 37400.00,
    status: 'pago',
    formaPagamento: 'PIX',
    dataPagamento: '2024-11-28',
    locacao: 'LOC-2024-001',
    observacoes: 'Pagamento antecipado'
  },
  {
    id: 2,
    numero: 'FAT-2024-002',
    cliente: 'Beta Engenharia',
    dataVencimento: '2024-12-05',
    dataEmissao: '2024-11-10',
    valor: 675.00,
    status: 'pendente',
    formaPagamento: '',
    dataPagamento: '',
    locacao: 'LOC-2024-002',
    observacoes: 'Aguardando pagamento'
  },
  {
    id: 3,
    numero: 'FAT-2024-003',
    cliente: 'Construtora Gama',
    dataVencimento: '2024-11-25',
    dataEmissao: '2024-11-15',
    valor: 1800.00,
    status: 'vencido',
    formaPagamento: '',
    dataPagamento: '',
    locacao: 'LOC-2024-003',
    observacoes: 'Fatura vencida - contatar cliente'
  },
  {
    id: 4,
    numero: 'FAT-2024-004',
    cliente: 'Alpha Construções',
    dataVencimento: '2024-12-10',
    dataEmissao: '2024-11-20',
    valor: 150.00,
    status: 'emitido',
    formaPagamento: '',
    dataPagamento: '',
    locacao: 'LOC-2024-004',
    observacoes: 'Fatura recém emitida'
  }
]

const mesesReceita = [
  { mes: 'Janeiro', receita: 45200, faturas: 12, taxa: 95 },
  { mes: 'Fevereiro', receita: 52800, faturas: 15, taxa: 87 },
  { mes: 'Março', receita: 38900, faturas: 11, taxa: 91 },
  { mes: 'Abril', receita: 61500, faturas: 18, taxa: 83 },
  { mes: 'Maio', receita: 47300, faturas: 14, taxa: 92 },
  { mes: 'Junho', receita: 55600, faturas: 16, taxa: 89 }
]

export default function FaturamentoPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroMes, setFiltroMes] = useState('todos')

  const faturasFiltradas = faturasMock.filter(fatura => {
    const matchSearch = fatura.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       fatura.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       fatura.locacao.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchStatus = filtroStatus === 'todos' || fatura.status === filtroStatus
    
    const matchMes = filtroMes === 'todos' || 
                    new Date(fatura.dataEmissao).getMonth() === parseInt(filtroMes)
    
    return matchSearch && matchStatus && matchMes
  })

  const totalReceita = faturasMock.filter(f => f.status === 'pago').reduce((sum, f) => sum + f.valor, 0)
  const totalPendente = faturasMock.filter(f => f.status === 'pendente').reduce((sum, f) => sum + f.valor, 0)
  const totalVencido = faturasMock.filter(f => f.status === 'vencido').reduce((sum, f) => sum + f.valor, 0)

  const stats = [
    { 
      name: 'Receita Confirmada', 
      value: `R$ ${totalReceita.toLocaleString()}`, 
      icon: '💰', 
      color: 'text-green-600' 
    },
    { 
      name: 'A Receber', 
      value: `R$ ${totalPendente.toLocaleString()}`, 
      icon: '⏳', 
      color: 'text-yellow-600' 
    },
    { 
      name: 'Vencidas', 
      value: `R$ ${totalVencido.toLocaleString()}`, 
      icon: '⚠️', 
      color: 'text-red-600' 
    },
    { 
      name: 'Total Faturas', 
      value: faturasMock.length, 
      icon: '📄', 
      color: 'text-blue-600' 
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-100 text-green-800">✅ Pago</Badge>
      case 'pendente':
        return <Badge className="bg-yellow-100 text-yellow-800">⏳ Pendente</Badge>
      case 'vencido':
        return <Badge className="bg-red-100 text-red-800">⚠️ Vencido</Badge>
      case 'emitido':
        return <Badge className="bg-blue-100 text-blue-800">📄 Emitido</Badge>
      default:
        return <Badge variant="secondary">❓ Indefinido</Badge>
    }
  }

  const calcularDiasVencimento = (dataVencimento: string) => {
    const hoje = new Date()
    const venc = new Date(dataVencimento)
    const diffTime = venc.getTime() - hoje.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💰 Faturamento</h1>
          <p className="text-gray-600">Controle financeiro e relatórios</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          ➕ Nova Fatura
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">📊 Receita por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mesesReceita.map((mes, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{mes.mes}</div>
                    <div className="text-sm text-gray-600">{mes.faturas} faturas • {mes.taxa}% pago</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      R$ {mes.receita.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">🎯 Metas e Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Meta Mensal:</span>
                <span className="font-bold">R$ 50.000</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Atual (Novembro):</span>
                <span className="font-bold text-green-600">R$ 40.025</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-500 h-3 rounded-full" style={{width: '80%'}}></div>
              </div>
              <div className="text-center text-sm text-gray-600">80% da meta atingida</div>
              
              <div className="mt-6 pt-4 border-t">
                <h4 className="font-medium mb-3">Indicadores:</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Ticket Médio:</span>
                    <span className="font-medium">R$ 10.007</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa Conversão:</span>
                    <span className="font-medium text-green-600">89%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prazo Médio Pagto:</span>
                    <span className="font-medium">12 dias</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Controle de Faturas</CardTitle>
            <div className="flex space-x-2">
              <select 
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="todos">Todos Status</option>
                <option value="emitido">Emitidas</option>
                <option value="pendente">Pendentes</option>
                <option value="pago">Pagas</option>
                <option value="vencido">Vencidas</option>
              </select>
              <select 
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="todos">Todos os Meses</option>
                <option value="10">Novembro</option>
                <option value="9">Outubro</option>
                <option value="8">Setembro</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="🔍 Buscar por número, cliente ou locação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-md"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faturasFiltradas.map((fatura) => (
              <div key={fatura.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-lg text-gray-900">{fatura.numero}</h3>
                      {getStatusBadge(fatura.status)}
                      {fatura.status === 'pendente' && (
                        <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                          {calcularDiasVencimento(fatura.dataVencimento)} dias para vencer
                        </span>
                      )}
                      {fatura.status === 'vencido' && (
                        <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                          Vencida há {Math.abs(calcularDiasVencimento(fatura.dataVencimento))} dias
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Cliente:</span> {fatura.cliente} • 
                      <span className="font-medium"> Locação:</span> {fatura.locacao}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      R$ {fatura.valor.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">📅 Emissão:</span>
                    <div>{new Date(fatura.dataEmissao).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="font-medium">⏰ Vencimento:</span>
                    <div>{new Date(fatura.dataVencimento).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <span className="font-medium">💳 Pagamento:</span>
                    <div>{fatura.formaPagamento || 'Não informado'}</div>
                    {fatura.dataPagamento && (
                      <div className="text-xs text-green-600">{new Date(fatura.dataPagamento).toLocaleDateString()}</div>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">📝 Observações:</span>
                    <div className="text-xs">{fatura.observacoes}</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">📄 PDF</Button>
                  <Button variant="outline" size="sm">✏️ Editar</Button>
                  <Button variant="outline" size="sm">📧 Enviar</Button>
                  {fatura.status === 'pendente' && (
                    <Button variant="outline" size="sm" className="text-green-600 border-green-300">✅ Marcar Pago</Button>
                  )}
                  {fatura.status === 'vencido' && (
                    <Button variant="outline" size="sm" className="text-red-600 border-red-300">📞 Cobrar</Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {faturasFiltradas.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">🔍</div>
              <p>Nenhuma fatura encontrada com os filtros aplicados</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>➕ Nova Fatura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Selecionar Locação</option>
                <option value="loc1">LOC-2024-005 - Construtora Alpha</option>
                <option value="loc2">LOC-2024-006 - Beta Engenharia</option>
                <option value="loc3">LOC-2024-007 - Construtora Gama</option>
              </select>
              <Input placeholder="Valor Total (R$)" type="number" />
              <Input placeholder="Data Vencimento" type="date" />
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Forma de Pagamento</option>
                <option value="pix">PIX</option>
                <option value="boleto">Boleto</option>
                <option value="transferencia">Transferência</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>
            <div className="mt-4">
              <Input placeholder="Observações da fatura..." />
            </div>
            <div className="mt-6 flex space-x-3">
              <Button className="bg-blue-600 hover:bg-blue-700">💾 Gerar Fatura</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>❌ Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}