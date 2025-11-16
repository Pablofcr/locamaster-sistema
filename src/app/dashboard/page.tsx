import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Package, 
  Users, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react"

export default function DashboardPage() {
  // Mock data baseado no projeto original
  const stats = [
    {
      title: "Total de Equipamentos",
      value: "156",
      change: "+12",
      changeText: "desde mês passado",
      icon: Package,
      color: "text-blue-600 bg-blue-100"
    },
    {
      title: "Clientes Ativos",
      value: "43",
      change: "+5",
      changeText: "novos este mês",
      icon: Users,
      color: "text-green-600 bg-green-100"
    },
    {
      title: "Locações Ativas",
      value: "28",
      change: "+8",
      changeText: "esta semana",
      icon: FileText,
      color: "text-orange-600 bg-orange-100"
    },
    {
      title: "Faturamento Mensal",
      value: "R$ 47.350",
      change: "+23%",
      changeText: "vs mês anterior",
      icon: DollarSign,
      color: "text-purple-600 bg-purple-100"
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: "rental",
      title: "Nova locação - Escavadeira CAT-320",
      client: "Construtora Alpha Ltda",
      time: "2 horas atrás",
      status: "active"
    },
    {
      id: 2,
      type: "return",
      title: "Devolução - Betoneira BT-400",
      client: "João Silva Santos",
      time: "4 horas atrás",
      status: "completed"
    },
    {
      id: 3,
      type: "maintenance",
      title: "Manutenção programada - Gerador GEN-50D",
      client: "Manutenção preventiva",
      time: "6 horas atrás",
      status: "pending"
    },
    {
      id: 4,
      type: "invoice",
      title: "Fatura gerada - Contrato #2024-156",
      client: "Beta Engenharia S/A",
      time: "8 horas atrás",
      status: "sent"
    }
  ]

  const equipmentStatus = [
    { status: "Disponível", count: 42, color: "bg-green-500" },
    { status: "Locado", count: 28, color: "bg-blue-500" },
    { status: "Manutenção", count: 6, color: "bg-orange-500" },
    { status: "Indisponível", count: 3, color: "bg-red-500" }
  ]

  return (
    <div className="px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Visão geral do seu sistema de locações</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">{stat.change}</span>
                      <span className="text-sm text-gray-500 ml-1">{stat.changeText}</span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Equipment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Status dos Equipamentos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipmentStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${item.color} mr-3`} />
                      <span className="text-sm font-medium text-gray-700">{item.status}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">{item.count}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="text-center">
                  <span className="text-2xl font-bold text-gray-900">79</span>
                  <p className="text-sm text-gray-600">Total de equipamentos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Atividades Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <div className="mt-1">
                      {activity.status === 'completed' && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                      {activity.status === 'active' && (
                        <AlertCircle className="h-5 w-5 text-blue-500" />
                      )}
                      {activity.status === 'pending' && (
                        <Clock className="h-5 w-5 text-orange-500" />
                      )}
                      {activity.status === 'sent' && (
                        <DollarSign className="h-5 w-5 text-purple-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                      <p className="text-sm text-gray-600">{activity.client}</p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Revenue Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Faturamento dos Últimos 6 Meses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Gráfico de faturamento</p>
                  <p className="text-sm text-gray-500 mt-1">Integração com Recharts em desenvolvimento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment Utilization */}
          <Card>
            <CardHeader>
              <CardTitle>Utilização de Equipamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Taxa de utilização</p>
                  <p className="text-sm text-gray-500 mt-1">Analytics avançados em desenvolvimento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alerts Section */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              Alertas e Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    3 equipamentos precisam de manutenção preventiva
                  </p>
                  <p className="text-xs text-orange-600">Martelo MD-20K, Serra SC-1800, Furadeira DI-1500</p>
                </div>
              </div>
              
              <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-red-800">
                    2 faturas em atraso há mais de 15 dias
                  </p>
                  <p className="text-xs text-red-600">Construtora Alpha Ltda, Delta Empreiteira Ltda</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Sistema atualizado com sucesso para V2.0
                  </p>
                  <p className="text-xs text-blue-600">Todas as funcionalidades migradas e melhoradas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
