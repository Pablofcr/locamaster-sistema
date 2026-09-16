'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'
import { ContaBancaria, lerContasBancarias, statusConfiguracao } from '@/lib/configuracaoPagamento'

export default function ConfiguracoesFaturamentoPage() {
  const { showToast } = useToast()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configId, setConfigId] = useState<number | null>(null)

  const [bancos, setBancos] = useState<ContaBancaria[]>([])

  const [form, setForm] = useState({
    dia_faturamento_padrao: '1',
    dias_para_vencimento: '10',
    juros_mora: '2.00',
    multa_atraso: '2.00',
    pix_chave: '',
    pix_tipo: 'cnpj',
    observacoes_padrao: '',
  })

  useEffect(() => {
    carregarConfig()
  }, [])

  const carregarConfig = async () => {
    setLoading(true)
    try {
      const { data } = await supabase
        .from('configuracoes_faturamento')
        .select('*')
        .limit(1)

      if (data && data.length > 0) {
        const c = data[0]
        setConfigId(c.id)
        setForm({
          dia_faturamento_padrao: String(c.dia_faturamento_padrao || 1),
          dias_para_vencimento: String(c.dias_para_vencimento || 10),
          juros_mora: String(c.juros_mora || 2),
          multa_atraso: String(c.multa_atraso || 2),
          pix_chave: c.pix_chave || '',
          pix_tipo: c.pix_tipo || 'cnpj',
          observacoes_padrao: c.observacoes_padrao || '',
        })
        setBancos(lerContasBancarias(c))
      }
    } catch { showToast('Erro ao carregar configurações', 'error') }
    setLoading(false)
  }

  const adicionarBanco = () => setBancos([...bancos, { nome: '', agencia: '', conta: '', titular: '' }])

  const removerBanco = (indice: number) => setBancos(bancos.filter((_, i) => i !== indice))

  const atualizarBanco = (indice: number, campo: keyof ContaBancaria, valor: string) =>
    setBancos(bancos.map((b, i) => (i === indice ? { ...b, [campo]: valor } : b)))

  // As contas em branco nao sao salvas; o PDF nao mostraria nada delas
  const bancosPreenchidos = lerContasBancarias({ bancos })
  const status = statusConfiguracao({ ...form, bancos })

  const salvar = async () => {
    setSaving(true)
    try {
      const dados = {
        dia_faturamento_padrao: parseInt(form.dia_faturamento_padrao) || 1,
        dias_para_vencimento: parseInt(form.dias_para_vencimento) || 10,
        juros_mora: parseFloat(form.juros_mora) || 0,
        multa_atraso: parseFloat(form.multa_atraso) || 0,
        pix_chave: form.pix_chave,
        pix_tipo: form.pix_tipo,
        bancos: bancosPreenchidos,
        // Espelha a primeira conta nas colunas antigas: o que le so elas continua funcionando
        banco_nome: bancosPreenchidos[0]?.nome || '',
        banco_agencia: bancosPreenchidos[0]?.agencia || '',
        banco_conta: bancosPreenchidos[0]?.conta || '',
        banco_titular: bancosPreenchidos[0]?.titular || '',
        observacoes_padrao: form.observacoes_padrao,
        updated_at: new Date().toISOString(),
      }

      const { error } = configId
        ? await supabase.from('configuracoes_faturamento').update(dados).eq('id', configId)
        : await supabase.from('configuracoes_faturamento').insert(dados).select().single()
          .then(r => { if (r.data) setConfigId(r.data.id); return r })

      // A lista de contas mora na coluna `bancos`, criada pela migracao do schema
      if (error?.message?.includes('bancos')) {
        showToast('Rode no Supabase: ALTER TABLE configuracoes_faturamento ADD COLUMN IF NOT EXISTS bancos JSONB DEFAULT \'[]\'::jsonb', 'error')
        setSaving(false)
        return
      }
      if (error) throw error

      showToast('Configurações salvas!', 'success')
    } catch { showToast('Erro ao salvar', 'error') }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configuracoes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configuracoes de Faturamento</h1>
          <p className="text-gray-600">Parametros globais para faturas e cobranças</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Button onClick={salvar} disabled={saving}>
            {saving ? 'Salvando...' : 'Salvar Configuracoes'}
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/faturamento')}>
            Voltar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Faturamento */}
        <Card>
          <CardHeader><CardTitle>Faturamento</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dia padrao de faturamento</label>
              <Input type="number" min="1" max="28" value={form.dia_faturamento_padrao}
                onChange={e => setForm({ ...form, dia_faturamento_padrao: e.target.value })} />
              <p className="text-xs text-gray-500 mt-1">Dia do mes para gerar faturas recorrentes (1-28)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dias para vencimento</label>
              <Input type="number" value={form.dias_para_vencimento}
                onChange={e => setForm({ ...form, dias_para_vencimento: e.target.value })} />
              <p className="text-xs text-gray-500 mt-1">Dias apos emissao ate o vencimento</p>
            </div>
          </CardContent>
        </Card>

        {/* Penalidades */}
        <Card>
          <CardHeader><CardTitle>Penalidades por Atraso</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Juros de mora (% ao mes)</label>
              <Input type="number" step="0.01" value={form.juros_mora}
                onChange={e => setForm({ ...form, juros_mora: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Multa por atraso (%)</label>
              <Input type="number" step="0.01" value={form.multa_atraso}
                onChange={e => setForm({ ...form, multa_atraso: e.target.value })} />
            </div>
          </CardContent>
        </Card>

        {/* PIX */}
        <Card>
          <CardHeader><CardTitle>Dados PIX</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de chave</label>
              <select value={form.pix_tipo} onChange={e => setForm({ ...form, pix_tipo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                <option value="cnpj">CNPJ</option>
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="telefone">Telefone</option>
                <option value="aleatoria">Chave Aleatoria</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chave PIX</label>
              <Input value={form.pix_chave} onChange={e => setForm({ ...form, pix_chave: e.target.value })}
                placeholder="Informe a chave PIX" />
            </div>
          </CardContent>
        </Card>

        {/* Dados bancarios */}
        <Card>
          <CardHeader><CardTitle>Contas Bancarias</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-gray-500">
              Todas as contas saem nas instrucoes de pagamento do PDF, na ordem desta lista.
            </p>

            {bancos.length === 0 && (
              <p className="text-sm text-gray-500">Nenhuma conta cadastrada.</p>
            )}

            {bancos.map((banco, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-600">Conta {i + 1}</span>
                  <button onClick={() => removerBanco(i)} className="text-xs text-red-600 hover:underline">
                    Remover
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Banco</label>
                  <Input value={banco.nome} onChange={e => atualizarBanco(i, 'nome', e.target.value)}
                    placeholder="Ex: Banco do Brasil, Itau..." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agencia</label>
                    <Input value={banco.agencia} onChange={e => atualizarBanco(i, 'agencia', e.target.value)}
                      placeholder="0000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Conta</label>
                    <Input value={banco.conta} onChange={e => atualizarBanco(i, 'conta', e.target.value)}
                      placeholder="00000-0" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titular</label>
                  <Input value={banco.titular} onChange={e => atualizarBanco(i, 'titular', e.target.value)}
                    placeholder="Nome do titular da conta" />
                </div>
              </div>
            ))}

            <Button variant="outline" onClick={adicionarBanco} className="w-full">
              + Adicionar banco
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status da configuracao */}
      <Card>
        <CardHeader><CardTitle>Status da Configuracao</CardTitle></CardHeader>
        <CardContent>
          {status.semFormaDePagamento && (
            <p className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-900">
              Sem chave PIX e sem conta bancaria, o PDF da fatura sai sem dizer como o cliente deve pagar.
            </p>
          )}
          <ul className="space-y-2 text-sm">
            {[
              { ok: status.temPix, label: 'Chave PIX', falta: 'Sem chave PIX cadastrada' },
              { ok: status.temBanco, label: `Contas bancarias (${bancosPreenchidos.length})`, falta: 'Nenhuma conta bancaria cadastrada' },
              { ok: status.temObservacoes, label: 'Observacoes padrao', falta: 'Sem texto padrao nas faturas (opcional)' },
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className={item.ok ? 'text-green-600' : 'text-gray-400'}>{item.ok ? '✓' : '○'}</span>
                <span className={item.ok ? 'text-gray-700' : 'text-gray-500'}>
                  {item.ok ? item.label : item.falta}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Observacoes */}
      <Card>
        <CardHeader><CardTitle>Observacoes Padrao</CardTitle></CardHeader>
        <CardContent>
          <textarea value={form.observacoes_padrao}
            onChange={e => setForm({ ...form, observacoes_padrao: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm h-24 resize-none"
            placeholder="Texto padrao que aparecera nas faturas..." />
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={salvar} disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar Configuracoes'}
        </Button>
      </div>
    </div>
  )
}
