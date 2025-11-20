"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Badge } from "@/components/ui/Badge"

export default function OrcamentosPage() {
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [busca, setBusca] = useState("")

  // Mock data
  const metricas = [
    { titulo: "Total Orçamentos", valor: "23", mudanca: "+5", icon: "📋" },
    { titulo: "Valor Total", valor: "R$ 127.500", mudanca: "+15%", icon: "💰" },
    { titulo: "Taxa Conversão", valor: "78%", mudanca: "+12%", icon: "📈" },
    { titulo: "Tempo Médio", valor: "2.3 dias", mudanca: "-0.8", icon: "⏰" }
  ]

  const orcamentos = [
    {
      id: "2024-001",
      cliente: "Construtora Alpha Ltda",
      valor: 12500,
      equipamentos: "Betoneira B350, Vibrador CV-2200",
      data: "15/01/2024",
      vencimento: "25/01/2024", 
      status: "pendente",
      vendedor: "Pablo Silva"
    },
    {
      id: "2024-002",
      cliente: "João Silva Santos", 
      valor: 3200,
      equipamentos: "Furadeira F-1200",
      data: "14/01/2024",
      vencimento: "24/01/2024",
      status: "aprovado",
      vendedor: "Pablo Silva"
    },
    {
      id: "2024-003",
      cliente: "Beta Engenharia S/A",
      valor: 25000,
      equipamentos: "Escavadeira CAT-320, Guincho G-15T", 
      data: "13/01/2024",
      vencimento: "23/01/2024",
      status: "recusado",
      vendedor: "Pablo Silva"
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: "Pendente", variant: "warning" as const },
      aprovado: { label: "Aprovado", variant: "success" as const },
      recusado: { label: "Recusado", variant: "danger" as const }
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente
  }

  const orcamentosFiltrados = orcamentos.filter(orc => {
    const matchStatus = filtroStatus === "todos" || orc.status === filtroStatus
    const matchBusca = orc.cliente.toLowerCase().includes(busca.toLowerCase()) ||
                      orc.id.toLowerCase().includes(busca.toLowerCase())
    return matchStatus && matchBusca
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📋 Orçamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie propostas e converta em contratos</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">🔍 Filtros</Button>
          <Button>➕ Novo Orçamento</Button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricas.map((metrica, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metrica.titulo}</p>
                  <p className="text-2xl font-bold text-gray-900">{metrica.valor}</p>
                  <p className="text-sm text-green-600">
                    📈 {metrica.mudanca} vs mês anterior
                  </p>
                </div>
                <div className="text-3xl">{metrica.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista de Orçamentos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle>Lista de Orçamentos</CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <Input
                placeholder="🔍 Buscar por cliente ou número..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="sm:w-64"
              />
              <div className="flex space-x-2">
                {["todos", "pendente", "aprovado", "recusado"].map((status) => (
                  <Button
                    key={status}
                    variant={filtroStatus === status ? "primary" : "outline"}
                    size="sm"
                    onClick={() => setFiltroStatus(status)}
                  >
                    {status === "todos" ? "Todos" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orcamentosFiltrados.map((orcamento) => {
              const statusConfig = getStatusBadge(orcamento.status)
              return (
                <div 
                  key={orcamento.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-3 lg:space-y-0">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">#{orcamento.id}</h3>
                        <Badge variant={statusConfig.variant}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <p className="text-gray-800 font-medium">👤 {orcamento.cliente}</p>
                      <p className="text-gray-600">📦 {orcamento.equipamentos}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span>📅 {orcamento.data}</span>
                        <span>⏰ Vence: {orcamento.vencimento}</span>
                        <span>👨‍💼 {orcamento.vendedor}</span>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {orcamento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          👁️ Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          ✏️ Editar
                        </Button>
                        {orcamento.status === "pendente" && (
                          <>
                            <Button variant="primary" size="sm">
                              ✅ Aprovar
                            </Button>
                            <Button variant="danger" size="sm">
                              ❌ Recusar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                Mostrando {orcamentosFiltrados.length} de {orcamentos.length} orçamentos
              </span>
              <span>
                Valor total: {orcamentosFiltrados.reduce((acc, orc) => acc + orc.valor, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
