"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode, useState } from "react"

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Calendário', href: '/dashboard/calendario', icon: '📅' },
  { name: 'Orçamentos', href: '/dashboard/orcamentos', icon: '📋', badge: 'NEW' },
  { name: 'Equipamentos', href: '/dashboard/equipamentos', icon: '📦' },
  { name: 'Manutenção', href: '/dashboard/manutencao', icon: '🔧' },
  { name: 'Clientes', href: '/dashboard/clientes', icon: '👥' },
  { name: 'Locações', href: '/dashboard/locacoes', icon: '📄' },
  { name: 'Faturamento', href: '/dashboard/faturamento', icon: '💰' },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: '📊' },
  { name: 'Premium', href: '/dashboard/premium', icon: '⭐', badge: 'HOT' },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: '⚙️' },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar Fixa */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col fixed h-full z-50">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-blue-600 to-blue-500 flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-bold text-lg">LS</span>
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold">LocaSys Pro</h1>
              <p className="text-xs text-blue-100">Sistema de Gestão</p>
            </div>
          </div>
        </div>

        {/* Navigation - Área Scrollável */}
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-4 px-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-lg" aria-hidden="true">
                      {item.icon}
                    </span>
                    {item.name}
                    {item.badge && (
                      <span className={`ml-auto px-2 py-1 text-xs font-bold rounded-full ${
                        item.badge === 'NEW' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Stats */}
          <div className="mt-8 mx-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-3">📊 Status Sistema</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Orçamentos:</span>
                <span className="font-medium text-blue-800">5</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Locações:</span>
                <span className="font-medium text-blue-800">18</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">Equipamentos:</span>
                <span className="font-medium text-blue-800">127</span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-4 mx-4 p-3 bg-gray-50 rounded-lg border mb-4">
            <h3 className="text-xs font-medium text-gray-600 mb-2">🎯 LocaSys Pro</h3>
            <div className="space-y-1 text-xs text-gray-500">
              <div>Sistema SaaS</div>
              <div>Múltiplas Empresas</div>
              <div>Gestão Completa</div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal - Com margem para sidebar */}
      <div className="flex-1 ml-64 flex flex-col h-full">
        {/* Header Fixo */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Buscar equipamentos, clientes..."
                    className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* User menu */}
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                  <span className="text-lg">🔔</span>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">LocaSys Pro</p>
                    <p className="text-xs text-gray-500">Administrador</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">L</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Conteúdo Scrollável */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}