"use client"

import Link from "next/link"
import { ReactNode, useState } from "react"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Package, 
  Users, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  LogOut,
  User,
  Palette,
  Moon,
  Sun
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DashboardLayoutProps {
  children: ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Equipamentos', href: '/dashboard/equipamentos', icon: Package },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Locações', href: '/dashboard/locacoes', icon: FileText },
  { name: 'Faturamento', href: '/dashboard/faturamento', icon: DollarSign },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
  { name: 'Premium', href: '/dashboard/premium', icon: TrendingUp, badge: 'NEW' },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
]

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  // ✅ CORREÇÃO 1: Menu dinâmico - não fica travado no Dashboard
  const pathname = usePathname()
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl border-r border-gray-200">
        {/* Logo */}
        <div className="flex h-20 items-center justify-center border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200">
              <span className="text-blue-600 font-bold text-xl">LM</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">LocaMaster Pro</h1>
              <p className="text-blue-100 text-sm font-medium">v2.0 Premium</p>
            </div>
          </div>
        </div>

        {/* Navigation - ✅ MENU DINÂMICO CORRIGIDO */}
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              // ✅ CORREÇÃO: Menu baseado na rota atual, não travado
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 hover:scale-[1.02] ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 hover:scale-[1.02] hover:shadow-md'
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                      isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
                    }`}
                    aria-hidden="true"
                  />
                  {item.name}
                  {item.badge && (
                    <span className="ml-auto px-2 py-1 text-xs font-bold bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        </nav>

        {/* Enhanced Stats Quick View - ✅ BORDAS COLORIDAS SUAVES */}
        <div className="mt-8 px-4">
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-blue-100">
            <h3 className="text-sm font-bold text-gray-800 mb-4 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
              Status em Tempo Real
            </h3>
            <div className="space-y-3">
              {/* ✅ CORREÇÃO 2: Bordas coloridas suaves em vez de pretas */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4 border-green-400 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-gray-600 text-sm font-medium">Equipamentos disponíveis</span>
                </div>
                <span className="font-bold text-green-600 text-lg">42</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4 border-blue-400 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-gray-600 text-sm font-medium">Locações ativas</span>
                </div>
                <span className="font-bold text-blue-600 text-lg">18</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border-l-4 border-orange-400 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 cursor-pointer">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-gray-600 text-sm font-medium">Faturas pendentes</span>
                </div>
                <span className="font-bold text-orange-600 text-lg">7</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-6 px-4">
          <div className="flex items-center justify-center p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors duration-200 cursor-pointer">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
            <span className="text-sm font-medium text-green-700">Sistema Online</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-72">
        {/* Enhanced Top header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Buscar equipamentos, clientes, contratos..."
                    className="pl-10 pr-4 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-300 hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                  />
                </div>
              </div>

              {/* Header actions */}
              <div className="flex items-center space-x-4">
                {/* ✅ CORREÇÃO 3: Hover effects nos botões */}
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hidden sm:flex hover:scale-105 hover:shadow-md hover:border-blue-400 transition-all duration-200"
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Hoje
                  </Button>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative hover:scale-110 hover:bg-blue-50 hover:shadow-md transition-all duration-200"
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs animate-bounce"></span>
                  </Button>
                </div>
                
                {/* ✅ CORREÇÃO 4: Menu de perfil completo */}
                <div className="relative">
                  <div 
                    className="flex items-center space-x-3 pl-4 border-l border-gray-200 cursor-pointer hover:bg-gray-50 rounded-lg p-2 transition-all duration-200 hover:shadow-sm"
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                  >
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">Pablo Silva</p>
                      <p className="text-xs text-gray-500">Administrador</p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform duration-200">
                      <span className="text-white text-sm font-bold">P</span>
                    </div>
                    <ChevronDown 
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                        showProfileMenu ? 'rotate-180' : 'rotate-0'
                      }`}
                    />
                  </div>

                  {/* ✅ DROPDOWN MENU COMPLETO */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in slide-in-from-top-2 duration-200">
                      
                      {/* Header do menu */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">Minha Conta</p>
                        <p className="text-xs text-gray-500">pablo.silva@locamaster.com.br</p>
                      </div>
                      
                      {/* Opções do menu */}
                      <div className="py-1">
                        <button 
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <User className="w-4 h-4 mr-3 text-gray-400" />
                          Editar Perfil
                        </button>
                        
                        <button 
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Settings className="w-4 h-4 mr-3 text-gray-400" />
                          Configurações da Conta
                        </button>
                        
                        <button 
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Palette className="w-4 h-4 mr-3 text-gray-400" />
                          Personalizar Tema
                        </button>

                        <button 
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 flex items-center"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Bell className="w-4 h-4 mr-3 text-gray-400" />
                          Notificações
                        </button>
                      </div>
                      
                      {/* Seção de logout */}
                      <div className="border-t border-gray-100 pt-1">
                        <button 
                          className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors duration-200 flex items-center"
                          onClick={() => {
                            setShowProfileMenu(false)
                            // Aqui você pode adicionar a lógica de logout
                            console.log('Fazendo logout...')
                          }}
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sair da Conta
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content with better spacing */}
        <main className="py-8">
          <div className="px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
