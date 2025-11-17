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
  Filter,
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Calendar,
  Users,
  Package
} from "lucide-react"

export default function OrcamentosPage() {
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [busca, setBusca] = useState("")

  // Mock data - em produção virá do banco de dados
  const metricas = [
    {
      titulo: "Total Orçamentos",
      valor: "23",
      mudanca: "+5",
      periodo: "este mês",
      icon: FileText,
      cor: "blue"
    },
    {
      titulo: "Valor Total",
      valor: "R$ 127.500",
      mudanca: "+15%",
      periodo: "vs mês anterior",
      icon: DollarSign,
      cor: "green"
    },
    {
      titulo: "Taxa Conversão",
      valor: "78%",
      mudanca: "+12%",
      periodo: "aprovados",
      icon: TrendingUp,
      cor: "purple"
    },
    {
      titulo: "Tempo Médio",
      valor: "2.3 dias",
      mudanca: "-0.8",
      periodo: "para aprovação",
      icon: Clock,
      cor: "orange"
    }
  ]

  const orcamentos = [
    {
      id: "2024-001",
      cliente: "Construtora Alpha Ltda",
      valor: 12500,
      equipamentos: ["Betoneira B350", "Vibrador CV-2200"],
      dataOrcamento: "2024-01-15",
      dataVencimento: "2024-01-25",
      status: "pendente",
      vendedor: "Pablo Silva"
    },
    {
      id: "2024-002", 
      cliente: "João Silva Santos",
      valor: 3200,
      equipamentos: ["Furadeira F-1200"],
      dataOrcamento: "2024-01-14",
      dataVencimento: "2024-01-24",
      status: "aprovado",
      vendedor: "Pablo Silva"
    },
    {
      id: "2024-003",
      cliente: "Beta Engenharia S/A",
      valor: 25000,
      equipamentos: ["Escavadeira CAT-320", "Guincho G-15T"],
      dataOrcamento: "2024-01-13", 
      dataVencimento: "2024-01-23",
      status: "recusado",
      vendedor: "Pablo Silva"
    },
    {
      id: "2024-004",
      cliente: "Construtora Horizonte",
      valor: 8750,
      equipamentos: ["Gerador GEN-50D"],
      dataOrcamento: "2024-01-12",
      dataVencimento: "2024-01-22", 
      status: "pendente",
      vendedor: "Pablo Silva"
    },
    {
      id: "2024-005",
      cliente: "Obras & Construções",
      valor: 15300,
      equipamentos: ["Compressor AC-500", "Britadeira BR-40"],
      dataOrcamento: "2024-01-11",
      dataVencimento: "2024-01-21",
      status: "aprovado", 
      vendedor: "Pablo Silva"
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: "Pendente", variant: "secondary" as const, color: "bg-yellow-100 text-yellow-800" },
      aprovado: { label: "Aprovado", variant: "default" as const, color: "bg-green-100 text-green-800" },
      recusado: { label: "Recusado", variant: "destructive" as const, color: "bg-red-100 text-red-800" },
      vencido: { label: "Vencido", variant: "outline" as const, color: "bg-gray-100 text-gray-800" }
    }
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pendente
  }

  const getCorMetrica = (cor: string) => {
    const cores = {
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200", 
      purple: "bg-purple-50 text-purple-600 border-purple-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200"
    }
    return cores[cor as keyof typeof cores] || cores.blue
  }

  const orcamentosFiltrados = orcamentos.filter(orc => {
    const matchStatus = filtroStatus === "todos" || orc.status === filtroStatus
    const matchBusca = orc.cliente.toLowerCase().includes(busca.toLowerCase()) ||
                      orc.id.toLowerCase().includes(busca.toLowerCase())
    return matchStatus && matchBusca
  })

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📋 Orçamentos
          </h1>
          <p className="text-gray-600 mt-1">Gerencie propostas e converta em contratos</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            className="hover:scale-105 hover:shadow-md hover:border-blue-400 transition-all duration-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
          <Button 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-105 hover:shadow-lg transition-all duration-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>
      </div>

      {/* Métricas Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricas.map((metrica, index) => (
          <Card 
            key={index} 
            className="border-l-4 hover:shadow-xl hover:scale-[1.02] transition-all duration-200 cursor-pointer group"
            style={{ borderLeftColor: metrica.cor === 'blue' ? '#3b82f6' : metrica.cor === 'green' ? '#10b981' : metrica.cor === 'purple' ? '#8b5cf6' : '#f59e0b' }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metrica.titulo}
              </CardTitle>
              <div className={`p-3 rounded-lg ${getCorMetrica(metrica.cor)} group-hover:scale-110 transition-transform duration-200`}>
                <metrica.icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 mb-2">{metrica.valor}</div>
              <div className="flex items-center text-sm">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-green-500 font-medium">{metrica.mudanca}</span>
                <span className="text-gray-500 ml-1">{metrica.periodo}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
            <CardTitle className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-500" />
              Lista de Orçamentos
            </CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Buscar por cliente ou número..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  className="pl-10 w-full sm:w-64 hover:border-blue-300 transition-colors"
                />
              </div>
              <div className="flex space-x-2">
                {["todos", "pendente", "aprovado", "recusado"].map((status) => (
                  <Button
                    key={status}
                    variant={filtroStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFiltroStatus(status)}
                    className="hover:scale-105 transition-transform capitalize"
                  >
                    {status === "todos" ? "Todos" : status}
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
                  className="border rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all duration-200 cursor-pointer"
                >
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-3 lg:space-y-0">
                    {/* Info Principal */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-semibold text-lg">#{orcamento.id}</h3>
                        <Badge className={statusConfig.color}>
                          {statusConfig.label}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="font-medium">{orcamento.cliente}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Package className="w-4 h-4" />
                        <span className="text-sm">{orcamento.equipamentos.join(", ")}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Criado: {new Date(orcamento.dataOrcamento).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>Vence: {new Date(orcamento.dataVencimento).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Valor e Ações */}
                    <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-6">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {orcamento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </div>
                        <div className="text-sm text-gray-500">
                          Vendedor: {orcamento.vendedor}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm" 
                          className="hover:bg-blue-50 hover:border-blue-400 hover:scale-105 transition-all duration-200"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="hover:bg-green-50 hover:border-green-400 hover:scale-105 transition-all duration-200"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        {orcamento.status === "pendente" && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-green-50 hover:border-green-400 hover:scale-105 transition-all duration-200"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Aprovar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="hover:bg-red-50 hover:border-red-400 hover:scale-105 transition-all duration-200"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Recusar
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

          {/* Estatísticas do Filtro */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>
                Mostrando {orcamentosFiltrados.length} de {orcamentos.length} orçamentos
              </span>
              <span>
                Valor total filtrado: {orcamentosFiltrados.reduce((acc, orc) => acc + orc.valor, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
