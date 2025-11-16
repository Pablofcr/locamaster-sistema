"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { usePDF, InvoiceData, ContractData } from "@/lib/pdf-generator"
import { useToast } from "@/lib/notifications"
import { 
  Download, 
  Eye, 
  FileText, 
  Printer,
  Loader2,
  Receipt,
  FileSignature
} from "lucide-react"

// Mock data para demonstração
const sampleInvoiceData: InvoiceData = {
  id: "inv_001",
  number: "FAT-2024-1001",
  issueDate: "2024-11-12",
  dueDate: "2024-11-27",
  customer: {
    name: "Construtora Alpha Ltda",
    email: "contato@construtoraalpha.com.br",
    document: "12.345.678/0001-90",
    address: "Rua das Obras, 123 - São Paulo, SP - CEP: 01234-567"
  },
  items: [
    {
      description: "Locação Betoneira 400L Industrial - 15 dias",
      quantity: 15,
      unitPrice: 120.00,
      total: 1800.00
    },
    {
      description: "Locação Gerador Diesel 50kVA - 10 dias", 
      quantity: 10,
      unitPrice: 300.00,
      total: 3000.00
    },
    {
      description: "Taxa de transporte e instalação",
      quantity: 1,
      unitPrice: 250.00,
      total: 250.00
    }
  ],
  subtotal: 5050.00,
  taxes: 555.50,
  total: 5605.50,
  notes: "Pagamento via PIX ou transferência bancária. Em caso de atraso, será cobrada multa de 2% + juros de 1% ao mês."
}

const sampleContractData: ContractData = {
  id: "ctr_001",
  number: "LM-2024-1234",
  startDate: "2024-11-01",
  endDate: "2024-11-15",
  customer: {
    name: "João Silva Santos",
    email: "joao@construtoraalpha.com.br",
    document: "123.456.789-00",
    address: "Rua das Construções, 456 - São Paulo, SP - CEP: 01234-567"
  },
  equipment: {
    name: "Betoneira 400L Industrial",
    model: "BT-400 Makita",
    serialNumber: "MAK240001123",
    dailyPrice: 120.00
  },
  totalDays: 15,
  totalAmount: 1800.00,
  status: "Ativo",
  terms: [
    "O locatário se responsabiliza pela guarda e conservação do equipamento durante todo o período de locação.",
    "Qualquer dano causado ao equipamento será cobrado do locatário conforme tabela de preços em vigor.",
    "O equipamento deve ser devolvido nas mesmas condições em que foi retirado, limpo e em perfeitas condições de funcionamento.",
    "Em caso de furto ou roubo, o locatário deverá ressarcir o valor integral do equipamento conforme nota fiscal de compra.",
    "O pagamento da locação deverá ser efetuado até a data de vencimento especificada na fatura.",
    "Em caso de atraso no pagamento, serão cobrados juros de mora de 1% ao mês e multa de 2%.",
    "O locatário declara ter recebido o equipamento em perfeitas condições de funcionamento.",
    "É de responsabilidade do locatário o combustível e manutenção preventiva básica (óleo, filtros, etc).",
    "Não é permitido o subloc do equipamento sem autorização prévia por escrito da locadora.",
    "Este contrato entra em vigor na data de assinatura e permanece válido durante todo o período especificado."
  ]
}

export function PDFGeneratorDemo() {
  const [isGenerating, setIsGenerating] = useState(false)
  const { generateInvoicePDF, generateContractPDF } = usePDF()
  const toast = useToast()

  const handleGenerateInvoice = async (action: 'download' | 'preview') => {
    setIsGenerating(true)
    try {
      await generateInvoicePDF(sampleInvoiceData, action)
      
      toast.success(`Fatura ${sampleInvoiceData.number} gerada!`)
      
      if (action === 'download') {
        toast.success('PDF da fatura baixado com sucesso!')
      } else {
        toast.info('PDF da fatura aberto em nova aba')
      }
    } catch (error) {
      toast.error('Erro ao gerar PDF da fatura')
      console.error('PDF Error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateContract = async (action: 'download' | 'preview') => {
    setIsGenerating(true)
    try {
      await generateContractPDF(sampleContractData, action)
      
      toast.success(`Contrato ${sampleContractData.number} gerado!`)
      
      if (action === 'download') {
        toast.success('PDF do contrato baixado com sucesso!')
      } else {
        toast.info('PDF do contrato aberto em nova aba')
      }
    } catch (error) {
      toast.error('Erro ao gerar PDF do contrato')
      console.error('PDF Error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-blue-600" />
            Gerador de PDF - Demonstração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Fatura */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Receipt className="h-5 w-5 mr-2 text-green-600" />
                  Fatura {sampleInvoiceData.number}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm space-y-2">
                    <p><strong>Cliente:</strong> {sampleInvoiceData.customer.name}</p>
                    <p><strong>Emissão:</strong> {new Date(sampleInvoiceData.issueDate).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Vencimento:</strong> {new Date(sampleInvoiceData.dueDate).toLocaleDateString('pt-BR')}</p>
                    <p><strong>Valor Total:</strong> {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(sampleInvoiceData.total)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => handleGenerateInvoice('preview')}
                      variant="outline" 
                      size="sm"
                      disabled={isGenerating}
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    
                    <Button 
                      onClick={() => handleGenerateInvoice('download')}
                      size="sm"
                      disabled={isGenerating}
                      className="flex items-center"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-1" />
                      )}
                      Baixar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contrato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <FileSignature className="h-5 w-5 mr-2 text-purple-600" />
                  Contrato {sampleContractData.number}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-sm space-y-2">
                    <p><strong>Cliente:</strong> {sampleContractData.customer.name}</p>
                    <p><strong>Equipamento:</strong> {sampleContractData.equipment.name}</p>
                    <p><strong>Período:</strong> {sampleContractData.totalDays} dias</p>
                    <p><strong>Valor Total:</strong> {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(sampleContractData.totalAmount)}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => handleGenerateContract('preview')}
                      variant="outline" 
                      size="sm"
                      disabled={isGenerating}
                      className="flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Button>
                    
                    <Button 
                      onClick={() => handleGenerateContract('download')}
                      size="sm"
                      disabled={isGenerating}
                      className="flex items-center"
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-1" />
                      )}
                      Baixar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Informações */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
              <Printer className="h-4 w-4 mr-2" />
              Funcionalidades do Gerador de PDF
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ <strong>Geração automática</strong> de faturas e contratos</li>
              <li>✅ <strong>Preview</strong> em nova aba antes do download</li>
              <li>✅ <strong>Layout profissional</strong> com dados da empresa</li>
              <li>✅ <strong>Cálculos automáticos</strong> de impostos e totais</li>
              <li>✅ <strong>Assinaturas digitais</strong> e termos legais</li>
              <li>✅ <strong>Compatível</strong> com todos os dispositivos</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
