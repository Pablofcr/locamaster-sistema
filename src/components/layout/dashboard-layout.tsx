"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  Package, 
  Users, 
  FileText, 
  DollarSign, 
  BarChart3, 
  Settings,
  Calculator
} from "lucide-react"

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Orçamentos', href: '/dashboard/orcamentos', icon: Calculator },
  { name: 'Equipamentos', href: '/dashboard/equipamentos', icon: Package },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Locações', href: '/dashboard/locacoes', icon: FileText },
  { name: 'Faturamento', href: '/dashboard/faturamento', icon: DollarSign },
  { name: 'Relatórios', href: '/dashboard/relatorios', icon: BarChart3 },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg border-r">
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b bg-blue-600">
          <h1 className="text-xl font-bold text-white">LocaMaster Pro</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        <main className="py-8">
          <div className="px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
