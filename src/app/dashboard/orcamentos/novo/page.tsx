"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Textarea } from "@/components/ui/Textarea"

export default function NovoOrcamentoPage() {
  const [formData, setFormData] = useState({
    cliente: '',
    equipamento: '',
    quantidade: 1,
    dias: 1,
    observacoes: ''
  })

  const clientes = [
    { value: '1', label: 'Construtora Alpha Ltda' },
    { value: '2', label: 'João Silva Santos' },
    { value: '3', label: 'Beta Engenharia S/A' },
    { value: '4', label: 'Construtora Horizonte' }
  ]

  const equipamentos = [
    { value: '1', label: 'Betoneira B350 - R$ 45,00/dia' },
    { value: '2', label: 'Escavadeira CAT-320 - R$ 850,00/dia' },
    { value: '3', label: 'Gerador GEN-50D - R$ 120,00/dia' },
    { value: '4', label: 'Vibrador CV-2200 - R$ 25,00/dia' }
  ]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Orçamento criado com sucesso! (Demonstração)')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📋 Novo Orçamento</h1>
        <p className="text-gray-600 mt-1">Crie uma proposta para seu cliente</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>👤 Dados do Cliente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Cliente"
                  options={clientes}
                  value={formData.cliente}
                  onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                  required
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📦 Equipamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Select
                    label="Equipamento"
                    options={equipamentos}
                    value={formData.equipamento}
                    onChange={(e) => setFormData({...formData, equipamento: e.target.value})}
                    required
                  />
                  <Input
                    label="Quantidade"
                    type="number"
                    min="1"
                    value={formData.quantidade}
                    onChange={(e) => setFormData({...formData, quantidade: parseInt(e.target.value)})}
                    required
                  />
                  <Input
                    label="Dias"
                    type="number" 
                    min="1"
                    value={formData.dias}
                    onChange={(e) => setFormData({...formData, dias: parseInt(e.target.value)})}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📝 Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  label="Observações"
                  placeholder="Condições especiais, instruções de entrega..."
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                />
              </CardContent>
            </Card>
          </form>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>💰 Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Equipamento:</span>
                  <span>1x Betoneira B350</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Período:</span>
                  <span>{formData.dias} dias</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor/dia:</span>
                  <span>R$ 45,00</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">R$ {(45 * formData.quantidade * formData.dias).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button type="submit" className="w-full">
                  💾 Gerar Orçamento
                </Button>
                <Button variant="outline" className="w-full">
                  📄 Salvar Rascunho  
                </Button>
              </div>

              <div className="text-sm text-gray-600 space-y-1">
                <p>📅 Prazo: 15 dias</p>
                <p>🚚 Entrega: Inclusa</p>
                <p>💳 Pagamento: À vista ou parcelado</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
