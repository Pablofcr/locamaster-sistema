'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'

interface Cliente {
  id: number
  nome: string
  telefone?: string
  email?: string
  created_at: string
}

interface Equipamento {
  id: number
  nome: string
  preco_unitario_dia: number
  status: string
  ativo: boolean
  created_at: string
}

interface Orcamento {
  id: number
  numero_orcamento?: string
  cliente_nome: string
  valor_total?: number
  status?: string
  created_at: string
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    clientes: 0,
    equipamentos: 0,
    orcamentos: 0,
    faturamento: 0
  })
  const [loading, setLoading] = useState(true)
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    try {
      setLoading(true)

      // Usar count para performance com grandes volumes
      const [clientesCount, equipamentosCount, orcamentosData] = await Promise.all([
        supabase.from('clientes').select('*', { count: 'exact', head: true }),
        supabase.from('equipamentos').select('*', { count: 'exact', head: true }),
        supabase.from('orcamentos').select('id, valor_total, status, created_at, cliente_nome').order('created_at', { ascending: false }).limit(10)
      ])

      // Calcular faturamento de orçamentos aprovados
      const faturamentoQuery = await supabase
        .from('orcamentos')
        .select('valor_total')
        .eq('status', 'aprovado')

      const totalFaturamento = faturamentoQuery.data?.reduce((sum, o) => sum + (o.valor_total || 0), 0) || 0

      setStats({
        clientes: clientesCount.count || 0,
        equipamentos: equipamentosCount.count || 0,
        orcamentos: orcamentosData.data?.length || 0,
        faturamento: totalFaturamento
      })

      // Carregar atividades recentes
      setRecentActivities(orcamentosData.data || [])

    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const formatarNumero = (numero: number) => {
    return new Intl.NumberFormat('pt-BR').format(numero)
  }

  const router = useRouter()

  const navigateTo = (path: string) => {
    router.push(path)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Visão geral do seu negócio</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/dashboard/clientes')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Clientes</CardTitle>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm">👥</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatarNumero(stats.clientes)}</div>
            <p className="text-xs text-gray-600">Total de clientes cadastrados</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/dashboard/equipamentos')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Equipamentos</CardTitle>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-sm">🔧</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatarNumero(stats.equipamentos)}</div>
            <p className="text-xs text-gray-600">Equipamentos no inventário</p>
            {stats.equipamentos > 1000 && (
              <p className="text-xs text-green-600 font-medium">✓ Inventário robusto</p>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigateTo('/dashboard/orcamentos')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-600">Orçamentos</CardTitle>
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 text-sm">📋</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatarNumero(stats.orcamentos)}</div>
            <p className="text-xs text-gray-600">Orçamentos criados</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">Faturamento</CardTitle>
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-sm">💰</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatarMoeda(stats.faturamento)}</div>
            <p className="text-xs text-gray-600">Total aprovado</p>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Button 
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigateTo('/dashboard/orcamentos')}
            >
              <span className="text-2xl">📋</span>
              <span>Novo Orçamento</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigateTo('/dashboard/clientes')}
            >
              <span className="text-2xl">👥</span>
              <span>Gerenciar Clientes</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => navigateTo('/dashboard/equipamentos')}
            >
              <span className="text-2xl">🔧</span>
              <span>Gerenciar Equipamentos</span>
            </Button>

            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => carregarDados()}
            >
              <span className="text-2xl">🔄</span>
              <span>Atualizar Dados</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Atividades Recentes */}
      {recentActivities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.slice(0, 5).map((orcamento, index) => (
                <div key={orcamento.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{orcamento.cliente_nome}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(orcamento.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">
                      {formatarMoeda(orcamento.valor_total || 0)}
                    </p>
                    <Badge variant={
                      orcamento.status === 'aprovado' ? 'default' :
                      orcamento.status === 'enviado' ? 'secondary' : 'outline'
                    }>
                      {orcamento.status || 'rascunho'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Informações do Sistema */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <span>Última atualização: {new Date().toLocaleString('pt-BR')}</span>
            <span>Sistema otimizado para grandes volumes</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
