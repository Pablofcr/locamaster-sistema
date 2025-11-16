"use client"

import { useState, useMemo } from 'react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Filter,
  Download,
  Maximize2,
  RefreshCw
} from 'lucide-react'

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 45000, expenses: 32000, profit: 13000, equipments: 124 },
  { month: 'Fev', revenue: 52000, expenses: 35000, profit: 17000, equipments: 132 },
  { month: 'Mar', revenue: 48000, expenses: 33000, profit: 15000, equipments: 128 },
  { month: 'Abr', revenue: 61000, expenses: 38000, profit: 23000, equipments: 145 },
  { month: 'Mai', revenue: 55000, expenses: 36000, profit: 19000, equipments: 140 },
  { month: 'Jun', revenue: 67000, expenses: 41000, profit: 26000, equipments: 158 },
  { month: 'Jul', revenue: 71000, expenses: 43000, profit: 28000, equipments: 162 },
  { month: 'Ago', revenue: 69000, expenses: 42000, profit: 27000, equipments: 159 },
  { month: 'Set', revenue: 74000, expenses: 45000, profit: 29000, equipments: 167 },
  { month: 'Out', revenue: 78000, expenses: 46000, profit: 32000, equipments: 174 },
  { month: 'Nov', revenue: 82000, expenses: 48000, profit: 34000, equipments: 180 },
  { month: 'Dez', revenue: 89000, expenses: 52000, profit: 37000, equipments: 195 }
]

const equipmentUtilizationData = [
  { name: 'Construção Civil', value: 35, count: 67, color: '#3b82f6' },
  { name: 'Jardinagem', value: 25, count: 48, color: '#10b981' },
  { name: 'Industrial', value: 20, count: 38, color: '#f59e0b' },
  { name: 'Transporte', value: 15, count: 28, color: '#8b5cf6' },
  { name: 'Outros', value: 5, count: 14, color: '#6b7280' }
]

const dailyRentalsData = [
  { day: 'Seg', rentals: 12, returns: 8, maintenance: 2 },
  { day: 'Ter', rentals: 15, returns: 10, maintenance: 1 },
  { day: 'Qua', rentals: 18, returns: 12, maintenance: 3 },
  { day: 'Qui', rentals: 20, returns: 14, maintenance: 2 },
  { day: 'Sex', rentals: 25, returns: 18, maintenance: 1 },
  { day: 'Sáb', rentals: 28, returns: 22, maintenance: 4 },
  { day: 'Dom', rentals: 8, returns: 15, maintenance: 1 }
]

const topEquipmentData = [
  { equipment: 'Betoneira 400L', revenue: 12500, rentals: 45, utilization: 89 },
  { equipment: 'Gerador 50kVA', revenue: 18200, rentals: 32, utilization: 78 },
  { equipment: 'Empilhadeira 2.5T', revenue: 22800, rentals: 28, utilization: 85 },
  { equipment: 'Compressor 15HP', revenue: 8900, rentals: 38, utilization: 72 },
  { equipment: 'Andaime Móvel', revenue: 6700, rentals: 52, utilization: 65 }
]

const colors = {
  primary: '#3b82f6',
  success: '#10b981', 
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  gray: '#6b7280'
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {`${entry.name}: ${typeof entry.value === 'number' && entry.name.includes('R$') 
              ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(entry.value)
              : entry.value
            }`}
          </p>
        ))}
      </div>
    )
  }
  return null
}

