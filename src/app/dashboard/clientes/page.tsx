import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Search, 
  Filter, 
  Plus,
  Edit,
  Eye,
  Phone,
  Mail,
  Building,
  User,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

export default function CustomersPage() {
  // Mock data dos clientes (baseado no projeto original)
  const customers = [
    {
      id: "1",
      type: "corporate",
      name: "Construtora Alpha Ltda",
      document: "12.345.678/0001-90",
      email: "contato@alpha.com.br",
      phone: "(11) 3000-1000",
      city: "São Paulo",
      state: "SP",
      status: "active",
      creditLimit: 150000,
      currentDebt: 12500,
      totalContracts: 15,
      lastRental: "2024-11-05"
    },
    {
      id: "2",
      type: "individual", 
      name: "João Silva Santos",
      document: "123.456.789-00",
      email: "joao.silva@email.com",
      phone: "(11) 99999-1234",
      city: "São Paulo",
      state: "SP", 
      status: "active",
      creditLimit: 25000,
      currentDebt: 0,
      totalContracts: 8,
      lastRental: "2024-11-10"
    },
    {
      id: "3",
      type: "corporate",
      name: "Beta Engenharia S/A",
      document: "98.765.432/0001-10",
      email: "financeiro@betaeng.com.br", 
      phone: "(21) 3000-2000",
      city: "Rio de Janeiro",
      state: "RJ",
      status: "active",
      creditLimit: 200000,
      currentDebt: 45000,
      totalContracts: 22,
      lastRental: "2024-11-08"
    },
    {
      id: "4",
      type: "individual",
      name: "Maria Oliveira Costa",
      document: "987.654.321-00", 
      email: "maria.oliveira@gmail.com",
      phone: "(11) 98888-5678",
      city: "Campinas",
      state: "SP",
      status: "active",
      creditLimit: 15000,
      currentDebt: 2800,
      totalContracts: 4,
      lastRental: "2024-10-28"
    },
    {
      id: "5",
      type: "corporate",
      name: "Gamma Construções e Incorporações",
      document: "11.222.333/0001-44",
      email: "admin@gamma.com.br",
      phone: "(31) 3000-3000", 
      city: "Belo Horizonte",
      state: "MG",
      status: "blocked",
      creditLimit: 300000,
      currentDebt: 85000,
      totalContracts: 35,
      lastRental: "2024-09-15"
    },
    {
      id: "6", 
      type: "individual",
      name: "Carlos Eduardo Ferreira",
      document: "456.789.123-00",
      email: "carlos.ferreira@hotmail.com",
      phone: "(21) 97777-9012",
      city: "Rio de Janeiro", 
      state: "RJ",
      status: "inactive",
      creditLimit: 20000,
      currentDebt: 0,
      totalContracts: 12,
      lastRental: "2024-07-20"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </span>
        )
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <User className="h-3 w-3 mr-1" />
            Inativo
          </span>
        )
      case 'blocked':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Bloqueado
          </span>
        )
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

  const getDebtStatus = (currentDebt: number, creditLimit: number) => {
    const debtPercentage = (currentDebt / creditLimit) * 100
    if (debtPercentage > 80) return 'high'
    if (debtPercentage > 50) return 'medium'
    return 'low'
  }

  return (
    <div className="px-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
              <p className="text-gray-600 mt-1">Gerencie sua base de clientes</p>
            </div>
            <Button className="flex items-center">
              <Plus className="h-4 w-4 mr-2" />
              Novo Cliente
            </Button>
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
                    placeholder="Buscar por nome, documento, email..."
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
                  <option value="">Todos os Tipos</option>
                  <option value="individual">Pessoa Física</option>
                  <option value="corporate">Pessoa Jurídica</option>
                </select>
                <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">Todos Status</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                  <option value="blocked">Bloqueado</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total de Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">43</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Clientes Ativos</p>
                  <p className="text-2xl font-bold text-green-600">38</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pessoa Jurídica</p>
                  <p className="text-2xl font-bold text-blue-600">15</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pessoa Física</p>
                  <p className="text-2xl font-bold text-purple-600">28</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Cliente</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Contato</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Localização</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Status</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Limite/Dívida</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Contratos</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-2">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                            customer.type === 'corporate' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-purple-100 text-purple-600'
                          }`}>
                            {customer.type === 'corporate' ? (
                              <Building className="h-5 w-5" />
                            ) : (
                              <User className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{customer.name}</p>
                            <p className="text-sm text-gray-600">{customer.document}</p>
                            <p className="text-xs text-gray-500">
                              {customer.type === 'corporate' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-1" />
                            <span className="truncate">{customer.email}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="h-4 w-4 mr-1" />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div>
                          <p className="text-sm text-gray-700">{customer.city}</p>
                          <p className="text-xs text-gray-500">{customer.state}</p>
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        {getStatusBadge(customer.status)}
                      </td>
                      <td className="py-4 px-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(customer.creditLimit)}
                          </p>
                          {customer.currentDebt > 0 && (
                            <p className={`text-xs ${
                              getDebtStatus(customer.currentDebt, customer.creditLimit) === 'high' 
                                ? 'text-red-600' 
                                : getDebtStatus(customer.currentDebt, customer.creditLimit) === 'medium'
                                ? 'text-orange-600'
                                : 'text-gray-600'
                            }`}>
                              Dívida: {formatCurrency(customer.currentDebt)}
                            </p>
                          )}
                          {customer.currentDebt === 0 && (
                            <p className="text-xs text-green-600">Em dia</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{customer.totalContracts}</p>
                          <p className="text-xs text-gray-500">
                            Último: {new Date(customer.lastRental).toLocaleDateString('pt-BR')}
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
                            <Phone className="h-4 w-4" />
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
                Mostrando 1-6 de 43 clientes
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

        {/* Credit Alerts */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas de Crédito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Gamma Construções</p>
                    <p className="text-xs text-red-600">Dívida: R$ 85.000 (28% do limite) - Cliente bloqueado</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Negociar</Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Beta Engenharia S/A</p>
                    <p className="text-xs text-orange-600">Dívida: R$ 45.000 (22% do limite) - Acompanhar</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Monitorar</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
