import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface DadosOrcamento {
  numero?: string
  clienteNome: string
  clienteNomeFantasia?: string
  clienteTelefone?: string
  clienteEmail?: string
  clienteDocumento?: string
  modalidade: string
  diasLocacao: number
  dataInicio?: string
  dataFim?: string
  itens: {
    equipamento_nome: string
    equipamento_marca: string
    equipamento_modelo: string
    quantidade: number
    preco_unitario: number
    tipo_desconto_item?: 'percentual' | 'valor'
    desconto_percentual?: number
    desconto_valor_item?: number
    subtotal: number
  }[]
  subtotal: number
  desconto: number
  frete: number
  total: number
  observacoes?: string
  formaPagamento?: string
  condicaoPagamento?: string
}

export interface DadosEmpresa {
  razao_social: string
  nome_fantasia?: string | null
  cnpj?: string | null
  email?: string | null
  telefone?: string | null
  logo_base64?: string | null
}

// Cores do template
const AZUL = [37, 99, 235] as const    // #2563EB
const CINZA_ESCURO = [55, 65, 81] as const  // #374151
const CINZA = [107, 114, 128] as const      // #6B7280
const BRANCO = [255, 255, 255] as const

function formatarMoeda(v: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
}

function formatarData(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('pt-BR')
}

function gerarNomeArquivo(dados: DadosOrcamento): string {
  const numero = dados.numero?.trim() || 'orcamento'

  let cliente = (dados.clienteNomeFantasia?.trim() || dados.clienteNome?.trim() || 'cliente')
  if (cliente.length > 25) {
    const palavras = cliente.split(/\s+/).filter(p => p.length >= 3)
    cliente = palavras.slice(0, 2).join(' ') || cliente.slice(0, 25)
  }
  cliente = cliente
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  const hoje = new Date()
  const dd = String(hoje.getDate()).padStart(2, '0')
  const mm = String(hoje.getMonth() + 1).padStart(2, '0')
  const yyyy = hoje.getFullYear()
  const data = `${dd}-${mm}-${yyyy}`

  return `${numero}_${cliente}_${data}`
}

