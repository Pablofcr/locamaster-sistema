'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { hojeISO } from '@/lib/data'

const CATEGORIAS = [
  { value: 'aluguel', label: 'Aluguel / Locacao' },
  { value: 'salarios', label: 'Salarios / Folha' },
  { value: 'impostos', label: 'Impostos / Tributos' },
  { value: 'combustivel', label: 'Combustivel' },
  { value: 'manutencao', label: 'Manutencao / Reparos' },
  { value: 'pecas', label: 'Pecas / Insumos' },
  { value: 'servicos', label: 'Servicos Terceirizados' },
  { value: 'seguro', label: 'Seguros' },
  { value: 'energia', label: 'Energia / Agua / Telecom' },
  { value: 'transporte', label: 'Transporte / Frete' },
  { value: 'equipamento', label: 'Compra de Equipamento' },
  { value: 'financeiro', label: 'Juros / Tarifas Bancarias' },
  { value: 'outros', label: 'Outros' },
]

const FORMAS_PAGAMENTO = [
  'PIX', 'Boleto', 'Transferencia', 'Dinheiro', 'Cartao', 'Cheque', 'Debito Automatico'
]

interface ContaPagar {
  id: number
  descricao: string
  categoria: string
  fornecedor_id: number | null
  fornecedor_nome: string | null
  valor: number
  valor_pago: number
  data_emissao: string
  data_vencimento: string
  data_pagamento: string | null
  forma_pagamento: string | null
  numero_documento: string | null
  numero_nota_fiscal: string | null
  parcela_numero: number
  parcela_total: number
  recorrente: boolean
  recorrencia_tipo: string | null
  status: string
  observacoes: string | null
}

