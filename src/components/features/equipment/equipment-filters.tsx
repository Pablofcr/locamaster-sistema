import { useState, useEffect, useMemo } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Equipment } from "@/lib/mock-data/types"
import { 
  Search, 
  Filter, 
  X,
  SlidersHorizontal,
  Download
} from "lucide-react"

interface FiltersState {
  search: string
  category: string
  status: string
  condition: string
  location: string
  priceMin: string
  priceMax: string
}

interface EquipmentFiltersProps {
  equipments: Equipment[]
  onFilteredResults: (filtered: Equipment[]) => void
  onFiltersChange: (filters: FiltersState) => void
}

export function EquipmentFilters({ equipments, onFilteredResults, onFiltersChange }: EquipmentFiltersProps) {
  const [filters, setFilters] = useState<FiltersState>({
    search: '',
    category: '',
    status: '',
    condition: '',
    location: '',
    priceMin: '',
    priceMax: ''
  })
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [activeFiltersCount, setActiveFiltersCount] = useState(0)

  // Filter options derived from data
  const filterOptions = useMemo(() => {
    const categories = [...new Set(equipments.map(e => e.category))].sort()
    const locations = [...new Set(equipments.map(e => e.location))].sort()
    
    return {
      categories: categories.map(cat => ({
        value: cat,
        label: cat === 'construcao' ? 'Construção Civil' :
               cat === 'industrial' ? 'Industrial' :
               cat === 'automotivo' ? 'Automotivo' :
               cat === 'jardinagem' ? 'Jardinagem' :
               cat === 'limpeza' ? 'Limpeza' :
               cat === 'eventos' ? 'Eventos' : cat
      })),
      locations,
      statuses: [
        { value: 'available', label: 'Disponível' },
        { value: 'rented', label: 'Locado' },
        { value: 'maintenance', label: 'Manutenção' },
        { value: 'retired', label: 'Aposentado' }
      ],
      conditions: [
        { value: 'new', label: 'Novo' },
        { value: 'good', label: 'Bom' },
        { value: 'fair', label: 'Regular' },
        { value: 'needs_repair', label: 'Precisa Reparo' }
      ]
    }
  }, [equipments])

  // Apply filters
  const filteredEquipments = useMemo(() => {
    let filtered = equipments

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      filtered = filtered.filter(equipment =>
        equipment.name.toLowerCase().includes(searchTerm) ||
        equipment.brand.toLowerCase().includes(searchTerm) ||
        equipment.model.toLowerCase().includes(searchTerm) ||
        equipment.serialNumber.toLowerCase().includes(searchTerm)
      )
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(equipment => equipment.category === filters.category)
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(equipment => equipment.status === filters.status)
    }

    // Condition filter
    if (filters.condition) {
      filtered = filtered.filter(equipment => equipment.condition === filters.condition)
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(equipment => equipment.location === filters.location)
    }

    // Price range filter
    if (filters.priceMin) {
      const minPrice = parseFloat(filters.priceMin)
      if (!isNaN(minPrice)) {
        filtered = filtered.filter(equipment => equipment.dailyPrice >= minPrice)
      }
    }

    if (filters.priceMax) {
      const maxPrice = parseFloat(filters.priceMax)
      if (!isNaN(maxPrice)) {
        filtered = filtered.filter(equipment => equipment.dailyPrice <= maxPrice)
      }
    }

    return filtered
  }, [equipments, filters])

  // Count active filters
  useEffect(() => {
    const count = Object.values(filters).filter(value => value !== '').length
    setActiveFiltersCount(count)
  }, [filters])

  // Notify parent of filtered results
  useEffect(() => {
    onFilteredResults(filteredEquipments)
    onFiltersChange(filters)
  }, [filteredEquipments, filters, onFilteredResults, onFiltersChange])

  const updateFilter = (key: keyof FiltersState, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      category: '',
      status: '',
      condition: '',
      location: '',
      priceMin: '',
      priceMax: ''
    })
  }

  const clearSingleFilter = (key: keyof FiltersState) => {
    updateFilter(key, '')
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Search and Quick Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="search"
                placeholder="Buscar por nome, marca, modelo, número de série..."
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                className="pl-10 pr-4"
              />
              {filters.search && (
                <button
                  onClick={() => clearSingleFilter('search')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Quick Filters */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[140px]"
            >
              <option value="">Todas Categorias</option>
              {filterOptions.categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm min-w-[120px]"
            >
              <option value="">Todos Status</option>
              {filterOptions.statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filtros Avançados
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-1 text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condição
                </label>
                <select
                  value={filters.condition}
                  onChange={(e) => updateFilter('condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todas</option>
                  {filterOptions.conditions.map(condition => (
                    <option key={condition.value} value={condition.value}>
                      {condition.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Localização
                </label>
                <select
                  value={filters.location}
                  onChange={(e) => updateFilter('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todas</option>
                  {filterOptions.locations.map(location => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Mín (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.priceMin}
                  onChange={(e) => updateFilter('priceMin', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço Máx (R$)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={filters.priceMax}
                  onChange={(e) => updateFilter('priceMax', e.target.value)}
                />
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                  disabled={activeFiltersCount === 0}
                >
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t">
            <span className="text-sm font-medium text-gray-700">Filtros ativos:</span>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                  Busca: "{filters.search}"
                  <button
                    onClick={() => clearSingleFilter('search')}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.category && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Categoria: {filterOptions.categories.find(c => c.value === filters.category)?.label}
                  <button
                    onClick={() => clearSingleFilter('category')}
                    className="ml-1 hover:text-green-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.status && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
                  Status: {filterOptions.statuses.find(s => s.value === filters.status)?.label}
                  <button
                    onClick={() => clearSingleFilter('status')}
                    className="ml-1 hover:text-orange-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <div className="text-sm text-gray-600">
            Mostrando {filteredEquipments.length} de {equipments.length} equipamentos
            {activeFiltersCount > 0 && (
              <span className="ml-2 text-blue-600">
                ({activeFiltersCount} {activeFiltersCount === 1 ? 'filtro ativo' : 'filtros ativos'})
              </span>
            )}
          </div>
          
          <Button variant="outline" size="sm" className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Exportar Resultados
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
