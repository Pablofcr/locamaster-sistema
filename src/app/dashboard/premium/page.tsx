'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const planosPremium = [
  {
    id: 'basico',
    nome: 'Básico',
    preco: 297,
    periodo: 'mês',
    descricao: 'Ideal para pequenas locadoras',
    recursos: [
      'Até 50 equipamentos',
      'Orçamentos ilimitados', 
      'Relatórios básicos',
      'Suporte por email',
      '1 usuário'
    ],
    limitacoes: [
      'Sem integração bancária',
      'Sem relatórios avançados',
      'Sem WhatsApp Business'
    ],
    destaque: false
  },
  {
    id: 'profissional',
    nome: 'Profissional',
    preco: 497,
    periodo: 'mês',
    descricao: 'Perfeito para empresas em crescimento',
    recursos: [
      'Até 200 equipamentos',
      'Orçamentos e contratos automáticos',
      'Relatórios avançados',
      'Suporte prioritário',
      'Até 5 usuários',
      'Integração bancária',
      'WhatsApp Business API',
      'Backup automático'
    ],
    limitacoes: [
      'Sem IA para previsões'
    ],
    destaque: true
  },
  {
    id: 'enterprise',
    nome: 'Enterprise',
    preco: 897,
    periodo: 'mês',
    descricao: 'Solução completa para grandes empresas',
    recursos: [
      'Equipamentos ilimitados',
      'Automação completa',
      'IA para previsões',
      'Suporte 24/7',
      'Usuários ilimitados',
      'Múltiplas filiais',
      'API personalizada',
      'Treinamento incluso'
    ],
    limitacoes: [],
    destaque: false
  }
]

const recursosAdicionais = [
  {
    nome: 'WhatsApp Business API',
    descricao: 'Integração completa com WhatsApp para comunicação automática',
    preco: 97,
    icone: '💬',
    disponivel: true
  },
  {
    nome: 'Integração Bancária',
    descricao: 'Conciliação automática de pagamentos',
    preco: 147,
    icone: '🏦',
    disponivel: true
  },
  {
    nome: 'IA Preditiva',
    descricao: 'Análises com inteligência artificial',
    preco: 247,
    icone: '🤖',
    disponivel: false
  },
  {
    nome: 'App Mobile',
    descricao: 'Aplicativo nativo para iOS e Android',
    preco: 197,
    icone: '📱',
    disponivel: false
  }
]

export default function PremiumPage() {
  const [planoAtual] = useState('basico')
  const [showContato, setShowContato] = useState(false)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">⭐ LocaSys Premium</h1>
        <p className="text-xl text-gray-600 mt-2">Eleve seu negócio ao próximo nível</p>
        <p className="text-gray-500 mt-1">Plano atual: <Badge className="bg-blue-100 text-blue-800">Básico</Badge></p>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-6 text-white text-center">
        <h2 className="text-2xl font-bold mb-2">🚀 Oferta Especial de Lançamento!</h2>
        <p className="text-blue-100 mb-4">50% de desconto nos primeiros 3 meses para novos clientes</p>
        <Button className="bg-yellow-400 text-blue-900 hover:bg-yellow-300 font-bold">
          🎯 Aproveitar Oferta
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {planosPremium.map((plano) => (
          <Card 
            key={plano.id} 
            className={`relative ${
              plano.destaque 
                ? 'border-2 border-blue-500 shadow-xl scale-105' 
                : 'border border-gray-200'
            }`}
          >
            {plano.destaque && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">🔥 MAIS POPULAR</Badge>
              </div>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plano.nome}</CardTitle>
              <div className="mt-4">
                <span className="text-4xl font-bold text-blue-600">R$ {plano.preco}</span>
                <span className="text-gray-500">/{plano.periodo}</span>
              </div>
              <p className="text-gray-600">{plano.descricao}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-green-600 mb-2">✅ Inclui:</h4>
                  <ul className="space-y-2">
                    {plano.recursos.map((recurso, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <span className="text-green-500 mr-2">✓</span>
                        {recurso}
                      </li>
                    ))}
                  </ul>
                </div>

                {plano.limitacoes.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-red-600 mb-2">❌ Limitações:</h4>
                    <ul className="space-y-1">
                      {plano.limitacoes.map((limitacao, index) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <span className="text-red-500 mr-2">✗</span>
                          {limitacao}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6">
                  {planoAtual === plano.id ? (
                    <Button className="w-full" disabled>
                      ✅ Plano Atual
                    </Button>
                  ) : (
                    <Button 
                      className={`w-full ${
                        plano.destaque 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-gray-600 hover:bg-gray-700'
                      }`}
                      onClick={() => setShowContato(true)}
                    >
                      🚀 Fazer Upgrade
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-blue-600">🛠️ Recursos Adicionais</CardTitle>
          <p className="text-gray-600">Expanda ainda mais as funcionalidades do seu sistema</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recursosAdicionais.map((recurso, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  recurso.disponivel 
                    ? 'border-gray-200 hover:bg-gray-50' 
                    : 'border-gray-300 bg-gray-50 opacity-75'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{recurso.icone}</div>
                    <div>
                      <h3 className="font-semibold">{recurso.nome}</h3>
                      <p className="text-sm text-gray-600">{recurso.descricao}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600">
                      R$ {recurso.preco}/mês
                    </div>
                    {recurso.disponivel ? (
                      <Button variant="outline" size="sm" className="mt-2">
                        ➕ Adicionar
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="mt-2">
                        Em Breve
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">💰 Calculadora de ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Receita mensal atual:</label>
                <input 
                  type="number" 
                  placeholder="R$ 50.000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Número de equipamentos:</label>
                <input 
                  type="number" 
                  placeholder="127"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800">Economia estimada com Premium:</h4>
                <div className="mt-2 text-2xl font-bold text-green-600">R$ 2.850/mês</div>
                <p className="text-sm text-green-700">Através de automação e eficiência operacional</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-purple-600">🎯 Casos de Sucesso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold">Locadora ABC - São Paulo</h4>
                <p className="text-sm text-gray-600 mt-1">
                  "Aumentamos nossa receita em 35% em 6 meses após migrar para o Premium"
                </p>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span>⭐⭐⭐⭐⭐</span>
                  <span className="text-purple-600">+35% receita</span>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold">Equipamentos XYZ - RJ</h4>
                <p className="text-sm text-gray-600 mt-1">
                  "Reduziu nosso tempo administrativo em 60% com a automação"
                </p>
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span>⭐⭐⭐⭐⭐</span>
                  <span className="text-purple-600">-60% tempo admin</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {showContato && (
        <Card>
          <CardHeader>
            <CardTitle>📞 Solicitar Upgrade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <h3 className="text-xl font-bold mb-4">Entre em contato para fazer seu upgrade</h3>
              <div className="space-y-2 mb-6">
                <p className="text-blue-600 font-semibold">📞 (11) 99999-0000</p>
                <p className="text-blue-600 font-semibold">📧 premium@locasys.com.br</p>
                <p className="text-blue-600 font-semibold">💬 WhatsApp: (11) 99999-0000</p>
              </div>
              <div className="flex space-x-3 justify-center">
                <Button className="bg-green-600 hover:bg-green-700">
                  💬 WhatsApp
                </Button>
                <Button variant="outline">
                  📧 Email
                </Button>
                <Button variant="outline" onClick={() => setShowContato(false)}>
                  ❌ Fechar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}