export default function ContasPagarPage() {
  const { showToast } = useToast()

  const [contas, setContas] = useState<ContaPagar[]>([])
  const [fornecedores, setFornecedores] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todos')
  const [filtroPeriodo, setFiltroPeriodo] = useState('todos')

  // Modal
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState<ContaPagar | null>(null)
  const [salvando, setSalvando] = useState(false)

  // Modal de Pagamento
  const [showPagamento, setShowPagamento] = useState(false)
  const [contaPagando, setContaPagando] = useState<ContaPagar | null>(null)
  const [pagValor, setPagValor] = useState('')
  const [pagData, setPagData] = useState(() => hojeISO())
  const [pagForma, setPagForma] = useState('')
  const [pagObs, setPagObs] = useState('')
  const [processandoPag, setProcessandoPag] = useState(false)

  // Form
  const [form, setForm] = useState({
    descricao: '',
    categoria: 'outros',
    fornecedor_id: '',
    valor: '',
    data_emissao: hojeISO(),
    data_vencimento: '',
    numero_documento: '',
    numero_nota_fiscal: '',
    parcelas: '1',
    recorrente: false,
    recorrencia_tipo: '',
    observacoes: '',
  })

  useEffect(() => {
    inicializar()
  }, [filtroStatus, filtroCategoria, filtroPeriodo])

  const inicializar = async () => {
    setLoading(true)
    try {
      await gerarRecorrencias()
      await carregarDados()
    } catch (err: any) {
      console.error('Erro ao inicializar:', err)
    }
    setLoading(false)
  }

  const gerarRecorrencias = async () => {
    // Buscar contas recorrentes "pai" (sem conta_pai_id)
    const { data: recorrentes } = await supabase
      .from('contas_pagar')
      .select('*')
      .eq('recorrente', true)
      .is('conta_pai_id', null)
      .neq('status', 'cancelado')

    if (!recorrentes || recorrentes.length === 0) return

    for (const pai of recorrentes) {
      if (!pai.recorrencia_tipo || !pai.data_vencimento) continue

      // Buscar filhos já existentes
      const { data: filhos } = await supabase
        .from('contas_pagar')
        .select('data_vencimento')
        .eq('conta_pai_id', pai.id)

      // Coletar todas as datas já existentes (pai + filhos)
      const datasExistentes = new Set<string>()
      datasExistentes.add(pai.data_vencimento)
      ;(filhos || []).forEach((f: any) => datasExistentes.add(f.data_vencimento))

      // Calcular datas esperadas até 1 mês à frente
      const hoje = new Date()
      const limite = new Date(hoje)
      limite.setMonth(limite.getMonth() + 1)

      const dataInicial = new Date(pai.data_vencimento + 'T12:00:00')
      const novasContas: any[] = []

      let dataAtual = new Date(dataInicial)
      let seguranca = 0
      const MAX_ITERACOES = 500

      while (dataAtual <= limite && seguranca < MAX_ITERACOES) {
        seguranca++
        const dataStr = dataAtual.toISOString().split('T')[0]

        if (!datasExistentes.has(dataStr)) {
          novasContas.push({
            descricao: pai.descricao,
            categoria: pai.categoria,
            fornecedor_id: pai.fornecedor_id,
            fornecedor_nome: pai.fornecedor_nome,
            valor: pai.valor,
            data_emissao: dataStr,
            data_vencimento: dataStr,
            numero_documento: pai.numero_documento || null,
            numero_nota_fiscal: pai.numero_nota_fiscal || null,
            conta_pai_id: pai.id,
            recorrente: false,
            recorrencia_tipo: null,
            status: 'pendente',
            observacoes: pai.observacoes || null,
          })
        }

        // Avançar para a próxima ocorrência
        switch (pai.recorrencia_tipo) {
          case 'semanal': dataAtual.setDate(dataAtual.getDate() + 7); break
          case 'quinzenal': dataAtual.setDate(dataAtual.getDate() + 14); break
          case 'mensal': dataAtual.setMonth(dataAtual.getMonth() + 1); break
          case 'bimestral': dataAtual.setMonth(dataAtual.getMonth() + 2); break
          case 'trimestral': dataAtual.setMonth(dataAtual.getMonth() + 3); break
          case 'semestral': dataAtual.setMonth(dataAtual.getMonth() + 6); break
          case 'anual': dataAtual.setFullYear(dataAtual.getFullYear() + 1); break
          default: dataAtual.setMonth(dataAtual.getMonth() + 1)
        }
      }

      // Inserir entradas faltantes
      if (novasContas.length > 0) {
        const { error: insertError } = await supabase.from('contas_pagar').insert(novasContas)
        if (insertError) console.error('Erro ao gerar recorrências:', insertError.message)
      }
    }
  }

  const carregarDados = async () => {
    try {
      // Carregar fornecedores
      const { data: fornData } = await supabase
        .from('fornecedores')
        .select('id, nome')
        .order('nome')
      setFornecedores(fornData || [])

      // Carregar contas
      let query = supabase
        .from('contas_pagar')
        .select('*')
        .order('data_vencimento', { ascending: true })

      if (filtroStatus !== 'todos') {
        query = query.eq('status', filtroStatus)
      }
      if (filtroCategoria !== 'todos') {
        query = query.eq('categoria', filtroCategoria)
      }
      if (filtroPeriodo !== 'todos') {
        const hoje = new Date()
        if (filtroPeriodo === 'semana') {
          const fim = new Date(hoje)
          fim.setDate(fim.getDate() + 7)
          query = query.gte('data_vencimento', hoje.toISOString().split('T')[0])
            .lte('data_vencimento', fim.toISOString().split('T')[0])
        } else if (filtroPeriodo === 'mes') {
          const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
          const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0)
          query = query.gte('data_vencimento', inicioMes.toISOString().split('T')[0])
            .lte('data_vencimento', fimMes.toISOString().split('T')[0])
        } else if (filtroPeriodo === 'vencidas') {
          query = query.lt('data_vencimento', hoje.toISOString().split('T')[0])
            .in('status', ['pendente', 'vencido'])
        }
      }

      const { data, error } = await query
      if (error) throw error

      setContas(data || [])
    } catch (error: any) {
      showToast('Erro ao carregar contas: ' + error.message, 'error')
    }
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
  }

  const formatarData = (data: string) => {
    if (!data) return '-'
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR')
  }

  const getCategoriaLabel = (cat: string) => {
    return CATEGORIAS.find(c => c.value === cat)?.label || cat
  }

  const getStatusBadge = (conta: ContaPagar) => {
    const hoje = hojeISO()
    let status = conta.status

    if ((status === 'pendente') && conta.data_vencimento < hoje) {
      status = 'vencido'
    }

    const map: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' | 'default' }> = {
      pendente: { label: 'Pendente', variant: 'warning' },
      pago: { label: 'Pago', variant: 'success' },
      parcial: { label: 'Parcial', variant: 'primary' },
      vencido: { label: 'Vencido', variant: 'danger' },
      cancelado: { label: 'Cancelado', variant: 'default' },
    }
    const cfg = map[status] || { label: status, variant: 'default' as const }
    return <Badge variant={cfg.variant}>{cfg.label}</Badge>
  }

  const diasParaVencer = (dataVenc: string) => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const venc = new Date(dataVenc + 'T12:00:00')
    venc.setHours(0, 0, 0, 0)
    const diff = Math.ceil((venc.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const contasFiltradas = contas.filter(c => {
    if (!busca) return true
    const termo = busca.toLowerCase()
    return (c.descricao || '').toLowerCase().includes(termo) ||
      (c.fornecedor_nome || '').toLowerCase().includes(termo) ||
      (c.numero_documento || '').toLowerCase().includes(termo) ||
      (c.numero_nota_fiscal || '').toLowerCase().includes(termo)
  })

  // Estatisticas
  const hoje = hojeISO()
  const totalPendente = contas.filter(c => c.status === 'pendente' || c.status === 'vencido').reduce((s, c) => s + (Number(c.valor) - Number(c.valor_pago || 0)), 0)
  const totalVencido = contas.filter(c => (c.status === 'pendente' || c.status === 'vencido') && c.data_vencimento < hoje).reduce((s, c) => s + (Number(c.valor) - Number(c.valor_pago || 0)), 0)
  const totalPagoMes = (() => {
    const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
    const fimMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
    return contas.filter(c => c.status === 'pago' && c.data_pagamento && c.data_pagamento >= inicioMes && c.data_pagamento <= fimMes).reduce((s, c) => s + Number(c.valor), 0)
  })()
  const vencemHoje = contas.filter(c => c.data_vencimento === hoje && c.status !== 'pago' && c.status !== 'cancelado').length

  // Abrir modal novo
  const abrirNovo = () => {
    setEditando(null)
    setForm({
      descricao: '',
      categoria: 'outros',
      fornecedor_id: '',
      valor: '',
      data_emissao: hojeISO(),
      data_vencimento: '',
      numero_documento: '',
      numero_nota_fiscal: '',
      parcelas: '1',
      recorrente: false,
      recorrencia_tipo: '',
      observacoes: '',
    })
    setShowModal(true)
  }

  // Abrir modal editar
  const abrirEditar = (conta: ContaPagar) => {
    setEditando(conta)
    setForm({
      descricao: conta.descricao,
      categoria: conta.categoria,
      fornecedor_id: conta.fornecedor_id ? String(conta.fornecedor_id) : '',
      valor: String(conta.valor),
      data_emissao: conta.data_emissao || hojeISO(),
      data_vencimento: conta.data_vencimento,
      numero_documento: conta.numero_documento || '',
      numero_nota_fiscal: conta.numero_nota_fiscal || '',
      parcelas: '1',
      recorrente: conta.recorrente || false,
      recorrencia_tipo: conta.recorrencia_tipo || '',
      observacoes: conta.observacoes || '',
    })
    setShowModal(true)
  }

  // Salvar conta
  const handleSalvar = async () => {
    if (!form.descricao.trim()) {
      showToast('Informe a descricao da conta', 'warning')
      return
    }
    if (!form.valor || parseFloat(form.valor) <= 0) {
      showToast('Informe um valor valido', 'warning')
      return
    }
    if (!form.data_vencimento) {
      showToast('Informe a data de vencimento', 'warning')
      return
    }

    setSalvando(true)
    try {
      const fornecedor = fornecedores.find((f: any) => f.id === parseInt(form.fornecedor_id))
      const valorTotal = parseFloat(form.valor)
      const numParcelas = Math.max(1, parseInt(form.parcelas) || 1)

      if (editando) {
        const { error } = await supabase.from('contas_pagar').update({
          descricao: form.descricao,
          categoria: form.categoria,
          fornecedor_id: form.fornecedor_id ? parseInt(form.fornecedor_id) : null,
          fornecedor_nome: fornecedor?.nome || null,
          valor: valorTotal,
          data_emissao: form.data_emissao,
          data_vencimento: form.data_vencimento,
          numero_documento: form.numero_documento || null,
          numero_nota_fiscal: form.numero_nota_fiscal || null,
          recorrente: form.recorrente,
          recorrencia_tipo: form.recorrente ? form.recorrencia_tipo : null,
          observacoes: form.observacoes || null,
          updated_at: new Date().toISOString(),
        }).eq('id', editando.id)

        if (error) throw error
        showToast('Conta atualizada com sucesso!', 'success')
      } else {
        if (numParcelas > 1) {
          const valorParcela = Math.round((valorTotal / numParcelas) * 100) / 100
          const contasInserir = []
          const dataBase = new Date(form.data_vencimento + 'T12:00:00')

          for (let i = 0; i < numParcelas; i++) {
            const dataVenc = new Date(dataBase)
            dataVenc.setMonth(dataVenc.getMonth() + i)

            contasInserir.push({
              descricao: `${form.descricao} (${i + 1}/${numParcelas})`,
              categoria: form.categoria,
              fornecedor_id: form.fornecedor_id ? parseInt(form.fornecedor_id) : null,
              fornecedor_nome: fornecedor?.nome || null,
              valor: i === numParcelas - 1 ? Math.round((valorTotal - valorParcela * (numParcelas - 1)) * 100) / 100 : valorParcela,
              data_emissao: form.data_emissao,
              data_vencimento: dataVenc.toISOString().split('T')[0],
              numero_documento: form.numero_documento || null,
              numero_nota_fiscal: form.numero_nota_fiscal || null,
              parcela_numero: i + 1,
              parcela_total: numParcelas,
              recorrente: form.recorrente,
              recorrencia_tipo: form.recorrente ? form.recorrencia_tipo : null,
              observacoes: form.observacoes || null,
              status: 'pendente',
            })
          }

          const { error } = await supabase.from('contas_pagar').insert(contasInserir)
          if (error) throw error
          showToast(`${numParcelas} parcelas criadas com sucesso!`, 'success')
        } else {
          const { error } = await supabase.from('contas_pagar').insert({
            descricao: form.descricao,
            categoria: form.categoria,
            fornecedor_id: form.fornecedor_id ? parseInt(form.fornecedor_id) : null,
            fornecedor_nome: fornecedor?.nome || null,
            valor: valorTotal,
            data_emissao: form.data_emissao,
            data_vencimento: form.data_vencimento,
            numero_documento: form.numero_documento || null,
            numero_nota_fiscal: form.numero_nota_fiscal || null,
            parcela_numero: 1,
            parcela_total: 1,
            recorrente: form.recorrente,
            recorrencia_tipo: form.recorrente ? form.recorrencia_tipo : null,
            observacoes: form.observacoes || null,
            status: 'pendente',
          })
          if (error) throw error
          showToast('Conta criada com sucesso!', 'success')
        }
      }

      setShowModal(false)
      await inicializar()
    } catch (error: any) {
      showToast('Erro ao salvar: ' + error.message, 'error')
    }
    setSalvando(false)
  }

  // Abrir pagamento
  const abrirPagamento = (conta: ContaPagar) => {
    setContaPagando(conta)
    const saldo = Number(conta.valor) - Number(conta.valor_pago || 0)
    setPagValor(String(saldo))
    setPagData(hojeISO())
    setPagForma('')
    setPagObs('')
    setShowPagamento(true)
  }

  // Confirmar pagamento
  const handleConfirmarPagamento = async () => {
    if (!contaPagando) return
    const valor = parseFloat(pagValor)
    if (!valor || valor <= 0) {
      showToast('Informe um valor valido', 'warning')
      return
    }
    if (!pagData) {
      showToast('Informe a data do pagamento', 'warning')
      return
    }

    setProcessandoPag(true)
    try {
      const novoValorPago = Math.min(Number(contaPagando.valor_pago || 0) + valor, Number(contaPagando.valor))
      const novoSaldo = Number(contaPagando.valor) - novoValorPago
      const novoStatus = novoSaldo <= 0.01 ? 'pago' : 'parcial'

      const { error } = await supabase.from('contas_pagar').update({
        valor_pago: Math.round(novoValorPago * 100) / 100,
        status: novoStatus,
        data_pagamento: novoStatus === 'pago' ? pagData : contaPagando.data_pagamento,
        forma_pagamento: pagForma || contaPagando.forma_pagamento,
        observacoes: pagObs
          ? (contaPagando.observacoes ? contaPagando.observacoes + '\n' : '') + `[${formatarData(pagData)}] Pgto ${formatarMoeda(valor)} - ${pagObs}`
          : contaPagando.observacoes,
        updated_at: new Date().toISOString(),
      }).eq('id', contaPagando.id)

      if (error) throw error

      showToast(
        novoStatus === 'pago'
          ? 'Conta paga integralmente!'
          : `Pagamento parcial registrado. Saldo restante: ${formatarMoeda(novoSaldo)}`,
        'success'
      )

      setShowPagamento(false)
      setContaPagando(null)
      carregarDados()
    } catch (error: any) {
      showToast('Erro ao registrar pagamento: ' + error.message, 'error')
    }
    setProcessandoPag(false)
  }

  // Cancelar conta
  const handleCancelar = async (conta: ContaPagar) => {
    if (!confirm(`Cancelar a conta "${conta.descricao}"?`)) return
    try {
      const { error } = await supabase.from('contas_pagar').update({
        status: 'cancelado',
        updated_at: new Date().toISOString(),
      }).eq('id', conta.id)
      if (error) throw error
      showToast('Conta cancelada', 'success')
      carregarDados()
    } catch (error: any) {
      showToast('Erro: ' + error.message, 'error')
    }
  }

  // Excluir conta
  const handleExcluir = async (conta: ContaPagar) => {
    if (!confirm(`Excluir permanentemente "${conta.descricao}"? Esta acao nao pode ser desfeita.`)) return
    try {
      const { error } = await supabase.from('contas_pagar').delete().eq('id', conta.id)
      if (error) throw error
      showToast('Conta excluida', 'success')
      carregarDados()
    } catch (error: any) {
      showToast('Erro: ' + error.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contas a Pagar</h1>
          <p className="text-gray-600">Gestao completa de despesas e obrigacoes financeiras</p>
        </div>
        <Button onClick={abrirNovo}>+ Nova Conta</Button>
      </div>

      {/* Cards de Estatisticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{formatarMoeda(totalPendente)}</div>
            <div className="text-sm text-gray-600">Total Pendente</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{formatarMoeda(totalVencido)}</div>
            <div className="text-sm text-gray-600">Total Vencido</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatarMoeda(totalPagoMes)}</div>
            <div className="text-sm text-gray-600">Pago no Mes</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{vencemHoje}</div>
            <div className="text-sm text-gray-600">Vencem Hoje</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="py-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              placeholder="Buscar por descricao, fornecedor, documento..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
            />
            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="parcial">Parcial</option>
              <option value="vencido">Vencido</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <select
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todas as categorias</option>
              {CATEGORIAS.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <select
              value={filtroPeriodo}
              onChange={e => setFiltroPeriodo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os periodos</option>
              <option value="vencidas">Vencidas</option>
              <option value="semana">Vencem esta semana</option>
              <option value="mes">Vencem este mes</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Contas */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Carregando contas...</p>
        </div>
      ) : contasFiltradas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            {busca || filtroStatus !== 'todos' || filtroCategoria !== 'todos'
              ? 'Nenhuma conta encontrada com os filtros aplicados'
              : 'Nenhuma conta a pagar cadastrada'}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 text-left">Vencimento</th>
                    <th className="p-3 text-left">Descricao</th>
                    <th className="p-3 text-left">Fornecedor</th>
                    <th className="p-3 text-left">Categoria</th>
                    <th className="p-3 text-right">Valor</th>
                    <th className="p-3 text-right">Saldo</th>
                    <th className="p-3 text-center">Status</th>
                    <th className="p-3 text-center">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {contasFiltradas.map(conta => {
                    const saldo = Number(conta.valor) - Number(conta.valor_pago || 0)
                    const dias = diasParaVencer(conta.data_vencimento)
                    const isPaga = conta.status === 'pago'
                    const isCancelada = conta.status === 'cancelado'

                    return (
                      <tr key={conta.id} className={`hover:bg-gray-50 transition-colors ${isPaga ? 'opacity-60' : ''} ${!isPaga && !isCancelada && dias < 0 ? 'bg-red-50' : ''}`}>
                        <td className="p-3">
                          <div className="font-medium">{formatarData(conta.data_vencimento)}</div>
                          {!isPaga && !isCancelada && (
                            <div className={`text-xs ${dias < 0 ? 'text-red-600 font-semibold' : dias === 0 ? 'text-orange-600 font-semibold' : dias <= 3 ? 'text-yellow-600' : 'text-gray-400'}`}>
                              {dias < 0 ? `Vencida ha ${Math.abs(dias)} dia(s)` : dias === 0 ? 'Vence HOJE' : dias <= 7 ? `Vence em ${dias} dia(s)` : ''}
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <div className="font-medium text-gray-900">{conta.descricao}</div>
                          {conta.numero_documento && (
                            <div className="text-xs text-gray-400">Doc: {conta.numero_documento}</div>
                          )}
                          {conta.numero_nota_fiscal && (
                            <div className="text-xs text-gray-400">NF: {conta.numero_nota_fiscal}</div>
                          )}
                          {conta.parcela_total > 1 && (
                            <div className="text-xs text-blue-500">Parcela {conta.parcela_numero}/{conta.parcela_total}</div>
                          )}
                        </td>
                        <td className="p-3 text-gray-600">{conta.fornecedor_nome || '-'}</td>
                        <td className="p-3">
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                            {getCategoriaLabel(conta.categoria)}
                          </span>
                        </td>
                        <td className="p-3 text-right font-medium">{formatarMoeda(Number(conta.valor))}</td>
                        <td className="p-3 text-right font-semibold">
                          {isPaga ? (
                            <span className="text-green-600">{formatarMoeda(0)}</span>
                          ) : (
                            <span className="text-red-600">{formatarMoeda(saldo)}</span>
                          )}
                        </td>
                        <td className="p-3 text-center">{getStatusBadge(conta)}</td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {!isPaga && !isCancelada && (
                              <Button variant="primary" size="sm" onClick={() => abrirPagamento(conta)}>
                                Pagar
                              </Button>
                            )}
                            {!isPaga && !isCancelada && (
                              <Button variant="outline" size="sm" onClick={() => abrirEditar(conta)}>
                                Editar
                              </Button>
                            )}
                            {!isPaga && !isCancelada && (
                              <Button variant="danger" size="sm" onClick={() => handleCancelar(conta)}>
                                Cancelar
                              </Button>
                            )}
                            {(isPaga || isCancelada) && (
                              <Button variant="outline" size="sm" onClick={() => handleExcluir(conta)}>
                                Excluir
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot className="bg-gray-50 border-t">
                  <tr>
                    <td colSpan={4} className="p-3 text-right font-semibold text-gray-700">Totais:</td>
                    <td className="p-3 text-right font-bold text-gray-900">
                      {formatarMoeda(contasFiltradas.reduce((s, c) => s + Number(c.valor), 0))}
                    </td>
                    <td className="p-3 text-right font-bold text-red-600">
                      {formatarMoeda(contasFiltradas.filter(c => c.status !== 'pago' && c.status !== 'cancelado').reduce((s, c) => s + (Number(c.valor) - Number(c.valor_pago || 0)), 0))}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal Nova/Editar Conta */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[85vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{editando ? 'Editar Conta' : 'Nova Conta a Pagar'}</h2>
                <Button variant="outline" onClick={() => setShowModal(false)}>Fechar</Button>
              </div>

              <div className="space-y-4">
                {/* Descricao */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descricao *</label>
                  <Input
                    placeholder="Ex: Aluguel galpao, Manutencao empilhadeira..."
                    value={form.descricao}
                    onChange={e => setForm({ ...form, descricao: e.target.value })}
                  />
                </div>

                {/* Categoria + Fornecedor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoria *</label>
                    <select
                      value={form.categoria}
                      onChange={e => setForm({ ...form, categoria: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {CATEGORIAS.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                    <select
                      value={form.fornecedor_id}
                      onChange={e => setForm({ ...form, fornecedor_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Nenhum fornecedor</option>
                      {fornecedores.map((f: any) => (
                        <option key={f.id} value={f.id}>{f.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Valor + Parcelas + Vencimento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total (R$) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0,00"
                      value={form.valor}
                      onChange={e => setForm({ ...form, valor: e.target.value })}
                    />
                  </div>
                  {!editando && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parcelas</label>
                      <Input
                        type="number"
                        min="1"
                        max="48"
                        value={form.parcelas}
                        onChange={e => setForm({ ...form, parcelas: e.target.value })}
                      />
                      {parseInt(form.parcelas) > 1 && form.valor && (
                        <p className="text-xs text-gray-500 mt-1">
                          {form.parcelas}x de {formatarMoeda(parseFloat(form.valor) / parseInt(form.parcelas))}
                        </p>
                      )}
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Vencimento *</label>
                    <Input
                      type="date"
                      value={form.data_vencimento}
                      onChange={e => setForm({ ...form, data_vencimento: e.target.value })}
                    />
                    {!editando && parseInt(form.parcelas) > 1 && (
                      <p className="text-xs text-gray-500 mt-1">1a parcela. Demais mensais.</p>
                    )}
                  </div>
                </div>

                {/* Datas + Documentos */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissao</label>
                    <Input
                      type="date"
                      value={form.data_emissao}
                      onChange={e => setForm({ ...form, data_emissao: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">N. Documento</label>
                    <Input
                      placeholder="Boleto, contrato..."
                      value={form.numero_documento}
                      onChange={e => setForm({ ...form, numero_documento: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">N. Nota Fiscal</label>
                    <Input
                      placeholder="NF-e, NFS-e..."
                      value={form.numero_nota_fiscal}
                      onChange={e => setForm({ ...form, numero_nota_fiscal: e.target.value })}
                    />
                  </div>
                </div>

                {/* Recorrencia */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.recorrente}
                      onChange={e => setForm({ ...form, recorrente: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-gray-700">Conta recorrente</span>
                  </label>
                  {form.recorrente && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Frequencia</label>
                      <select
                        value={form.recorrencia_tipo}
                        onChange={e => setForm({ ...form, recorrencia_tipo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Selecionar...</option>
                        <option value="semanal">Semanal</option>
                        <option value="quinzenal">Quinzenal</option>
                        <option value="mensal">Mensal</option>
                        <option value="bimestral">Bimestral</option>
                        <option value="trimestral">Trimestral</option>
                        <option value="semestral">Semestral</option>
                        <option value="anual">Anual</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Observacoes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                  <textarea
                    rows={2}
                    value={form.observacoes}
                    onChange={e => setForm({ ...form, observacoes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Anotacoes adicionais..."
                  />
                </div>

                {/* Botoes */}
                <div className="flex space-x-3 pt-4">
                  <Button onClick={handleSalvar} disabled={salvando}>
                    {salvando ? 'Salvando...' : editando ? 'Salvar Alteracoes' : 'Criar Conta'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowModal(false)}>Cancelar</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPagamento && contaPagando && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Registrar Pagamento</h2>
                <Button variant="outline" onClick={() => setShowPagamento(false)}>Fechar</Button>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-gray-600">{contaPagando.descricao}</div>
                {contaPagando.fornecedor_nome && (
                  <div className="text-xs text-gray-400">{contaPagando.fornecedor_nome}</div>
                )}
                <div className="mt-2 flex justify-between">
                  <div>
                    <div className="text-xs text-gray-400">Valor Total</div>
                    <div className="font-semibold">{formatarMoeda(Number(contaPagando.valor))}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Ja Pago</div>
                    <div className="font-semibold text-green-600">{formatarMoeda(Number(contaPagando.valor_pago || 0))}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">Saldo</div>
                    <div className="font-bold text-red-600">{formatarMoeda(Number(contaPagando.valor) - Number(contaPagando.valor_pago || 0))}</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valor do Pagamento (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={pagValor}
                    onChange={e => setPagValor(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Data do Pagamento</label>
                  <Input
                    type="date"
                    value={pagData}
                    onChange={e => setPagData(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={pagForma}
                    onChange={e => setPagForma(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecionar...</option>
                    {FORMAS_PAGAMENTO.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
                  <Input
                    placeholder="Opcional..."
                    value={pagObs}
                    onChange={e => setPagObs(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button onClick={handleConfirmarPagamento} disabled={processandoPag}>
                  {processandoPag ? 'Processando...' : 'Confirmar Pagamento'}
                </Button>
                <Button variant="outline" onClick={() => setShowPagamento(false)}>Cancelar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
