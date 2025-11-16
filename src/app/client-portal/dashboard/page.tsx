"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Package,
  DollarSign,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Download,
  MessageSquare,
  Phone,
  Mail
} from "lucide-react"

export default function ClientDashboard() {
  // Mock data for the client
  const clientData = {
    name: "João Silva Santos",
    company: "Construtora Silva Ltda",
    document: "123.456.789-00",
    creditLimit: 50000,
    currentDebt: 12500,
    availableCredit: 37500,
    stats: {
      activeRentals: 3,
      completedRentals: 15,
      totalSpent: 89650,
      avgMonthlySpent: 7470
    }
  }

  const activeRentals = [
    {
      id: "1",
      contractNumber: "LM-2024-1234",
      equipment: "Betoneira 400L Industrial",
      startDate: "2024-11-01",
      endDate: "2024-11-15",
      dailyPrice: 120,
      status: "active",
      daysRemaining: 3
    },
    {
      id: "2", 
      contractNumber: "LM-2024-1235",
      equipment: "Gerador Diesel 50kVA",
      startDate: "2024-11-05",
      endDate: "2024-11-20",
      dailyPrice: 300,
      status: "active", 
      daysRemaining: 8
    },
    {
      id: "3",
      contractNumber: "LM-2024-1236", 
      equipment: "Empilhadeira Elétrica 2.5 Ton",
      startDate: "2024-11-10",
      endDate: "2024-11-25",
      dailyPrice: 400,
      status: "active",
      daysRemaining: 13
    }
  ]

  const recentInvoices = [
    {
      id: "1",
      number: "FAT-2024-1001",
      issueDate: "2024-11-01",
      dueDate: "2024-11-15",
      amount: 1680,
      status: "paid",
      paidDate: "2024-11-10"
    },
    {
      id: "2",
      number: "FAT-2024-1002", 
      issueDate: "2024-10-15",
      dueDate: "2024-10-30",
      amount: 2400,
      status: "overdue",
      daysPastDue: 13
    },
    {
      id: "3",
      number: "FAT-2024-1003",
      issueDate: "2024-11-05",
      dueDate: "2024-11-20", 
      amount: 8400,
      status: "pending",
      daysTodue: 8
    }
  ]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Ativo
          </span>
        )
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pago
          </span>
        )
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Em Atraso
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bem-vindo de volta, {clientData.name.split(' ')[0]}!</h1>
        <p className="text-gray-600 mt-1">Acompanhe suas locações e faturas em tempo real</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Locações Ativas</p>
                <p className="text-2xl font-bold text-gray-900">{clientData.stats.activeRentals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Crédito Disponível</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(clientData.availableCredit)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Gasto</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(clientData.stats.totalSpent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Locações Concluídas</p>
                <p className="text-2xl font-bold text-gray-900">{clientData.stats.completedRentals}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Rentals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Locações Ativas
              </CardTitle>
              <Button variant="outline" size="sm">Ver Todas</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeRentals.map((rental) => (
                <div key={rental.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">{rental.equipment}</h4>
                      <p className="text-sm text-gray-600">Contrato: {rental.contractNumber}</p>
                    </div>
                    {getStatusBadge(rental.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Período</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(rental.startDate)} até {formatDate(rental.endDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Valor Diário</p>
                      <p className="text-sm font-medium text-green-600">
                        {formatCurrency(rental.dailyPrice)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {rental.daysRemaining} dias restantes
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">Ver Detalhes</Button>
                        <Button size="sm">Prorrogar</Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-purple-600" />
                Faturas Recentes
              </CardTitle>
              <Button variant="outline" size="sm">Ver Todas</Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentInvoices.map((invoice) => (
                <div key={invoice.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">Fatura {invoice.number}</h4>
                      <p className="text-sm text-gray-600">Emitida em {formatDate(invoice.issueDate)}</p>
                    </div>
                    {getStatusBadge(invoice.status)}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-gray-500">Vencimento</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(invoice.dueDate)}
                      </p>
                      {invoice.status === 'overdue' && (
                        <p className="text-xs text-red-600 mt-1">
                          {invoice.daysPastDue} dias em atraso
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Valor</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(invoice.amount)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      {invoice.status === 'paid' ? (
                        <span className="text-sm text-green-600">
                          Pago em {formatDate(invoice.paidDate!)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-600">
                          {invoice.status === 'overdue' ? 'Pagamento em atraso' : 
                           invoice.status === 'pending' ? `Vence em ${invoice.daysTodue} dias` : ''}
                        </span>
                      )}
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        {invoice.status !== 'paid' && (
                          <Button size="sm">Pagar</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credit Limit Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-green-600" />
            Status de Crédito
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-600">Limite de Crédito</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(clientData.creditLimit)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Utilizado</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(clientData.currentDebt)}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-600 h-2 rounded-full"
                  style={{ 
                    width: `${(clientData.currentDebt / clientData.creditLimit) * 100}%` 
                  }}
                ></div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Disponível</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(clientData.availableCredit)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {Math.round((clientData.availableCredit / clientData.creditLimit) * 100)}% disponível
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              Nova Locação
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              Gerar Fatura
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <MessageSquare className="h-6 w-6 mb-2" />
              Suporte
            </Button>
            
            <Button variant="outline" className="h-20 flex-col">
              <Download className="h-6 w-6 mb-2" />
              Relatórios
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Precisa de Ajuda?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              Nossa equipe está pronta para atendê-lo
            </p>
            <div className="flex justify-center space-x-6">
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-2" />
                (11) 3000-1000
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-2" />
                contato@locamaster.com.br
              </div>
            </div>
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Abrir Chamado de Suporte
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
