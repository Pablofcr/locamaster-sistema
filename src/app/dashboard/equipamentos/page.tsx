"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Settings,
  Download,
  Wrench,
  Activity,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown
} from "lucide-react"
import { AddEquipmentModal } from "@/components/features/equipment/add-equipment-modal"
import { EquipmentFilters } from "@/components/features/equipment/equipment-filters"
import { Pagination, usePagination } from "@/components/ui/pagination"
import { mockEquipment } from "@/lib/mock-data/equipment"
import { randomBetween } from "@/lib/mock-data/types"

export default function EquipmentPage() {
  const [allEquipments, setAllEquipments] = useState(mockEquipment)
  const [filteredEquipments, setFilteredEquipments] = useState(mockEquipment)
  const [currentFilters, setCurrentFilters] = useState({})
  
  // Pagination
  const { paginatedItems, pagination } = usePagination(filteredEquipments, 12)

  const handleAddEquipment = (newEquipment: any) => {
    const equipment = {
      id: `new_${Date.now()}`,
      status: 'available',
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenance: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      utilizationRate: 0,
      maintenanceStatus: 'ok',
      ...newEquipment
    }
    
    const updatedEquipments = [equipment, ...allEquipments]
    setAllEquipments(updatedEquipments)
    
    // If no filters are active, also update filtered list
    if (Object.values(currentFilters).every(value => !value)) {
      setFilteredEquipments(updatedEquipments)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Disponível
          </span>
        )
      case 'rented':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            Locado
          </span>
        )
      case 'maintenance':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <Wrench className="h-3 w-3 mr-1" />
            Manutenção
          </span>
        )
      case 'retired':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <XCircle className="h-3 w-3 mr-1" />
            Aposentado
          </span>
        )
      default:
        return null
    }
  }

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'new':
        return <span className="text-xs font-medium text-green-600">Novo</span>
      case 'good':
        return <span className="text-xs font-medium text-blue-600">Bom</span>
      case 'fair':
        return <span className="text-xs font-medium text-yellow-600">Regular</span>
      case 'needs_repair':
        return <span className="text-xs font-medium text-red-600">Precisa Reparo</span>
      default:
        return null
    }
  }

  const getMaintenanceAlert = (nextMaintenanceDate: Date | null) => {
    if (!nextMaintenanceDate) return <CheckCircle className="h-4 w-4 text-green-500" />
    
    const today = new Date()
    const daysUntil = Math.ceil((nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />
    } else if (daysUntil <= 7) {
      return <AlertTriangle className="h-4 w-4 text-orange-500" />
    } else if (daysUntil <= 30) {
      return <Clock className="h-4 w-4 text-yellow-500" />
    }
    return <CheckCircle className="h-4 w-4 text-green-500" />
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)
  }

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Não definida'
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return dateObj.toLocaleDateString('pt-BR')
  }

  // Calculate stats
  const stats = {
    total: allEquipments.length,
    available: allEquipments.filter(e => e.status === 'available').length,
    rented: allEquipments.filter(e => e.status === 'rented').length,
    maintenance: allEquipments.filter(e => e.status === 'maintenance').length,
    avgUtilization: Math.round(
      allEquipments.reduce((acc, eq) => acc + randomBetween(40, 95), 0) / allEquipments.length
    ),
    needsMaintenance: allEquipments.filter(eq => {
      const nextDate = eq.nextMaintenanceDate || new Date()
      const today = new Date()
      return nextDate <= today
    }).length
  }

  return (
    <div className="px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Equipamentos</h1>
            <p className="text-gray-600 mt-1">Gerencie seu inventário de equipamentos</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Exportar Lista
            </Button>
            <Button variant="outline" className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Manutenções
            </Button>
            <AddEquipmentModal onAdd={handleAddEquipment} />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Disponível</p>
                <p className="text-2xl font-bold text-green-600">{stats.available}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Locado</p>
                <p className="text-2xl font-bold text-blue-600">{stats.rented}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Manutenção</p>
                <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
              </div>
              <Wrench className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Utilização</p>
                <p className="text-2xl font-bold text-purple-600">{stats.avgUtilization}%</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alertas</p>
                <p className="text-2xl font-bold text-red-600">{stats.needsMaintenance}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <EquipmentFilters
        equipments={allEquipments}
        onFilteredResults={setFilteredEquipments}
        onFiltersChange={setCurrentFilters}
      />

      {/* Equipment Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Equipamentos</CardTitle>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {filteredEquipments.length} equipamentos encontrados
              </span>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-1" />
                  Grade
                </Button>
                <Button variant="ghost" size="sm">
                  Lista
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Equipment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
            {paginatedItems.map((equipment) => (
              <Card key={equipment.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                        {equipment.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {equipment.brand} - {equipment.model}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getMaintenanceAlert(equipment.nextMaintenanceDate)}
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Status and Condition */}
                  <div className="flex items-center justify-between mb-4">
                    {getStatusBadge(equipment.status)}
                    {getConditionBadge(equipment.condition)}
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500">Preço Diário</p>
                      <p className="font-semibold text-green-600">
                        {formatCurrency(equipment.dailyPrice)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Utilização</p>
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900">
                          {randomBetween(40, 95)}%
                        </span>
                        {randomBetween(40, 95) > 70 ? (
                          <TrendingUp className="h-3 w-3 text-green-500 ml-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-orange-500 ml-1" />
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Localização</p>
                      <p className="text-sm font-medium text-gray-700 flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {equipment.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Próx. Manutenção</p>
                      <p className="text-sm font-medium text-gray-700">
                        {formatDate(equipment.nextMaintenanceDate)}
                      </p>
                    </div>
                  </div>

                  {/* Serial Number */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">Nº de Série</p>
                    <p className="text-sm font-mono text-gray-700">{equipment.serialNumber}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    </div>
                    <div className="flex items-center">
                      {equipment.status === 'available' ? (
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Locar
                        </Button>
                      ) : equipment.status === 'maintenance' ? (
                        <Button size="sm" variant="outline">
                          <Wrench className="h-4 w-4 mr-1" />
                          Manutenção
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" disabled>
                          Em Uso
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No results message */}
          {paginatedItems.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Nenhum equipamento encontrado</h3>
              <p className="text-gray-500 mt-1">Tente ajustar os filtros de busca</p>
            </div>
          )}

          {/* Pagination */}
          {paginatedItems.length > 0 && (
            <Pagination
              items={filteredEquipments}
              itemsPerPage={pagination.pageSize}
              onPageChange={(items, page, totalPages) => {
                // Pagination is handled by the hook
              }}
              className="mt-6 pt-4 border-t"
            />
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Maintenance Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-orange-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertas de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allEquipments
                .filter(eq => {
                  if (!eq.nextMaintenanceDate) return false
                  const today = new Date()
                  return (eq.nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 7
                })
                .slice(0, 3)
                .map((equipment) => (
                  <div key={equipment.id} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 text-orange-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-orange-800">{equipment.name}</p>
                        <p className="text-xs text-orange-600">
                          Manutenção: {formatDate(equipment.nextMaintenanceDate)}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Agendar
                    </Button>
                  </div>
                ))
              }
              {allEquipments.filter(eq => {
                if (!eq.nextMaintenanceDate) return false
                const today = new Date()
                return (eq.nextMaintenanceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 7
              }).length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  Nenhuma manutenção urgente
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Resumo de Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Taxa de Utilização Média</span>
                <span className="text-lg font-bold text-blue-600">{stats.avgUtilization}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Equipamentos Ativos</span>
                <span className="text-lg font-bold text-green-600">
                  {stats.available + stats.rented}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Receita Potencial Diária</span>
                <span className="text-lg font-bold text-purple-600">
                  {formatCurrency(
                    allEquipments
                      .filter(eq => eq.status === 'available')
                      .reduce((sum, eq) => sum + eq.dailyPrice, 0)
                  )}
                </span>
              </div>
              
              <div className="pt-3 border-t">
                <Button className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Relatório Completo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
