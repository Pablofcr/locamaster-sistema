import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function Dashboard() {
  const stats = [
    { name: 'Total Equipamentos', value: '127', icon: '📦', color: 'text-blue-600' },
    { name: 'Locações Ativas', value: '18', icon: '📄', color: 'text-green-600' },
    { name: 'Orçamentos Pendentes', value: '5', icon: '📋', color: 'text-yellow-600' },
    { name: 'Receita Mensal', value: 'R$ 45.720', icon: '💰', color: 'text-emerald-600' }
  ]

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🏠 Dashboard</h1>
            <p className="text-blue-100 mt-1">Visão geral do seu negócio</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">Sistema:</div>
            <div className="font-semibold">LocaSys Pro</div>
            <div className="text-sm text-blue-100">Gestão Completa</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-l-4 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className="text-3xl">{stat.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">🚀 Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
              ➕ Novo Orçamento
            </Button>
            <Button variant="outline" className="w-full justify-start border-blue-300 text-blue-600 hover:bg-blue-50">
              📦 Adicionar Equipamento
            </Button>
            <Button variant="outline" className="w-full justify-start border-blue-300 text-blue-600 hover:bg-blue-50">
              👤 Novo Cliente
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">⚠️ Atenção Necessária</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">5 orçamentos aguardando aprovação</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-800">2 equipamentos em manutenção</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">3 locações vencem hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">📊 Resumo Mensal</CardTitle>
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
              <div className="flex justify-between">
                <span className="text-gray-600">Satisfação:</span>
                <span className="font-medium text-green-600">95%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}