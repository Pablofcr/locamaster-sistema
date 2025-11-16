import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DollarSign, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Eye,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  FileText,
  User,
  Building,
  Calendar,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt
} from "lucide-react"

export default function BillingPage() {
  // Mock data das faturas
  const invoices = [
    {
      id: "1",
      invoiceNumber: "FAT-2024-1001",
      customerName: "Construtora Alpha Ltda",
      customerType: "corporate",
      customerDocument: "12.345.678/0001-90",
      contractNumber: "LM-2024-1234",
      issueDate: "2024-11-01",
      dueDate: "2024-11-15",
      paymentDate: null,
      status: "sent",
      totalAmount: 19600,
      paidAmount: 0,
      remainingAmount: 19600,
      paymentMethod: null,
      items: [
        { description: "Locação Escavadeira CAT-320", quantity: 14, unitPrice: 800, totalPrice: 11200 },
        { description: "Locação Gerador 50kVA", quantity: 14, unitPrice: 300, totalPrice: 8400 }
      ]
    },
    {
      id: "2", 
      invoiceNumber: "FAT-2024-1002",
      customerName: "João Silva Santos",
      customerType: "individual",
      customerDocument: "123.456.789-00",
      contractNumber: "LM-2024-1235",
      issueDate: "2024-10-15",
      dueDate: "2024-10-22",
      paymentDate: "2024-10-20",
      status: "paid",
      totalAmount: 840,
      paidAmount: 840,
      remainingAmount: 0,
      paymentMethod: "pix",
      items: [
        { description: "Locação Betoneira 400L", quantity: 7, unitPrice: 120, totalPrice: 840 }
      ]
    },
    {
      id: "3",
      invoiceNumber: "FAT-2024-1003", 
      customerName: "Beta Engenharia S/A",
      customerType: "corporate",
      customerDocument: "98.765.432/0001-10",
      contractNumber: "LM-2024-1236",
      issueDate: "2024-10-20",
      dueDate: "2024-11-05",
      paymentDate: null,
      status: "overdue",
      totalAmount: 16000,
      paidAmount: 8000,
      remainingAmount: 8000,
      paymentMethod: "bank_transfer",
      items: [
        { description: "Locação Retroescavadeira JCB", quantity: 16, unitPrice: 650, totalPrice: 10400 },
        { description: "Locação Compressor 100HP", quantity: 16, unitPrice: 350, totalPrice: 5600 }
      ]
    },
    {
      id: "4",
      invoiceNumber: "FAT-2024-1004",
      customerName: "Maria Oliveira Costa",
      customerType: "individual",
      customerDocument: "987.654.321-00", 
      contractNumber: "LM-2024-1237",
      issueDate: "2024-11-08",
      dueDate: "2024-11-15",
      paymentDate: null,
      status: "sent",
      totalAmount: 640,
      paidAmount: 320,
      remainingAmount: 320,
      paymentMethod: "credit_card",
      items: [
        { description: "Locação Martelo Demolidor 20kg", quantity: 4, unitPrice: 80, totalPrice: 320 },
        { description: "Taxa de Entrega", quantity: 1, unitPrice: 150, totalPrice: 150 },
        { description: "Taxa de Retirada", quantity: 1, unitPrice: 150, totalPrice: 150 }
      ]
    },
    {
      id: "5",
      invoiceNumber: "FAT-2024-1005",
      customerName: "Gamma Construções",
      customerType: "corporate", 
      customerDocument: "11.222.333/0001-44",
      contractNumber: "LM-2024-1238",
      issueDate: "2024-11-10",
      dueDate: "2024-11-25",
      paymentDate: null,
      status: "draft",
      totalAmount: 16000,
      paidAmount: 0,
      remainingAmount: 16000,
      paymentMethod: null,
      items: [
        { description: "Locação Guindaste 25 Ton", quantity: 10, unitPrice: 1200, totalPrice: 12000 },
        { description: "Locação Empilhadeira 2.5 Ton", quantity: 10, unitPrice: 400, totalPrice: 4000 }
      ]
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pago
          </span>
        )
      case 'sent':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Send className="h-3 w-3 mr-1" />
            Enviado
          </span>
        )
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Em Atraso
          </span>
        )
      case 'draft':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <Edit className="h-3 w-3 mr-1" />
            Rascunho
          </span>
        )
      case 'partial':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <Clock className="h-3 w-3 mr-1" />
            Parcial
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelado
          </span>
        )
      default:
        return null
    }
  }

  const getPaymentMethodIcon = (method: string | null) => {
    if (!method) return null
    
    switch (method) {
      case 'pix':
        return <Smartphone className="h-4 w-4 text-blue-600" />
      case 'credit_card':
        return <CreditCard className="h-4 w-4 text-purple-600" />
      case 'bank_transfer':
        return <Banknote className="h-4 w-4 text-green-600" />
      case 'cash':
        return <DollarSign className="h-4 w-4 text-yellow-600" />
      case 'check':
        return <Receipt className="h-4 w-4 text-gray-600" />
      default:
        return null
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: string | null) => {
    return date ? new Date(date).toLocaleDateString('pt-BR') : '-'
  }

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'paid' && new Date(dueDate) < new Date()
  }

  return (
    <div className="px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Faturamento</h1>
            <p className="text-gray-600 mt-1">Gerencie faturas e recebimentos</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Relatório
            </Button>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Nova Fatura
            </Button>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Buscar por número, cliente, documento..."
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">Todos Status</option>
                <option value="draft">Rascunho</option>
                <option value="sent">Enviado</option>
                <option value="paid">Pago</option>
                <option value="partial">Parcial</option>
                <option value="overdue">Em Atraso</option>
                <option value="cancelled">Cancelado</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">Tipo de Cliente</option>
                <option value="individual">Pessoa Física</option>
                <option value="corporate">Pessoa Jurídica</option>
              </select>
              <input 
                type="month" 
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                defaultValue="2024-11"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Faturamento Total</p>
                <p className="text-2xl font-bold text-gray-900">R$ 653.240</p>
                <p className="text-xs text-green-600">+12% vs mês anterior</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recebido</p>
                <p className="text-2xl font-bold text-green-600">R$ 487.430</p>
                <p className="text-xs text-gray-500">74.6% do total</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">A Receber</p>
                <p className="text-2xl font-bold text-blue-600">R$ 134.560</p>
                <p className="text-xs text-gray-500">32 faturas</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600">R$ 31.250</p>
                <p className="text-xs text-gray-500">8 faturas</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Faturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Fatura</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Cliente</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Contrato</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Emissão</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Vencimento</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Valor</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div>
                        <p className="font-medium text-gray-900">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">
                          {invoice.items.length} {invoice.items.length === 1 ? 'item' : 'itens'}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          invoice.customerType === 'corporate' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          {invoice.customerType === 'corporate' ? (
                            <Building className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{invoice.customerName}</p>
                          <p className="text-xs text-gray-500">{invoice.customerDocument}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div>
                        {invoice.contractNumber ? (
                          <p className="text-sm font-medium text-blue-600">{invoice.contractNumber}</p>
                        ) : (
                          <p className="text-sm text-gray-500">Sem contrato</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <p className="text-sm text-gray-700">{formatDate(invoice.issueDate)}</p>
                    </td>
                    <td className="py-4 px-2">
                      <div>
                        <p className={`text-sm font-medium ${
                          isOverdue(invoice.dueDate, invoice.status) ? 'text-red-600' : 'text-gray-900'
                        }`}>
                          {formatDate(invoice.dueDate)}
                        </p>
                        {isOverdue(invoice.dueDate, invoice.status) && (
                          <p className="text-xs text-red-500">
                            {Math.ceil((new Date().getTime() - new Date(invoice.dueDate).getTime()) / (1000 * 60 * 60 * 24))} dias
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="py-4 px-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.totalAmount)}
                        </p>
                        {invoice.remainingAmount > 0 && invoice.status !== 'draft' && (
                          <div className="flex items-center mt-1">
                            <p className="text-xs text-red-600">
                              Pendente: {formatCurrency(invoice.remainingAmount)}
                            </p>
                          </div>
                        )}
                        {invoice.remainingAmount === 0 && invoice.status === 'paid' && (
                          <div className="flex items-center mt-1">
                            {getPaymentMethodIcon(invoice.paymentMethod)}
                            <p className="text-xs text-green-600 ml-1">
                              Pago via {invoice.paymentMethod === 'pix' ? 'PIX' : 
                                      invoice.paymentMethod === 'credit_card' ? 'Cartão' :
                                      invoice.paymentMethod === 'bank_transfer' ? 'Transferência' :
                                      invoice.paymentMethod === 'cash' ? 'Dinheiro' : 'Cheque'}
                            </p>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button variant="ghost" size="sm">
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        {(invoice.status === 'sent' || invoice.status === 'partial') && (
                          <Button variant="ghost" size="sm">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Mostrando 1-5 de 120 faturas
            </p>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Anterior</Button>
              <Button variant="outline" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Próximo</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods & Collections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Payment Methods Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Métodos de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Smartphone className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">PIX</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">R$ 245.680</p>
                  <p className="text-xs text-gray-500">50.4%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Banknote className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Transferência</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">R$ 156.290</p>
                  <p className="text-xs text-gray-500">32.1%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Cartão</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">R$ 67.850</p>
                  <p className="text-xs text-gray-500">13.9%</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 text-yellow-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Dinheiro</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">R$ 17.610</p>
                  <p className="text-xs text-gray-500">3.6%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Collections Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Cobrança Urgente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Beta Engenharia S/A</p>
                    <p className="text-xs text-red-600">R$ 16.000 - 7 dias em atraso</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Cobrar</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Alpha Construtora</p>
                    <p className="text-xs text-orange-600">R$ 19.600 - Vence hoje</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Lembrar</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-yellow-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Maria Costa</p>
                    <p className="text-xs text-yellow-600">R$ 320 - Pagamento parcial</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Acompanhar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
