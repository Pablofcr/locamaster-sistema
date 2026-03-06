import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Logo BRALOC em base64
const LOGO_BASE64 = 'data:image/png;base64,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Z9asWVTWcXJyioiI4HA4nTt39vT0VCqV3bp1s7Oza9++fURExK5du1atWrVs2bLBgwfv27dv3bp1VVVV3bp1O3bsWFZWlkKhGDJkSHp6+tixY0eMGBESEmIInbVr1y5atIheWGBgIJXeMMZff/318uXLy8rK+IQoH20p6MjlclYa5/F4VD4NDQ0dPHgwfatGjBjh4+Nz6dKlvn37qlQqrVZ79+7dBw8evPfeexs2bOjbt+++ffv8/f2HDRtGX00ulxsSEvLWW2+5u7v3798/MDBw586d9N6ys7Otra3v3yfVHsl7T7fF2bNnOzg4KJXKQYMG0Qugu0Zubu6gQYNiY2P79OnD5XKHDBkilUpHjhz5DaFhw4ZlZma++OKLcXFxhYWFHA6HwrdLly4ymSw3N7dbt25VVVULFiy4c+eOu7s75U//+te/7OzsioqKunXrtmTJknfffdfBwaGoqCgjI6OwsHDAgAGlpdDtIT8/f/To0Yb6YFFRUf/+/ak0o1KpevfuTbW8Dh06zJw5s7Ky0traOikpSaPRDB48mK6uh4fH9evXqWZABZQ333zTwcGhd+/e+/fv37Jli4eHx4EDB6ZMmXLv3r1ly5YpFIqePXtS/JWWlr722msIIaoHnD4N6c8nT56kW/yDBw+srKyoAjt16lQXFxeVSsXn89VqNY/Ho8q5QCCgD7OloKPT6SQSiVAoFAgEeXl5Fy5cmDp1amRkpK2tbZ8+fd57770+ffpQ0fXdd9/t27fv0KFDhw0b9t///pfeQ0BAwNy5c1UqlbW19ciRI1977bXZs2cvXryY/tXZ2Xn58uUKhaJTp05jx461srKiMi+VllxcXLp06WJra9u+ffuUlJSCgoKOHTva2tp+8sknVOdPSUl5++23y8rKkpKSZDLZoEGD7t27N2TIELlcrlQqe/fuXVJSsm7duueee2727NkcDueDDz6gUmr//v379u376aefYoznzJlz69YtNzc3KmB+8skn48aN8/X1pSuakpIyadIkFxeXrl279u/ff968efSxlJaWvvzyy2PHjv3000/p7dNPbG1tZ82aVV5efuDAAarOcDic999/n2LFysrqnXfeGTp0KMZ46dKl7u7uly5douIg3WXoNQQEBCxbtmz9+vWUAefm5vJ4vNmzZxcVFdGTzps3TyAQUE0zOzubw+GEhkJ47tGjR6k4jzGeMWOGlZXVuHHjOnbsWFZWduDAgXbt2p0/f14qldLdSiKR1G9waip06PtEGU96enpiYuLKlSuTkpKKiormz5//8ccfp6XRdA3YFBYsWDB79myJRPLnn3+eOgVF6gsLC7dv367T6YRC4bvvvjtnzpySkpKzZ88+fPiQLkxYGBQvevTo0cyZM3/88Uf6SlFR+urVq1999dUPP/xApY2ysjIHB4eFCxcuXbqUqjZSqTQgAOqu00MCAgJ4PF54eDi1vYaEhEilUp1O5+rqamdnFxYWdvgwVPXOzc2dP3/+V199RS1SR44ckUqlly5dOn4cii/dvXv3yJEjFy9epO9xWVnZtm3b8vPz7e3t58yZQ1Vlui9v2LDB8GJUKpWzs/PXX3/9ww8/5OZCYYbffvvN1tY2JCQkNDRULpdXVFQsWbJk7ty51IRz/Pjxq1evCoXC8HCSjoPxqVOn/vwTUmry8vK8vb3Dw8Ppf+k1BwQEVFRUODk5LVy4cNmyZXl5ebt376Zsw8vLiwqL8fHxZ8+eZTfQxYsXz5gxg3Lx4uJiT0/P2NhYynL4fD5rZ2lB6Gi1Wsp4RCJRZmZmeXl5RUVFoyykFApHjhzx9IRSRTUcDg0x+D6mt3ndF1P7wPot1w38a6tRDYN4ow40/F2hUJSUlGRmZlLdSiKRPNZD3AzQoVYEkUgkkUhEIlFaWppAIMjKyiouLq6oqKBeEuoDok4T1pNCP2fVdR8fH6qEV1ZWUp2WHsJ+h3p86FHUKaNWq6uqqmpMVeOM7Pfp4ewn9BfqSKJT0QPZ66TnovYC1vVj6AnSGUxLJzG8vBoXU/suap+X/m54ohoXXOOa2T/VflD0d8MrrPFAtFptVVWVSqUqLi6mm1RaWhq7iNTe3RrQoSZ8aoJMJyQgRMXnhpBEIklLS8vIyGjg9y3ULETFYYFAQFeNriDdYVsPOpT3SCQSKmTRSxE1hhr7fQs1C7GgEQgEEomkIfym+aFDpZbi4mJqYubz+VQAaiBRyDfP87BQw4hdpoyMjOLi4kZJqM0MHUo6nU4ul8tkMqlUKpFImoe3Wqi5SSKRSKVSmUwml8vNCPxoEegYEiskWqgNUlNWltPWlEYLtTKZvVItznUs9E8lC3QsZCZZoGMhM8kCHQuZSRboWMhMskDHQmaSBToWMpMs0LGQmWSBjoXMJAt0LGQmWaBjITPJAh0LmUkW6FjITLJAx0JmkgU6FjKTLNCxkJlkgY6FzCQLdCxkJlmgYyEzyQIdC5lJFuhYyEyyQMdC2Dz6f3w4OljH0HDhAAAAAElFTkSuQmCC'

