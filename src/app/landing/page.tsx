'use client'

import Link from 'next/link'

export default function LandingPageBRA() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-orange-600 to-orange-400">
      {/* Header */}
      <nav className="bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
                <span className="text-orange-600 font-bold text-xl">BRA</span>
              </div>
              <div className="text-white">
                <span className="font-bold text-2xl">BRA LOCAÇÃO</span>
                <div className="text-sm text-orange-100">Equipamentos e Soluções</div>
              </div>
            </div>
            <div className="space-x-4">
              <button className="text-white hover:text-orange-200 px-4 py-2 rounded-lg transition-colors">
                📞 (85) 98900-2319
              </button>
              <Link 
                href="/dashboard" 
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-medium hover:bg-orange-50 transition-colors"
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
          <h1 className="text-6xl md:text-7xl font-bold text-white mb-6">
            <span className="block">BRA LOCAÇÃO</span>
            <span className="block text-yellow-300">de Equipamentos</span>
          </h1>
          <p className="text-xl text-orange-100 mb-8 max-w-3xl mx-auto">
            Locação profissional de equipamentos para construção civil. 
            Qualidade, confiança e suporte técnico especializado em Fortaleza e região.
          </p>
          <div className="space-x-4">
            <Link 
              href="/dashboard" 
              className="bg-yellow-400 text-orange-900 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors inline-flex items-center"
            >
              🚀 Acessar Sistema
            </Link>
            <a 
              href="tel:+5585989002319"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-orange-900 transition-colors inline-flex items-center"
            >
              📞 (85) 98900-2319
            </a>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Nossos Serviços em Fortaleza
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center text-white">
            <div className="text-5xl mb-4">🏗️</div>
            <h3 className="text-xl font-semibold mb-2">Equipamentos para Construção</h3>
            <p className="text-orange-100">Betoneiras, escavadeiras, compressores e mais para sua obra</p>
          </div>
          <div className="text-center text-white">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Entrega Rápida</h3>
            <p className="text-orange-100">Entregamos em toda região metropolitana de Fortaleza</p>
          </div>
          <div className="text-center text-white">
            <div className="text-5xl mb-4">🔧</div>
            <h3 className="text-xl font-semibold mb-2">Suporte Técnico</h3>
            <p className="text-orange-100">Manutenção e suporte especializado durante toda locação</p>
          </div>
        </div>
      </div>

      {/* Contato e Localização */}
      <div className="bg-white/10 backdrop-blur-md border-t border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Contato */}
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-6">Entre em Contato</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📞</span>
                  <div>
                    <p className="font-semibold">(85) 98900-2319</p>
                    <p className="text-orange-100">WhatsApp e Ligações</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <p className="font-semibold">contato@braloc.com.br</p>
                    <p className="text-orange-100">Email Comercial</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold">Fortaleza - CE</p>
                    <p className="text-orange-100">Atendemos toda região metropolitana</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats da empresa */}
            <div className="text-white">
              <h3 className="text-2xl font-bold mb-6">BRA Locação em Números</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold">127</div>
                  <div className="text-orange-100">Equipamentos</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">18</div>
                  <div className="text-orange-100">Locações Ativas</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">5+</div>
                  <div className="text-orange-100">Anos no Mercado</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold">100%</div>
                  <div className="text-orange-100">Satisfação</div>
                </div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <h3 className="text-2xl font-bold text-white mb-4">
              Precisa de equipamentos para sua obra?
            </h3>
            <p className="text-orange-100 mb-6">
              Entre em contato e faça seu orçamento sem compromisso
            </p>
            <div className="space-x-4">
              <a 
                href="https://wa.me/5585989002319"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-green-600 transition-colors inline-flex items-center"
              >
                💬 WhatsApp
              </a>
              <Link 
                href="/dashboard" 
                className="bg-yellow-400 text-orange-900 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors inline-flex items-center"
              >
                📋 Sistema de Orçamentos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
