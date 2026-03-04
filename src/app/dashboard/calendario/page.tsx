'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'

interface Evento {
  tipo: string
  titulo: string
  hora: string
  cliente?: string
  status?: string
}

export default function CalendarioPage() {
  const [semanaAtual, setSemanaAtual] = useState(0)
  const [eventos, setEventos] = useState<Record<string, Evento[]>>({})
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, manutencao: 0, fatura: 0, locacao: 0 })

  const hoje = new Date()
  const inicioSemana = new Date(hoje)
  inicioSemana.setDate(hoje.getDate() - hoje.getDay() + (semanaAtual * 7))

  const diasSemana: Date[] = []
  for (let i = 0; i < 7; i++) {
    const dia = new Date(inicioSemana)
    dia.setDate(inicioSemana.getDate() + i)
    diasSemana.push(dia)
  }

  const nomesDias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  useEffect(() => { carregarEventos() }, [semanaAtual])

  const formatarData = (data: Date) => {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
  }

  const carregarEventos = async () => {
    setLoading(true)
    try {
      const inicio = formatarData(diasSemana[0])
      const fim = formatarData(diasSemana[6])

      const [manRes, fatRes, locRes] = await Promise.all([
        supabase.from('manutencoes').select('*').gte('data_agendada', inicio).lte('data_agendada', fim),
        supabase.from('faturas').select('*').gte('data_vencimento', inicio).lte('data_vencimento', fim),
        supabase.from('locacoes').select('*').or(`data_inicio.gte.${inicio},data_fim.lte.${fim}`)
      ])

      const eventosMap: Record<string, Evento[]> = {}

      ;(manRes.data || []).forEach(m => {
        const data = m.data_agendada
        if (!eventosMap[data]) eventosMap[data] = []
        eventosMap[data].push({
          tipo: 'manutencao',
          titulo: `Manutenção ${m.equipamento_nome || ''}`,
          hora: '08:00',
          status: m.status
        })
      })

      ;(fatRes.data || []).forEach(f => {
        const data = f.data_vencimento
        if (!eventosMap[data]) eventosMap[data] = []
        eventosMap[data].push({
          tipo: 'fatura',
          titulo: `Venc. Fatura ${f.numero || '#' + f.id}`,
          hora: '23:59',
          cliente: f.cliente_nome
        })
      })

      ;(locRes.data || []).forEach(l => {
        if (l.data_inicio && l.data_inicio >= inicio && l.data_inicio <= fim) {
          if (!eventosMap[l.data_inicio]) eventosMap[l.data_inicio] = []
          eventosMap[l.data_inicio].push({
            tipo: 'locacao',
            titulo: `Início ${l.numero || ''} - ${l.equipamento_nome || ''}`,
            hora: '08:00',
            cliente: l.cliente_nome
          })
        }
        if (l.data_fim && l.data_fim >= inicio && l.data_fim <= fim) {
          if (!eventosMap[l.data_fim]) eventosMap[l.data_fim] = []
          eventosMap[l.data_fim].push({
            tipo: 'locacao',
            titulo: `Fim ${l.numero || ''} - ${l.equipamento_nome || ''}`,
            hora: '17:00',
            cliente: l.cliente_nome
          })
        }
      })

      setEventos(eventosMap)

      const todosEventos = Object.values(eventosMap).flat()
      setStats({
        total: todosEventos.length,
        manutencao: todosEventos.filter(e => e.tipo === 'manutencao').length,
        fatura: todosEventos.filter(e => e.tipo === 'fatura').length,
        locacao: todosEventos.filter(e => e.tipo === 'locacao').length
      })
    } catch {
      // silently handle, events will be empty
    } finally {
      setLoading(false)
    }
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'manutencao': return '🔧'
      case 'fatura': return '💰'
      case 'locacao': return '🚚'
      default: return '📅'
    }
  }

  const getTipoColor = (tipo: string, status?: string) => {
    switch (tipo) {
      case 'manutencao': return status === 'vencida' ? 'border-red-400 bg-red-50' : 'border-orange-400 bg-orange-50'
      case 'fatura': return 'border-green-400 bg-green-50'
      case 'locacao': return 'border-blue-400 bg-blue-50'
      default: return 'border-gray-400 bg-gray-50'
    }
  }

  const ehHoje = (data: Date) => formatarData(data) === formatarData(hoje)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-600">Agenda semanal de atividades</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setSemanaAtual(semanaAtual - 1)}>Anterior</Button>
          <Button variant="outline" onClick={() => setSemanaAtual(0)}>Hoje</Button>
          <Button variant="outline" onClick={() => setSemanaAtual(semanaAtual + 1)}>Próxima</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Total Eventos</div><div className="text-2xl font-bold text-blue-600">{stats.total}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Manutenções</div><div className="text-2xl font-bold text-orange-600">{stats.manutencao}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Faturas</div><div className="text-2xl font-bold text-green-600">{stats.fatura}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Locações</div><div className="text-2xl font-bold text-blue-600">{stats.locacao}</div></CardContent></Card>
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Semana de {diasSemana[0].getDate()} a {diasSemana[6].getDate()} de {mesesNomes[diasSemana[0].getMonth()]} {diasSemana[0].getFullYear()}
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando eventos...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {diasSemana.map((dia, index) => {
            const dataFormatada = formatarData(dia)
            const eventsDoDia = eventos[dataFormatada] || []
            const isHoje = ehHoje(dia)

            return (
              <Card key={index} className={`min-h-[300px] ${isHoje ? 'border-2 border-blue-500 shadow-lg bg-blue-50' : 'border border-gray-200'}`}>
                <CardHeader className="pb-3">
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-600">{nomesDias[dia.getDay()]}</div>
                    <div className={`text-2xl font-bold ${isHoje ? 'text-blue-600' : 'text-gray-800'}`}>{dia.getDate()}</div>
                    {isHoje && <Badge className="bg-blue-100 text-blue-800 text-xs mt-1">Hoje</Badge>}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {eventsDoDia.length === 0 ? (
                      <div className="text-center text-gray-400 text-sm py-4">Nenhum evento</div>
                    ) : (
                      eventsDoDia.map((evento, ei) => (
                        <div key={ei} className={`p-2 rounded-md text-xs border-l-4 ${getTipoColor(evento.tipo, evento.status)}`}>
                          <div className="flex items-start space-x-2">
                            <span className="text-sm">{getTipoIcon(evento.tipo)}</span>
                            <div className="flex-1">
                              <div className="font-medium text-gray-800 leading-tight">{evento.titulo}</div>
                              <div className="text-gray-600 mt-1">{evento.hora}</div>
                              {evento.cliente && <div className="text-gray-500 mt-1">{evento.cliente}</div>}
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
      )}

      <Card>
        <CardHeader><CardTitle>Legenda</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-200 border-l-4 border-orange-400 rounded"></div>
              <span className="text-sm">Manutenções</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 border-l-4 border-green-400 rounded"></div>
              <span className="text-sm">Faturas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200 border-l-4 border-blue-400 rounded"></div>
              <span className="text-sm">Locações</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
