import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface DadosContrato {
  numeroOrcamento: string
  // Empresa (locadora)
  empresaNome: string
  empresaRazaoSocial: string
  empresaCnpj: string
  empresaEndereco: string
  empresaEmail: string
  empresaTelefone: string
  empresaLogo?: string
  // Cliente (locataria)
  clienteNome: string
  clienteNomeFantasia?: string
  clienteDocumento: string
  clienteEndereco: string
  clienteEmail?: string
  clienteTelefone?: string
  // Locacao
  localObra: string
  modalidade: string
  diasLocacao: number
  dataInicio?: string
  dataFim?: string
  // Equipamentos (tabela)
  itens: { equipamento_nome: string; equipamento_marca: string; equipamento_modelo: string; quantidade: number; preco_unitario: number; subtotal: number }[]
  // Financeiro
  subtotal: number
  desconto: number
  frete: number
  total: number
  formaPagamento: string
  condicaoPagamento: string
  // Config
  prazoNaoDevolucaoDias: number
}

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

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const formasLabel: Record<string, string> = {
  pix: 'PIX',
  cartao_credito: 'Cartao de Credito',
  deposito_bancario: 'Deposito Bancario',
}

const condicoesLabel: Record<string, string> = {
  antecipado: 'Antecipado',
  '50_ato_30': '50% no ato + 50% para 30 dias',
  final_periodo: 'Ao final do periodo',
}

function checkPageBreak(doc: jsPDF, y: number, needed: number, margin: number): number {
  const pageHeight = 297
  if (y + needed > pageHeight - margin) {
    doc.addPage()
    return margin
  }
  return y
}

function writeClausula(doc: jsPDF, titulo: string, texto: string, y: number, margin: number, contentWidth: number): number {
  const pageHeight = 297

  // Titulo da clausula
  y = checkPageBreak(doc, y, 12, margin)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text(titulo, margin, y)
  y += 5

  // Corpo da clausula
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(...CINZA_ESCURO)
  const lines = doc.splitTextToSize(texto, contentWidth)

  for (let i = 0; i < lines.length; i++) {
    y = checkPageBreak(doc, y, 4, margin)
    doc.text(lines[i], margin, y)
    y += 3.5
  }

  y += 3
  return y
}

