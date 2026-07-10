'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { supabase } from '@/lib/supabase'

interface Evento {
  tipo: string
  titulo: string
  hora: string
  cliente?: string
  status?: string
  valor?: number
}

export default function CalendarioPage() {
  const [semanaAtual, setSemanaAtual] = useState(0)
  const [eventos, setEventos] = useState<Record<string, Evento[]>>({})
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ total: 0, manutencao: 0, fatura: 0, locacao: 0, conta: 0 })

  // Animação
  const [animando, setAnimando] = useState(false)
  const [slideStyle, setSlideStyle] = useState({
    transform: 'translateX(0)',
    opacity: 1,
    transition: 'all 0.35s ease'
  })

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

  const formatarData = (data: Date) => {
    return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
  }

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0)
  }

  const carregarEventos = useCallback(async () => {
    setLoading(true)
    try {
      const inicio = formatarData(diasSemana[0])
      const fim = formatarData(diasSemana[6])

      const [manRes, fatRes, locRes, contasRes] = await Promise.all([
        supabase.from('manutencoes').select('*').gte('data_agendada', inicio).lte('data_agendada', fim),
        supabase.from('faturas').select('*').gte('data_vencimento', inicio).lte('data_vencimento', fim),
        supabase.from('locacoes').select('*').or(`data_inicio.gte.${inicio},data_fim.lte.${fim}`),
        supabase.from('contas_pagar').select('*').gte('data_vencimento', inicio).lte('data_vencimento', fim)
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
          cliente: f.cliente_nome,
          valor: Number(f.valor)
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

      ;(contasRes.data || []).forEach(c => {
        const data = c.data_vencimento
        if (!eventosMap[data]) eventosMap[data] = []
        const isPago = c.status === 'pago'
        eventosMap[data].push({
          tipo: 'conta',
          titulo: c.descricao || 'Conta a Pagar',
          hora: '',
          cliente: c.fornecedor_nome || undefined,
          status: c.status,
          valor: Number(c.valor)
        })
      })

      setEventos(eventosMap)

      const todosEventos = Object.values(eventosMap).flat()
      setStats({
        total: todosEventos.length,
        manutencao: todosEventos.filter(e => e.tipo === 'manutencao').length,
        fatura: todosEventos.filter(e => e.tipo === 'fatura').length,
        locacao: todosEventos.filter(e => e.tipo === 'locacao').length,
        conta: todosEventos.filter(e => e.tipo === 'conta').length
      })
    } catch {
      // silently handle
    } finally {
      setLoading(false)
    }
  }, [semanaAtual])

  useEffect(() => { carregarEventos() }, [carregarEventos])

  const navegarSemana = (direcao: number) => {
    if (animando) return
    setAnimando(true)

    // Slide out
    setSlideStyle({
      transform: `translateX(${direcao > 0 ? '-60px' : '60px'})`,
      opacity: 0,
      transition: 'all 0.3s ease'
    })

    setTimeout(() => {
      setSemanaAtual(prev => prev + direcao)

      // Posicionar do lado oposto sem transição
      setSlideStyle({
        transform: `translateX(${direcao > 0 ? '60px' : '-60px'})`,
        opacity: 0,
        transition: 'none'
      })

      // Slide in
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSlideStyle({
            transform: 'translateX(0)',
            opacity: 1,
            transition: 'all 0.35s ease'
          })
          setTimeout(() => setAnimando(false), 350)
        })
      })
    }, 300)
  }

  const irParaHoje = () => {
    if (animando || semanaAtual === 0) return
    const direcao = semanaAtual > 0 ? -1 : 1
    setAnimando(true)

    setSlideStyle({
      transform: `translateX(${direcao < 0 ? '-60px' : '60px'})`,
      opacity: 0,
      transition: 'all 0.3s ease'
    })

    setTimeout(() => {
      setSemanaAtual(0)

      setSlideStyle({
        transform: `translateX(${direcao < 0 ? '60px' : '-60px'})`,
        opacity: 0,
        transition: 'none'
      })

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setSlideStyle({
            transform: 'translateX(0)',
            opacity: 1,
            transition: 'all 0.35s ease'
          })
          setTimeout(() => setAnimando(false), 350)
        })
      })
    }, 300)
  }

  const getTipoColor = (tipo: string, status?: string) => {
    switch (tipo) {
      case 'manutencao': return status === 'vencida' ? 'border-red-400 bg-red-50' : 'border-orange-400 bg-orange-50'
      case 'fatura': return 'border-green-400 bg-green-50'
      case 'locacao': return 'border-blue-400 bg-blue-50'
      case 'conta':
        if (status === 'pago') return 'border-emerald-400 bg-emerald-50'
        if (status === 'vencido') return 'border-red-400 bg-red-50'
        return 'border-rose-400 bg-rose-50'
      default: return 'border-gray-400 bg-gray-50'
    }
  }

  const getTipoIcon = (tipo: string, status?: string) => {
    switch (tipo) {
      case 'manutencao': return (
        <svg className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
      case 'fatura': return (
        <svg className="w-3.5 h-3.5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
        </svg>
      )
      case 'locacao': return (
        <svg className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
      )
      case 'conta': return (
        <svg className={`w-3.5 h-3.5 flex-shrink-0 ${status === 'pago' ? 'text-emerald-600' : 'text-rose-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
      default: return null
    }
  }

  const ehHoje = (data: Date) => formatarData(data) === formatarData(hoje)

  // Titulo da semana
  const mesInicio = mesesNomes[diasSemana[0].getMonth()]
  const mesFim = mesesNomes[diasSemana[6].getMonth()]
  const anoInicio = diasSemana[0].getFullYear()
  const anoFim = diasSemana[6].getFullYear()
  let tituloSemana = `${diasSemana[0].getDate()} a ${diasSemana[6].getDate()} de ${mesFim} ${anoFim}`
  if (mesInicio !== mesFim) {
    tituloSemana = `${diasSemana[0].getDate()} ${mesInicio} a ${diasSemana[6].getDate()} ${mesFim} ${anoFim}`
  }
  if (anoInicio !== anoFim) {
    tituloSemana = `${diasSemana[0].getDate()} ${mesInicio} ${anoInicio} a ${diasSemana[6].getDate()} ${mesFim} ${anoFim}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario</h1>
          <p className="text-gray-600">Agenda semanal de atividades</p>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Total Eventos</div><div className="text-2xl font-bold text-gray-800">{stats.total}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Manutencoes</div><div className="text-2xl font-bold text-orange-600">{stats.manutencao}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Faturas</div><div className="text-2xl font-bold text-green-600">{stats.fatura}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Locacoes</div><div className="text-2xl font-bold text-blue-600">{stats.locacao}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-sm text-gray-600">Contas a Pagar</div><div className="text-2xl font-bold text-rose-600">{stats.conta}</div></CardContent></Card>
      </div>

      {/* Navegação da semana */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => navegarSemana(-2)}
          disabled={animando}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
          title="2 semanas atrás"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => navegarSemana(-1)}
          disabled={animando}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-30"
          title="Semana anterior"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={irParaHoje}
          disabled={animando || semanaAtual === 0}
          className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
            semanaAtual === 0
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700'
          } disabled:opacity-50`}
        >
          Hoje
        </button>

        <button
          onClick={() => navegarSemana(1)}
          disabled={animando}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors disabled:opacity-30"
          title="Próxima semana"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => navegarSemana(2)}
          disabled={animando}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30"
          title="2 semanas à frente"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Título da semana com animação */}
      <div className="text-center" style={slideStyle}>
        <h2 className="text-2xl font-bold text-gray-800">
          Semana de {tituloSemana}
        </h2>
      </div>

      {/* Calendário semanal com animação */}
      {loading && Object.keys(eventos).length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando eventos...</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          <div style={slideStyle}>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              {diasSemana.map((dia, index) => {
                const dataFormatada = formatarData(dia)
                const eventsDoDia = eventos[dataFormatada] || []
                const isHoje = ehHoje(dia)

                return (
                  <Card key={index} className={`min-h-[300px] ${isHoje ? 'border-2 border-blue-500 shadow-lg bg-blue-50/30' : 'border border-gray-200'}`}>
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
                              <div className="flex items-start space-x-1.5">
                                <div className="mt-0.5">{getTipoIcon(evento.tipo, evento.status)}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-gray-800 leading-tight truncate">{evento.titulo}</div>
                                  {evento.valor && (
                                    <div className={`font-semibold mt-0.5 ${evento.tipo === 'conta' && evento.status === 'pago' ? 'text-emerald-700' : evento.tipo === 'conta' ? 'text-rose-700' : 'text-gray-700'}`}>
                                      {formatarMoeda(evento.valor)}
                                      {evento.tipo === 'conta' && evento.status === 'pago' && (
                                        <span className="ml-1 text-emerald-600 font-normal">Pago</span>
                                      )}
                                    </div>
                                  )}
                                  {evento.cliente && <div className="text-gray-500 mt-0.5 truncate">{evento.cliente}</div>}
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
          </div>
        </div>
      )}

      {/* Legenda */}
      <Card>
        <CardHeader><CardTitle>Legenda</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-200 border-l-4 border-orange-400 rounded"></div>
              <span className="text-sm">Manutencoes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-200 border-l-4 border-green-400 rounded"></div>
              <span className="text-sm">Faturas a Receber</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-blue-200 border-l-4 border-blue-400 rounded"></div>
              <span className="text-sm">Locacoes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-rose-200 border-l-4 border-rose-400 rounded"></div>
              <span className="text-sm">Contas a Pagar</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
