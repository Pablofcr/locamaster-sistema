'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export default function CalendarioPage() {
  const [semanaAtual, setSemanaAtual] = useState(0)

  const hoje = new Date()
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay() + (semanaAtual * 7))

  const diasSemana = []
  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicioSemana)
    dia.setDate(inicioSemana.getDate() + i)
    diasSemana.push(dia)
  }

  const nomesDias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  const eventosCalendario = {
    '2024-11-25': [
      { tipo: 'manutencao', titulo: 'Manutenção Escavadeira ESC-001', hora: '08:00', status: 'agendada' },
      { tipo: 'fatura', titulo: 'Vencimento Fatura FAT-002', hora: '23:59', cliente: 'Beta Engenharia' }
    ],
    '2024-11-26': [
      { tipo: 'locacao', titulo: 'Entrega Betoneira - Obra Centro', hora: '14:00', cliente: 'Alpha Construtora' },
      { tipo: 'manutencao', titulo: 'Revisão Compressor COM-001', hora: '09:00', status: 'urgente' }
    ],
    '2024-11-27': [
      { tipo: 'cliente', titulo: 'Reunião Nova Proposta', hora: '15:30', cliente: 'Construtora Gama' }
    ],
    '2024-11-28': [
      { tipo: 'fatura', titulo: 'Vencimento Fatura FAT-003', hora: '23:59', cliente: 'Construtora Gama' },
      { tipo: 'locacao', titulo: 'Devolução Gerador GER-001', hora: '16:00', cliente: 'Beta Engenharia' }
    ],
    '2024-11-29': [
      { tipo: 'manutencao', titulo: 'Conclusão Reparo Gerador', hora: '10:00', status: 'em_andamento' },
      { tipo: 'orcamento', titulo: 'Apresentação Orçamento ORC-005', hora: '11:00', cliente: 'Nova Construtora' }
    ],
    '2024-11-30': [
      { tipo: 'fatura', titulo: 'Vencimento Fatura FAT-001', hora: '23:59', cliente: 'Construtora Alpha' }
    ],
    '2024-12-01': [
      { tipo: 'locacao', titulo: 'Início Nova Locação LOC-005', hora: '08:00', cliente: 'Construtora Delta' }
    ]
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'manutencao': return '🔧'
      case 'fatura': return '💰'
      case 'locacao': return '🚚'
      case 'cliente': return '👥'
      case 'orcamento': return '📋'
      default: return '📅'
    }
  }

  const getTipoColor = (tipo: string, status?: string) => {
    switch (tipo) {
      case 'manutencao': 
        return status === 'urgente' ? 'border-red-400 bg-red-50' : 'border-orange-400 bg-orange-50'
      case 'fatura': return 'border-green-400 bg-green-50'
      case 'locacao': return 'border-blue-400 bg-blue-50'
      case 'cliente': return 'border-purple-400 bg-purple-50'
      case 'orcamento': return 'border-yellow-400 bg-yellow-50'
      default: return 'border-gray-400 bg-gray-50'
    }
  }

  const formatarData = (data: Date) => {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
  }

  const ehHoje = (data: Date) => {
    return formatarData(data) === formatarData(hoje)
  }

  const proximaSemana = () => {
    setSemanaAtual(semanaAtual + 1)
  }

  const semanaAnterior = () => {
    setSemanaAtual(semanaAtual - 1)
  }

  const voltarHoje = () => {
    setSemanaAtual(0)
  }

  const contarEventosPorTipo = () => {
    const eventos = Object.values(eventosCalendario).flat()
    return {
      manutencao: eventos.filter(e => e.tipo === 'manutencao').length,
      fatura: eventos.filter(e => e.tipo === 'fatura').length,
      locacao: eventos.filter(e => e.tipo === 'locacao').length,
      total: eventos.length
    }
  }

  const stats = contarEventosPorTipo()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">📅 Calendário</h1>
          <p className="text-gray-600">Agenda semanal de atividades da locadora</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={semanaAnterior}>
            ⬅️ Semana Anterior
          </Button>
          <Button variant="outline" onClick={voltarHoje}>
            📍 Hoje
          </Button>
          <Button variant="outline" onClick={proximaSemana}>
            Próxima Semana ➡️
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Eventos</p>
                <p className="text-xl font-bold text-blue-600">{stats.total}</p>
              </div>
              <div className="text-2xl">📅</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-orange-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Manutenções</p>
                <p className="text-xl font-bold text-orange-600">{stats.manutencao}</p>
              </div>
              <div className="text-2xl">🔧</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Faturas</p>
                <p className="text-xl font-bold text-green-600">{stats.fatura}</p>
              </div>
              <div className="text-2xl">💰</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Locações</p>
                <p className="text-xl font-bold text-blue-600">{stats.locacao}</p>
              </div>
              <div className="text-2xl">🚚</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Semana de {diasSemana[0].getDate()} a {diasSemana[6].getDate()} de {mesesNomes[diasSemana[0].getMonth()]} {diasSemana[0].getFullYear()}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {diasSemana.map((dia, index) => {
          const dataFormatada = formatarData(dia)
          const eventsDoDia = eventosCalendario[dataFormatada] || []
          const isHoje = ehHoje(dia)

          return (
            <Card 
              key={index} 
              className={`min-h-[300px] ${
                isHoje 
                  ? 'border-2 border-blue-500 shadow-lg bg-blue-50' 
                  : 'border border-gray-200'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-600">
                    {nomesDias[dia.getDay()]}
                  </div>
                  <div className={`text-2xl font-bold ${
                    isHoje ? 'text-blue-600' : 'text-gray-800'
                  }`}>
                    {dia.getDate()}
                  </div>
                  {isHoje && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">
                      Hoje
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {eventsDoDia.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-4">
                      Nenhum evento
                    </div>
                  ) : (
                    eventsDoDia.map((evento, eventIndex) => (
                      <div
                        key={eventIndex}
                        className={`p-2 rounded-md text-xs border-l-4 ${getTipoColor(evento.tipo, evento.status)}`}
                      >
                        <div className="flex items-start space-x-2">
                          <span className="text-sm">{getTipoIcon(evento.tipo)}</span>
                          <div className="flex-1">
                            <div className="font-medium text-gray-800 leading-tight">
                              {evento.titulo}
                            </div>
                            <div className="text-gray-600 mt-1">
                              ⏰ {evento.hora}
                            </div>
                            {evento.cliente && (
                              <div className="text-gray-500 mt-1">
                                👤 {evento.cliente}
                              </div>
                            )}
                            {evento.status === 'urgente' && (
                              <Badge className="bg-red-100 text-red-800 text-xs mt-1">
                                Urgente
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📋 Legenda de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-200 border-l-4 border-orange-400 rounded"></div>
              <span className="text-sm">🔧 Manutenções</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 border-l-4 border-green-400 rounded"></div>
              <span className="text-sm">💰 Vencimento Faturas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200 border-l-4 border-blue-400 rounded"></div>
              <span className="text-sm">🚚 Locações</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-purple-200 border-l-4 border-purple-400 rounded"></div>
              <span className="text-sm">👥 Clientes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-yellow-200 border-l-4 border-yellow-400 rounded"></div>
              <span className="text-sm">📋 Orçamentos</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}