export function gerarContratoLocacao(dados: DadosContrato) {
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = 210
  const margin = 15
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // ============ HEADER ============
  if (dados.empresaLogo) {
    try {
      doc.addImage(dados.empresaLogo, 'PNG', margin, y, 20, 22)
    } catch {
      // skip logo
    }
  }

  const textX = dados.empresaLogo ? margin + 23 : margin
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...AZUL)
  doc.text('CONTRATO DE LOCACAO DE EQUIPAMENTOS', textX, y + 8)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA)
  doc.text(`Ref. Orcamento: ${dados.numeroOrcamento}`, textX, y + 14)

  y += 26

  // Linha separadora
  doc.setDrawColor(...AZUL)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageWidth - margin, y)
  y += 6

  // ============ INFO BOXES ============
  const boxWidth = (contentWidth - 6) / 2
  const boxStartY = y

  // Box LOCADORA (esquerda)
  doc.setFillColor(...AZUL)
  doc.roundedRect(margin, y, boxWidth, 7, 1, 1, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRANCO)
  doc.text('LOCADORA', margin + 3, y + 5)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA_ESCURO)
  doc.setFontSize(7)
  const locY = y + 10
  const lbl = 20
  doc.setFont('helvetica', 'bold')
  doc.text('Razao Social:', margin + 2, locY)
  doc.setFont('helvetica', 'normal')
  doc.text(dados.empresaRazaoSocial, margin + 2 + lbl, locY)
  doc.setFont('helvetica', 'bold')
  doc.text('Nome:', margin + 2, locY + 4)
  doc.setFont('helvetica', 'normal')
  doc.text(dados.empresaNome, margin + 2 + lbl, locY + 4)
  doc.setFont('helvetica', 'bold')
  doc.text('CNPJ:', margin + 2, locY + 8)
  doc.setFont('helvetica', 'normal')
  doc.text(dados.empresaCnpj, margin + 2 + lbl, locY + 8)
  doc.setFont('helvetica', 'bold')
  doc.text('Endereco:', margin + 2, locY + 12)
  doc.setFont('helvetica', 'normal')
  const endEmpLines = doc.splitTextToSize(dados.empresaEndereco, boxWidth - lbl - 6)
  doc.text(endEmpLines, margin + 2 + lbl, locY + 12)
  const empBoxHeight = 7 + 4 + 16 + (endEmpLines.length - 1) * 3 + 4

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.roundedRect(margin, y, boxWidth, empBoxHeight, 1, 1, 'S')

  // Box LOCATARIA (direita)
  const rightX = margin + boxWidth + 6
  doc.setFillColor(...AZUL)
  doc.roundedRect(rightX, y, boxWidth, 7, 1, 1, 'F')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...BRANCO)
  doc.text('LOCATARIA', rightX + 3, y + 5)

  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA_ESCURO)
  doc.setFontSize(7)
  const cliY = y + 10
  doc.setFont('helvetica', 'bold')
  doc.text('Razao Social:', rightX + 2, cliY)
  doc.setFont('helvetica', 'normal')
  doc.text(dados.clienteNome, rightX + 2 + lbl, cliY)
  if (dados.clienteNomeFantasia) {
    doc.setFont('helvetica', 'bold')
    doc.text('Fantasia:', rightX + 2, cliY + 4)
    doc.setFont('helvetica', 'normal')
    doc.text(dados.clienteNomeFantasia, rightX + 2 + lbl, cliY + 4)
  }
  doc.setFont('helvetica', 'bold')
  doc.text('CPF/CNPJ:', rightX + 2, cliY + 8)
  doc.setFont('helvetica', 'normal')
  doc.text(dados.clienteDocumento, rightX + 2 + lbl, cliY + 8)
  doc.setFont('helvetica', 'bold')
  doc.text('Endereco:', rightX + 2, cliY + 12)
  doc.setFont('helvetica', 'normal')
  const endCliLines = doc.splitTextToSize(dados.clienteEndereco || '________', boxWidth - lbl - 6)
  doc.text(endCliLines, rightX + 2 + lbl, cliY + 12)
  const cliBoxHeight = 7 + 4 + 16 + (endCliLines.length - 1) * 3 + 4

  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.roundedRect(rightX, y, boxWidth, cliBoxHeight, 1, 1, 'S')

  y = boxStartY + Math.max(empBoxHeight, cliBoxHeight) + 4

  // ============ CLAUSULAS ============
  const localObra = dados.localObra || '________________________________________'
  const freteTexto = dados.frete > 0 ? formatarMoeda(dados.frete) : 'a combinar'
  const modalidadeTexto = capitalize(dados.modalidade)
  const formaTexto = formasLabel[dados.formaPagamento] || dados.formaPagamento
  const condicaoTexto = condicoesLabel[dados.condicaoPagamento] || dados.condicaoPagamento

  // Clausula 1 - Objeto
  y = writeClausula(doc,
    'CLAUSULA 1 - DO OBJETO',
    `A LOCADORA se compromete a locar a(o) LOCATARIA os equipamentos descritos no Quadro de Equipamentos anexo a este contrato, para utilizacao no local: ${localObra}. Os equipamentos serao entregues em perfeito estado de funcionamento e conservacao.`,
    y, margin, contentWidth
  )

  // Clausula 2 - Prazo
  let periodoTexto = `${dados.diasLocacao} dias`
  if (dados.dataInicio && dados.dataFim) {
    periodoTexto = `${formatarData(dados.dataInicio)} a ${formatarData(dados.dataFim)} (${dados.diasLocacao} dias)`
  } else if (dados.dataInicio) {
    periodoTexto = `a partir de ${formatarData(dados.dataInicio)}, pelo periodo de ${dados.diasLocacao} dias`
  }
  y = writeClausula(doc,
    'CLAUSULA 2 - DO PRAZO',
    `O prazo de locacao sera na modalidade ${modalidadeTexto}, compreendendo o periodo de ${periodoTexto}, podendo ser prorrogado mediante acordo entre as partes, mantidas as mesmas condicoes contratuais. A renovacao devera ser solicitada com antecedencia minima de 02 (dois) dias uteis antes do termino do contrato.`,
    y, margin, contentWidth
  )

  // Clausula 3 - Disponibilizacao
  y = writeClausula(doc,
    'CLAUSULA 3 - DA DISPONIBILIZACAO',
    `Os equipamentos serao disponibilizados pela LOCADORA no endereco indicado pela LOCATARIA. A taxa de entrega e coleta sera de ${freteTexto}. A LOCATARIA devera conferir os equipamentos no ato do recebimento, assinando o Termo de Recebimento. Qualquer divergencia devera ser comunicada imediatamente.`,
    y, margin, contentWidth
  )

  // Clausula 4 - Valor e Pagamento
  y = writeClausula(doc,
    'CLAUSULA 4 - DO VALOR E PAGAMENTO',
    `O valor total da locacao e de ${formatarMoeda(dados.total)}, conforme detalhamento no Quadro de Equipamentos anexo. A forma de pagamento sera ${formaTexto}, com condicao de pagamento ${condicaoTexto}. O nao pagamento na data estipulada implicara na incidencia de multa e juros conforme clausula 13.`,
    y, margin, contentWidth
  )

  // Clausula 5 - Obrigacoes da Locataria
  y = writeClausula(doc,
    'CLAUSULA 5 - DAS OBRIGACOES DA LOCATARIA',
    'A LOCATARIA se obriga a: a) Utilizar os equipamentos exclusivamente para a finalidade a que se destinam; b) Manter os equipamentos em perfeito estado de conservacao e limpeza; c) Nao ceder, emprestar, sublocar ou transferir os equipamentos a terceiros sem autorizacao previa e por escrito da LOCADORA; d) Comunicar imediatamente a LOCADORA qualquer defeito, avaria ou problema nos equipamentos; e) Responsabilizar-se pela guarda e seguranca dos equipamentos enquanto estiverem em sua posse.',
    y, margin, contentWidth
  )

  // Clausula 6 - Obrigacoes da Locadora
  y = writeClausula(doc,
    'CLAUSULA 6 - DAS OBRIGACOES DA LOCADORA',
    'A LOCADORA se obriga a: a) Entregar os equipamentos em perfeito estado de funcionamento; b) Prestar assistencia tecnica durante o periodo de locacao, em horario comercial; c) Substituir os equipamentos que apresentarem defeitos de fabricacao ou desgaste natural, no prazo de 48 horas uteis apos comunicacao da LOCATARIA.',
    y, margin, contentWidth
  )

  // Clausula 7 - Responsabilidade
  y = writeClausula(doc,
    'CLAUSULA 7 - DA RESPONSABILIDADE',
    'A LOCATARIA e responsavel por quaisquer danos causados aos equipamentos por mau uso, negligencia, imprudencia ou imperica, incluindo, mas nao se limitando a: quebra, extravio, furto, roubo, incendio, inundacao ou qualquer outro evento que cause dano ou perda dos equipamentos. Em caso de dano, a LOCATARIA arcara com os custos de reparo. Em caso de perda total, arcara com o valor de reposicao do equipamento.',
    y, margin, contentWidth
  )

  // Clausula 8 - Devolucao
  y = writeClausula(doc,
    'CLAUSULA 8 - DA DEVOLUCAO',
    'Ao termino do prazo de locacao, a LOCATARIA devera devolver os equipamentos nas mesmas condicoes em que os recebeu, ressalvado o desgaste natural pelo uso. A devolucao devera ser agendada com antecedencia minima de 02 (dois) dias uteis. Os equipamentos serao inspecionados pela LOCADORA no ato da devolucao.',
    y, margin, contentWidth
  )

  // Clausula 9 - Nao Devolucao
  y = writeClausula(doc,
    'CLAUSULA 9 - DA NAO DEVOLUCAO',
    `Caso a LOCATARIA nao devolva os equipamentos no prazo de ${dados.prazoNaoDevolucaoDias} dias apos o termino do contrato, sem justificativa aceita pela LOCADORA, os equipamentos serao considerados como vendidos, devendo a LOCATARIA arcar com o valor de mercado dos mesmos, sem prejuizo das demais penalidades previstas neste contrato e na legislacao vigente.`,
    y, margin, contentWidth
  )

  // Clausula 10 - Manutencao
  y = writeClausula(doc,
    'CLAUSULA 10 - DA MANUTENCAO',
    'A manutencao preventiva dos equipamentos e de responsabilidade da LOCADORA. A manutencao corretiva decorrente de mau uso ou negligencia sera de responsabilidade da LOCATARIA. Durante o periodo de manutencao corretiva, o prazo de locacao continuara correndo normalmente.',
    y, margin, contentWidth
  )

  // Clausula 11 - Seguro
  y = writeClausula(doc,
    'CLAUSULA 11 - DO SEGURO',
    'A LOCATARIA podera, a seu criterio, contratar seguro para os equipamentos locados. Na ausencia de seguro, a LOCATARIA assumira integralmente os riscos de danos, furto, roubo ou destruicao dos equipamentos.',
    y, margin, contentWidth
  )

  // Clausula 12 - Rescisao
  y = writeClausula(doc,
    'CLAUSULA 12 - DA RESCISAO',
    'O presente contrato podera ser rescindido por qualquer das partes, mediante comunicacao por escrito com antecedencia minima de 05 (cinco) dias. Em caso de rescisao antecipada pela LOCATARIA, sera devida multa de 20% sobre o valor remanescente do contrato. Nao sera devida multa em caso de rescisao por descumprimento contratual da parte contraria.',
    y, margin, contentWidth
  )

  // Clausula 13 - Mora e Juros
  y = writeClausula(doc,
    'CLAUSULA 13 - DA MORA E JUROS',
    'O atraso no pagamento de qualquer parcela implicara na incidencia de: a) Multa moratoria de 2% (dois por cento) sobre o valor devido; b) Juros de mora de 2% (dois por cento) ao mes, calculados pro rata die; c) Correcao monetaria pelo IGPM/FGV ou indice que o substitua. Apos 30 dias de inadimplencia, a LOCADORA podera retirar os equipamentos e considerar o contrato rescindido, sem prejuizo da cobranca dos valores devidos.',
    y, margin, contentWidth
  )

  // Clausula 14 - Vistoria
  y = writeClausula(doc,
    'CLAUSULA 14 - DA VISTORIA',
    'A LOCADORA reserva-se o direito de vistoriar os equipamentos a qualquer tempo, mediante aviso previo de 24 horas, para verificar as condicoes de uso e conservacao.',
    y, margin, contentWidth
  )

  // Clausula 15 - Caso Fortuito
  y = writeClausula(doc,
    'CLAUSULA 15 - DO CASO FORTUITO E FORCA MAIOR',
    'Nenhuma das partes sera responsabilizada pelo nao cumprimento de suas obrigacoes quando decorrente de caso fortuito ou forca maior, conforme definido pelo Codigo Civil Brasileiro, desde que a parte afetada comunique a outra no prazo de 48 horas.',
    y, margin, contentWidth
  )

  // Clausula 16 - Confidencialidade
  y = writeClausula(doc,
    'CLAUSULA 16 - DA CONFIDENCIALIDADE',
    'As partes se comprometem a manter sigilo sobre as informacoes tecnicas e comerciais obtidas em razao deste contrato, nao podendo divulga-las a terceiros sem autorizacao previa e por escrito da outra parte.',
    y, margin, contentWidth
  )

  // Clausula 17 - Disposicoes Gerais
  y = writeClausula(doc,
    'CLAUSULA 17 - DAS DISPOSICOES GERAIS',
    'Este contrato representa o acordo integral entre as partes, substituindo quaisquer entendimentos ou acordos anteriores, verbais ou escritos. Qualquer alteracao deste contrato somente sera valida se feita por escrito e assinada por ambas as partes. A tolerancia de qualquer das partes quanto ao descumprimento de clausula contratual nao implicara em novacao ou renunciaao direito.',
    y, margin, contentWidth
  )

  // Clausula 18 - Foro
  y = writeClausula(doc,
    'CLAUSULA 18 - DO FORO',
    'Para dirimir quaisquer controversias oriundas deste contrato, as partes elegem o foro da comarca do domicilio da LOCADORA, com exclusao de qualquer outro, por mais privilegiado que seja.',
    y, margin, contentWidth
  )

  // ============ ASSINATURAS ============
  y = checkPageBreak(doc, y, 50, margin)
  y += 8

  const hoje = new Date()
  const dataExtenso = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })

  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text(`Local e data: _________________________, ${dataExtenso}`, margin, y)

  y += 15

  const signWidth = (contentWidth - 20) / 2

  // Locadora
  doc.setDrawColor(...CINZA_ESCURO)
  doc.setLineWidth(0.3)
  doc.line(margin, y, margin + signWidth, y)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(dados.empresaNome, margin + signWidth / 2, y + 5, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('LOCADORA', margin + signWidth / 2, y + 9, { align: 'center' })
  if (dados.empresaCnpj) {
    doc.text(`CNPJ: ${dados.empresaCnpj}`, margin + signWidth / 2, y + 13, { align: 'center' })
  }

  // Locataria
  const rightSignX = pageWidth - margin - signWidth
  doc.setLineWidth(0.3)
  doc.line(rightSignX, y, pageWidth - margin, y)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text(dados.clienteNome, rightSignX + signWidth / 2, y + 5, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.text('LOCATARIA', rightSignX + signWidth / 2, y + 9, { align: 'center' })
  if (dados.clienteDocumento) {
    doc.text(`CPF/CNPJ: ${dados.clienteDocumento}`, rightSignX + signWidth / 2, y + 13, { align: 'center' })
  }

  // ============ PAGINA 2 - QUADRO DE EQUIPAMENTOS ============
  doc.addPage()
  y = margin

  // Header pagina 2
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...AZUL)
  doc.text('QUADRO DE EQUIPAMENTOS', pageWidth / 2, y + 8, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA)
  doc.text(`ANEXO AO CONTRATO - ${dados.numeroOrcamento}`, pageWidth / 2, y + 14, { align: 'center' })

  y += 22

  // Linha separadora
  doc.setDrawColor(...AZUL)
  doc.setLineWidth(0.8)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // Tabela de equipamentos
  const tableData = dados.itens.map(item => {
    const descricao = item.equipamento_marca || item.equipamento_modelo
      ? `${item.equipamento_nome}\n${item.equipamento_marca}${item.equipamento_modelo ? ' - ' + item.equipamento_modelo : ''}`
      : item.equipamento_nome
    return [
      descricao,
      String(item.quantidade),
      capitalize(dados.modalidade),
      formatarMoeda(item.preco_unitario),
      formatarMoeda(item.subtotal)
    ]
  })

  autoTable(doc, {
    startY: y,
    head: [['Equipamento', 'Qtd', 'Modalidade', 'Valor Unitario', 'Subtotal']],
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
      1: { halign: 'center', cellWidth: 18 },
      2: { halign: 'center', cellWidth: 28 },
      3: { halign: 'right', cellWidth: 32 },
      4: { halign: 'right', cellWidth: 32 },
    },
    bodyStyles: {
      fontSize: 8,
      textColor: CINZA_ESCURO as any,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
  })

  y = (doc as any).lastAutoTable.finalY + 8

  // Resumo financeiro
  const resumoX = pageWidth - margin - 80

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...CINZA_ESCURO)

  doc.text('Subtotal:', resumoX, y)
  doc.text(formatarMoeda(dados.subtotal), pageWidth - margin, y, { align: 'right' })
  y += 6

  if (dados.desconto > 0) {
    doc.text('Desconto:', resumoX, y)
    doc.setTextColor(220, 38, 38)
    doc.text(`-${formatarMoeda(dados.desconto)}`, pageWidth - margin, y, { align: 'right' })
    doc.setTextColor(...CINZA_ESCURO)
    y += 6
  }

  if (dados.frete > 0) {
    doc.text('Frete:', resumoX, y)
    doc.text(`+${formatarMoeda(dados.frete)}`, pageWidth - margin, y, { align: 'right' })
    y += 6
  }

  // Linha
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(resumoX, y, pageWidth - margin, y)
  y += 6

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL:', resumoX, y)
  doc.text(formatarMoeda(dados.total), pageWidth - margin, y, { align: 'right' })

  y += 12

  // Informacoes de pagamento
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...CINZA_ESCURO)
  doc.text('Forma de Pagamento:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(formasLabel[dados.formaPagamento] || dados.formaPagamento, margin + 38, y)
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text('Condicao:', margin, y)
  doc.setFont('helvetica', 'normal')
  doc.text(condicoesLabel[dados.condicaoPagamento] || dados.condicaoPagamento, margin + 38, y)

  // Abrir PDF
  const pdfBlob = doc.output('blob')
  const url = URL.createObjectURL(pdfBlob)
  window.open(url, '_blank')
}
