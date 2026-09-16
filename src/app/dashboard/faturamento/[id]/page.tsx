'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { formatarMoeda, formatarData, registrarPagamento, cancelarFatura, corrigirDataPagamento, obterPeriodoCobertoPelaFatura } from '@/lib/faturamento'
import { lerContasBancarias, contaPrincipal } from '@/lib/configuracaoPagamento'
import { obterLogCobranca, registrarAcaoManual, abrirWhatsApp, processarTemplate } from '@/lib/cobranca'
import { gerarPDFFatura } from '@/lib/gerarPDFFatura'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { hojeISO } from '@/lib/data'

export default function FaturaDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const { showToast } = useToast()
  const { empresa } = useEmpresa()
  const faturaId = Number(params.id)

  const [fatura, setFatura] = useState<any>(null)
  const [locacao, setLocacao] = useState<any>(null)
  const [cliente, setCliente] = useState<any>(null)
  const [configPagamento, setConfigPagamento] = useState<any>(null)
  const [indiceContaPDF, setIndiceContaPDF] = useState(0)
  const [pagamentos, setPagamentos] = useState<any[]>([])
  const [logCobranca, setLogCobranca] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modais
  const [showPagamento, setShowPagamento] = useState(false)
  const [showCancelar, setShowCancelar] = useState(false)
  const [showEditar, setShowEditar] = useState(false)
  const [showAcaoManual, setShowAcaoManual] = useState(false)

  // Formulário pagamento
  const [pgForm, setPgForm] = useState({
    valor: '', data_pagamento: hojeISO(), forma_pagamento: '', observacoes: ''
  })

  // Correcao da data de um pagamento ja lancado
  const [pgEditandoId, setPgEditandoId] = useState<number | null>(null)
  const [pgNovaData, setPgNovaData] = useState('')

  // Formulário cancelamento
  const [motivoCancelamento, setMotivoCancelamento] = useState('')

  // Formulário edição
  const [editForm, setEditForm] = useState({
    data_vencimento: '', valor: '', forma_pagamento: '', observacoes: '',
    valor_desconto: '', valor_juros: '', valor_multa: ''
  })

  // Formulário ação manual
  const [acaoForm, setAcaoForm] = useState({ tipo_acao: 'ligacao', observacoes: '' })

  useEffect(() => { carregarFatura() }, [faturaId])

  const carregarFatura = async () => {
    setLoading(true)
    try {
      const { data: fat } = await supabase
        .from('faturas')
        .select('*')
        .eq('id', faturaId)
        .single()

      if (!fat) { router.push('/dashboard/faturamento'); return }
      setFatura(fat)

      setEditForm({
        data_vencimento: fat.data_vencimento || '',
        valor: String(fat.valor || ''),
        forma_pagamento: fat.forma_pagamento || '',
        observacoes: fat.observacoes || '',
        valor_desconto: String(fat.valor_desconto || '0'),
        valor_juros: String(fat.valor_juros || '0'),
        valor_multa: String(fat.valor_multa || '0'),
      })

      // Carregar dados relacionados em paralelo
      const promises: Promise<any>[] = []

      if (fat.locacao_id) {
        promises.push(
          Promise.resolve(supabase.from('locacoes').select('*, equipamentos(nome, marca, modelo)').eq('id', fat.locacao_id).single())
            .then(r => setLocacao(r.data))
        )
      }

      if (fat.cliente_id) {
        promises.push(
          Promise.resolve(supabase.from('clientes').select('*').eq('id', fat.cliente_id).single())
            .then(r => setCliente(r.data))
        )
      }

      // Contas bancarias: alimentam o seletor de conta do PDF
      promises.push(
        Promise.resolve(supabase.from('configuracoes_faturamento').select('*').limit(1))
          .then(r => {
            const config = r.data?.[0] || null
            setConfigPagamento(config)
            const principal = lerContasBancarias(config).findIndex(c => c.principal)
            setIndiceContaPDF(principal >= 0 ? principal : 0)
          })
      )

      promises.push(
        Promise.resolve(supabase.from('pagamentos').select('*').eq('fatura_id', faturaId).order('created_at', { ascending: false }))
          .then(r => setPagamentos(r.data || []))
      )

      promises.push(
        obterLogCobranca(faturaId).then(setLogCobranca)
      )

      await Promise.all(promises)
    } catch { showToast('Erro ao carregar fatura', 'error') }
    setLoading(false)
  }

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' | 'default' }> = {
      pago: { label: 'Pago', variant: 'success' },
      pendente: { label: 'Pendente', variant: 'warning' },
      vencido: { label: 'Vencido', variant: 'danger' },
      emitido: { label: 'Emitido', variant: 'primary' },
      parcial: { label: 'Parcial', variant: 'warning' },
      cancelado: { label: 'Cancelado', variant: 'default' },
    }
    const cfg = map[status] || { label: status, variant: 'default' as const }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const handleRegistrarPagamento = async () => {
    if (!pgForm.valor || !pgForm.data_pagamento) {
      showToast('Preencha valor e data', 'warning'); return
    }
    try {
      await registrarPagamento({
        fatura_id: faturaId,
        valor: parseFloat(pgForm.valor),
        data_pagamento: pgForm.data_pagamento,
        forma_pagamento: pgForm.forma_pagamento,
        observacoes: pgForm.observacoes,
      })
      showToast('Pagamento registrado!', 'success')
      setShowPagamento(false)
      setPgForm({ valor: '', data_pagamento: hojeISO(), forma_pagamento: '', observacoes: '' })
      carregarFatura()
    } catch (err: any) { showToast('Erro: ' + err.message, 'error') }
  }

  const handleCorrigirData = async (pagamentoId: number) => {
    if (!pgNovaData) { showToast('Informe a nova data', 'warning'); return }
    try {
      await corrigirDataPagamento(pagamentoId, faturaId, pgNovaData)
      showToast('Data do pagamento corrigida!', 'success')
      setPgEditandoId(null)
      setPgNovaData('')
      carregarFatura()
    } catch (err: any) { showToast('Erro: ' + err.message, 'error') }
  }

  const handleCancelar = async () => {
    if (!motivoCancelamento) { showToast('Informe o motivo', 'warning'); return }
    try {
      await cancelarFatura(faturaId, motivoCancelamento)
      showToast('Fatura cancelada', 'success')
      setShowCancelar(false)
      carregarFatura()
    } catch { showToast('Erro ao cancelar', 'error') }
  }

  const handleSalvarEdicao = async () => {
    try {
      await supabase.from('faturas').update({
        data_vencimento: editForm.data_vencimento,
        valor: parseFloat(editForm.valor) || 0,
        forma_pagamento: editForm.forma_pagamento,
        observacoes: editForm.observacoes,
        valor_desconto: parseFloat(editForm.valor_desconto) || 0,
        valor_juros: parseFloat(editForm.valor_juros) || 0,
        valor_multa: parseFloat(editForm.valor_multa) || 0,
        updated_at: new Date().toISOString(),
      }).eq('id', faturaId)
      showToast('Fatura atualizada!', 'success')
      setShowEditar(false)
      carregarFatura()
    } catch { showToast('Erro ao atualizar', 'error') }
  }

  const handleAcaoManual = async () => {
    try {
      await registrarAcaoManual({
        fatura_id: faturaId,
        tipo_acao: acaoForm.tipo_acao,
        observacoes: acaoForm.observacoes,
      })
      showToast('Ação registrada!', 'success')
      setShowAcaoManual(false)
      setAcaoForm({ tipo_acao: 'ligacao', observacoes: '' })
      carregarFatura()
    } catch { showToast('Erro ao registrar ação', 'error') }
  }

  // A conta escolhida no seletor; sem escolha, a principal
  const contasDisponiveis = lerContasBancarias(configPagamento)

  const handleGerarPDF = async () => {
    if (!fatura) return
    try {
      const { data: configArr } = await supabase.from('configuracoes_faturamento').select('*').limit(1)
      const config = configArr?.[0]
      const conta = lerContasBancarias(config)[indiceContaPDF] || contaPrincipal(config)
      const periodoMedicao = await obterPeriodoCobertoPelaFatura(fatura)

      const itens = locacao ? [{
        equipamento_nome: locacao.equipamento_nome || locacao.equipamentos?.nome || '',
        equipamento_marca: locacao.equipamentos?.marca || '',
        equipamento_modelo: locacao.equipamentos?.modelo || '',
        quantidade: locacao.quantidade || 1,
        valor_unitario: Number(locacao.valor_dia || locacao.valor_total) || 0,
        subtotal: Number(fatura.valor) || 0,
      }] : []

      gerarPDFFatura({
        numero: fatura.numero,
        data_emissao: fatura.data_emissao,
        data_vencimento: fatura.data_vencimento,
        tipo: fatura.tipo || 'avulsa',
        parcela_numero: fatura.parcela_numero,
        parcela_total: fatura.parcela_total,
        periodo_referencia: fatura.periodo_referencia,
        forma_pagamento: fatura.forma_pagamento,
        observacoes: fatura.observacoes,
        cliente_nome: fatura.cliente_nome,
        cliente_documento: cliente?.documento || '',
        cliente_email: cliente?.email || fatura.cliente_email || '',
        cliente_telefone: cliente?.telefone || fatura.cliente_telefone || '',
        locacao_numero: fatura.locacao_numero,
        locacao_data_inicio: locacao?.data_inicio,
        locacao_data_fim: locacao?.data_fim,
        periodo_medicao: periodoMedicao || undefined,
        itens,
        valor_original: Number(fatura.valor_original || fatura.valor) || 0,
        valor_desconto: Number(fatura.valor_desconto) || 0,
        valor_juros: Number(fatura.valor_juros) || 0,
        valor_multa: Number(fatura.valor_multa) || 0,
        valor_total: Number(fatura.valor) || 0,
        valor_pago: Number(fatura.valor_pago) || 0,
      }, empresa ? {
        razao_social: empresa.razao_social,
        nome_fantasia: empresa.nome_fantasia,
        cnpj: empresa.cnpj,
        email: empresa.email,
        telefone: empresa.telefone,
        logo_base64: empresa.logo_base64,
      } : undefined, config ? { ...config, conta } : undefined)
    } catch { showToast('Erro ao gerar PDF', 'error') }
  }

  if (loading || !fatura) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando fatura...</p>
        </div>
      </div>
    )
  }

  const valorTotal = Number(fatura.valor) + Number(fatura.valor_juros || 0) + Number(fatura.valor_multa || 0) - Number(fatura.valor_desconto || 0)
  const saldoDevedor = valorTotal - Number(fatura.valor_pago || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{fatura.numero || `Fatura #${fatura.id}`}</h1>
            {fatura.tipo === 'indenizacao' && (
              <Badge variant="danger">Indenizacao</Badge>
            )}
            {getStatusBadge(fatura.status)}
            {fatura.parcela_numero && fatura.parcela_total && (
              <Badge variant="secondary">Parcela {fatura.parcela_numero}/{fatura.parcela_total}</Badge>
            )}
          </div>
          <p className="text-gray-600">{fatura.cliente_nome}</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {/* A conta que sai no PDF; so aparece quando ha mais de uma cadastrada */}
          {contasDisponiveis.length > 1 && (
            <select value={indiceContaPDF} onChange={e => setIndiceContaPDF(Number(e.target.value))}
              title="Conta que aparece no PDF"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              {contasDisponiveis.map((c, i) => (
                <option key={i} value={i}>
                  {c.nome || `Conta ${i + 1}`}{c.conta ? ` - ${c.conta}` : ''}{c.principal ? ' (principal)' : ''}
                </option>
              ))}
            </select>
          )}
          <Button variant="outline" onClick={handleGerarPDF}>PDF</Button>
          {fatura.status !== 'pago' && fatura.status !== 'cancelado' && (
            <>
              <Button variant="outline" onClick={() => setShowEditar(true)}>Editar</Button>
              <Button onClick={() => {
                setPgForm({ ...pgForm, valor: String(saldoDevedor > 0 ? saldoDevedor : 0) })
                setShowPagamento(true)
              }}>+ Pagamento</Button>
              <Button variant="danger" onClick={() => setShowCancelar(true)}>Cancelar</Button>
            </>
          )}
          {fatura.cliente_telefone && (
            <Button variant="outline" onClick={() => {
              const msg = `Olá ${fatura.cliente_nome}, referente a fatura ${fatura.numero} no valor de ${formatarMoeda(Number(fatura.valor))}.`
              abrirWhatsApp(fatura.cliente_telefone, msg)
            }}>WhatsApp</Button>
          )}
          <Button variant="outline" onClick={() => router.push('/dashboard/faturamento')}>
            Voltar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info da fatura */}
          <Card>
            <CardHeader><CardTitle>Informacoes da Fatura</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Emissao</span>
                  <span className="font-medium">{formatarData(fatura.data_emissao)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Vencimento</span>
                  <span className="font-medium">{formatarData(fatura.data_vencimento)}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Tipo</span>
                  <span className="font-medium capitalize">{fatura.tipo || 'Avulsa'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Forma Pagamento</span>
                  <span className="font-medium">{fatura.forma_pagamento || '-'}</span>
                </div>
                {fatura.locacao_numero && (
                  <div>
                    <span className="text-gray-500 block">Locacao</span>
                    <span className="font-medium">{fatura.locacao_numero}</span>
                  </div>
                )}
                {fatura.periodo_referencia && (
                  <div>
                    <span className="text-gray-500 block">Referencia</span>
                    <span className="font-medium">{fatura.periodo_referencia}</span>
                  </div>
                )}
                {fatura.data_pagamento && (
                  <div>
                    <span className="text-gray-500 block">Data Pagamento</span>
                    <span className="font-medium text-green-600">{formatarData(fatura.data_pagamento)}</span>
                  </div>
                )}
                {fatura.motivo_cancelamento && (
                  <div className="col-span-2">
                    <span className="text-gray-500 block">Motivo Cancelamento</span>
                    <span className="font-medium text-red-600">{fatura.motivo_cancelamento}</span>
                  </div>
                )}
              </div>
              {fatura.observacoes && (
                <div className="mt-4 pt-4 border-t">
                  <span className="text-gray-500 block text-sm">Observacoes</span>
                  <p className="text-sm">{fatura.observacoes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Itens da locacao */}
          {locacao && (
            <Card>
              <CardHeader><CardTitle>Itens da Locacao</CardTitle></CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">Equipamento</th>
                      <th className="p-3 text-center">Qtd</th>
                      <th className="p-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-3">
                        <div className="font-medium">{locacao.equipamento_nome || locacao.equipamentos?.nome}</div>
                        {locacao.equipamentos?.marca && (
                          <div className="text-xs text-gray-500">{locacao.equipamentos.marca} {locacao.equipamentos.modelo || ''}</div>
                        )}
                      </td>
                      <td className="p-3 text-center">{locacao.quantidade || 1}</td>
                      <td className="p-3 text-right font-medium">{formatarMoeda(Number(locacao.valor_total))}</td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Pagamentos */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Pagamentos Registrados</CardTitle>
                {fatura.status !== 'pago' && fatura.status !== 'cancelado' && (
                  <Button size="sm" variant="outline" onClick={() => {
                    setPgForm({ ...pgForm, valor: String(saldoDevedor > 0 ? saldoDevedor : 0) })
                    setShowPagamento(true)
                  }}>+ Registrar</Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {pagamentos.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum pagamento registrado</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 text-left">Data</th>
                      <th className="p-3 text-right">Valor</th>
                      <th className="p-3 text-left">Forma</th>
                      <th className="p-3 text-left">Obs</th>
                      <th className="p-3 text-right">Acoes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {pagamentos.map(pg => (
                      <tr key={pg.id}>
                        <td className="p-3">
                          {pgEditandoId === pg.id ? (
                            <Input type="date" value={pgNovaData} onChange={e => setPgNovaData(e.target.value)} />
                          ) : (
                            formatarData(pg.data_pagamento)
                          )}
                        </td>
                        <td className="p-3 text-right font-medium text-green-600">{formatarMoeda(Number(pg.valor))}</td>
                        <td className="p-3">{pg.forma_pagamento || '-'}</td>
                        <td className="p-3 text-gray-500 text-xs">{pg.observacoes || '-'}</td>
                        <td className="p-3 text-right whitespace-nowrap">
                          {pgEditandoId === pg.id ? (
                            <>
                              <Button size="sm" onClick={() => handleCorrigirData(pg.id)}>Salvar</Button>
                              <Button size="sm" variant="outline" className="ml-2" onClick={() => { setPgEditandoId(null); setPgNovaData('') }}>Cancelar</Button>
                            </>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => { setPgEditandoId(pg.id); setPgNovaData(pg.data_pagamento || '') }}>
                              Corrigir data
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>

          {/* Historico de cobranca */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Historico de Cobranca</CardTitle>
                <Button size="sm" variant="outline" onClick={() => setShowAcaoManual(true)}>+ Acao Manual</Button>
              </div>
            </CardHeader>
            <CardContent>
              {logCobranca.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhuma cobranca registrada</p>
              ) : (
                <div className="space-y-3">
                  {logCobranca.map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border-l-2 border-blue-300 bg-gray-50 rounded-r">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium capitalize">{log.tipo_acao}</span>
                          <Badge variant={log.status === 'enviado' ? 'success' : log.status === 'manual' ? 'primary' : 'default'}>
                            {log.status}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        {log.mensagem && <p className="text-xs text-gray-600">{log.mensagem}</p>}
                        {log.observacoes && <p className="text-xs text-gray-500 mt-1">{log.observacoes}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Coluna lateral - Resumo Financeiro */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Resumo Financeiro</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Valor Original</span>
                <span className="font-medium">{formatarMoeda(Number(fatura.valor_original || fatura.valor))}</span>
              </div>
              {Number(fatura.valor_desconto) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Desconto</span>
                  <span className="text-green-600">- {formatarMoeda(Number(fatura.valor_desconto))}</span>
                </div>
              )}
              {Number(fatura.valor_juros) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Juros</span>
                  <span className="text-red-600">+ {formatarMoeda(Number(fatura.valor_juros))}</span>
                </div>
              )}
              {Number(fatura.valor_multa) > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Multa</span>
                  <span className="text-red-600">+ {formatarMoeda(Number(fatura.valor_multa))}</span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-bold text-lg">{formatarMoeda(valorTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pago</span>
                <span className="text-green-600 font-medium">{formatarMoeda(Number(fatura.valor_pago || 0))}</span>
              </div>
              <div className="border-t pt-3 flex justify-between">
                <span className="font-semibold">Saldo Devedor</span>
                <span className={`font-bold text-lg ${saldoDevedor > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatarMoeda(Math.max(0, saldoDevedor))}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Info do cliente */}
          {cliente && (
            <Card>
              <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div><span className="text-gray-500">Nome:</span> <span className="font-medium">{cliente.nome}</span></div>
                {cliente.documento && <div><span className="text-gray-500">CPF/CNPJ:</span> {cliente.documento}</div>}
                {cliente.email && <div><span className="text-gray-500">Email:</span> {cliente.email}</div>}
                {cliente.telefone && <div><span className="text-gray-500">Telefone:</span> {cliente.telefone}</div>}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ============ MODAIS ============ */}

      {/* Modal Registrar Pagamento */}
      {showPagamento && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Registrar Pagamento</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <Input type="number" value={pgForm.valor} onChange={e => setPgForm({ ...pgForm, valor: e.target.value })}
                  placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
                <Input type="date" value={pgForm.data_pagamento}
                  onChange={e => setPgForm({ ...pgForm, data_pagamento: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma</label>
                <select value={pgForm.forma_pagamento}
                  onChange={e => setPgForm({ ...pgForm, forma_pagamento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">Selecionar...</option>
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Transferência">Transferencia</option>
                  <option value="Dinheiro">Dinheiro</option>
                  <option value="Cartão">Cartao</option>
                </select>
              </div>
              <Input placeholder="Observacoes" value={pgForm.observacoes}
                onChange={e => setPgForm({ ...pgForm, observacoes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowPagamento(false)}>Cancelar</Button>
              <Button onClick={handleRegistrarPagamento}>Confirmar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cancelar */}
      {showCancelar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 text-red-600">Cancelar Fatura</h3>
            <p className="text-sm text-gray-600 mb-4">Esta acao nao pode ser desfeita.</p>
            <textarea placeholder="Motivo do cancelamento..." value={motivoCancelamento}
              onChange={e => setMotivoCancelamento(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-24 resize-none" />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCancelar(false)}>Voltar</Button>
              <Button variant="danger" onClick={handleCancelar}>Confirmar Cancelamento</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {showEditar && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-bold mb-4">Editar Fatura</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento</label>
                <Input type="date" value={editForm.data_vencimento}
                  onChange={e => setEditForm({ ...editForm, data_vencimento: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <Input type="number" value={editForm.valor}
                  onChange={e => setEditForm({ ...editForm, valor: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                <Input type="number" value={editForm.valor_desconto}
                  onChange={e => setEditForm({ ...editForm, valor_desconto: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Juros</label>
                <Input type="number" value={editForm.valor_juros}
                  onChange={e => setEditForm({ ...editForm, valor_juros: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Multa</label>
                <Input type="number" value={editForm.valor_multa}
                  onChange={e => setEditForm({ ...editForm, valor_multa: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Forma Pagamento</label>
                <select value={editForm.forma_pagamento}
                  onChange={e => setEditForm({ ...editForm, forma_pagamento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="">Selecionar...</option>
                  <option value="PIX">PIX</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Transferência">Transferencia</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
              <Input value={editForm.observacoes}
                onChange={e => setEditForm({ ...editForm, observacoes: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowEditar(false)}>Cancelar</Button>
              <Button onClick={handleSalvarEdicao}>Salvar</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Acao Manual */}
      {showAcaoManual && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Registrar Acao Manual</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Acao</label>
                <select value={acaoForm.tipo_acao}
                  onChange={e => setAcaoForm({ ...acaoForm, tipo_acao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                  <option value="ligacao">Ligacao</option>
                  <option value="email">Email</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="visita">Visita</option>
                  <option value="negociacao">Negociacao</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <textarea placeholder="Observacoes da acao..." value={acaoForm.observacoes}
                onChange={e => setAcaoForm({ ...acaoForm, observacoes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-24 resize-none" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAcaoManual(false)}>Cancelar</Button>
              <Button onClick={handleAcaoManual}>Registrar</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
