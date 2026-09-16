/**
 * Demonstrativo de cobranca: varias faturas do mesmo cliente num PDF so.
 *
 * O faturamento e por mes fechado, entao um ciclo de locacao que atravessa
 * dois meses vira duas faturas — e o cliente teria de receber dois arquivos.
 * Este documento junta as faturas escolhidas, com o periodo de cada uma e o
 * total, sem mexer nas faturas: cada uma mantem seu vencimento e sua baixa.
 *
 * Nao substitui a fatura: e o resumo do que esta em aberto.
 */

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { ContaBancaria, lerContasBancarias, descreverConta } from './configuracaoPagamento'

export interface FaturaConsolidada {
  numero: string
  periodo: string
  locacao_numero?: string
  data_vencimento: string
  valor: number
  valor_pago: number
  status: string
}

export interface DadosConsolidado {
  cliente_nome: string
  cliente_documento?: string
  cliente_email?: string
  cliente_telefone?: string
  faturas: FaturaConsolidada[]
  observacoes?: string
}

export interface DadosEmpresaConsolidado {
  razao_social: string
  nome_fantasia?: string | null
  cnpj?: string | null
  email?: string | null
  telefone?: string | null
  logo_base64?: string | null
}

export interface ConfigPagamentoConsolidado {
  pix_chave?: string
  pix_tipo?: string
  banco_nome?: string
  banco_agencia?: string
  banco_conta?: string
  banco_titular?: string
  /** Contas bancarias da configuracao; se vazia, valem os campos banco_* acima */
  bancos?: ContaBancaria[]
  juros_mora?: number
  multa_atraso?: number
}

// Cores do template (mesmas da fatura e do orcamento)
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

const STATUS_LABEL: Record<string, string> = {
  emitido: 'Em aberto',
  pendente: 'Em aberto',
  parcial: 'Parcial',
  vencido: 'Vencida',
  pago: 'Paga',
}

/** Monta o documento. Separado da abertura para poder ser gerado fora do navegador. */
export function construirPDFConsolidado(
  dados: DadosConsolidado,
  empresa?: DadosEmpresaConsolidado,
  config?: ConfigPagamentoConsolidado
): jsPDF {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const nomeFantasia = empresa?.nome_fantasia || empresa?.razao_social || 'Empresa'
  const razaoSocial = empresa?.razao_social || 'Empresa'

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

  doc.setFontSize(15)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...AZUL)
  doc.text('DEMONSTRATIVO DE COBRANCA', pageWidth - margin, y + 8, { align: 'right' })

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA)
  doc.text(`${dados.faturas.length} fatura(s)`, pageWidth - margin, y + 15, { align: 'right' })

  y += 30

  doc.setDrawColor(...AZUL)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  // ============ INFO BOXES ============
  const boxWidth = (contentWidth - 6) / 2
  const boxStartY = y
  const labelOffset = 22

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
  doc.setFont('helvetica', 'normal'); doc.text(empresa?.cnpj || '', margin + 3 + labelOffset, locY + 5)
  doc.setFont('helvetica', 'bold'); doc.text('E-mail:', margin + 3, locY + 10)
  doc.setFont('helvetica', 'normal'); doc.text(empresa?.email || '', margin + 3 + labelOffset, locY + 10)
  doc.setFont('helvetica', 'bold'); doc.text('Telefone:', margin + 3, locY + 15)
  doc.setFont('helvetica', 'normal'); doc.text(empresa?.telefone || '', margin + 3 + labelOffset, locY + 15)

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, y, boxWidth, 30, 1, 1, 'S')

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

  // ============ TABELA DE FATURAS ============
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text('Faturas', margin, y)
  y += 3

  const linhas = dados.faturas.map(f => {
    const saldo = Number(f.valor) - Number(f.valor_pago || 0)
    return [
      f.locacao_numero ? `${f.numero}\n${f.locacao_numero}` : f.numero,
      f.periodo || '-',
      formatarData(f.data_vencimento),
      STATUS_LABEL[f.status] || f.status,
      formatarMoeda(Number(f.valor)),
      formatarMoeda(saldo),
    ]
  })

  autoTable(doc, {
    startY: y,
    head: [['Fatura', 'Periodo', 'Vencimento', 'Situacao', 'Valor', 'Saldo']],
    body: linhas,
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
      // Sem largura fixa: a coluna do periodo ("13/07/2026 a 30/07/2026") nao cabe em medida fixa
      0: { halign: 'left' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'right' },
      5: { halign: 'right' },
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

  // ============ TOTAIS ============
  const total = dados.faturas.reduce((s, f) => s + Number(f.valor), 0)
  const pago = dados.faturas.reduce((s, f) => s + Number(f.valor_pago || 0), 0)
  const saldoTotal = total - pago

  const resumoX = pageWidth - margin - 80
  const linhaResumo = (label: string, valor: string) => {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...CINZA_ESCURO)
    doc.text(label, resumoX, y)
    doc.text(valor, pageWidth - margin, y, { align: 'right' })
    y += 5
  }

  linhaResumo('Soma das faturas:', formatarMoeda(total))
  if (pago > 0) linhaResumo('Ja pago:', `- ${formatarMoeda(pago)}`)
  y += 2

  doc.setDrawColor(...AZUL)
  doc.setLineWidth(0.5)
  doc.roundedRect(resumoX - 5, y - 3, pageWidth - margin - resumoX + 10, 12, 2, 2, 'S')
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text('TOTAL A PAGAR:', resumoX, y + 5)
  doc.setTextColor(...AZUL)
  doc.text(formatarMoeda(saldoTotal), pageWidth - margin, y + 5, { align: 'right' })
  y += 18

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
    const tipoLabel: Record<string, string> = { cnpj: 'CNPJ', cpf: 'CPF', email: 'E-mail', telefone: 'Telefone', aleatoria: 'Chave Aleatoria' }
    doc.text(`Chave ${tipoLabel[config.pix_tipo || 'cnpj'] || 'CNPJ'}: ${config.pix_chave}`, margin + 14, y)
    y += 5
  }

  lerContasBancarias(config).forEach((conta, i) => {
    doc.setFont('helvetica', 'bold')
    if (i === 0) doc.text('Deposito:', margin + 2, y)
    doc.setFont('helvetica', 'normal')
    doc.text(descreverConta(conta), margin + 20, y)
    y += 5
  })

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA)
  doc.setFontSize(7)
  doc.text('Cada fatura mantem o seu vencimento. Este demonstrativo reune as faturas acima para facilitar o pagamento.', margin + 2, y)
  y += 8

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
  doc.text(`Multa de ${config?.multa_atraso || 2}% sobre o valor da fatura + Juros de mora de ${config?.juros_mora || 2}% ao mes (pro rata die)`, margin + 4, y + 10)

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
    doc.text(doc.splitTextToSize(dados.observacoes, contentWidth), margin, y)
  }

  return doc
}

export function gerarPDFConsolidado(
  dados: DadosConsolidado,
  empresa?: DadosEmpresaConsolidado,
  config?: ConfigPagamentoConsolidado
) {
  const doc = construirPDFConsolidado(dados, empresa, config)
  const url = URL.createObjectURL(doc.output('blob'))
  window.open(url, '_blank')
}
