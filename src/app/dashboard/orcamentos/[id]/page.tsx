import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"

export default function VisualizarOrcamentoPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Orçamento #2024-001</h1>
          <p className="text-gray-600">Construtora Alpha Ltda • 15/01/2024</p>
        </div>
        <Badge variant="warning">⏳ Pendente</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>👤 Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Nome:</strong> Construtora Alpha Ltda</p>
                <p><strong>Email:</strong> contato@alpha.com.br</p>
                <p><strong>Telefone:</strong> (11) 99999-1111</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📦 Equipamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border rounded p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Betoneira B350</h4>
                      <p className="text-sm text-gray-600">2x • 15 dias • R$ 45,00/dia</p>
                    </div>
                    <span className="font-bold">R$ 1.350,00</span>
                  </div>
                </div>
                <div className="border rounded p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">Vibrador CV-2200</h4>
                      <p className="text-sm text-gray-600">1x • 15 dias • R$ 25,00/dia</p>
                    </div>
                    <span className="font-bold">R$ 375,00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>💰 Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ 1.725,00</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span className="text-green-600">R$ 1.725,00</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full">
                  ✅ Aprovar
                </Button>
                <Button variant="danger" className="w-full">
                  ❌ Recusar
                </Button>
                <Button variant="outline" className="w-full">
                  ✏️ Editar
                </Button>
                <Button variant="outline" className="w-full">
                  📧 Enviar Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
