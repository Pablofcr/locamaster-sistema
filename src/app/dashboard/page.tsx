import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function DashboardPage() {
  const stats = [
    { name: 'Total Equipamentos', value: '127', icon: '📦' },
    { name: 'Locações Ativas', value: '18', icon: '📄' },
    { name: 'Orçamentos Pendentes', value: '5', icon: '📋' },
    { name: 'Receita Mensal', value: 'R$ 45.720', icon: '💰' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">🏠 Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do seu negócio</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>📋 Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              ➕ Novo Orçamento
            </Button>
            <Button variant="outline" className="w-full justify-start">
              📦 Adicionar Equipamento
            </Button>
            <Button variant="outline" className="w-full justify-start">
              👤 Novo Cliente
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⚠️ Atenção Necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm font-medium text-yellow-800">5 orçamentos aguardando aprovação</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <p className="text-sm font-medium text-red-800">2 equipamentos em manutenção</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800">3 locações vencem hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Resumo Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Novos Clientes:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contratos Fechados:</span>
                <span className="font-medium">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa de Conversão:</span>
                <span className="font-medium text-green-600">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
