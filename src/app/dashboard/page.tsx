"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  Users, 
  FileText, 
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  Zap
} from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Equipamentos",
      value: "127",
      change: "+12%",
      trend: "up",
      icon: Package,
      description: "42 disponíveis",
      color: "green" // Verde suave
    },
    {
      title: "Clientes Ativos",
      value: "89",
      change: "+5%",
      trend: "up", 
      icon: Users,
      description: "18 novos este mês",
      color: "blue" // Azul suave
    },
    {
      title: "Locações Ativas",
      value: "234",
      change: "-2%",
      trend: "down",
      icon: FileText,
      description: "25 expiram em breve",
      color: "orange" // Laranja suave
    },
    {
      title: "Faturamento Mensal",
      value: "R$ 45.230",
      change: "+18%",
      trend: "up",
      icon: DollarSign,
      description: "7 faturas pendentes",
      color: "purple" // Roxo suave
    }
  ]

  const recentActivities = [
    {
      type: "rental",
      title: "Nova locação criada",
      description: "Betoneira B350 - Construtora Alpha",
      time: "2 min atrás",
      icon: FileText,
      color: "blue"
    },
    {
      type: "payment",
      title: "Pagamento recebido",
      description: "R$ 2.450,00 - Fatura #1024",
      time: "15 min atrás",
      icon: DollarSign,
      color: "green"
    },
    {
      type: "equipment",
      title: "Equipamento devolvido",
      description: "Escavadeira CAT320 - ID: 089",
      time: "1h atrás",
      icon: Package,
      color: "orange"
    },
    {
      type: "client",
      title: "Novo cliente cadastrado",
      description: "Construtora Horizonte Ltda",
      time: "2h atrás",
      icon: Users,
      color: "purple"
    }
  ]

  const alerts = [
    {
      type: "warning",
      title: "Manutenção preventiva",
      description: "5 equipamentos precisam de revisão",
      priority: "alta"
    },
    {
      type: "info",
      title: "Contratos expirando",
      description: "8 contratos vencem nos próximos 7 dias",
      priority: "média"
    }
  ]

  // ✅ CORREÇÃO: Bordas coloridas suaves em vez de pretas
  const getBorderColor = (color: string) => {
    const borderColors = {
      green: "border-l-4 border-green-400",
      blue: "border-l-4 border-blue-400", 
      orange: "border-l-4 border-orange-400",
      purple: "border-l-4 border-purple-400"
    }
    return borderColors[color as keyof typeof borderColors] || borderColors.blue
  }

  const getIconBgColor = (color: string) => {
    const bgColors = {
      green: "bg-green-50 text-green-600",
      blue: "bg-blue-50 text-blue-600",
      orange: "bg-orange-50 text-orange-600", 
      purple: "bg-purple-50 text-purple-600"
    }
    return bgColors[color as keyof typeof bgColors] || bgColors.blue
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard Principal
          </h1>
          <p className="text-gray-600 mt-1">Visão geral do seu negócio em tempo real</p>
        </div>
        <div className="flex space-x-3">
          {/* ✅ CORREÇÃO: Hover effects nos botões */}
          <Button 
            variant="outline" 
            size="sm"
            className="hover:scale-105 hover:shadow-md hover:border-blue-400 transition-all duration-200"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Relatório Mensal
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            <Zap className="w-4 h-4 mr-2" />
            Nova Locação
          </Button>
        </div>
      </div>

      {/* Stats Cards - ✅ CORRIGIDOS: Bordas coloridas suaves + Hover effects */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className={`${getBorderColor(stat.color)} hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer group bg-white`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <div className={`p-3 rounded-lg ${getIconBgColor(stat.color)} group-hover:scale-110 transition-transform duration-200`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2 hover:shadow-lg transition-all duration-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-500" />
              Atividades Recentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index} 
                  className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-blue-50 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer"
                >
                  <div className={`p-2 rounded-full ${getIconBgColor(activity.color)}`}>
                    <activity.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.description}
                    </p>
                  </div>
                  <div className="text-xs text-gray-400">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <Button 
                variant="ghost" 
                size="sm"
                className="hover:bg-blue-50 hover:scale-105 transition-all duration-200"
              >
                Ver todas atividades
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Alerts */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alerts.map((alert, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border-l-4 hover:shadow-md hover:scale-[1.01] transition-all duration-200 cursor-pointer ${
                      alert.type === 'warning' 
                        ? 'bg-orange-50 border-orange-400 hover:bg-orange-100' 
                        : 'bg-blue-50 border-blue-400 hover:bg-blue-100'
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900">
                      {alert.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {alert.description}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded-full mt-2 inline-block ${
                      alert.priority === 'alta' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      Prioridade {alert.priority}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="hover:shadow-lg transition-all duration-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                Ações Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start hover:bg-blue-50 hover:border-blue-400 hover:scale-[1.02] transition-all duration-200"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Nova Locação
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start hover:bg-green-50 hover:border-green-400 hover:scale-[1.02] transition-all duration-200"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Cadastrar Cliente
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start hover:bg-orange-50 hover:border-orange-400 hover:scale-[1.02] transition-all duration-200"
                >
                  <Package className="w-4 h-4 mr-2" />
                  Adicionar Equipamento
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start hover:bg-purple-50 hover:border-purple-400 hover:scale-[1.02] transition-all duration-200"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  Gerar Fatura
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* System Status */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-green-700">
              Sistema operando normalmente - Última atualização: agora
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
