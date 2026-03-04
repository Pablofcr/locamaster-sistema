'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'

export default function OrcamentoDetalhePage() {
  const router = useRouter()
  const params = useParams()
  const { showToast } = useToast()
  const [orcamento, setOrcamento] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const id = params.id as string

  useEffect(() => {
    if (id) carregarOrcamento()
  }, [id])

  const carregarOrcamento = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) { setError('Orçamento não encontrado'); return }
      setOrcamento(data)
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar orçamento')
    } finally {
      setLoading(false)
    }
  }

  const atualizarStatus = async (novoStatus: string) => {
    try {
      const { error } = await supabase
        .from('orcamentos')
        .update({ status: novoStatus, updated_at: new Date().toISOString() })
        .eq('id', id)

      if (error) throw error
      showToast(`Orçamento ${novoStatus} com sucesso!`, 'success')
      carregarOrcamento()
    } catch (err: any) {
      showToast('Erro ao atualizar status: ' + err.message, 'error')
    }
  }

  const enviarEmail = () => {
    if (orcamento?.cliente_email) {
      const subject = encodeURIComponent(`Orçamento ${orcamento.numero_orcamento || '#' + orcamento.id}`)
      const body = encodeURIComponent(
        `Prezado(a) ${orcamento.cliente_nome},\n\nSegue o orçamento solicitado:\n\nNúmero: ${orcamento.numero_orcamento || '#' + orcamento.id}\nValor Total: ${formatarMoeda(Number(orcamento.valor_total) || 0)}\nModalidade: ${orcamento.modalidade_locacao || 'N/A'}\n\nAtenciosamente,\nEquipe LocaMaster`
      )
      window.open(`mailto:${orcamento.cliente_email}?subject=${subject}&body=${body}`)
    } else {
      showToast('Cliente não possui email cadastrado', 'warning')
    }
  }

  const formatarMoeda = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; color: string }> = {
      rascunho: { label: 'Rascunho', color: 'bg-gray-100 text-gray-800' },
      enviado: { label: 'Enviado', color: 'bg-blue-100 text-blue-800' },
      aprovado: { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
      recusado: { label: 'Recusado', color: 'bg-red-100 text-red-800' },
      cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500' }
    }
    const c = configs[status] || { label: status, color: 'bg-gray-100 text-gray-800' }
    return <Badge className={c.color}>{c.label}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando orçamento...</p>
        </div>
      </div>
    )
  }

  if (error || !orcamento) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">{error || 'Orçamento não encontrado'}</h2>
        <Button onClick={() => router.push('/dashboard/orcamentos')} variant="outline" className="mt-4">
          Voltar para Orçamentos
        </Button>
      </div>
    )
  }

  let itens: any[] = []
  try { itens = typeof orcamento.itens === 'string' ? JSON.parse(orcamento.itens) : (orcamento.itens || []) } catch { itens = [] }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Orçamento {orcamento.numero_orcamento || `#${orcamento.id}`}
          </h1>
          <p className="text-gray-600">
            {orcamento.cliente_nome} - {orcamento.data_orcamento ? new Date(orcamento.data_orcamento).toLocaleDateString('pt-BR') : new Date(orcamento.created_at).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(orcamento.status)}
          <Button onClick={() => router.push('/dashboard/orcamentos')} variant="outline">Voltar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Nome:</strong> {orcamento.cliente_nome}</p>
                {orcamento.cliente_email && <p><strong>Email:</strong> {orcamento.cliente_email}</p>}
                {orcamento.cliente_telefone && <p><strong>Telefone:</strong> {orcamento.cliente_telefone}</p>}
                {orcamento.cliente_contato && orcamento.cliente_contato !== orcamento.cliente_telefone && (
                  <p><strong>Contato:</strong> {orcamento.cliente_contato}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Detalhes da Locação</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Modalidade</span>
                  <p className="font-semibold">{orcamento.modalidade_locacao || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Dias</span>
                  <p className="font-semibold">{orcamento.dias_locacao || 'N/A'}</p>
                </div>
                {orcamento.data_inicio_locacao && (
                  <div>
                    <span className="font-medium text-gray-600">Início</span>
                    <p className="font-semibold">{new Date(orcamento.data_inicio_locacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {orcamento.data_fim_locacao && (
                  <div>
                    <span className="font-medium text-gray-600">Fim</span>
                    <p className="font-semibold">{new Date(orcamento.data_fim_locacao).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {itens.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Equipamentos</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {itens.map((item: any, i: number) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-medium">{item.equipamento_nome}</h4>
                          <p className="text-sm text-gray-600">
                            {item.equipamento_marca} {item.equipamento_modelo && `- ${item.equipamento_modelo}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.quantidade}x - {formatarMoeda(item.preco_unitario || 0)}/{orcamento.modalidade_locacao || 'un'}
                          </p>
                        </div>
                        <span className="font-bold text-green-600">{formatarMoeda(item.subtotal || 0)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {orcamento.observacoes && (
            <Card>
              <CardHeader><CardTitle>Observações</CardTitle></CardHeader>
              <CardContent>
                <p className="text-gray-700">{orcamento.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Resumo Financeiro</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatarMoeda(Number(orcamento.subtotal) || 0)}</span>
                </div>
                {Number(orcamento.desconto_valor) > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Desconto:</span>
                    <span>-{formatarMoeda(Number(orcamento.desconto_valor))}</span>
                  </div>
                )}
                {Number(orcamento.valor_frete) > 0 && (
                  <div className="flex justify-between">
                    <span>Frete ({orcamento.frete_responsavel}):</span>
                    <span>+{formatarMoeda(Number(orcamento.valor_frete))}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-green-600">{formatarMoeda(Number(orcamento.valor_total) || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Ações</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(orcamento.status === 'rascunho' || orcamento.status === 'enviado') && (
                  <>
                    <Button onClick={() => atualizarStatus('aprovado')} className="w-full bg-green-600 hover:bg-green-700">
                      Aprovar Orçamento
                    </Button>
                    <Button onClick={() => atualizarStatus('recusado')} variant="danger" className="w-full">
                      Recusar Orçamento
                    </Button>
                  </>
                )}
                {orcamento.status === 'rascunho' && (
                  <Button onClick={() => atualizarStatus('enviado')} className="w-full">
                    Marcar como Enviado
                  </Button>
                )}
                <Button onClick={enviarEmail} variant="outline" className="w-full">
                  Enviar por Email
                </Button>
                {orcamento.cliente_telefone && (
                  <Button variant="outline" className="w-full"
                    onClick={() => {
                      const phone = orcamento.cliente_telefone.replace(/\D/g, '')
                      const msg = encodeURIComponent(`Olá ${orcamento.cliente_nome}, segue o orçamento ${orcamento.numero_orcamento || '#' + orcamento.id} no valor de ${formatarMoeda(Number(orcamento.valor_total) || 0)}`)
                      window.open(`https://wa.me/55${phone}?text=${msg}`)
                    }}>
                    Enviar por WhatsApp
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="text-xs text-gray-500 space-y-1">
                {orcamento.data_validade && <p>Validade: {new Date(orcamento.data_validade).toLocaleDateString('pt-BR')}</p>}
                <p>Criado em: {new Date(orcamento.created_at).toLocaleDateString('pt-BR')}</p>
                {orcamento.updated_at && <p>Atualizado: {new Date(orcamento.updated_at).toLocaleDateString('pt-BR')}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