export function gerarPDFOrcamento(dados: DadosOrcamento, empresa?: DadosEmpresa) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  const nomeArquivo = gerarNomeArquivo(dados)
  doc.setProperties({
    title: nomeArquivo,
    subject: 'Proposta de Locacao',
    creator: 'LocaMaster',
  })

  const nomeFantasia = empresa?.nome_fantasia || empresa?.razao_social || 'Empresa'
  const razaoSocial = empresa?.razao_social || 'Empresa'
  const cnpj = empresa?.cnpj || ''
  const emailEmpresa = empresa?.email || ''
  const telefoneEmpresa = empresa?.telefone || ''

  // ============ HEADER ============
  // Logo
  if (empresa?.logo_base64) {
    try {
      doc.addImage(empresa.logo_base64, 'PNG', margin, y, 22, 24)
    } catch {
      // Se falhar, apenas pula o logo
    }
  }

  // Nome da empresa ao lado do logo
  const textX = empresa?.logo_base64 ? margin + 25 : margin
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text(nomeFantasia.toUpperCase(), textX, y + 8)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA)
  doc.text(razaoSocial.toUpperCase(), textX, y + 14)

  // Titulo do documento (direita)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...AZUL)
  const titulo = 'PROPOSTA DE LOCACAO'
  doc.text(titulo, pageWidth - margin, y + 8, { align: 'right' })

  // Numero do orcamento
  if (dados.numero) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(...CINZA)
    doc.text(`N. ${dados.numero}`, pageWidth - margin, y + 15, { align: 'right' })
  }

  y += 30

  // Linha separadora azul
  doc.setDrawColor(...AZUL)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  // ============ INFO BOXES ============
  const boxWidth = (contentWidth - 6) / 2
  const boxStartY = y

  // Box LOCADORA (esquerda)
  doc.setFillColor(...AZUL)
  doc.roundedRect(margin, y, boxWidth, 8, 1, 1, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRANCO)
  doc.text('LOCADORA', margin + 3, y + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA_ESCURO)
  doc.setFontSize(7)
  const locadoraY = y + 12
  const labelOffset = 22
  doc.setFont('helvetica', 'bold')
  doc.text('Razao Social:', margin + 3, locadoraY)
  doc.setFont('helvetica', 'normal')
  doc.text(razaoSocial, margin + 3 + labelOffset, locadoraY)
  doc.setFont('helvetica', 'bold')
  doc.text('Nome Fantasia:', margin + 3, locadoraY + 5)
  doc.setFont('helvetica', 'normal')
  doc.text(nomeFantasia, margin + 3 + labelOffset, locadoraY + 5)
  doc.setFont('helvetica', 'bold')
  doc.text('CNPJ:', margin + 3, locadoraY + 10)
  doc.setFont('helvetica', 'normal')
  doc.text(cnpj, margin + 3 + labelOffset, locadoraY + 10)
  doc.setFont('helvetica', 'bold')
  doc.text('E-mail:', margin + 3, locadoraY + 15)
  doc.setFont('helvetica', 'normal')
  doc.text(emailEmpresa, margin + 3 + labelOffset, locadoraY + 15)
  doc.setFont('helvetica', 'bold')
  doc.text('Telefone:', margin + 3, locadoraY + 20)
  doc.setFont('helvetica', 'normal')
  doc.text(telefoneEmpresa, margin + 3 + labelOffset, locadoraY + 20)

  // Borda do box locadora
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, y, boxWidth, 35, 1, 1, 'S')

  // Box LOCATARIA (direita)
  const rightBoxX = margin + boxWidth + 6
  doc.setFillColor(...AZUL)
  doc.roundedRect(rightBoxX, y, boxWidth, 8, 1, 1, 'F')
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRANCO)
  doc.text('LOCATARIA', rightBoxX + 3, y + 5.5)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA_ESCURO)
  doc.setFontSize(7)
  const clienteY = y + 12
  doc.setFont('helvetica', 'bold')
  doc.text('Razao Social:', rightBoxX + 3, clienteY)
  doc.setFont('helvetica', 'normal')
  doc.text(dados.clienteNome || '', rightBoxX + 3 + labelOffset, clienteY)
  doc.setFont('helvetica', 'bold')
  doc.text('Nome Fantasia:', rightBoxX + 3, clienteY + 5)
  doc.setFont('helvetica', 'normal')
  doc.text(dados.clienteNomeFantasia || '', rightBoxX + 3 + labelOffset, clienteY + 5)
  doc.setFont('helvetica', 'bold')
  doc.text('CPF/CNPJ:', rightBoxX + 3, clienteY + 10)
  doc.setFont('helvetica', 'normal')
  doc.text(dados.clienteDocumento || '', rightBoxX + 3 + labelOffset, clienteY + 10)
  doc.setFont('helvetica', 'bold')
  doc.text('E-mail:', rightBoxX + 3, clienteY + 15)
  doc.setFont('helvetica', 'normal')
  doc.text(dados.clienteEmail || '', rightBoxX + 3 + labelOffset, clienteY + 15)
  doc.setFont('helvetica', 'bold')
  doc.text('Telefone:', rightBoxX + 3, clienteY + 20)
  doc.setFont('helvetica', 'normal')
  doc.text(dados.clienteTelefone || '', rightBoxX + 3 + labelOffset, clienteY + 20)

  // Borda do box cliente
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.roundedRect(rightBoxX, y, boxWidth, 35, 1, 1, 'S')

  y = boxStartY + 40

  // ============ DATAS ============
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  const colWidth = contentWidth / 3
  doc.setFontSize(7)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA)

  doc.text('Data de Emissao:', margin, y)
  doc.text('Validade da Proposta:', margin + colWidth, y)
  doc.text('Periodo da Locacao:', margin + colWidth * 2, y)

  y += 5
  doc.setFontSize(9)
  doc.setTextColor(...CINZA_ESCURO)
  doc.setFont('helvetica', 'normal')

  const hoje = new Date()
  doc.text(hoje.toLocaleDateString('pt-BR'), margin, y)

  const validade = new Date(hoje.getTime() + 7 * 86400000)
  doc.text(validade.toLocaleDateString('pt-BR'), margin + colWidth, y)

  let periodoText = ''
  if (dados.dataInicio && dados.dataFim) {
    periodoText = `${formatarData(dados.dataInicio)} ate ${formatarData(dados.dataFim)}`
  } else if (dados.dataInicio) {
    periodoText = `${formatarData(dados.dataInicio)} (${dados.diasLocacao} dias)`
  }
  doc.text(periodoText, margin + colWidth * 2, y)

  y += 8

  // ============ TABELA DE EQUIPAMENTOS ============
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text('Itens do Orcamento', margin, y)
  y += 3

  const tableData = dados.itens.map(item => {
    const descricao = item.equipamento_marca || item.equipamento_modelo
      ? `${item.equipamento_nome}\n${item.equipamento_marca}${item.equipamento_modelo ? ' - ' + item.equipamento_modelo : ''}`
      : item.equipamento_nome
    const tipoDesc = item.tipo_desconto_item || 'percentual'
    const descPct = item.desconto_percentual || 0
    const descVal = item.desconto_valor_item || 0
    let descText = '-'
    if (tipoDesc === 'percentual' && descPct > 0) descText = `${descPct}%`
    else if (tipoDesc === 'valor' && descVal > 0) descText = formatarMoeda(descVal)
    return [
      descricao,
      String(item.quantidade),
      capitalize(dados.modalidade),
      '1',
      formatarMoeda(item.preco_unitario),
      descText,
      formatarMoeda(item.subtotal)
    ]
  })

  autoTable(doc, {
    startY: y,
    head: [['Equipamento', 'Qtd', 'Modalidade', 'Periodos', 'Valor/Periodo', 'Desconto', 'Subtotal']],
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
      0: { halign: 'left', cellWidth: 52 },
      1: { halign: 'center', cellWidth: 13 },
      2: { halign: 'center', cellWidth: 23 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'right', cellWidth: 26 },
      5: { halign: 'center', cellWidth: 22 },
      6: { halign: 'right', cellWidth: 28 },
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

  // ============ DESCONTO GLOBAL (apenas se houver) ============
  if (dados.desconto > 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...CINZA_ESCURO)
    doc.text('Desconto:', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(formatarMoeda(dados.desconto), margin + 22, y)
    y += 8
  }

  // ============ FRETE (acima do total, para compor o preço final) ============
  if (dados.frete > 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...CINZA_ESCURO)
    doc.text('Frete incluso:', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(formatarMoeda(dados.frete), margin + 28, y)
    y += 6
  }

  // ============ VALOR TOTAL ============
  const totalBoxHeight = 14
  doc.setDrawColor(...AZUL)
  doc.setLineWidth(0.5)
  doc.roundedRect(pageWidth / 2, y, contentWidth / 2, totalBoxHeight, 2, 2, 'S')

  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text(`VALOR TOTAL: ${formatarMoeda(dados.total)}`, pageWidth / 2 + (contentWidth / 4), y + totalBoxHeight / 2 + 1, { align: 'center' })

  y += totalBoxHeight + 8

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
    y += lines.length * 4 + 4
  }

  // ============ CONDICOES DE PAGAMENTO ============
  const formasLabel: Record<string, string> = {
    pix: 'PIX',
    cartao_credito: 'Cartao de Credito',
    deposito_bancario: 'Deposito Bancario',
  }
  const condicoesLabel: Record<string, string> = {
    antecipado: 'Antecipado',
    '50_ato_30': '50% no ato + 50% para 30 dias',
    final_periodo: 'Ultimo dia do periodo contratado',
    '5_dias_apos': '5 dias apos o vencimento do contrato',
  }

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text('Condicoes de Pagamento:', margin, y)
  y += 5
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('Forma:', margin + 2, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formasLabel[dados.formaPagamento || 'pix'] || 'PIX', margin + 16, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text('Condicao:', margin + 2, y)
  doc.setFont('helvetica', 'normal')
  doc.text(condicoesLabel[dados.condicaoPagamento || '50_ato_30'] || '50% no ato + 50% para 30 dias', margin + 22, y)
  y += 8

  // ============ ACEITE DA PROPOSTA ============
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text('Aceite da Proposta:', margin, y)
  y += 6
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)

  // Checkbox
  doc.setDrawColor(...CINZA_ESCURO)
  doc.setLineWidth(0.4)
  doc.rect(margin + 2, y - 3.5, 4, 4)
  doc.setFont('helvetica', 'bold')
  doc.text('Aceite:', margin + 8, y)
  doc.setFont('helvetica', 'normal')
  doc.text('Declaro que aceito os termos e condicoes desta proposta', margin + 22, y)

  y += 15

  // ============ ASSINATURA ============
  doc.setDrawColor(...CINZA_ESCURO)
  doc.setLineWidth(0.3)
  const lineStart = pageWidth / 2 - 45
  const lineEnd = pageWidth / 2 + 45
  doc.line(lineStart, y, lineEnd, y)

  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text(dados.clienteNome || '', pageWidth / 2, y, { align: 'center' })
  y += 4
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA)
  doc.text('Locatario - Assinatura', pageWidth / 2, y, { align: 'center' })

  // Download direto com nome correto (Chrome ignora /Title em blob URLs,
  // entao forcamos via anchor com atributo download)
  doc.save(`${nomeArquivo}.pdf`)
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
