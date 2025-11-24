"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode, useState } from "react"

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '🏠' },
  { name: 'Orçamentos', href: '/dashboard/orcamentos', icon: '📋', badge: 'NEW' },
  { name: 'Equipamentos', href: '/dashboard/equipamentos', icon: '📦' },
  { name: 'Clientes', href: '/dashboard/clientes', icon: '👥' },
  { name: 'Locações', href: '/dashboard/locacoes', icon: '📄' },
  { name: 'Faturamento', href: '/dashboard/faturamento', icon: '💰' },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: '📊' },
  { name: 'Premium', href: '/dashboard/premium', icon: '⭐', badge: 'HOT' },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: '⚙️' },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg border-r border-gray-200">
        {/* Logo BRA LOCAÇÃO */}
        <div className="flex items-center justify-center h-16 px-4 bg-gradient-to-r from-orange-600 to-orange-500">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-orange-600 font-bold text-lg">BRA</span>
            </div>
            <div className="text-white">
              <h1 className="text-lg font-bold">BRA LOCAÇÃO</h1>
              <p className="text-xs text-orange-100">Equipamentos</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
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
                      ? 'bg-orange-100 text-orange-700 border-r-2 border-orange-500'
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

        {/* Stats da empresa */}
        <div className="mt-8 mx-4 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
          <h3 className="text-sm font-medium text-orange-800 mb-3">📊 Status BRA Locação</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-orange-700">Orçamentos:</span>
              <span className="font-medium text-orange-800">5</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-orange-700">Locações:</span>
              <span className="font-medium text-orange-800">18</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-orange-700">Equipamentos:</span>
              <span className="font-medium text-orange-800">127</span>
            </div>
          </div>
        </div>

        {/* Contato BRA */}
        <div className="mt-4 mx-4 p-3 bg-gray-50 rounded-lg border">
          <h3 className="text-xs font-medium text-gray-600 mb-2">📞 Contato</h3>
          <div className="space-y-1 text-xs text-gray-500">
            <div>(85) 989002319</div>
            <div>contato@braloc.com.br</div>
            <div>Fortaleza - CE</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="🔍 Buscar equipamentos, clientes..."
                    className="w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* User menu */}
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-orange-600 transition-colors">
                  <span className="text-lg">🔔</span>
                  <span className="sr-only">Notificações</span>
                </button>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">BRA Locação</p>
                    <p className="text-xs text-gray-500">Administrador</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">B</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
