import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export interface DadosFatura {
  numero: string
  data_emissao: string
  data_vencimento: string
  tipo: string
  parcela_numero?: number
  parcela_total?: number
  periodo_referencia?: string
  forma_pagamento?: string
  observacoes?: string
  // Cliente
  cliente_nome: string
  cliente_documento?: string
  cliente_email?: string
  cliente_telefone?: string
  // Locação
  locacao_numero?: string
  locacao_data_inicio?: string
  locacao_data_fim?: string
  periodo_medicao?: string
  // Itens
  itens: {
    equipamento_nome: string
    equipamento_marca?: string
    equipamento_modelo?: string
    quantidade: number
    valor_unitario: number
    subtotal: number
  }[]
  // Valores
  valor_original: number
  valor_desconto: number
  valor_juros: number
  valor_multa: number
  valor_total: number
  valor_pago: number
}

export interface DadosEmpresaFatura {
  razao_social: string
  nome_fantasia?: string | null
  cnpj?: string | null
  email?: string | null
  telefone?: string | null
  logo_base64?: string | null
}

export interface ConfigPagamento {
  pix_chave?: string
  pix_tipo?: string
  banco_nome?: string
  banco_agencia?: string
  banco_conta?: string
  banco_titular?: string
  juros_mora?: number
  multa_atraso?: number
}

// Cores do template (mesmas do orçamento)
const AZUL = [37, 99, 235] as const
const CINZA_ESCURO = [55, 65, 81] as const
const CINZA = [107, 114, 128] as const
const BRANCO = [255, 255, 255] as const

