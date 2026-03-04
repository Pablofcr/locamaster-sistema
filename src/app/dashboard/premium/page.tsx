'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

const planosPremium = [
  {
    id: 'basico', nome: 'Básico', preco: 297, periodo: 'mês',
    descricao: 'Ideal para pequenas locadoras',
    recursos: ['Até 50 equipamentos', 'Orçamentos ilimitados', 'Relatórios básicos', 'Suporte por email', '1 usuário'],
    limitacoes: ['Sem integração bancária', 'Sem relatórios avançados'],
    destaque: false
  },
  {
    id: 'profissional', nome: 'Profissional', preco: 497, periodo: 'mês',
    descricao: 'Perfeito para empresas em crescimento',
    recursos: ['Até 200 equipamentos', 'Orçamentos e contratos automáticos', 'Relatórios avançados', 'Suporte prioritário', 'Até 5 usuários', 'Integração bancária', 'WhatsApp Business API', 'Backup automático'],
    limitacoes: ['Sem IA para previsões'],
    destaque: true
  },
  {
    id: 'enterprise', nome: 'Enterprise', preco: 897, periodo: 'mês',
    descricao: 'Solução completa para grandes empresas',
    recursos: ['Equipamentos ilimitados', 'Automação completa', 'IA para previsões', 'Suporte 24/7', 'Usuários ilimitados', 'Múltiplas filiais', 'API personalizada', 'Treinamento incluso'],
    limitacoes: [],
    destaque: false
  }
]

export default function PremiumPage() {
  const [planoAtual] = useState('basico')
  const [showContato, setShowContato] = useState(false)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">LocaSys Premium</h1>
        <p className="text-xl text-gray-600 mt-2">Eleve seu negócio ao próximo nível</p>
        <p className="text-gray-500 mt-1">Plano atual: <Badge className="bg-blue-100 text-blue-800">Básico</Badge></p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {planosPremium.map((plano) => (
          <Card key={plano.id} className={`relative ${plano.destaque ? 'border-2 border-blue-500 shadow-xl' : ''}`}>
            {plano.destaque && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">MAIS POPULAR</Badge>
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
                <ul className="space-y-2">
                  {plano.recursos.map((recurso, i) => (
                    <li key={i} className="flex items-center text-sm">
                      <span className="text-green-500 mr-2">✓</span>{recurso}
                    </li>
                  ))}
                </ul>
                {plano.limitacoes.length > 0 && (
                  <ul className="space-y-1">
                    {plano.limitacoes.map((lim, i) => (
                      <li key={i} className="flex items-center text-sm text-gray-600">
                        <span className="text-red-500 mr-2">✗</span>{lim}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="mt-6">
                  {planoAtual === plano.id ? (
                    <Button className="w-full" disabled>Plano Atual</Button>
                  ) : (
                    <Button className={`w-full ${plano.destaque ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      onClick={() => setShowContato(true)}>Fazer Upgrade</Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showContato && (
        <Card>
          <CardHeader><CardTitle>Solicitar Upgrade</CardTitle></CardHeader>
          <CardContent>
            <div className="bg-blue-50 p-6 rounded-lg text-center">
              <h3 className="text-xl font-bold mb-4">Entre em contato para fazer seu upgrade</h3>
              <div className="space-y-2 mb-6">
                <p className="text-blue-600 font-semibold">(11) 99999-0000</p>
                <p className="text-blue-600 font-semibold">premium@locasys.com.br</p>
              </div>
              <Button variant="outline" onClick={() => setShowContato(false)}>Fechar</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