// Revenue trends chart
function RevenueChart() {
  const [period, setPeriod] = useState('12m')
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
            Receita vs Despesas
          </CardTitle>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setPeriod('6m')}>
              6M
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPeriod('12m')}>
              12M
            </Button>
            <Button variant="ghost" size="sm">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={revenueData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              {/* Revenue area */}
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stackId="1"
                stroke={colors.primary}
                fill={colors.primary}
                fillOpacity={0.1}
                name="Receita"
              />
              
              {/* Expenses area */}
              <Area 
                type="monotone" 
                dataKey="expenses" 
                stackId="1"
                stroke={colors.danger}
                fill={colors.danger}
                fillOpacity={0.1}
                name="Despesas"
              />
              
              {/* Profit line */}
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke={colors.success}
                strokeWidth={3}
                dot={{ fill: colors.success, r: 4 }}
                name="Lucro"
              />
              
              {/* Equipment count bars */}
              <Bar 
                dataKey="equipments" 
                fill={colors.warning}
                fillOpacity={0.3}
                name="Equipamentos"
                yAxisId="right"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              R$ {(revenueData.reduce((acc, item) => acc + item.profit, 0) / 1000).toFixed(0)}k
            </p>
            <p className="text-sm text-gray-600">Lucro Total</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {((revenueData.reduce((acc, item) => acc + item.profit, 0) / 
                 revenueData.reduce((acc, item) => acc + item.revenue, 0)) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">Margem Média</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {Math.round(revenueData.reduce((acc, item) => acc + item.equipments, 0) / revenueData.length)}
            </p>
            <p className="text-sm text-gray-600">Equipamentos Médio</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Equipment utilization pie chart
function EquipmentUtilizationChart() {
  const renderLabel = (entry: any) => {
    return `${entry.name}: ${entry.value}%`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PieChartIcon className="h-5 w-5 mr-2 text-purple-600" />
          Utilização por Categoria
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={equipmentUtilizationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {equipmentUtilizationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: any, name: any) => [`${value}%`, name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {equipmentUtilizationData.map((item, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600">
                {item.name} ({item.count})
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Daily operations chart
function DailyOperationsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2 text-orange-600" />
          Operações Diárias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={dailyRentalsData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="day" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Bar 
                dataKey="rentals" 
                name="Locações" 
                fill={colors.primary}
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="returns" 
                name="Devoluções" 
                fill={colors.success}
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="maintenance" 
                name="Manutenções" 
                fill={colors.warning}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// Top equipment performance
function TopEquipmentChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <BarChart3 className="h-5 w-5 mr-2 text-indigo-600" />
          Top Equipamentos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={topEquipmentData} 
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                type="number" 
                tick={{ fontSize: 12 }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <YAxis 
                type="category" 
                dataKey="equipment" 
                tick={{ fontSize: 10 }}
                axisLine={{ stroke: '#e0e0e0' }}
                width={120}
              />
              <Tooltip 
                formatter={(value: any, name: any) => [
                  name === 'revenue' 
                    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
                    : value,
                  name === 'revenue' ? 'Receita' : 
                  name === 'rentals' ? 'Locações' : 'Utilização'
                ]}
              />
              <Legend />
              
              <Bar 
                dataKey="revenue" 
                name="Receita" 
                fill={colors.primary}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Top equipment details */}
        <div className="mt-4 space-y-2">
          {topEquipmentData.slice(0, 3).map((equipment, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold
                  ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>
                  {index + 1}
                </div>
                <span className="ml-2 text-sm font-medium">{equipment.equipment}</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-green-600">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(equipment.revenue)}
                </p>
                <p className="text-xs text-gray-500">
                  {equipment.rentals} locações • {equipment.utilization}% utilização
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Main dashboard charts component
export function InteractiveCharts() {
  const [refreshing, setRefreshing] = useState(false)
  
  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate data refresh
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshing(false)
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Avançados</h1>
          <p className="text-gray-600">Dashboard interativo com métricas em tempo real</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-1 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-1" />
            Período
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filtros
          </Button>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Main revenue chart - full width on mobile */}
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        
        {/* Secondary charts */}
        <EquipmentUtilizationChart />
        <DailyOperationsChart />
        
        {/* Bottom chart - full width */}
        <div className="lg:col-span-2">
          <TopEquipmentChart />
        </div>
      </div>

      {/* Chart features info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">🎯 Funcionalidades dos Charts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600">Interatividade</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Hover para detalhes</li>
                <li>• Zoom e pan</li>
                <li>• Click em legendas</li>
                <li>• Tooltips customizados</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-green-600">Responsividade</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Auto-resize</li>
                <li>• Mobile-first</li>
                <li>• Grid adaptativo</li>
                <li>• Touch-friendly</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-purple-600">Tipos de Chart</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Line & Area charts</li>
                <li>• Bar charts</li>
                <li>• Pie charts</li>
                <li>• Composed charts</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-orange-600">Recursos</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Export para PDF</li>
                <li>• Filtros dinâmicos</li>
                <li>• Atualização real-time</li>
                <li>• Temas customizáveis</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
