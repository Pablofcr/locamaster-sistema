"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  CheckCircle,
  XCircle,
  Edit,
  Download,
  Send,
  FileText,
  User,
  Package,
  Calendar,
  DollarSign,
  Clock,
  Mail,
  Phone,
  MapPin,
  Building,
  ArrowRight,
  Printer
} from "lucide-react"

// Componentes simples internos
function Badge({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${className}`}>
      {children}
    </span>
  )
}

function Textarea({ value, onChange, placeholder, className = "" }: { 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, 
  placeholder?: string,
  className?: string 
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      rows={4}
    />
  )
}

interface OrcamentoDetalhes {
  id: string
  numero: string
  cliente: {
    nome: string
    email: string
    telefone: string
    endereco: string
    cnpj: string
  }
  itens: Array<{
    equipamento: string
    categoria: string
    quantidade: number
    dias: number
    valorUnitario: number
    subtotal: number
  }>
  subtotal: number
  desconto: number
  total: number
  status: "pendente" | "aprovado" | "recusado" | "vencido"
  dataOrcamento: string
  dataVencimento: string
  dataAprovacao?: string
  vendedor: string
  observacoes: string
  condicoes: string[]
}

export default function VisualizarOrcamentoPage() {
  const [motivoRecusa, setMotivoRecusa] = useState("")
  const [mostrarRecusa, setMostrarRecusa] = useState(false)

  // Mock data - em produção viria de API baseado no ID
  const orcamento: OrcamentoDetalhes = {
    id: "2024-001",
    numero: "ORC-2024-001", 
    cliente: {
      nome: "Construtora Alpha Ltda",
      email: "contato@alpha.com.br",
      telefone: "(11) 99999-1111",
      endereco: "Rua das Construções, 123 - São Paulo/SP",
      cnpj: "12.345.678/0001-90"
    },
    itens: [
      {
        equipamento: "Betoneira B350",
        categoria: "Concreto",
        quantidade: 2,
        dias: 15,
        valorUnitario: 45.00,
        subtotal: 1350.00
      },
      {
        equipamento: "Vibrador CV-2200", 
        categoria: "Concreto",
        quantidade: 1,
        dias: 15,
        valorUnitario: 25.00,
        subtotal: 375.00
      },
      {
        equipamento: "Gerador GEN-50D",
        categoria: "Energia", 
        quantidade: 1,
        dias: 10,
        valorUnitario: 120.00,
        subtotal: 1200.00
      }
    ],
    subtotal: 2925.00,
    desconto: 292.50, // 10%
    total: 2632.50,
    status: "pendente",
    dataOrcamento: "2024-01-15",
    dataVencimento: "2024-01-30",
    vendedor: "Pablo Silva",
    observacoes: "Entrega programada para segunda-feira. Equipamentos com manutenção em dia.",
    condicoes: [
      "Prazo de validade: 15 dias",
      "Entrega inclusa em São Paulo/Capital",
      "Pagamento: 50% antecipado + 50% em 30 dias",
      "Manutenção preventiva inclusa",
      "Seguro obrigatório do contratante"
    ]
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pendente: { label: "⏳ Pendente", color: "bg-yellow-100 text-yellow-800" },
      aprovado: { label: "✅ Aprovado", color: "bg-green-100 text-green-800" },
      recusado: { label: "❌ Recusado", color: "bg-red-100 text-red-800" },
      vencido: { label: "⏰ Vencido", color: "bg-gray-100 text-gray-800" }
    }
    return statusConfig[status as keyof typeof statusConfig]
  }

  const aprovarOrcamento = () => {
    // Aqui implementaria a aprovação
    alert("Orçamento aprovado! Contrato será gerado automaticamente.")
  }

  const recusarOrcamento = () => {
    if (!motivoRecusa.trim()) {
      alert("Por favor, informe o motivo da recusa.")
      return
    }
    // Aqui implementaria a recusa
    alert("Orçamento recusado. Cliente será notificado.")
    setMostrarRecusa(false)
  }

  const gerarContrato = () => {
    // Aqui implementaria a conversão para contrato
    alert("Convertendo orçamento em contrato...")
  }

  const enviarPorEmail = () => {
    alert("Orçamento enviado por email para " + orcamento.cliente.email)
  }

  const diasRestantes = Math.ceil(
    (new Date(orcamento.dataVencimento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  const statusBadge = getStatusBadge(orcamento.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FileText className="w-8 h-8 mr-3 text-blue-500" />
            {orcamento.numero}
          </h1>
          <p className="text-gray-600 mt-1">
            {orcamento.cliente.nome} • Criado em {new Date(orcamento.dataOrcamento).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {statusBadge && (
            <Badge className={statusBadge.color}>
              {statusBadge.label}
            </Badge>
          )}
          {diasRestantes > 0 && orcamento.status === "pendente" && (
            <Badge className="bg-orange-100 text-orange-700">
              ⏰ {diasRestantes} dias restantes
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detalhes do Orçamento */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Informações do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Dados do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{orcamento.cliente.nome}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{orcamento.cliente.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{orcamento.cliente.telefone}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                    <span className="text-gray-600">{orcamento.cliente.endereco}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{orcamento.cliente.cnpj}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Itens do Orçamento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-500" />
                Equipamentos Orçados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orcamento.itens.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-all duration-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{item.equipamento}</h4>
                        <p className="text-sm text-gray-600">Categoria: {item.categoria}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-700">
                          <span>Quantidade: <strong>{item.quantidade}x</strong></span>
                          <span>Período: <strong>{item.dias} dias</strong></span>
                          <span>Valor/dia: <strong>R$ {item.valorUnitario.toFixed(2)}</strong></span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          R$ {item.subtotal.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.quantidade} × {item.dias} × R$ {item.valorUnitario.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Observações e Condições */}
          {(orcamento.observacoes || orcamento.condicoes.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-500" />
                  Observações e Condições
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orcamento.observacoes && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Observações:</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{orcamento.observacoes}</p>
                  </div>
                )}
                
                {orcamento.condicoes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Condições Comerciais:</h4>
                    <ul className="space-y-1">
                      {orcamento.condicoes.map((condicao, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-gray-600">{condicao}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Área de Recusa */}
          {mostrarRecusa && (
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center text-red-700">
                  <XCircle className="w-5 h-5 mr-2" />
                  Motivo da Recusa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={motivoRecusa}
                  onChange={(e) => setMotivoRecusa(e.target.value)}
                  placeholder="Descreva o motivo da recusa do orçamento..."
                  className="border-red-200 focus:border-red-400"
                />
                <div className="flex space-x-3">
                  <Button
                    onClick={recusarOrcamento}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Confirmar Recusa
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setMostrarRecusa(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar - Resumo e Ações */}
        <div className="space-y-6">
          
          {/* Resumo Financeiro */}
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2 text-green-500" />
                Resumo Financeiro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">R$ {orcamento.subtotal.toFixed(2)}</span>
                </div>
                
                {orcamento.desconto > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Desconto:</span>
                    <span>-R$ {orcamento.desconto.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-xl font-bold pt-3 border-t">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {orcamento.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Informações de Prazo */}
              <div className="pt-4 border-t space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Válido até: {new Date(orcamento.dataVencimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Vendedor: {orcamento.vendedor}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              
              {/* Ações para orçamento pendente */}
              {orcamento.status === "pendente" && (
                <>
                  <Button 
                    onClick={aprovarOrcamento}
                    className="w-full bg-green-600 hover:bg-green-700 hover:scale-105 transition-all duration-200"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar Orçamento
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setMostrarRecusa(true)}
                    className="w-full hover:bg-red-50 hover:border-red-400 transition-colors"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Recusar Orçamento
                  </Button>
                </>
              )}

              {/* Ação para orçamento aprovado */}
              {orcamento.status === "aprovado" && (
                <Button 
                  onClick={gerarContrato}
                  className="w-full bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-all duration-200"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Gerar Contrato
                </Button>
              )}

              {/* Ações gerais */}
              <Button 
                variant="outline"
                onClick={enviarPorEmail}
                className="w-full hover:bg-blue-50 hover:border-blue-400 transition-colors"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar por Email
              </Button>
              
              <Button 
                variant="outline"
                className="w-full hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar PDF
              </Button>
              
              <Button 
                variant="outline"
                className="w-full hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
              
              <Button 
                variant="outline"
                className="w-full hover:bg-orange-50 hover:border-orange-400 transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar Orçamento
              </Button>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Orçamento criado</p>
                    <p className="text-xs text-gray-500">
                      {new Date(orcamento.dataOrcamento).toLocaleDateString('pt-BR')} às 14:30
                    </p>
                  </div>
                </div>
                
                {orcamento.status === "aprovado" && orcamento.dataAprovacao && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Orçamento aprovado</p>
                      <p className="text-xs text-gray-500">
                        {new Date(orcamento.dataAprovacao).toLocaleDateString('pt-BR')} às 09:15
                      </p>
                    </div>
                  </div>
                )}
                
                {orcamento.status === "pendente" && (
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Aguardando aprovação</p>
                      <p className="text-xs text-gray-500">
                        Enviado para {orcamento.cliente.email}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
