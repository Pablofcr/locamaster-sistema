import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export interface InvoiceData {
  id: string
  number: string
  issueDate: string
  dueDate: string
  customer: {
    name: string
    email: string
    document: string
    address: string
  }
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  taxes: number
  total: number
  notes?: string
}

export interface ContractData {
  id: string
  number: string
  startDate: string
  endDate: string
  customer: {
    name: string
    email: string
    document: string
    address: string
  }
  equipment: {
    name: string
    model: string
    serialNumber: string
    dailyPrice: number
  }
  totalDays: number
  totalAmount: number
  terms: string[]
  status: string
}

class PDFGenerator {
  private createHeader(doc: jsPDF, title: string) {
    // Logo e cabeçalho
    doc.setFillColor(59, 130, 246) // Blue-600
    doc.rect(0, 0, 210, 30, 'F')
    
    // Logo text
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('LocaMaster Pro', 15, 20)
    
    // Título do documento
    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text(title, 15, 25)
    
    // Informações da empresa (lado direito)
    doc.setFontSize(10)
    doc.text('CNPJ: 12.345.678/0001-90', 150, 15)
    doc.text('Tel: (11) 3000-1000', 150, 20)
    doc.text('contato@locamaster.com.br', 150, 25)
    
    return 40 // Retorna Y position para próximo conteúdo
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  private formatDate(date: string): string {
    return new Date(date).toLocaleDateString('pt-BR')
  }

  async generateInvoice(data: InvoiceData): Promise<Blob> {
    const doc = new jsPDF()
    
    // Cabeçalho
    let yPos = this.createHeader(doc, `FATURA ${data.number}`)
    
    // Reset cor do texto
    doc.setTextColor(0, 0, 0)
    
    // Informações da fatura
    yPos += 10
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DADOS DA FATURA', 15, yPos)
    
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Número: ${data.number}`, 15, yPos)
    doc.text(`Emissão: ${this.formatDate(data.issueDate)}`, 70, yPos)
    doc.text(`Vencimento: ${this.formatDate(data.dueDate)}`, 130, yPos)
    
    // Dados do cliente
    yPos += 15
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DADOS DO CLIENTE', 15, yPos)
    
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nome: ${data.customer.name}`, 15, yPos)
    yPos += 5
    doc.text(`Documento: ${data.customer.document}`, 15, yPos)
    yPos += 5
    doc.text(`Email: ${data.customer.email}`, 15, yPos)
    yPos += 5
    doc.text(`Endereço: ${data.customer.address}`, 15, yPos)
    
    // Tabela de itens
    yPos += 15
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('ITENS DA FATURA', 15, yPos)
    
    // Cabeçalho da tabela
    yPos += 8
    doc.setFillColor(240, 240, 240)
    doc.rect(15, yPos - 3, 180, 8, 'F')
    
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('DESCRIÇÃO', 20, yPos + 2)
    doc.text('QTD', 130, yPos + 2)
    doc.text('VALOR UNIT.', 150, yPos + 2)
    doc.text('TOTAL', 175, yPos + 2)
    
    // Itens
    yPos += 10
    doc.setFont('helvetica', 'normal')
    data.items.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250)
        doc.rect(15, yPos - 3, 180, 6, 'F')
      }
      
      doc.text(item.description, 20, yPos)
      doc.text(item.quantity.toString(), 135, yPos)
      doc.text(this.formatCurrency(item.unitPrice), 150, yPos)
      doc.text(this.formatCurrency(item.total), 175, yPos)
      
      yPos += 6
    })
    
    // Totais
    yPos += 10
    doc.setDrawColor(200, 200, 200)
    doc.line(130, yPos, 195, yPos)
    
    yPos += 6
    doc.setFont('helvetica', 'normal')
    doc.text('Subtotal:', 130, yPos)
    doc.text(this.formatCurrency(data.subtotal), 175, yPos)
    
    yPos += 6
    doc.text('Impostos:', 130, yPos)
    doc.text(this.formatCurrency(data.taxes), 175, yPos)
    
    yPos += 6
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', 130, yPos)
    doc.text(this.formatCurrency(data.total), 175, yPos)
    
    // Observações
    if (data.notes) {
      yPos += 15
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('OBSERVAÇÕES:', 15, yPos)
      
      yPos += 6
      doc.setFont('helvetica', 'normal')
      const splitNotes = doc.splitTextToSize(data.notes, 170)
      doc.text(splitNotes, 15, yPos)
    }
    
    // Rodapé
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('Este documento foi gerado automaticamente pelo sistema LocaMaster Pro', 15, 280)
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 285)
    
    return doc.output('blob')
  }

  async generateContract(data: ContractData): Promise<Blob> {
    const doc = new jsPDF()
    
    // Cabeçalho
    let yPos = this.createHeader(doc, `CONTRATO ${data.number}`)
    
    // Reset cor do texto
    doc.setTextColor(0, 0, 0)
    
    // Título do contrato
    yPos += 10
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('CONTRATO DE LOCAÇÃO DE EQUIPAMENTOS', 15, yPos)
    
    // Dados do contrato
    yPos += 15
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('DADOS DO CONTRATO', 15, yPos)
    
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Número: ${data.number}`, 15, yPos)
    doc.text(`Status: ${data.status}`, 100, yPos)
    
    yPos += 5
    doc.text(`Início: ${this.formatDate(data.startDate)}`, 15, yPos)
    doc.text(`Término: ${this.formatDate(data.endDate)}`, 100, yPos)
    
    yPos += 5
    doc.text(`Período: ${data.totalDays} dias`, 15, yPos)
    doc.text(`Valor Total: ${this.formatCurrency(data.totalAmount)}`, 100, yPos)
    
    // Dados do cliente (LOCATÁRIO)
    yPos += 15
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('LOCATÁRIO', 15, yPos)
    
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Nome: ${data.customer.name}`, 15, yPos)
    yPos += 5
    doc.text(`Documento: ${data.customer.document}`, 15, yPos)
    yPos += 5
    doc.text(`Email: ${data.customer.email}`, 15, yPos)
    yPos += 5
    doc.text(`Endereço: ${data.customer.address}`, 15, yPos)
    
    // Dados do equipamento
    yPos += 15
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('EQUIPAMENTO LOCADO', 15, yPos)
    
    yPos += 8
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Equipamento: ${data.equipment.name}`, 15, yPos)
    yPos += 5
    doc.text(`Modelo: ${data.equipment.model}`, 15, yPos)
    yPos += 5
    doc.text(`Nº Série: ${data.equipment.serialNumber}`, 15, yPos)
    yPos += 5
    doc.text(`Valor Diário: ${this.formatCurrency(data.equipment.dailyPrice)}`, 15, yPos)
    
    // Termos e condições
    yPos += 15
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TERMOS E CONDIÇÕES', 15, yPos)
    
    yPos += 8
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    data.terms.forEach((term, index) => {
      const termText = `${index + 1}. ${term}`
      const splitTerm = doc.splitTextToSize(termText, 170)
      doc.text(splitTerm, 15, yPos)
      yPos += splitTerm.length * 4 + 2
    })
    
    // Assinaturas
    yPos += 20
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    
    // Linha para assinatura locador
    doc.line(15, yPos, 80, yPos)
    doc.text('LOCADOR', 15, yPos + 8)
    doc.setFont('helvetica', 'normal')
    doc.text('LocaMaster Pro Ltda', 15, yPos + 12)
    doc.text('CNPJ: 12.345.678/0001-90', 15, yPos + 16)
    
    // Linha para assinatura locatário
    doc.line(110, yPos, 180, yPos)
    doc.setFont('helvetica', 'bold')
    doc.text('LOCATÁRIO', 110, yPos + 8)
    doc.setFont('helvetica', 'normal')
    doc.text(data.customer.name, 110, yPos + 12)
    doc.text(data.customer.document, 110, yPos + 16)
    
    // Rodapé
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text('Este contrato foi gerado automaticamente pelo sistema LocaMaster Pro', 15, 280)
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 15, 285)
    
    return doc.output('blob')
  }

  // Gerar PDF a partir de elemento HTML
  async generateFromElement(element: HTMLElement, filename: string): Promise<Blob> {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF()
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }
    
    return pdf.output('blob')
  }

  // Baixar PDF
  downloadPDF(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Preview PDF em nova aba
  previewPDF(blob: Blob) {
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank')
  }
}

export const pdfGenerator = new PDFGenerator()

// Hook para usar geração de PDF
export const usePDF = () => {
  const generateInvoicePDF = async (data: InvoiceData, action: 'download' | 'preview' = 'download') => {
    try {
      const blob = await pdfGenerator.generateInvoice(data)
      const filename = `fatura-${data.number}.pdf`
      
      if (action === 'download') {
        pdfGenerator.downloadPDF(blob, filename)
      } else {
        pdfGenerator.previewPDF(blob)
      }
      
      return blob
    } catch (error) {
      console.error('Erro ao gerar PDF da fatura:', error)
      throw error
    }
  }

  const generateContractPDF = async (data: ContractData, action: 'download' | 'preview' = 'download') => {
    try {
      const blob = await pdfGenerator.generateContract(data)
      const filename = `contrato-${data.number}.pdf`
      
      if (action === 'download') {
        pdfGenerator.downloadPDF(blob, filename)
      } else {
        pdfGenerator.previewPDF(blob)
      }
      
      return blob
    } catch (error) {
      console.error('Erro ao gerar PDF do contrato:', error)
      throw error
    }
  }

  const generateElementPDF = async (element: HTMLElement, filename: string, action: 'download' | 'preview' = 'download') => {
    try {
      const blob = await pdfGenerator.generateFromElement(element, filename)
      
      if (action === 'download') {
        pdfGenerator.downloadPDF(blob, filename)
      } else {
        pdfGenerator.previewPDF(blob)
      }
      
      return blob
    } catch (error) {
      console.error('Erro ao gerar PDF do elemento:', error)
      throw error
    }
  }

  return {
    generateInvoicePDF,
    generateContractPDF,
    generateElementPDF
  }
}
