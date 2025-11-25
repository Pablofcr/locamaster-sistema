'use client'

import Link from 'next/link'
import { useState } from 'react'

const userTypes = [
  {
    id: 'operator',
    title: '👷 Operador do Sistema',
    description: 'Acesso às funcionalidades básicas: orçamentos, clientes, equipamentos',
    features: ['Criar orçamentos', 'Cadastrar clientes', 'Gerenciar equipamentos', 'Visualizar relatórios'],
    redirect: '/dashboard'
  },
  {
    id: 'manager', 
    title: '👨‍💼 Gerente/Administrador',
    description: 'Acesso completo ao sistema da empresa',
    features: ['Todas funções do operador', 'Configurações avançadas', 'Relatórios financeiros', 'Gestão de usuários'],
    redirect: '/dashboard'
  },
  {
    id: 'client',
    title: '🏢 Cliente da Locadora', 
    description: 'Portal do cliente para acompanhar locações',
    features: ['Ver orçamentos recebidos', 'Acompanhar locações', 'Histórico de contratos', 'Solicitar suporte'],
    redirect: '/dashboard'
  },
  {
    id: 'developer',
    title: '💻 Desenvolvedor/Demo',
    description: 'Acesso de desenvolvedor para testes e demonstração',
    features: ['Acesso total sistema', 'Dados de demonstração', 'Configurações debug', 'Todas empresas'],
    redirect: '/dashboard'
  }
]

export default function LoginPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-blue-400 flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center mr-4">
              <span className="text-blue-600 font-bold text-2xl">LS</span>
            </div>
            <div className="text-white text-left">
              <h1 className="text-4xl font-bold">LocaSys Pro</h1>
              <p className="text-blue-100">Sistema de Gestão para Locadoras</p>
            </div>
          </div>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Escolha seu tipo de acesso para entrar no sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {userTypes.map((type) => (
            <div 
              key={type.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl border-2 rounded-lg p-6 ${
                selectedType === type.id 
                  ? 'border-yellow-400 shadow-xl transform scale-105 bg-white/20' 
                  : 'border-white/20 hover:border-white/40 bg-white/10'
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <div className="text-white">
                <h3 className="text-xl font-bold mb-2">{type.title}</h3>
                <p className="text-blue-100 text-sm mb-4">{type.description}</p>
                <div className="space-y-2">
                  {type.features.map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-blue-100">
                      <span className="text-green-300 mr-2">✓</span>
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedType && (
          <div className="text-center">
            <Link 
              href={userTypes.find(t => t.id === selectedType)?.redirect || '/dashboard'}
              className="bg-yellow-400 text-blue-900 px-12 py-4 rounded-lg text-lg font-semibold hover:bg-yellow-300 transition-colors inline-flex items-center"
            >
              🚀 Entrar como {userTypes.find(t => t.id === selectedType)?.title}
            </Link>
          </div>
        )}

        <div className="mt-12 bg-white/10 backdrop-blur-md rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4 text-center">🏢 Empresas de Demonstração</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🟢</div>
              <h4 className="text-white font-medium">BRA Locação</h4>
              <p className="text-blue-100 text-sm">Fortaleza - CE</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🔵</div>
              <h4 className="text-white font-medium">Silva Equipamentos</h4>
              <p className="text-blue-100 text-sm">São Paulo - SP</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-2xl mb-2">🟠</div>
              <h4 className="text-white font-medium">Norte Locações</h4>
              <p className="text-blue-100 text-sm">Manaus - AM</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-8 text-blue-100">
          <p className="text-sm">
            © 2024 LocaSys Pro - Sistema de Gestão para Locadoras
          </p>
        </div>
      </div>
    </div>
  )
}