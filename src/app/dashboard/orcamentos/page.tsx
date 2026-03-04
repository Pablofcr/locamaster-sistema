'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function OrcamentosPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [orcamentos, setOrcamentos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [stats, setStats] = useState({ total: 0, valorTotal: 0, aprovados: 0, pendentes: 0 })

  const ITEMS_PER_PAGE = 15

  useEffect(() => {
    carregarOrcamentos()
  }, [currentPage, searchTerm, filtroStatus])

  useEffect(() => {
    carregarStats()
  }, [])

  const carregarStats = async () => {
    try {
      const { data } = await supabase.from('orcamentos').select('status, valor_total')
      if (data) {
        setStats({
          total: data.length,
          valorTotal: data.reduce((sum, o) => sum + (Number(o.valor_total) || 0), 0),
          aprovados: data.filter(o => o.status === 'aprovado').length,
          pendentes: data.filter(o => o.status === 'rascunho' || o.status === 'enviado').length
        })
      }
    } catch (error) {
      console.error('Erro ao carregar stats:', error)
    }
  }

  const carregarOrcamentos = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('orcamentos')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`numero_orcamento.ilike.%${searchTerm}%,cliente_nome.ilike.%${searchTerm}%`)
      }

      if (filtroStatus !== 'todos') {
        query = query.eq('status', filtroStatus)
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data, error, count } = await query.range(from, to)

      if (error) throw error

      setOrcamentos(data || [])
      setTotalCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error)
      showToast('Erro ao carregar orçamentos', 'error')
    } finally {
      setLoading(false)
    }
  }

  const atualizarStatus = async (id: number, novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({ status: novoStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error

      showToast(`Orçamento ${novoStatus} com sucesso!`, 'success')
      carregarOrcamentos()
      carregarStats()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      showToast('Erro ao atualizar status do orçamento', 'error')
    }
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
  }

  const formatarNumero = (numero: number) => {
    return new Intl.NumberFormat('pt-BR').format(numero)
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
      enviado: { label: 'Enviado', color: 'bg-blue-100 text-blue-800' },
      aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
      recusado: { label: 'Recusado', color: 'bg-red-100 text-red-800' },
      cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500' }
    }
    const config = configs[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }, [])

  const navigateToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const taxaConversao = stats.total > 0 ? Math.round((stats.aprovados / stats.total) * 100) : 0

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando orçamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Orçamentos</h1>
          <p className="text-gray-600 mt-2">{formatarNumero(totalCount)} orçamentos</p>
        </div>
        <Button onClick={() => router.push('/dashboard/orcamentos/novo')}>
          + Novo Orçamento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Total</div>
            <div className="text-2xl font-bold text-blue-600">{formatarNumero(stats.total)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Valor Total</div>
            <div className="text-2xl font-bold text-green-600">{formatarMoeda(stats.valorTotal)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Taxa Conversão</div>
            <div className="text-2xl font-bold text-purple-600">{taxaConversao}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-gray-600">Pendentes</div>
            <div className="text-2xl font-bold text-yellow-600">{formatarNumero(stats.pendentes)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar por número ou cliente..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
            <select
              value={filtroStatus}
              onChange={(e) => { setFiltroStatus(e.target.value); setCurrentPage(1) }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todos">Todos os status</option>
              <option value="rascunho">Rascunho</option>
              <option value="enviado">Enviado</option>
              <option value="aprovado">Aprovado</option>
              <option value="recusado">Recusado</option>
            </select>
            <Button variant="outline" onClick={() => { setSearchTerm(''); setFiltroStatus('todos'); setCurrentPage(1) }}>
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Lista de Orçamentos</CardTitle>
            {totalPages > 0 && (
              <div className="text-sm text-gray-600">Página {currentPage} de {totalPages}</div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-2"></div>
              <p className="text-gray-600">Carregando...</p>
            </div>
          ) : orcamentos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-gray-500 mb-4">
                {searchTerm || filtroStatus !== 'todos'
                  ? 'Nenhum orçamento encontrado com os filtros aplicados'
                  : 'Nenhum orçamento cadastrado'}
              </p>
              <Button onClick={() => router.push('/dashboard/orcamentos/novo')}>
                + Criar Primeiro Orçamento
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orcamentos.map((orc) => (
                <div key={orc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">{orc.numero_orcamento || `#${orc.id}`}</h3>
                        {getStatusBadge(orc.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div><span className="font-medium">Cliente:</span> {orc.cliente_nome}</div>
                        <div className="flex items-center gap-4">
                          <span><span className="font-medium">Valor:</span> <span className="text-green-600 font-semibold">{formatarMoeda(Number(orc.valor_total) || 0)}</span></span>
                          <span><span className="font-medium">Data:</span> {orc.data_orcamento ? new Date(orc.data_orcamento).toLocaleDateString('pt-BR') : new Date(orc.created_at).toLocaleDateString('pt-BR')}</span>
                          {orc.modalidade_locacao && <span><span className="font-medium">Modalidade:</span> {orc.modalidade_locacao}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/orcamentos/${orc.id}`)}>
                        Ver
                      </Button>
                      {(orc.status === 'rascunho' || orc.status === 'enviado') && (
                        <>
                          <Button size="sm" onClick={() => atualizarStatus(orc.id, 'aprovado')} className="bg-green-600 hover:bg-green-700 text-white">
                            Aprovar
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => atualizarStatus(orc.id, 'recusado')} className="text-red-600 border-red-300 hover:bg-red-50">
                            Recusar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginação */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} até {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {formatarNumero(totalCount)}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => navigateToPage(currentPage - 1)} disabled={currentPage === 1}>
                  Anterior
                </Button>
                <div className="flex space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = currentPage <= 3 ? index + 1 : currentPage + index - 2
                    if (pageNumber > totalPages || pageNumber < 1) return null
                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === currentPage ? "primary" : "outline"}
                        size="sm"
                        onClick={() => navigateToPage(pageNumber)}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>
                <Button variant="outline" size="sm" onClick={() => navigateToPage(currentPage + 1)} disabled={currentPage === totalPages}>
                  Próxima
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