function formatarMoeda(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatarData(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR')
}

export function gerarPDFFatura(dados: DadosFatura, empresa?: DadosEmpresaFatura, config?: ConfigPagamento) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const nomeFantasia = empresa?.nome_fantasia || empresa?.razao_social || 'Empresa'
  const razaoSocial = empresa?.razao_social || 'Empresa'
  const cnpj = empresa?.cnpj || ''
  const emailEmpresa = empresa?.email || ''
  const telefoneEmpresa = empresa?.telefone || ''

  // ============ HEADER ============
  if (empresa?.logo_base64) {
    try {
      doc.addImage(empresa.logo_base64, 'PNG', margin, y, 22, 24)
    } catch { /* skip logo */ }
  }

  const textX = empresa?.logo_base64 ? margin + 25 : margin
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text(nomeFantasia.toUpperCase(), textX, y + 8)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA)
  doc.text(razaoSocial.toUpperCase(), textX, y + 14)

  // Titulo FATURA (direita)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...AZUL)
  doc.text('FATURA', pageWidth - margin, y + 8, { align: 'right' })

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA)
  doc.text(`N. ${dados.numero}`, pageWidth - margin, y + 15, { align: 'right' })

  if (dados.parcela_numero && dados.parcela_total) {
    doc.setFontSize(9)
    doc.text(`Parcela ${dados.parcela_numero}/${dados.parcela_total}`, pageWidth - margin, y + 21, { align: 'right' })
  }

  y += 30

  // Linha separadora
  doc.setDrawColor(...AZUL)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  // ============ INFO BOXES ============
  const boxWidth = (contentWidth - 6) / 2
  const boxStartY = y
  const labelOffset = 22

  // Box LOCADORA (esquerda)
  doc.setFillColor(...AZUL)
  doc.roundedRect(margin, y, boxWidth, 8, 1, 1, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRANCO)
  doc.text('LOCADORA', margin + 3, y + 5.5)

  doc.setTextColor(...CINZA_ESCURO)
  doc.setFontSize(7)
  const locY = y + 12
  doc.setFont('helvetica', 'bold'); doc.text('Razao Social:', margin + 3, locY)
  doc.setFont('helvetica', 'normal'); doc.text(razaoSocial, margin + 3 + labelOffset, locY)
  doc.setFont('helvetica', 'bold'); doc.text('CNPJ:', margin + 3, locY + 5)
  doc.setFont('helvetica', 'normal'); doc.text(cnpj, margin + 3 + labelOffset, locY + 5)
  doc.setFont('helvetica', 'bold'); doc.text('E-mail:', margin + 3, locY + 10)
  doc.setFont('helvetica', 'normal'); doc.text(emailEmpresa, margin + 3 + labelOffset, locY + 10)
  doc.setFont('helvetica', 'bold'); doc.text('Telefone:', margin + 3, locY + 15)
  doc.setFont('helvetica', 'normal'); doc.text(telefoneEmpresa, margin + 3 + labelOffset, locY + 15)

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, y, boxWidth, 30, 1, 1, 'S')

  // Box LOCATARIA (direita)
  const rightX = margin + boxWidth + 6
  doc.setFillColor(...AZUL)
  doc.roundedRect(rightX, y, boxWidth, 8, 1, 1, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRANCO)
  doc.text('LOCATARIA', rightX + 3, y + 5.5)

  doc.setTextColor(...CINZA_ESCURO)
  doc.setFontSize(7)
  const cliY = y + 12
  doc.setFont('helvetica', 'bold'); doc.text('Razao Social:', rightX + 3, cliY)
  doc.setFont('helvetica', 'normal'); doc.text(dados.cliente_nome || '', rightX + 3 + labelOffset, cliY)
  doc.setFont('helvetica', 'bold'); doc.text('CPF/CNPJ:', rightX + 3, cliY + 5)
  doc.setFont('helvetica', 'normal'); doc.text(dados.cliente_documento || '', rightX + 3 + labelOffset, cliY + 5)
  doc.setFont('helvetica', 'bold'); doc.text('E-mail:', rightX + 3, cliY + 10)
  doc.setFont('helvetica', 'normal'); doc.text(dados.cliente_email || '', rightX + 3 + labelOffset, cliY + 10)
  doc.setFont('helvetica', 'bold'); doc.text('Telefone:', rightX + 3, cliY + 15)
  doc.setFont('helvetica', 'normal'); doc.text(dados.cliente_telefone || '', rightX + 3 + labelOffset, cliY + 15)

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.roundedRect(rightX, y, boxWidth, 30, 1, 1, 'S')

  y = boxStartY + 35

  // ============ DATAS / REFERENCIA ============
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  const colW = contentWidth / 4
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA)

  doc.text('Emissao:', margin, y)
  doc.text('Vencimento:', margin + colW, y)
  doc.text('Periodo:', margin + colW * 2, y)
  doc.text('Referencia:', margin + colW * 3, y)

  y += 5
  doc.setFontSize(9)
  doc.setTextColor(...CINZA_ESCURO)
  doc.setFont('helvetica', 'normal')

  doc.text(formatarData(dados.data_emissao), margin, y)
  doc.text(formatarData(dados.data_vencimento), margin + colW, y)
  doc.text(dados.periodo_medicao || dados.locacao_numero || '-', margin + colW * 2, y)
  doc.text(dados.periodo_referencia || '-', margin + colW * 3, y)

  y += 8

  // ============ TABELA DE EQUIPAMENTOS ============
  if (dados.itens && dados.itens.length > 0) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...CINZA_ESCURO)
    doc.text('Itens', margin, y)
    y += 3

    const tableData = dados.itens.map(item => {
      const desc = item.equipamento_marca || item.equipamento_modelo
        ? `${item.equipamento_nome}\n${item.equipamento_marca || ''}${item.equipamento_modelo ? ' - ' + item.equipamento_modelo : ''}`
        : item.equipamento_nome
      return [
        desc,
        String(item.quantidade),
        formatarMoeda(item.valor_unitario),
        formatarMoeda(item.subtotal),
      ]
    })

    autoTable(doc, {
      startY: y,
      head: [['Equipamento', 'Qtd', 'Valor Unit.', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      margin: { left: margin, right: margin },
      headStyles: {
        fillColor: AZUL as any,
        textColor: BRANCO as any,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 80 },
        1: { halign: 'center', cellWidth: 20 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 },
      },
      bodyStyles: {
        fontSize: 8,
        textColor: CINZA_ESCURO as any,
      },
      alternateRowStyles: {
        fillColor: [245, 247, 250],
      },
    })

    y = (doc as any).lastAutoTable.finalY + 6
  }

  // ============ RESUMO FINANCEIRO ============
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text('Resumo Financeiro', margin, y)
  y += 6

  const resumoX = pageWidth - margin - 80

  const linhaResumo = (label: string, valor: string, bold = false) => {
    doc.setFontSize(9)
    doc.setFont('helvetica', bold ? 'bold' : 'normal')
    doc.setTextColor(...CINZA_ESCURO)
    doc.text(label, resumoX, y)
    doc.text(valor, pageWidth - margin, y, { align: 'right' })
    y += 5
  }

  linhaResumo('Valor Original:', formatarMoeda(dados.valor_original))
  if (dados.valor_desconto > 0) linhaResumo('Desconto:', `- ${formatarMoeda(dados.valor_desconto)}`)
  if (dados.valor_juros > 0) linhaResumo('Juros:', `+ ${formatarMoeda(dados.valor_juros)}`)
  if (dados.valor_multa > 0) linhaResumo('Multa:', `+ ${formatarMoeda(dados.valor_multa)}`)
  y += 2

  // Total em destaque
  doc.setDrawColor(...AZUL)
  doc.setLineWidth(0.5)
  doc.roundedRect(resumoX - 5, y - 3, pageWidth - margin - resumoX + 10, 12, 2, 2, 'S')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL:', resumoX, y + 5)
  doc.setTextColor(...AZUL)
  doc.text(formatarMoeda(dados.valor_total), pageWidth - margin, y + 5, { align: 'right' })
  y += 16

  if (dados.valor_pago > 0) {
    doc.setTextColor(...CINZA_ESCURO)
    linhaResumo('Valor Pago:', formatarMoeda(dados.valor_pago))
    linhaResumo('Saldo Devedor:', formatarMoeda(dados.valor_total - dados.valor_pago), true)
    y += 2
  }

  // ============ INSTRUCOES DE PAGAMENTO ============
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text('Instrucoes de Pagamento', margin, y)
  y += 6

  doc.setFontSize(8)

  if (config?.pix_chave) {
    doc.setFont('helvetica', 'bold')
    doc.text('PIX:', margin + 2, y)
    doc.setFont('helvetica', 'normal')
    const tipoLabel: Record<string, string> = { cnpj: 'CNPJ', cpf: 'CPF', email: 'E-mail', telefone: 'Telefone', aleatoria: 'Chave Aleatória' }
    doc.text(`Chave ${tipoLabel[config.pix_tipo || 'cnpj'] || 'CNPJ'}: ${config.pix_chave}`, margin + 14, y)
    y += 5
  }

  if (config?.banco_nome) {
    doc.setFont('helvetica', 'bold')
    doc.text('Deposito:', margin + 2, y)
    doc.setFont('helvetica', 'normal')
    doc.text(`${config.banco_nome} | Ag: ${config.banco_agencia || '-'} | Cc: ${config.banco_conta || '-'} | ${config.banco_titular || ''}`, margin + 20, y)
    y += 5
  }

  y += 3

  // ============ PENALIDADES ============
  doc.setFillColor(255, 248, 240)
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'F')
  doc.setDrawColor(251, 191, 36)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, y, contentWidth, 14, 2, 2, 'S')

  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(180, 83, 9)
  doc.text('PENALIDADES POR ATRASO', margin + 4, y + 5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  const jurosTx = config?.juros_mora || 2
  const multaTx = config?.multa_atraso || 2
  doc.text(`Multa de ${multaTx}% sobre o valor da fatura + Juros de mora de ${jurosTx}% ao mes (pro rata die)`, margin + 4, y + 10)

  y += 20

  // ============ OBSERVACOES ============
  if (dados.observacoes) {
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageWidth - margin, y)
    y += 5

    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...CINZA_ESCURO)
    doc.text('Observacoes:', margin, y)
    y += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    const lines = doc.splitTextToSize(dados.observacoes, contentWidth)
    doc.text(lines, margin, y)
  }

  // Abrir PDF em nova aba
  const pdfBlob = doc.output('blob')
  const url = URL.createObjectURL(pdfBlob)
  window.open(url, '_blank')
}
