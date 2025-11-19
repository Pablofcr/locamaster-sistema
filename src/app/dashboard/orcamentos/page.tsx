"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  DollarSign, 
  Clock, 
  TrendingUp,
  Search,
  Plus,
  Eye,
  Edit
} from "lucide-react"

export default function OrcamentosPage() {
  const [busca, setBusca] = useState("")

  const orcamentos = [
    {
      id: "2024-001",
      cliente: "Construtora Alpha Ltda",
      valor: 12500,
      status: "pendente",
      data: "15/01/2024"
    },
    {
      id: "2024-002", 
      cliente: "João Silva Santos",
      valor: 3200,
      status: "aprovado",
      data: "14/01/2024"
    },
    {
      id: "2024-003",
      cliente: "Beta Engenharia S/A",
      valor: 25000,
      status: "recusado",
      data: "13/01/2024"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente": return "secondary"
      case "aprovado": return "default"
      case "recusado": return "destructive"
      default: return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600">Gerencie propostas e converta em contratos</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Orçamento
        </Button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orçamentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">+5 este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 127.500</div>
            <p className="text-xs text-muted-foreground">+15% vs mês anterior</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa Conversão</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">+12% aprovados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 dias</div>
            <p className="text-xs text-muted-foreground">para aprovação</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Orçamentos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Orçamentos</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar orçamentos..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orcamentos.map((orcamento) => (
              <div key={orcamento.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold">#{orcamento.id}</h3>
                      <Badge variant={getStatusColor(orcamento.status)}>
                        {orcamento.status}
                      </Badge>
                    </div>
                    <p className="text-gray-600">{orcamento.cliente}</p>
                    <p className="text-sm text-gray-500">{orcamento.data}</p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        {orcamento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
