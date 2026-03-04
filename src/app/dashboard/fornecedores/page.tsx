'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'

export default function FornecedoresPage() {
  const router = useRouter()
  const [fornecedores, setFornecedores] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [estadosDisponiveis, setEstadosDisponiveis] = useState([])

  const ITEMS_PER_PAGE = 15

  useEffect(() => {
    carregarFornecedores()
    carregarEstados()
  }, [currentPage, searchTerm, filtroEstado])

  const carregarEstados = async () => {
    try {
      const { data } = await supabase
        .from('fornecedores')
        .select('estado')
        .not('estado', 'is', null)
        .neq('estado', '')

      const estadosUnicos = [...new Set(data?.map(item => item.estado) || [])]
        .filter(estado => estado && estado.trim())
        .sort()

      setEstadosDisponiveis(estadosUnicos)
    } catch (error) {
      console.error('Erro ao carregar estados:', error)
    }
  }

  const carregarFornecedores = async () => {
    try {
      setLoading(true)

      let query = supabase
        .from('fornecedores')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,cnpj.ilike.%${searchTerm}%,cidade.ilike.%${searchTerm}%`)
      }

      if (filtroEstado !== 'todos') {
        query = query.eq('estado', filtroEstado)
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data, error, count } = await query.range(from, to)

      if (error) throw error

      setFornecedores(data || [])
      setTotalCount(count || 0)
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))

    } catch (error) {
      console.error('Erro ao carregar fornecedores:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarNumero = (numero) => {
    return new Intl.NumberFormat('pt-BR').format(numero)
  }

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }, [])

  const handleEstadoChange = useCallback((e) => {
    setFiltroEstado(e.target.value)
    setCurrentPage(1)
  }, [])

  const navigateToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setFiltroEstado('todos')
    setCurrentPage(1)
  }

  const formatarTelefone = (telefone) => {
    if (!telefone) return ''
    const nums = telefone.replace(/\D/g, '')
    if (nums.length === 11) {
      return `(${nums.substring(0,2)}) ${nums.substring(2,3)} ${nums.substring(3,7)}-${nums.substring(7)}`
    } else if (nums.length === 10) {
      return `(${nums.substring(0,2)}) ${nums.substring(2,6)}-${nums.substring(6)}`
    }
    return telefone
  }

  if (loading && currentPage === 1) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando fornecedores...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fornecedores</h1>
          <p className="text-gray-600 mt-2">
            {formatarNumero(totalCount)} fornecedores cadastrados
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/fornecedores/novo')}>
          + Novo Fornecedor
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Input
                placeholder="Buscar fornecedores..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full"
              />
            </div>
            <div>
              <select
                value={filtroEstado}
                onChange={handleEstadoChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos os estados</option>
                {estadosDisponiveis.map(estado => (
                  <option key={estado} value={estado}>{estado}</option>
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

      {/* Lista de Fornecedores */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Fornecedores ({formatarNumero(totalCount)} total)
            </CardTitle>
            <div className="text-sm text-gray-600">
              Página {currentPage} de {totalPages}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto mb-2"></div>
              <p className="text-gray-600">Carregando...</p>
            </div>
          ) : fornecedores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {searchTerm || filtroEstado !== 'todos'
                  ? 'Nenhum fornecedor encontrado com os filtros aplicados'
                  : 'Nenhum fornecedor cadastrado'}
              </p>
              <Button onClick={() => router.push('/dashboard/fornecedores/novo')}>
                + Cadastrar Primeiro Fornecedor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {fornecedores.map((fornecedor) => (
                <div key={fornecedor.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold text-lg">
                          {fornecedor.nome?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{fornecedor.nome}</h3>
                        <div className="text-sm text-gray-600 space-y-1 mt-1">
                          {fornecedor.cnpj && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">CNPJ:</span>
                              <span>{fornecedor.cnpj}</span>
                            </div>
                          )}
                          {fornecedor.email && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Email:</span>
                              <span>{fornecedor.email}</span>
                            </div>
                          )}
                          {fornecedor.telefone && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Telefone:</span>
                              <span>{formatarTelefone(fornecedor.telefone)}</span>
                            </div>
                          )}
                          {fornecedor.contato && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Contato:</span>
                              <span>{fornecedor.contato}</span>
                            </div>
                          )}
                          {(fornecedor.cidade || fornecedor.estado) && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Localização:</span>
                              <span>
                                {[fornecedor.cidade, fornecedor.estado].filter(Boolean).join(', ')}
                              </span>
                            </div>
                          )}
                          {fornecedor.categoria && (
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Categoria:</span>
                              <Badge variant="secondary">{fornecedor.categoria}</Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <Badge variant="outline" className="text-green-600 border-green-300">
                        Ativo
                      </Badge>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/dashboard/fornecedores/${fornecedor.id}/editar`)}
                        >
                          Editar
                        </Button>
                      </div>
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
                Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} até {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {formatarNumero(totalCount)} fornecedores
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