interface DadosOrcamento {
  numero?: string
  clienteNome: string
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
    subtotal: number
  }[]
  subtotal: number
  desconto: number
  frete: number
  total: number
  observacoes?: string
}

// Cores do template BRALOC
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

export function gerarPDFOrcamento(dados: DadosOrcamento) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // ============ HEADER ============
  // Logo
  try {
    doc.addImage(LOGO_BASE64, 'PNG', margin, y, 22, 24)
  } catch {
    // Se falhar, apenas pula o logo
  }

  // Nome da empresa ao lado do logo
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text('BRALOC', margin + 25, y + 8)

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA)
  doc.text('BRA LOCACAO DE EQUIPAMENTOS LTDA', margin + 25, y + 14)

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
  doc.setFont('helvetica', 'bold')
  doc.text('Razao Social:', margin + 3, locadoraY)
  doc.setFont('helvetica', 'normal')
  doc.text('BRA LOCACAO DE EQUIPAMENTOS LTDA', margin + 28, locadoraY)
  doc.setFont('helvetica', 'bold')
  doc.text('Nome Fantasia:', margin + 3, locadoraY + 5)
  doc.setFont('helvetica', 'normal')
  doc.text('BRALOC', margin + 30, locadoraY + 5)
  doc.setFont('helvetica', 'bold')
  doc.text('CNPJ:', margin + 3, locadoraY + 10)
  doc.setFont('helvetica', 'normal')
  doc.text('53.666.786/0001-47', margin + 15, locadoraY + 10)
  doc.setFont('helvetica', 'bold')
  doc.text('E-mail:', margin + 3, locadoraY + 15)
  doc.setFont('helvetica', 'normal')
  doc.text('contato@braloc.com.br', margin + 16, locadoraY + 15)
  doc.setFont('helvetica', 'bold')
  doc.text('Telefone:', margin + 3, locadoraY + 20)
  doc.setFont('helvetica', 'normal')
  doc.text('(85) 98900-2319', margin + 19, locadoraY + 20)

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
  doc.text('Nome:', rightBoxX + 3, clienteY)
  doc.setFont('helvetica', 'normal')
  doc.text(dados.clienteNome || '', rightBoxX + 16, clienteY)

  if (dados.clienteDocumento) {
    doc.setFont('helvetica', 'bold')
    doc.text('Documento:', rightBoxX + 3, clienteY + 5)
    doc.setFont('helvetica', 'normal')
    doc.text(dados.clienteDocumento, rightBoxX + 24, clienteY + 5)
  }

  if (dados.clienteEmail) {
    doc.setFont('helvetica', 'bold')
    doc.text('E-mail:', rightBoxX + 3, clienteY + 10)
    doc.setFont('helvetica', 'normal')
    doc.text(dados.clienteEmail, rightBoxX + 16, clienteY + 10)
  }

  if (dados.clienteTelefone) {
    doc.setFont('helvetica', 'bold')
    doc.text('Telefone:', rightBoxX + 3, clienteY + 15)
    doc.setFont('helvetica', 'normal')
    doc.text(dados.clienteTelefone, rightBoxX + 19, clienteY + 15)
  }

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
    return [
      descricao,
      String(item.quantidade),
      capitalize(dados.modalidade),
      '1',
      formatarMoeda(item.preco_unitario),
      formatarMoeda(item.subtotal)
    ]
  })

  autoTable(doc, {
    startY: y,
    head: [['Equipamento', 'Qtd', 'Modalidade', 'Periodos', 'Valor/Periodo', 'Subtotal']],
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
      0: { halign: 'left', cellWidth: 60 },
      1: { halign: 'center', cellWidth: 15 },
      2: { halign: 'center', cellWidth: 25 },
      3: { halign: 'center', cellWidth: 18 },
      4: { halign: 'right', cellWidth: 30 },
      5: { halign: 'right', cellWidth: 30 },
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

  // ============ DESCONTO ============
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text('Desconto:', margin, y)
  doc.setFont('helvetica', 'normal')
  if (dados.desconto > 0) {
    doc.text(formatarMoeda(dados.desconto), margin + 22, y)
  } else {
    doc.text('Nenhum', margin + 22, y)
  }
  y += 8

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

  // ============ FRETE (se houver) ============
  if (dados.frete > 0) {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...CINZA_ESCURO)
    doc.text('Frete incluso:', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(formatarMoeda(dados.frete), margin + 28, y)
    y += 8
  }

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
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(margin, y, pageWidth - margin, y)
  y += 5

  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text('Condicoes de Pagamento:', margin, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('Forma:', margin + 2, y)
  doc.setFont('helvetica', 'normal')
  doc.text('PIX', margin + 16, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text('Condicao:', margin + 2, y)
  doc.setFont('helvetica', 'normal')
  doc.text('50% no ato + 50% em 30 dias', margin + 22, y)
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

  // Abrir PDF em nova aba
  const pdfBlob = doc.output('blob')
  const url = URL.createObjectURL(pdfBlob)
  window.open(url, '_blank')
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}
