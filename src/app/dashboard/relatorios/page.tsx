'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'

export default function RelatoriosPage() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    receitaMes: 0, taxaOcupacao: 0, ticketMedio: 0, novosClientes: 0,
    totalEquipamentos: 0, equipamentosLocados: 0
  })
  const [periodoInicio, setPeriodoInicio] = useState('')
  const [periodoFim, setPeriodoFim] = useState('')

  useEffect(() => { carregarDados() }, [])

  const carregarDados = async () => {
    setLoading(true)
    try {
      const [fatRes, eqRes, cliRes, orcRes] = await Promise.all([
        supabase.from('faturas').select('valor, status, data_pagamento'),
        supabase.from('equipamentos').select('status, ativo').eq('ativo', true),
        supabase.from('clientes').select('created_at'),
        supabase.from('orcamentos').select('valor_total, status')
      ])

      const faturas = fatRes.data || []
      const equipamentos = eqRes.data || []
      const clientes = cliRes.data || []
      const orcamentos = orcRes.data || []

      const mesAtual = new Date().getMonth()
      const anoAtual = new Date().getFullYear()

      const receitaMes = faturas
        .filter(f => f.status === 'pago' && f.data_pagamento)
        .filter(f => {
          const d = new Date(f.data_pagamento)
          return d.getMonth() === mesAtual && d.getFullYear() === anoAtual
        })
        .reduce((s, f) => s + (Number(f.valor) || 0), 0)

      const totalEq = equipamentos.length
      const locados = equipamentos.filter(e => e.status === 'locado').length
      const taxaOcupacao = totalEq > 0 ? Math.round((locados / totalEq) * 100) : 0

      const orcAprovados = orcamentos.filter(o => o.status === 'aprovado')
      const ticketMedio = orcAprovados.length > 0
        ? orcAprovados.reduce((s, o) => s + (Number(o.valor_total) || 0), 0) / orcAprovados.length
        : 0

      const novosClientes = clientes.filter(c => {
        const d = new Date(c.created_at)
        return d.getMonth() === mesAtual && d.getFullYear() === anoAtual
      }).length

      setStats({ receitaMes, taxaOcupacao, ticketMedio, novosClientes, totalEquipamentos: totalEq, equipamentosLocados: locados })
    } catch { showToast('Erro ao carregar dados', 'error') }
    finally { setLoading(false) }
  }

  const gerarRelatorioPDF = async (tipo: string) => {
    try {
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF()

      doc.setFontSize(18)
      doc.text('LocaMaster - Relatório', 20, 20)
      doc.setFontSize(12)
      doc.text(`Tipo: ${tipo}`, 20, 35)
      doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 45)

      if (periodoInicio && periodoFim) {
        doc.text(`Período: ${new Date(periodoInicio).toLocaleDateString('pt-BR')} a ${new Date(periodoFim).toLocaleDateString('pt-BR')}`, 20, 55)
      }

      doc.setFontSize(14)
      doc.text('Resumo', 20, 75)
      doc.setFontSize(11)

      const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

      let y = 90
      switch (tipo) {
        case 'receita':
          doc.text(`Receita do Mês: ${formatarMoeda(stats.receitaMes)}`, 20, y)
          doc.text(`Ticket Médio: ${formatarMoeda(stats.ticketMedio)}`, 20, y + 12)
          break
        case 'equipamentos':
          doc.text(`Total Equipamentos: ${stats.totalEquipamentos}`, 20, y)
          doc.text(`Locados: ${stats.equipamentosLocados}`, 20, y + 12)
          doc.text(`Taxa de Ocupação: ${stats.taxaOcupacao}%`, 20, y + 24)
          break
        case 'clientes':
          doc.text(`Novos Clientes (mês): ${stats.novosClientes}`, 20, y)
          break
        default:
          doc.text(`Receita: ${formatarMoeda(stats.receitaMes)}`, 20, y)
          doc.text(`Equipamentos: ${stats.totalEquipamentos}`, 20, y + 12)
          doc.text(`Taxa Ocupação: ${stats.taxaOcupacao}%`, 20, y + 24)
          doc.text(`Novos Clientes: ${stats.novosClientes}`, 20, y + 36)
      }

      doc.save(`relatorio-${tipo}-${new Date().toISOString().split('T')[0]}.pdf`)
      showToast('Relatório gerado com sucesso!', 'success')
    } catch (error) {
      showToast('Erro ao gerar relatório PDF', 'error')
    }
  }

  const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando relatórios...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-gray-600">Análises e relatórios gerenciais</p>
        </div>
        <Button onClick={() => gerarRelatorioPDF('geral')}>Gerar Relatório PDF</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-green-500">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-600">Receita Mês</p>
            <p className="text-xl font-bold text-green-600">{formatarMoeda(stats.receitaMes)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-600">Taxa Ocupação</p>
            <p className="text-xl font-bold text-blue-600">{stats.taxaOcupacao}%</p>
            <p className="text-xs text-blue-600">{stats.equipamentosLocados} de {stats.totalEquipamentos} equipamentos</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-yellow-500">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
            <p className="text-xl font-bold text-yellow-600">{formatarMoeda(stats.ticketMedio)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-purple-500">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-gray-600">Novos Clientes</p>
            <p className="text-xl font-bold text-purple-600">{stats.novosClientes}</p>
            <p className="text-xs text-purple-600">Este mês</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Gerar Relatório</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Input placeholder="Data início" type="date" value={periodoInicio} onChange={(e) => setPeriodoInicio(e.target.value)} />
            <Input placeholder="Data fim" type="date" value={periodoFim} onChange={(e) => setPeriodoFim(e.target.value)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button onClick={() => gerarRelatorioPDF('receita')} variant="outline">Relatório de Receita</Button>
            <Button onClick={() => gerarRelatorioPDF('clientes')} variant="outline">Análise de Clientes</Button>
            <Button onClick={() => gerarRelatorioPDF('equipamentos')} variant="outline">Status Equipamentos</Button>
            <Button onClick={() => gerarRelatorioPDF('geral')} variant="outline">Relatório Geral</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
