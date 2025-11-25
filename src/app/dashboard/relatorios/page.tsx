'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const relatoriosMock = [
  { id: 1, nome: 'Relatório Mensal de Receita', tipo: 'financeiro', periodo: 'Novembro 2024', arquivo: 'receita-nov-2024.pdf' },
  { id: 2, nome: 'Equipamentos por Status', tipo: 'operacional', periodo: 'Última semana', arquivo: 'equipamentos-status.xlsx' },
  { id: 3, nome: 'Clientes Mais Rentáveis', tipo: 'comercial', periodo: 'Últimos 6 meses', arquivo: 'clientes-top.pdf' },
  { id: 4, nome: 'Análise de Locações', tipo: 'operacional', periodo: 'Outubro 2024', arquivo: 'locacoes-out-2024.xlsx' }
]

export default function RelatoriosPage() {
  const [filtroTipo, setFiltroTipo] = useState('todos')
  const [periodoInicio, setPeriodoInicio] = useState('')
  const [periodoFim, setPeriodoFim] = useState('')

  const dadosGraficos = {
    receita: [
      { mes: 'Jun', valor: 45200 },
      { mes: 'Jul', valor: 52800 },
      { mes: 'Ago', valor: 38900 },
      { mes: 'Set', valor: 61500 },
      { mes: 'Out', valor: 47300 },
      { mes: 'Nov', valor: 55600 }
    ],
    equipamentos: [
      { categoria: 'Escavação', total: 8, disponivel: 6, locado: 2 },
      { categoria: 'Concreto', total: 15, disponivel: 12, locado: 3 },
      { categoria: 'Energia', total: 6, disponivel: 4, locado: 2 },
      { categoria: 'Pneumática', total: 10, disponivel: 8, locado: 2 }
    ]
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📊 Relatórios</h1>
          <p className="text-gray-600">Análises e relatórios gerenciais</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          📈 Gerar Relatório
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Receita Mês</p>
                <p className="text-xl font-bold text-green-600">R$ 55.600</p>
                <p className="text-xs text-green-600">+18% vs mês anterior</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Taxa Ocupação</p>
                <p className="text-xl font-bold text-blue-600">73%</p>
                <p className="text-xs text-blue-600">29 de 40 equipamentos</p>
              </div>
              <div className="text-2xl">📦</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-yellow-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ticket Médio</p>
                <p className="text-xl font-bold text-yellow-600">R$ 185</p>
                <p className="text-xs text-yellow-600">Por dia de locação</p>
              </div>
              <div className="text-2xl">🎯</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Novos Clientes</p>
                <p className="text-xl font-bold text-purple-600">12</p>
                <p className="text-xs text-purple-600">Este mês</p>
              </div>
              <div className="text-2xl">👥</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-blue-600">📈 Receita por Mês (R$)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dadosGraficos.receita.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 text-sm font-medium">{item.mes}</div>
                    <div className="flex-1">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className="bg-blue-500 h-3 rounded-full" 
                          style={{width: `${(item.valor / 65000) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-bold text-blue-600">
                    {item.valor.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">📦 Equipamentos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dadosGraficos.equipamentos.map((cat, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{cat.categoria}</span>
                    <span className="text-sm text-gray-600">{cat.total} total</span>
                  </div>
                  <div className="flex space-x-2 text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-green-500 rounded"></div>
                      <span>Disponível: {cat.disponivel}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                      <span>Locado: {cat.locado}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>📋 Relatórios Gerados</CardTitle>
            <div className="flex space-x-2">
              <select 
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="financeiro">Financeiro</option>
                <option value="operacional">Operacional</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Data início"
              type="date"
              value={periodoInicio}
              onChange={(e) => setPeriodoInicio(e.target.value)}
              className="w-40"
            />
            <Input
              placeholder="Data fim"
              type="date"
              value={periodoFim}
              onChange={(e) => setPeriodoFim(e.target.value)}
              className="w-40"
            />
            <Button variant="outline">🔍 Filtrar</Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {relatoriosMock.map((relatorio) => (
              <div key={relatorio.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div>
                  <h3 className="font-medium">{relatorio.nome}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                    <span>📊 {relatorio.tipo}</span>
                    <span>📅 {relatorio.periodo}</span>
                    <span>📄 {relatorio.arquivo}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">📄 Visualizar</Button>
                  <Button variant="outline" size="sm">📥 Download</Button>
                  <Button variant="outline" size="sm">📧 Enviar</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📈 Gerar Novo Relatório</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="">Tipo de Relatório</option>
              <option value="receita">Relatório de Receita</option>
              <option value="clientes">Análise de Clientes</option>
              <option value="equipamentos">Status Equipamentos</option>
              <option value="locacoes">Relatório de Locações</option>
            </select>
            <Input placeholder="Data início" type="date" />
            <Input placeholder="Data fim" type="date" />
          </div>
          <div className="mt-4 flex space-x-3">
            <Button className="bg-blue-600 hover:bg-blue-700">📊 Gerar Relatório</Button>
            <Button variant="outline">📧 Agendar Envio</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}