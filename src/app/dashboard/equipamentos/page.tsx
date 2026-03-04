'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'

interface Classe {
  id: number
  codigo: string
  nome: string
}

interface Subclasse {
  id: number
  class_id: number
  codigo: string
  nome: string
}

export default function EquipamentosPage() {
  const router = useRouter()
  const [equipamentos, setEquipamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filtroStatus, setFiltroStatus] = useState('todos')
  const [filtroClasse, setFiltroClasse] = useState('todos')
  const [filtroSubclasse, setFiltroSubclasse] = useState('todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [classes, setClasses] = useState<Classe[]>([])
  const [subclasses, setSubclasses] = useState<Subclasse[]>([])
  const [subclassesFiltradas, setSubclassesFiltradas] = useState<Subclasse[]>([])
  const [stats, setStats] = useState({
    disponivel: 0,
    locado: 0,
    manutencao: 0,
    inativo: 0
  })

  const ITEMS_PER_PAGE = 20

  useEffect(() => {
    carregarClassificacoes()
    carregarStats()
  }, [])

  useEffect(() => {
    carregarEquipamentos()
  }, [currentPage, searchTerm, filtroStatus, filtroClasse, filtroSubclasse])

  useEffect(() => {
    if (filtroClasse !== 'todos') {
      setSubclassesFiltradas(subclasses.filter(s => s.class_id === parseInt(filtroClasse)))
    } else {
      setSubclassesFiltradas(subclasses)
    }
    setFiltroSubclasse('todos')
  }, [filtroClasse, subclasses])

  const carregarClassificacoes = async () => {
    try {
      const [classesRes, subclassesRes] = await Promise.all([
        supabase.from('equipment_classes').select('*').order('codigo'),
        supabase.from('equipment_subclasses').select('*').order('codigo')
      ])
      setClasses(classesRes.data || [])
      setSubclasses(subclassesRes.data || [])
    } catch {
      console.error('Erro ao carregar classificacoes')
    }
  }

  const carregarStats = async () => {
    try {
      const { data: statsData } = await supabase
        .from('equipamentos')
        .select('status')
        .eq('ativo', true)

      const statsCount = {
        disponivel: 0,
        locado: 0,
        manutencao: 0,
        inativo: 0
      }

      statsData?.forEach(item => {
        if (statsCount[item.status] !== undefined) {
          statsCount[item.status]++
        }
      })

      setStats(statsCount)
    } catch (error) {
      console.error('Erro ao carregar estatisticas:', error)
    }
  }

  const carregarEquipamentos = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('equipamentos')
        .select('*', { count: 'exact' })
        .eq('ativo', true)
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,marca.ilike.%${searchTerm}%,modelo.ilike.%${searchTerm}%,numero_patrimonio.ilike.%${searchTerm}%,asset_id.ilike.%${searchTerm}%`)
      }

      if (filtroStatus !== 'todos') {
        query = query.eq('status', filtroStatus)
      }

      if (filtroClasse !== 'todos') {
        query = query.eq('classe_id', parseInt(filtroClasse))
      }

      if (filtroSubclasse !== 'todos') {
        query = query.eq('subclasse_id', parseInt(filtroSubclasse))
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data, error, count } = await query.range(from, to)

      if (error) throw error

      setEquipamentos(data || [])
      setTotalCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))

    } catch (error) {
      console.error('Erro ao carregar equipamentos:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarMoeda = (valor) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor || 0)
  }

  const formatarNumero = (numero) => {
    return new Intl.NumberFormat('pt-BR').format(numero)
  }

  const getStatusBadge = (status) => {
    const configs = {
      disponivel: { label: 'Disponivel', color: 'bg-green-100 text-green-800' },
      locado: { label: 'Locado', color: 'bg-blue-100 text-blue-800' },
      manutencao: { label: 'Manutencao', color: 'bg-yellow-100 text-yellow-800' },
      inativo: { label: 'Inativo', color: 'bg-red-100 text-red-800' }
    }

    const config = configs[status] || { label: status, color: 'bg-gray-100 text-gray-800' }

    return (
      <Badge className={`${config.color} text-xs`}>
        {config.label}
      </Badge>
    )
  }

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }, [])

  const handleStatusChange = useCallback((e) => {
    setFiltroStatus(e.target.value)
    setCurrentPage(1)
  }, [])

  const handleClasseChange = useCallback((e) => {
    setFiltroClasse(e.target.value)
    setCurrentPage(1)
  }, [])

  const handleSubclasseChange = useCallback((e) => {
    setFiltroSubclasse(e.target.value)
    setCurrentPage(1)
  }, [])

  const navigateToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFiltroStatus('todos')
    setFiltroClasse('todos')
    setFiltroSubclasse('todos')
    setCurrentPage(1)
  }

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando equipamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Equipamentos</h1>
          <p className="text-gray-600 mt-2">
            {formatarNumero(totalCount)} equipamentos no inventario
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => router.push('/dashboard/equipamentos/classificacao')}>
            Classificacao
          </Button>
          <Button onClick={() => router.push('/dashboard/equipamentos/novo')}>
            + Novo Equipamento
          </Button>
        </div>
      </div>

      {/* Estatisticas Rapidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{formatarNumero(stats.disponivel)}</div>
            <div className="text-sm text-gray-600">Disponiveis</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{formatarNumero(stats.locado)}</div>
            <div className="text-sm text-gray-600">Locados</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{formatarNumero(stats.manutencao)}</div>
            <div className="text-sm text-gray-600">Manutencao</div>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-gray-600">{formatarNumero(stats.inativo)}</div>
            <div className="text-sm text-gray-600">Inativos</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Buscar por nome, marca, Asset ID..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={filtroStatus}
                onChange={handleStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os status</option>
                <option value="disponivel">Disponivel</option>
                <option value="locado">Locado</option>
                <option value="manutencao">Manutencao</option>
                <option value="inativo">Inativo</option>
              </select>
            </div>
            <div>
              <select
                value={filtroClasse}
                onChange={handleClasseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todas as classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.codigo} - {c.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filtroSubclasse}
                onChange={handleSubclasseChange}
                disabled={filtroClasse === 'todos'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="todos">Todas subclasses</option>
                {subclassesFiltradas.map(s => (
                  <option key={s.id} value={s.id}>{s.codigo} - {s.nome}</option>
                ))}
              </select>
            </div>
            <div>
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Equipamentos */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Equipamentos ({formatarNumero(totalCount)} total)
            </CardTitle>
            <div className="text-sm text-gray-600">
              Pagina {currentPage} de {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-2"></div>
              <p className="text-gray-600">Carregando...</p>
            </div>
          ) : equipamentos.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {searchTerm || filtroStatus !== 'todos' || filtroClasse !== 'todos'
                  ? 'Nenhum equipamento encontrado com os filtros aplicados'
                  : 'Nenhum equipamento cadastrado'}
              </p>
              <Button onClick={clearFilters}>
                Limpar Filtros
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {equipamentos.map((equipamento) => (
                <div key={equipamento.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                        {equipamento.asset_id ? (
                          <span className="text-xs font-bold font-mono text-blue-700 text-center leading-tight px-1">
                            {equipamento.asset_id.split('-').slice(0, 2).join('-')}
                          </span>
                        ) : (
                          <span className="text-2xl">🔧</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          {equipamento.asset_id && (
                            <span className="font-mono text-sm font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              {equipamento.asset_id}
                            </span>
                          )}
                          <h3 className="font-semibold text-gray-900">{equipamento.nome}</h3>
                          {getStatusBadge(equipamento.status)}
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                          {equipamento.marca && equipamento.modelo && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Marca/Modelo:</span>
                              <span>{equipamento.marca} - {equipamento.modelo}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4">
                            {equipamento.numero_patrimonio && (
                              <span><span className="font-medium">Patrimonio:</span> {equipamento.numero_patrimonio}</span>
                            )}
                            {equipamento.numero_serie && (
                              <span><span className="font-medium">Serie:</span> {equipamento.numero_serie}</span>
                            )}
                            {equipamento.numero_frota && (
                              <span><span className="font-medium">Frota:</span> {equipamento.numero_frota}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Diaria:</span>
                            <span className="text-green-600 font-semibold">{formatarMoeda(equipamento.preco_unitario_dia)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/dashboard/equipamentos/${equipamento.id}/editar`)}>
                        Editar
                      </Button>

                      <Button
                        size="sm"
                        disabled={equipamento.status !== 'disponivel'}
                        onClick={() => router.push(`/dashboard/orcamentos/novo?equipamento=${equipamento.id}`)}
                      >
                        + Orcamento
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Paginacao */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} ate {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {formatarNumero(totalCount)} equipamentos
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>

                <div className="flex space-x-1">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = currentPage <= 3
                      ? index + 1
                      : currentPage + index - 2

                    if (pageNumber > totalPages) return null

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

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Proxima
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
