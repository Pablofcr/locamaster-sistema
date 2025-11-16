import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Eye,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  Package,
  User,
  Building,
  MapPin,
  Camera
} from "lucide-react"

export default function RentalsPage() {
  // Mock data das locações (seria importado do arquivo de mock)
  const rentals = [
    {
      id: "1",
      contractNumber: "LM-2024-1234",
      customerName: "Construtora Alpha Ltda",
      customerType: "corporate",
      equipments: [
        { name: "Escavadeira CAT-320", quantity: 1, dailyPrice: 800 },
        { name: "Gerador 50kVA", quantity: 2, dailyPrice: 300 }
      ],
      status: "active",
      startDate: "2024-11-01",
      endDate: "2024-11-15", 
      totalDays: 14,
      totalValue: 19600,
      paidValue: 15000,
      pendingValue: 4600,
      deliveryAddress: "Av. Paulista, 1000 - São Paulo/SP",
      deliveryType: "delivery"
    },
    {
      id: "2",
      contractNumber: "LM-2024-1235", 
      customerName: "João Silva Santos",
      customerType: "individual",
      equipments: [
        { name: "Betoneira 400L", quantity: 1, dailyPrice: 120 }
      ],
      status: "completed",
      startDate: "2024-10-15",
      endDate: "2024-10-22",
      totalDays: 7,
      totalValue: 840,
      paidValue: 840,
      pendingValue: 0,
      deliveryAddress: "Rua das Flores, 500 - Campinas/SP",
      deliveryType: "pickup"
    },
    {
      id: "3",
      contractNumber: "LM-2024-1236",
      customerName: "Beta Engenharia S/A", 
      customerType: "corporate",
      equipments: [
        { name: "Retroescavadeira JCB", quantity: 1, dailyPrice: 650 },
        { name: "Compressor 100HP", quantity: 1, dailyPrice: 350 }
      ],
      status: "overdue",
      startDate: "2024-10-20",
      endDate: "2024-11-05",
      totalDays: 16,
      totalValue: 16000,
      paidValue: 8000,
      pendingValue: 8000,
      deliveryAddress: "Av. Brasil, 2500 - Rio de Janeiro/RJ",
      deliveryType: "both"
    },
    {
      id: "4",
      contractNumber: "LM-2024-1237",
      customerName: "Maria Oliveira Costa",
      customerType: "individual", 
      equipments: [
        { name: "Martelo Demolidor 20kg", quantity: 2, dailyPrice: 80 }
      ],
      status: "active",
      startDate: "2024-11-08",
      endDate: "2024-11-12",
      totalDays: 4,
      totalValue: 640,
      paidValue: 320,
      pendingValue: 320,
      deliveryAddress: "Rua XV de Novembro, 800 - São Paulo/SP",
      deliveryType: "delivery"
    },
    {
      id: "5",
      contractNumber: "LM-2024-1238",
      customerName: "Gamma Construções",
      customerType: "corporate",
      equipments: [
        { name: "Guindaste 25 Ton", quantity: 1, dailyPrice: 1200 },
        { name: "Empilhadeira 2.5 Ton", quantity: 1, dailyPrice: 400 }
      ],
      status: "draft",
      startDate: "2024-11-15", 
      endDate: "2024-11-25",
      totalDays: 10,
      totalValue: 16000,
      paidValue: 0,
      pendingValue: 16000,
      deliveryAddress: "Av. Faria Lima, 1500 - São Paulo/SP",
      deliveryType: "delivery"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Ativo
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Finalizado
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

  const getDeliveryTypeBadge = (type: string) => {
    switch (type) {
      case 'pickup':
        return <span className="text-xs text-blue-600">Retirada</span>
      case 'delivery':
        return <span className="text-xs text-green-600">Entrega</span>
      case 'both':
        return <span className="text-xs text-purple-600">Entrega + Retirada</span>
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  return (
    <div className="px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Locações</h1>
            <p className="text-gray-600 mt-1">Gerencie contratos e locações de equipamentos</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Calendário
            </Button>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Nova Locação
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
                  placeholder="Buscar por contrato, cliente, equipamento..."
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
                <option value="active">Ativo</option>
                <option value="completed">Finalizado</option>
                <option value="overdue">Em Atraso</option>
                <option value="cancelled">Cancelado</option>
              </select>
              <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="">Tipo de Cliente</option>
                <option value="individual">Pessoa Física</option>
                <option value="corporate">Pessoa Jurídica</option>
              </select>
              <input 
                type="date" 
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Data inicial"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rental Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">45</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ativos</p>
                <p className="text-2xl font-bold text-blue-600">18</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Finalizados</p>
                <p className="text-2xl font-bold text-green-600">22</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Em Atraso</p>
                <p className="text-2xl font-bold text-red-600">3</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rascunhos</p>
                <p className="text-2xl font-bold text-gray-600">2</p>
              </div>
              <Edit className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rentals List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Locações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Contrato</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Cliente</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Equipamentos</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Período</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Status</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Valor</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Entrega</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Ações</th>
                </tr>
              </thead>
              <tbody>
                {rentals.map((rental) => (
                  <tr key={rental.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div>
                        <p className="font-medium text-gray-900">{rental.contractNumber}</p>
                        <p className="text-xs text-gray-500">{rental.totalDays} dias</p>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          rental.customerType === 'corporate' 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'bg-purple-100 text-purple-600'
                        }`}>
                          {rental.customerType === 'corporate' ? (
                            <Building className="h-4 w-4" />
                          ) : (
                            <User className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{rental.customerName}</p>
                          <p className="text-xs text-gray-500">
                            {rental.customerType === 'corporate' ? 'PJ' : 'PF'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div>
                        {rental.equipments.slice(0, 2).map((eq, index) => (
                          <p key={index} className="text-sm text-gray-700">
                            {eq.quantity}x {eq.name}
                          </p>
                        ))}
                        {rental.equipments.length > 2 && (
                          <p className="text-xs text-gray-500">
                            +{rental.equipments.length - 2} mais
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDate(rental.startDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                          até {formatDate(rental.endDate)}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {getStatusBadge(rental.status)}
                    </td>
                    <td className="py-4 px-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {formatCurrency(rental.totalValue)}
                        </p>
                        {rental.pendingValue > 0 && (
                          <p className="text-xs text-red-600">
                            Pendente: {formatCurrency(rental.pendingValue)}
                          </p>
                        )}
                        {rental.pendingValue === 0 && rental.status !== 'draft' && (
                          <p className="text-xs text-green-600">Quitado</p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div>
                        {getDeliveryTypeBadge(rental.deliveryType)}
                        <p className="text-xs text-gray-500 mt-1 max-w-32 truncate">
                          {rental.deliveryAddress}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Camera className="h-4 w-4" />
                        </Button>
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
              Mostrando 1-5 de 45 locações
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Urgent Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Ações Urgentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Beta Engenharia - Atraso</p>
                    <p className="text-xs text-red-600">Devolução atrasada há 7 dias</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Contatar</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Alpha Construtora</p>
                    <p className="text-xs text-orange-600">Devolução prevista para hoje</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Check-out</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Check-out realizado</p>
                  <p className="text-xs text-gray-600">João Silva - Betoneira 400L</p>
                  <p className="text-xs text-gray-500">2 horas atrás</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Nova locação criada</p>
                  <p className="text-xs text-gray-600">Gamma Construções - Guindaste</p>
                  <p className="text-xs text-gray-500">4 horas atrás</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Pagamento recebido</p>
                  <p className="text-xs text-gray-600">Maria Costa - R$ 320,00</p>
                  <p className="text-xs text-gray-500">6 horas atrás</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
