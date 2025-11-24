import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

export default function DashboardBRA() {
  const stats = [
    { name: 'Equipamentos BRA', value: '127', icon: '📦', color: 'text-orange-600' },
    { name: 'Locações Ativas', value: '18', icon: '📄', color: 'text-blue-600' },
    { name: 'Orçamentos Pendentes', value: '5', icon: '📋', color: 'text-yellow-600' },
    { name: 'Receita Mensal', value: 'R$ 85.720', icon: '💰', color: 'text-green-600' }
  ]

  return (
    <div className="space-y-6">
      {/* Header Personalizado */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🏠 Dashboard BRA Locação</h1>
            <p className="text-orange-100 mt-1">Gestão completa de equipamentos - Fortaleza/CE</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-orange-100">Contato Rápido:</div>
            <div className="font-semibold">(85) 98900-2319</div>
            <div className="text-sm text-orange-100">contato@braloc.com.br</div>
          </div>
        </div>
      </div>

      {/* Stats com cores BRA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="border-l-4 border-orange-500">
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

      {/* Actions BRA */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-600">🚀 Ações Rápidas BRA</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start bg-orange-600 hover:bg-orange-700">
              ➕ Novo Orçamento
            </Button>
            <Button variant="outline" className="w-full justify-start border-orange-300 text-orange-600 hover:bg-orange-50">
              📦 Cadastrar Equipamento
            </Button>
            <Button variant="outline" className="w-full justify-start border-orange-300 text-orange-600 hover:bg-orange-50">
              👤 Novo Cliente
            </Button>
            <Button variant="outline" className="w-full justify-start border-orange-300 text-orange-600 hover:bg-orange-50">
              📞 WhatsApp (85) 98900-2319
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
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-800">3 equipamentos em manutenção</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-800">2 locações vencem hoje</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">📊 Performance BRA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Novos Clientes (mês):</span>
                <span className="font-medium">15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Contratos Fechados:</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Taxa de Conversão:</span>
                <span className="font-medium text-green-600">85%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Satisfação Cliente:</span>
                <span className="font-medium text-green-600">98%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Equipamentos em Destaque */}
      <Card>
        <CardHeader>
          <CardTitle className="text-orange-600">🔥 Equipamentos em Destaque - BRA Locação</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🏗️</span>
                <div>
                  <h4 className="font-semibold text-orange-800">Escavadeira CAT</h4>
                  <p className="text-sm text-orange-600">R$ 850/dia • Disponível</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h4 className="font-semibold text-orange-800">Gerador 50KVA</h4>
                  <p className="text-sm text-orange-600">R$ 120/dia • 3 disponíveis</p>
                </div>
              </div>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔨</span>
                <div>
                  <h4 className="font-semibold text-orange-800">Betoneira B350</h4>
                  <p className="text-sm text-orange-600">R$ 45/dia • 5 disponíveis</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Footer com contato */}
      <div className="bg-gray-50 rounded-lg p-4 border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">BRA</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">BRA Locação de Equipamentos</p>
              <p className="text-sm text-gray-500">Sistema de Gestão • Fortaleza/CE</p>
            </div>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>📞 (85) 98900-2319</p>
            <p>📧 contato@braloc.com.br</p>
          </div>
        </div>
      </div>
    </div>
  )
}
