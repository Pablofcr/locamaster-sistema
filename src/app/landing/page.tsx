'use client'

import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-bold text-lg">LM</span>
              </div>
              <span className="text-white font-bold text-xl">LocaMaster</span>
            </div>
            <div className="space-x-4">
              <Link 
                href="/dashboard" 
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
              >
                Acessar Sistema
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Sistema de Gestão
            <span className="block text-yellow-300">para Locadoras</span>
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Gerencie equipamentos, clientes, orçamentos e locações de forma simples e profissional. 
            Aumente sua produtividade e organize seu negócio.
          </p>
          <div className="space-x-4">
            <Link 
              href="/dashboard" 
              className="bg-yellow-400 text-blue-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors inline-flex items-center"
            >
              🚀 Acessar Sistema
            </Link>
            <button className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-900 transition-colors">
              📞 Falar com Vendas
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center text-white">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold mb-2">Orçamentos</h3>
            <p className="text-blue-100">Crie propostas profissionais e acompanhe conversões</p>
          </div>
          <div className="text-center text-white">
            <div className="text-4xl mb-4">📦</div>
            <h3 className="text-xl font-semibold mb-2">Equipamentos</h3>
            <p className="text-blue-100">Controle disponibilidade e manutenção de equipamentos</p>
          </div>
          <div className="text-center text-white">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Faturamento</h3>
            <p className="text-blue-100">Relatórios financeiros e controle de pagamentos</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white/10 backdrop-blur-md border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 text-center text-white">
            <div>
              <div className="text-3xl font-bold">127</div>
              <div className="text-blue-100">Equipamentos</div>
            </div>
            <div>
              <div className="text-3xl font-bold">18</div>
              <div className="text-blue-100">Locações Ativas</div>
            </div>
            <div>
              <div className="text-3xl font-bold">78%</div>
              <div className="text-blue-100">Taxa Conversão</div>
            </div>
            <div>
              <div className="text-3xl font-bold">R$ 45k</div>
              <div className="text-blue-100">Receita Mensal</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
