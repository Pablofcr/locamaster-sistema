'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'

export default function FaturamentoPage() {
  const { showToast } = useToast()
  const [faturas, setFaturas] = useState<any[]>([])
  const [locacoes, setLocacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [showForm, setShowForm] = useState(false)
  const [stats, setStats] = useState({ pago: 0, pendente: 0, vencido: 0, total: 0 })

  const [formData, setFormData] = useState({
    locacao_id: '', valor: '', data_vencimento: '', forma_pagamento: '', observacoes: ''
  })

  useEffect(() => { carregarDados() }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [fatRes, locRes] = await Promise.all([
        supabase.from('faturas').select('*').order('created_at', { ascending: false }),
        supabase.from('locacoes').select('id, numero, cliente_nome, valor_total').order('created_at', { ascending: false })
      ])

      const data = fatRes.data || []
      setFaturas(data)
      setLocacoes(locRes.data || [])

      setStats({
        pago: data.filter(f => f.status === 'pago').reduce((s, f) => s + (Number(f.valor) || 0), 0),
        pendente: data.filter(f => f.status === 'pendente' || f.status === 'emitido').reduce((s, f) => s + (Number(f.valor) || 0), 0),
        vencido: data.filter(f => f.status === 'vencido').reduce((s, f) => s + (Number(f.valor) || 0), 0),
        total: data.length
      })
    } catch { showToast('Erro ao carregar faturas', 'error') }
    finally { setLoading(false) }
  }

  const criarFatura = async () => {
    if (!formData.locacao_id || !formData.valor || !formData.data_vencimento) {
      showToast('Preencha os campos obrigatórios', 'warning'); return
    }
    try {
      const locacao = locacoes.find(l => l.id === parseInt(formData.locacao_id))
      const countRes = await supabase.from('faturas').select('*', { count: 'exact', head: true })
      const numero = `FAT-${new Date().getFullYear()}-${String((countRes.count || 0) + 1).padStart(3, '0')}`

      const { error } = await supabase.from('faturas').insert({
        numero, locacao_id: parseInt(formData.locacao_id),
        locacao_numero: locacao?.numero || '', cliente_nome: locacao?.cliente_nome || '',
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: formData.data_vencimento,
        valor: parseFloat(formData.valor), status: 'emitido',
        forma_pagamento: formData.forma_pagamento, observacoes: formData.observacoes
      })
      if (error) throw error

      showToast('Fatura gerada com sucesso!', 'success')
      setShowForm(false)
      setFormData({ locacao_id: '', valor: '', data_vencimento: '', forma_pagamento: '', observacoes: '' })
      carregarDados()
    } catch (error: any) { showToast('Erro ao criar fatura: ' + error.message, 'error') }
  }

  const marcarPago = async (fatura: any) => {
    try {
      await supabase.from('faturas').update({
        status: 'pago', data_pagamento: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      }).eq('id', fatura.id)
      showToast('Fatura marcada como paga!', 'success')
      carregarDados()
    } catch { showToast('Erro ao atualizar fatura', 'error') }
  }

  const cobrar = (fatura: any) => {
    const phone = (fatura.cliente_telefone || '').replace(/\D/g, '')
    if (phone) {
      const msg = encodeURIComponent(`Olá ${fatura.cliente_nome}, informamos que a fatura ${fatura.numero} no valor de ${formatarMoeda(Number(fatura.valor))} encontra-se pendente. Por favor, regularize o pagamento.`)
      window.open(`https://wa.me/55${phone}?text=${msg}`)
    } else {
      showToast('Telefone do cliente não disponível', 'warning')
    }
  }

  const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const getStatusBadge = (status: string) => {
    const c: Record<string, { label: string; color: string }> = {
      pago: { label: 'Pago', color: 'bg-green-100 text-green-800' },
      pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      vencido: { label: 'Vencido', color: 'bg-red-100 text-red-800' },
      emitido: { label: 'Emitido', color: 'bg-blue-100 text-blue-800' },
      cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500' }
    }
    const cfg = c[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return <Badge className={cfg.color}>{cfg.label}</Badge>
  }

  const calcularDiasVencimento = (dataVenc: string) => {
    return Math.ceil((new Date(dataVenc).getTime() - Date.now()) / 86400000)
  }

  const faturasFiltradas = faturas.filter(f => {
    const matchSearch = !searchTerm ||
      (f.numero || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.cliente_nome || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (f.locacao_numero || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filtroStatus === 'todos' || f.status === filtroStatus
    return matchSearch && matchStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando faturamento...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Faturamento</h1>
          <p className="text-gray-600">Controle financeiro e faturas</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>+ Nova Fatura</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Receita Confirmada</div><div className="text-2xl font-bold text-green-600">{formatarMoeda(stats.pago)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">A Receber</div><div className="text-2xl font-bold text-yellow-600">{formatarMoeda(stats.pendente)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Vencidas</div><div className="text-2xl font-bold text-red-600">{formatarMoeda(stats.vencido)}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Total Faturas</div><div className="text-2xl font-bold text-blue-600">{stats.total}</div></CardContent></Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Controle de Faturas</CardTitle>
            <select value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value="todos">Todos Status</option>
              <option value="emitido">Emitidas</option>
              <option value="pendente">Pendentes</option>
              <option value="pago">Pagas</option>
              <option value="vencido">Vencidas</option>
            </select>
          </div>
          <Input placeholder="Buscar por número, cliente ou locação..." value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} className="max-w-md mt-2" />
        </CardHeader>
        <CardContent>
          {faturasFiltradas.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Nenhuma fatura encontrada</div>
          ) : (
            <div className="space-y-4">
              {faturasFiltradas.map(fatura => (
                <div key={fatura.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{fatura.numero || `#${fatura.id}`}</h3>
                        {getStatusBadge(fatura.status)}
                        {fatura.status === 'pendente' && fatura.data_vencimento && (
                          <span className="text-xs bg-yellow-50 text-yellow-700 px-2 py-1 rounded">
                            {calcularDiasVencimento(fatura.data_vencimento)} dias para vencer
                          </span>
                        )}
                        {fatura.status === 'vencido' && fatura.data_vencimento && (
                          <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                            Vencida há {Math.abs(calcularDiasVencimento(fatura.data_vencimento))} dias
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Cliente:</span> {fatura.cliente_nome} -
                        <span className="font-medium"> Locação:</span> {fatura.locacao_numero || '-'}
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">{formatarMoeda(Number(fatura.valor) || 0)}</div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                    <div><span className="font-medium">Emissão:</span><div>{fatura.data_emissao ? new Date(fatura.data_emissao).toLocaleDateString('pt-BR') : '-'}</div></div>
                    <div><span className="font-medium">Vencimento:</span><div>{fatura.data_vencimento ? new Date(fatura.data_vencimento).toLocaleDateString('pt-BR') : '-'}</div></div>
                    <div><span className="font-medium">Pagamento:</span><div>{fatura.forma_pagamento || 'Não informado'}</div>
                      {fatura.data_pagamento && <div className="text-xs text-green-600">{new Date(fatura.data_pagamento).toLocaleDateString('pt-BR')}</div>}
                    </div>
                    {fatura.observacoes && <div><span className="font-medium">Obs:</span><div className="text-xs">{fatura.observacoes}</div></div>}
                  </div>

                  <div className="flex space-x-2">
                    {(fatura.status === 'pendente' || fatura.status === 'emitido') && (
                      <Button variant="outline" size="sm" onClick={() => marcarPago(fatura)} className="text-green-600 border-green-300">Marcar Pago</Button>
                    )}
                    {fatura.status === 'vencido' && (
                      <Button variant="outline" size="sm" onClick={() => cobrar(fatura)} className="text-red-600 border-red-300">Cobrar</Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nova Fatura</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select value={formData.locacao_id} onChange={(e) => setFormData({ ...formData, locacao_id: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Selecionar Locação</option>
                {locacoes.map(l => <option key={l.id} value={l.id}>{l.numero} - {l.cliente_nome}</option>)}
              </select>
              <Input placeholder="Valor Total (R$)" type="number" value={formData.valor} onChange={(e) => setFormData({ ...formData, valor: e.target.value })} />
              <Input placeholder="Data Vencimento" type="date" value={formData.data_vencimento} onChange={(e) => setFormData({ ...formData, data_vencimento: e.target.value })} />
              <select value={formData.forma_pagamento} onChange={(e) => setFormData({ ...formData, forma_pagamento: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Forma de Pagamento</option>
                <option value="PIX">PIX</option>
                <option value="Boleto">Boleto</option>
                <option value="Transferência">Transferência</option>
                <option value="Dinheiro">Dinheiro</option>
              </select>
            </div>
            <div className="mt-4">
              <Input placeholder="Observações da fatura..." value={formData.observacoes} onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })} />
            </div>
            <div className="mt-6 flex space-x-3">
              <Button onClick={criarFatura}>Gerar Fatura</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
