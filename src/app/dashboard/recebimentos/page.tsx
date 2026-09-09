'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import {
  formatarMoeda,
  formatarData,
  simularDistribuicao,
  distribuirPagamento,
} from '@/lib/faturamento'
import { hojeISO } from '@/lib/data'

interface ClienteComFaturas {
  id: number
  nome: string
  cpf_cnpj: string | null
  qtd_faturas: number
  total_aberto: number
  faturas: any[]
}

const NOMES_MES = ['Janeiro', 'Fevereiro', 'Marco', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
const NOMES_MES_CURTO = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

function getNomeMes(mesStr: string) {
  const [a, m] = mesStr.split('-').map(Number)
  return NOMES_MES[m - 1] + ' ' + a
}

export default function RecebimentosPage() {
  const { showToast } = useToast()

  // Aba ativa
  const [abaAtiva, setAbaAtiva] = useState('aberto')

  // === Estado aba Em Aberto ===
  const [clientesDevedores, setClientesDevedores] = useState<ClienteComFaturas[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [clienteExpandidoId, setClienteExpandidoId] = useState<number | null>(null)
  const [faturas, setFaturas] = useState<any[]>([])
  const [loadingFaturas, setLoadingFaturas] = useState(false)
  const [valorRecebido, setValorRecebido] = useState('')
  const [dataPagamento, setDataPagamento] = useState(hojeISO())
  const [formaPagamento, setFormaPagamento] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [preview, setPreview] = useState<ReturnType<typeof simularDistribuicao> | null>(null)
  const [troco, setTroco] = useState(0)
  const [processando, setProcessando] = useState(false)

  // === Estado aba Recebidas ===
  const [faturasRecebidas, setFaturasRecebidas] = useState<any[]>([])
  const [loadingRecebidas, setLoadingRecebidas] = useState(false)
  const [buscaRecebidas, setBuscaRecebidas] = useState('')
  const [mesRecebidas, setMesRecebidas] = useState(() => {
    const h = new Date()
    return h.getFullYear() + '-' + String(h.getMonth() + 1).padStart(2, '0')
  })

  // Carregar dados
  useEffect(() => {
    carregarClientesDevedores()
  }, [])

  useEffect(() => {
    if (abaAtiva === 'recebidas') {
      carregarFaturasRecebidas()
    }
  }, [abaAtiva, mesRecebidas])

  const carregarClientesDevedores = async () => {
    setLoading(true)
    try {
      const { data: faturasAbertas } = await supabase
        .from('faturas')
        .select('cliente_id, cliente_nome, valor, valor_juros, valor_multa, valor_desconto, valor_pago, status')
        .in('status', ['emitido', 'vencido', 'parcial'])

      if (!faturasAbertas || faturasAbertas.length === 0) {
        setClientesDevedores([])
        setLoading(false)
        return
      }

      const mapa: Record<number, { nome: string; total: number; qtd: number }> = {}
      for (const f of faturasAbertas) {
        if (!f.cliente_id) continue
        if (!mapa[f.cliente_id]) {
          mapa[f.cliente_id] = { nome: f.cliente_nome || '', total: 0, qtd: 0 }
        }
        const valorTotal = Number(f.valor) + Number(f.valor_juros || 0) + Number(f.valor_multa || 0) - Number(f.valor_desconto || 0)
        const saldo = valorTotal - Number(f.valor_pago || 0)
        mapa[f.cliente_id].total += saldo
        mapa[f.cliente_id].qtd += 1
      }

      const clienteIds = Object.keys(mapa).map(Number)
      const { data: clientesData } = await supabase
        .from('clientes')
        .select('id, cpf_cnpj')
        .in('id', clienteIds)

      const cpfMap: Record<number, string | null> = {}
      ;(clientesData || []).forEach(c => { cpfMap[c.id] = c.cpf_cnpj })

      const lista: ClienteComFaturas[] = clienteIds.map(id => ({
        id,
        nome: mapa[id].nome,
        cpf_cnpj: cpfMap[id] || null,
        qtd_faturas: mapa[id].qtd,
        total_aberto: Math.round(mapa[id].total * 100) / 100,
        faturas: [],
      }))

      lista.sort((a, b) => b.total_aberto - a.total_aberto)
      setClientesDevedores(lista)
    } catch (_e) {
      showToast('Erro ao carregar clientes', 'error')
    }
    setLoading(false)
  }

  const carregarFaturasRecebidas = async () => {
    setLoadingRecebidas(true)
    try {
      const [ano, mes] = mesRecebidas.split('-').map(Number)
      const inicioMes = ano + '-' + String(mes).padStart(2, '0') + '-01'
      const fimMes = ano + '-' + String(mes).padStart(2, '0') + '-' + new Date(ano, mes, 0).getDate()

      const { data } = await supabase
        .from('faturas')
        .select('*')
        .eq('status', 'pago')
        .gte('data_pagamento', inicioMes)
        .lte('data_pagamento', fimMes)
        .order('data_pagamento', { ascending: false })

      setFaturasRecebidas(data || [])
    } catch (_e) {
      showToast('Erro ao carregar faturas recebidas', 'error')
    }
    setLoadingRecebidas(false)
  }

  const handleExpandirCliente = async (clienteId: number) => {
    if (clienteExpandidoId === clienteId) {
      setClienteExpandidoId(null)
      setFaturas([])
      setPreview(null)
      setValorRecebido('')
      setObservacoes('')
      setTroco(0)
      return
    }

    setClienteExpandidoId(clienteId)
    setPreview(null)
    setValorRecebido('')
    setObservacoes('')
    setTroco(0)
    setLoadingFaturas(true)

    try {
      const { data } = await supabase
        .from('faturas')
        .select('*')
        .eq('cliente_id', clienteId)
        .in('status', ['emitido', 'vencido', 'parcial'])
        .order('data_vencimento', { ascending: true })

      setFaturas(data || [])
    } catch (_e) {
      showToast('Erro ao carregar faturas', 'error')
    }
    setLoadingFaturas(false)
  }

  const handleSimular = () => {
    const valor = parseFloat(valorRecebido)
    if (!valor || valor <= 0) {
      showToast('Informe um valor valido', 'warning')
      return
    }
    if (faturas.length === 0) {
      showToast('Nenhuma fatura em aberto', 'warning')
      return
    }

    const resultado = simularDistribuicao(faturas, valor)
    setPreview(resultado)

    const totalAplicado = resultado.reduce((s, r) => s + r.valor_aplicado, 0)
    setTroco(Math.round((valor - totalAplicado) * 100) / 100)
  }

  const handleConfirmar = async () => {
    if (!preview || preview.length === 0 || !clienteExpandidoId) return
    if (!dataPagamento) {
      showToast('Informe a data do pagamento', 'warning')
      return
    }

    setProcessando(true)
    try {
      const resultado = await distribuirPagamento({
        cliente_id: clienteExpandidoId,
        valor: parseFloat(valorRecebido),
        data_pagamento: dataPagamento,
        forma_pagamento: formaPagamento,
        observacoes: observacoes,
      })

      const qtd = resultado.distribuicao.length
      const msg = resultado.troco > 0
        ? 'Pagamento distribuido em ' + qtd + ' fatura(s). Troco/credito: ' + formatarMoeda(resultado.troco)
        : 'Pagamento distribuido em ' + qtd + ' fatura(s) com sucesso!'

      showToast(msg, 'success')

      setValorRecebido('')
      setObservacoes('')
      setPreview(null)
      setTroco(0)
      setClienteExpandidoId(null)
      setFaturas([])

      await carregarClientesDevedores()
    } catch (err: any) {
      showToast('Erro: ' + err.message, 'error')
    }
    setProcessando(false)
  }

  const navegarMes = (direcao: number) => {
    const [a, m] = mesRecebidas.split('-').map(Number)
    const d = new Date(a, m - 1 + direcao, 1)
    setMesRecebidas(d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'))
  }

  // Computados
  const totalGeralAberto = clientesDevedores.reduce((s, c) => s + c.total_aberto, 0)
  const totalRecebidoMes = faturasRecebidas.reduce((s, f) => s + Number(f.valor_pago || f.valor || 0), 0)

  const totalEmAberto = faturas.reduce((s, f) => {
    const valorTotal = Number(f.valor) + Number(f.valor_juros || 0) + Number(f.valor_multa || 0) - Number(f.valor_desconto || 0)
    return s + valorTotal - Number(f.valor_pago || 0)
  }, 0)

  const clientesFiltrados = clientesDevedores.filter(c => {
    if (!busca) return true
    const termo = busca.toLowerCase()
    return (c.nome || '').toLowerCase().includes(termo) ||
      (c.cpf_cnpj || '').includes(termo)
  })

  const faturasRecebidasFiltradas = faturasRecebidas.filter(f => {
    if (!buscaRecebidas) return true
    const termo = buscaRecebidas.toLowerCase()
    return (f.cliente_nome || '').toLowerCase().includes(termo) ||
      (f.numero || '').toLowerCase().includes(termo) ||
      (f.locacao_numero || '').toLowerCase().includes(termo)
  })

  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' | 'default' }> = {
      vencido: { label: 'Vencido', variant: 'danger' },
      emitido: { label: 'Emitido', variant: 'warning' },
      parcial: { label: 'Parcial', variant: 'primary' },
    }
    const cfg = map[status] || { label: status, variant: 'default' as const }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  // ==========================
  // RENDER
  // ==========================

  const renderAbaAberto = () => (
    <div className="space-y-6">
      {/* Busca */}
      <Card>
        <CardContent className="py-3">
          <Input
            placeholder="Filtrar por nome ou CPF/CNPJ..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Carregando clientes...</p>
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {busca ? 'Nenhum cliente encontrado com esse filtro' : 'Nenhum cliente com faturas em aberto'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {clientesFiltrados.map(cliente => {
            const isExpandido = clienteExpandidoId === cliente.id
            return (
              <div key={cliente.id}>
                <Card className={'cursor-pointer transition-all ' + (isExpandido ? 'ring-2 ring-blue-500 shadow-md' : 'hover:shadow-md')}>
                  <CardContent className="py-4">
                    <div
                      className="flex items-center justify-between"
                      onClick={() => handleExpandirCliente(cliente.id)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 font-bold text-sm">
                            {(cliente.nome || '?').substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{cliente.nome}</div>
                          {cliente.cpf_cnpj && (
                            <div className="text-xs text-gray-400">{cliente.cpf_cnpj}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-center">
                          <div className="text-xs text-gray-400">Faturas</div>
                          <Badge variant={cliente.qtd_faturas > 3 ? 'danger' : 'warning'}>
                            {cliente.qtd_faturas}
                          </Badge>
                        </div>
                        <div className="text-right min-w-[120px]">
                          <div className="text-xs text-gray-400">Total em Aberto</div>
                          <div className="font-bold text-red-600">{formatarMoeda(cliente.total_aberto)}</div>
                        </div>
                        <div className="text-gray-400">
                          {isExpandido ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Area expandida */}
                {isExpandido && (
                  <div className="ml-6 mt-2 space-y-4 border-l-2 border-blue-200 pl-4">
                    {/* Tabela de Faturas */}
                    <Card>
                      <CardHeader className="py-3">
                        <CardTitle>Faturas em Aberto</CardTitle>
                      </CardHeader>
                      <CardContent className="p-0">
                        {loadingFaturas ? (
                          <div className="text-center py-6">
                            <div className="animate-spin rounded-full h-6 w-6 border-4 border-blue-500 border-t-transparent mx-auto mb-2"></div>
                            <p className="text-gray-500 text-sm">Carregando faturas...</p>
                          </div>
                        ) : faturas.length === 0 ? (
                          <div className="text-center py-6 text-gray-500">
                            Nenhuma fatura em aberto
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 border-b">
                                <tr>
                                  <th className="p-3 text-left">Fatura</th>
                                  <th className="p-3 text-left">Locacao</th>
                                  <th className="p-3 text-left">Vencimento</th>
                                  <th className="p-3 text-right">Valor</th>
                                  <th className="p-3 text-right">Pago</th>
                                  <th className="p-3 text-right">Saldo Devedor</th>
                                  <th className="p-3 text-center">Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {faturas.map(f => {
                                  const vt = Number(f.valor) + Number(f.valor_juros || 0) + Number(f.valor_multa || 0) - Number(f.valor_desconto || 0)
                                  const saldo = vt - Number(f.valor_pago || 0)
                                  return (
                                    <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                                      <td className="p-3 font-medium text-blue-600">{f.numero || '#' + f.id}</td>
                                      <td className="p-3 text-gray-500">{f.locacao_numero || '-'}</td>
                                      <td className="p-3 text-gray-600">{f.data_vencimento ? formatarData(f.data_vencimento) : '-'}</td>
                                      <td className="p-3 text-right">{formatarMoeda(vt)}</td>
                                      <td className="p-3 text-right text-green-600">{formatarMoeda(Number(f.valor_pago || 0))}</td>
                                      <td className="p-3 text-right font-semibold text-red-600">{formatarMoeda(saldo)}</td>
                                      <td className="p-3 text-center">{getStatusBadge(f.status)}</td>
                                    </tr>
                                  )
                                })}
                              </tbody>
                              <tfoot className="bg-gray-50 border-t">
                                <tr>
                                  <td colSpan={5} className="p-3 text-right font-semibold text-gray-700">Total em Aberto:</td>
                                  <td className="p-3 text-right font-bold text-red-600">{formatarMoeda(totalEmAberto)}</td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Formulario de Recebimento */}
                    {faturas.length > 0 && (
                      <Card>
                        <CardHeader className="py-3"><CardTitle>Registrar Recebimento</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Valor Recebido (R$)</label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0,00"
                                value={valorRecebido}
                                onChange={e => {
                                  setValorRecebido(e.target.value)
                                  setPreview(null)
                                }}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Data do Pagamento</label>
                              <Input
                                type="date"
                                value={dataPagamento}
                                onChange={e => setDataPagamento(e.target.value)}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                              <select
                                value={formaPagamento}
                                onChange={e => setFormaPagamento(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                              >
                                <option value="">Selecionar...</option>
                                <option value="PIX">PIX</option>
                                <option value="Boleto">Boleto</option>
                                <option value="Transferência">Transferencia</option>
                                <option value="Dinheiro">Dinheiro</option>
                                <option value="Cartão">Cartao</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                              <Input
                                placeholder="Opcional..."
                                value={observacoes}
                                onChange={e => setObservacoes(e.target.value)}
                              />
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Button variant="outline" onClick={handleSimular}>
                              Simular Distribuicao
                            </Button>
                            {preview && preview.length > 0 && (
                              <Button onClick={handleConfirmar} disabled={processando}>
                                {processando ? 'Processando...' : 'Confirmar Recebimento'}
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Preview da Distribuicao */}
                    {preview && preview.length > 0 && (
                      <Card>
                        <CardHeader className="py-3">
                          <CardTitle>Preview da Distribuicao</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                              <thead className="bg-gray-50 border-b">
                                <tr>
                                  <th className="p-3 text-left">Fatura</th>
                                  <th className="p-3 text-right">Saldo Anterior</th>
                                  <th className="p-3 text-right">Pagamento</th>
                                  <th className="p-3 text-right">Novo Saldo</th>
                                  <th className="p-3 text-center">Novo Status</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {preview.map(item => (
                                  <tr key={item.fatura_id} className="hover:bg-gray-50">
                                    <td className="p-3 font-medium">{item.numero}</td>
                                    <td className="p-3 text-right text-gray-600">{formatarMoeda(item.saldo_anterior)}</td>
                                    <td className="p-3 text-right font-semibold text-green-600">- {formatarMoeda(item.valor_aplicado)}</td>
                                    <td className="p-3 text-right font-semibold">
                                      {item.novo_saldo > 0
                                        ? <span className="text-red-600">{formatarMoeda(item.novo_saldo)}</span>
                                        : <span className="text-green-600">{formatarMoeda(0)}</span>
                                      }
                                    </td>
                                    <td className="p-3 text-center">
                                      <Badge variant={item.novo_status === 'pago' ? 'success' : 'warning'}>
                                        {item.novo_status === 'pago' ? 'Pago' : 'Parcial'}
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-gray-50 border-t">
                                <tr>
                                  <td className="p-3 font-semibold text-gray-700">Total</td>
                                  <td></td>
                                  <td className="p-3 text-right font-bold text-green-600">
                                    {formatarMoeda(preview.reduce((s, p) => s + p.valor_aplicado, 0))}
                                  </td>
                                  <td></td>
                                  <td></td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>

                          {troco > 0 && (
                            <div className="p-4 bg-yellow-50 border-t border-yellow-200">
                              <div className="flex items-center gap-2">
                                <span className="text-yellow-700 font-medium">Atencao:</span>
                                <span className="text-yellow-600">
                                  Valor excedente de {formatarMoeda(troco)} (troco/credito). Todas as faturas em aberto serao quitadas.
                                </span>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}

                    {preview && preview.length === 0 && (
                      <Card>
                        <CardContent className="p-6 text-center text-gray-500">
                          Nenhuma fatura a ser afetada com o valor informado.
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )

  const renderAbaRecebidas = () => (
    <div className="space-y-6">
      {/* Filtros */}
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navegarMes(-1)}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-medium text-gray-700 min-w-[160px] text-center">
                {getNomeMes(mesRecebidas)}
              </span>
              <button
                onClick={() => navegarMes(1)}
                className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <Input
                placeholder="Filtrar por cliente, numero da fatura ou locacao..."
                value={buscaRecebidas}
                onChange={e => setBuscaRecebidas(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Faturas Recebidas */}
      {loadingRecebidas ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Carregando faturas recebidas...</p>
        </div>
      ) : faturasRecebidasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {buscaRecebidas
              ? 'Nenhuma fatura encontrada com esse filtro'
              : 'Nenhuma fatura recebida em ' + getNomeMes(mesRecebidas)
            }
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 text-left">Fatura</th>
                    <th className="p-3 text-left">Cliente</th>
                    <th className="p-3 text-left">Locacao</th>
                    <th className="p-3 text-left">Periodo</th>
                    <th className="p-3 text-center">Dt. Vencimento</th>
                    <th className="p-3 text-center">Dt. Pagamento</th>
                    <th className="p-3 text-right">Valor</th>
                    <th className="p-3 text-right">Valor Pago</th>
                    <th className="p-3 text-center">Forma Pgto</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {faturasRecebidasFiltradas.map(f => {
                    let periodoLabel = '-'
                    if (f.periodo_referencia) {
                      const [a, m] = f.periodo_referencia.split('-').map(Number)
                      periodoLabel = NOMES_MES_CURTO[m - 1] + '/' + a
                    }
                    return (
                      <tr key={f.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-medium text-blue-600">{f.numero || '#' + f.id}</td>
                        <td className="p-3 text-gray-700">{f.cliente_nome || '-'}</td>
                        <td className="p-3 text-gray-500">{f.locacao_numero || '-'}</td>
                        <td className="p-3 text-gray-500">{periodoLabel}</td>
                        <td className="p-3 text-center text-gray-600">{f.data_vencimento ? formatarData(f.data_vencimento) : '-'}</td>
                        <td className="p-3 text-center text-gray-600">{f.data_pagamento ? formatarData(f.data_pagamento) : '-'}</td>
                        <td className="p-3 text-right">{formatarMoeda(Number(f.valor))}</td>
                        <td className="p-3 text-right font-semibold text-green-600">{formatarMoeda(Number(f.valor_pago || f.valor))}</td>
                        <td className="p-3 text-center">
                          {f.forma_pagamento ? (
                            <Badge variant="default">{f.forma_pagamento}</Badge>
                          ) : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td colSpan={6} className="p-3 text-right font-semibold text-gray-700">Total Recebido:</td>
                    <td className="p-3 text-right font-bold text-gray-600">
                      {formatarMoeda(faturasRecebidasFiltradas.reduce((s, f) => s + Number(f.valor), 0))}
                    </td>
                    <td className="p-3 text-right font-bold text-green-600">
                      {formatarMoeda(faturasRecebidasFiltradas.reduce((s, f) => s + Number(f.valor_pago || f.valor), 0))}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contas a Receber</h1>
          <p className="text-gray-600">
            {abaAtiva === 'aberto' ? 'Baixa de pagamentos com distribuicao em cascata' : 'Historico de faturas recebidas'}
          </p>
        </div>
        {abaAtiva === 'aberto' && clientesDevedores.length > 0 && (
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Geral em Aberto</div>
            <div className="text-2xl font-bold text-red-600">{formatarMoeda(totalGeralAberto)}</div>
            <div className="text-xs text-gray-400">{clientesDevedores.length} cliente(s)</div>
          </div>
        )}
        {abaAtiva === 'recebidas' && (
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Recebido no Mes</div>
            <div className="text-2xl font-bold text-green-600">{formatarMoeda(totalRecebidoMes)}</div>
            <div className="text-xs text-gray-400">{faturasRecebidas.length} fatura(s)</div>
          </div>
        )}
      </div>

      {/* Abas */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setAbaAtiva('aberto')}
          className={'px-4 py-2 rounded-md text-sm font-medium transition-all ' + (
            abaAtiva === 'aberto'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Em Aberto
          {clientesDevedores.length > 0 && (
            <span className={'ml-2 px-2 py-0.5 rounded-full text-xs ' + (
              abaAtiva === 'aberto' ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-500'
            )}>
              {clientesDevedores.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setAbaAtiva('recebidas')}
          className={'px-4 py-2 rounded-md text-sm font-medium transition-all ' + (
            abaAtiva === 'recebidas'
              ? 'bg-white text-green-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          Recebidas
        </button>
      </div>

      {/* Conteudo da aba */}
      {abaAtiva === 'aberto' && renderAbaAberto()}
      {abaAtiva === 'recebidas' && renderAbaRecebidas()}
    </div>
  )
}
