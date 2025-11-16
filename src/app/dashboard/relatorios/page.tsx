import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  BarChart3, 
  Download, 
  Filter,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  Users,
  FileText,
  Calendar,
  Eye,
  Target,
  PieChart,
  Activity,
  Award
} from "lucide-react"

export default function ReportsPage() {
  // Mock analytics data
  const analytics = {
    revenue: {
      current: 653240,
      previous: 583190,
      growth: 12.0,
      monthlyData: [
        { month: 'Jan', revenue: 420000, rentals: 35 },
        { month: 'Fev', revenue: 380000, rentals: 32 },
        { month: 'Mar', revenue: 520000, rentals: 45 },
        { month: 'Abr', revenue: 480000, rentals: 38 },
        { month: 'Mai', revenue: 560000, rentals: 42 },
        { month: 'Jun', revenue: 590000, rentals: 48 },
        { month: 'Jul', revenue: 610000, rentals: 51 },
        { month: 'Ago', revenue: 580000, rentals: 46 },
        { month: 'Set', revenue: 620000, rentals: 53 },
        { month: 'Out', revenue: 583190, rentals: 47 },
        { month: 'Nov', revenue: 653240, rentals: 55 }
      ]
    },
    equipment: {
      utilizationRate: 78.5,
      topPerformers: [
        { name: 'Escavadeira CAT-320', revenue: 89600, utilization: 92 },
        { name: 'Guindaste 25 Ton', revenue: 76800, utilization: 88 },
        { name: 'Retroescavadeira JCB', revenue: 65400, utilization: 85 },
        { name: 'Gerador 50kVA', revenue: 54200, utilization: 82 },
        { name: 'Empilhadeira 2.5 Ton', revenue: 48600, utilization: 79 }
      ]
    },
    customers: {
      retention: 87.3,
      avgTicket: 14520,
      segmentation: [
        { type: 'Pessoa Jurídica', count: 15, revenue: 487340, percentage: 74.6 },
        { type: 'Pessoa Física', count: 28, revenue: 165900, percentage: 25.4 }
      ]
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600 mt-1">Analytics e insights do seu negócio</p>
          </div>
          <div className="flex items-center space-x-3">
            <select className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="current-month">Mês Atual</option>
              <option value="last-month">Mês Anterior</option>
              <option value="quarter">Trimestre</option>
              <option value="year">Ano</option>
            </select>
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button className="flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard Executivo
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faturamento</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.revenue.current)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{formatPercentage(analytics.revenue.growth)}</span>
                  <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa de Utilização</p>
                <p className="text-3xl font-bold text-gray-900">{formatPercentage(analytics.equipment.utilizationRate)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                  <span className="text-sm text-blue-600">+3.2%</span>
                  <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Retenção de Clientes</p>
                <p className="text-3xl font-bold text-gray-900">{formatPercentage(analytics.customers.retention)}</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-orange-500 mr-1" />
                  <span className="text-sm text-orange-600">-1.2%</span>
                  <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(analytics.customers.avgTicket)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8.4%</span>
                  <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Target className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Evolução do Faturamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex flex-col">
              {/* Chart placeholder with data visualization */}
              <div className="flex-1 flex items-end justify-between px-4 pb-4 space-x-2">
                {analytics.revenue.monthlyData.slice(-6).map((data, index) => {
                  const height = (data.revenue / Math.max(...analytics.revenue.monthlyData.map(d => d.revenue))) * 200;
                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="bg-blue-500 w-8 rounded-t-sm"
                        style={{ height: `${height}px` }}
                      ></div>
                      <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Crescimento médio mensal: +6.8%</p>
                <p className="text-xs text-gray-500">Melhor mês: Novembro (R$ 653.240)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Segmentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Segmentação de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {/* Pie chart representation */}
              <div className="flex items-center justify-center h-48">
                <div className="relative w-32 h-32">
                  <div className="absolute inset-0 rounded-full bg-blue-500" style={{ 
                    background: `conic-gradient(#3B82F6 0deg ${74.6 * 3.6}deg, #A855F7 ${74.6 * 3.6}deg 360deg)` 
                  }}></div>
                  <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-gray-900">43</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3 mt-4">
                {analytics.customers.segmentation.map((segment, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-3 ${
                        segment.type === 'Pessoa Jurídica' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-700">{segment.type}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{segment.count} clientes</p>
                      <p className="text-xs text-gray-500">{formatCurrency(segment.revenue)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipment Performance */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="h-5 w-5 mr-2" />
            Top Equipamentos por Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Posição</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Equipamento</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Faturamento</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Taxa de Utilização</th>
                  <th className="text-left py-3 px-2 font-semibold text-gray-900">Performance</th>
                </tr>
              </thead>
              <tbody>
                {analytics.equipment.topPerformers.map((equipment, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500' :
                          index === 1 ? 'bg-gray-400' :
                          index === 2 ? 'bg-orange-500' :
                          'bg-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <p className="font-medium text-gray-900">{equipment.name}</p>
                    </td>
                    <td className="py-4 px-2">
                      <p className="font-medium text-gray-900">{formatCurrency(equipment.revenue)}</p>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${equipment.utilization}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{equipment.utilization}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center">
                        <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600">Excelente</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reports Shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Relatório Financeiro</h3>
                <p className="text-sm text-gray-600">Fluxo de caixa e recebimentos</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Visualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <Package className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Análise de Equipamentos</h3>
                <p className="text-sm text-gray-600">Performance e ROI por item</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Visualizar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Análise de Clientes</h3>
                <p className="text-sm text-gray-600">Comportamento e segmentação</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-1" />
                Visualizar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
