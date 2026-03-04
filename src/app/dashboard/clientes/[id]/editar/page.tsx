'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'

const estadosBrasil = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG',
  'PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
]

function maskCpfCnpj(value: string) {
  const nums = value.replace(/\D/g, '')
  if (nums.length <= 11) {
    return nums
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }
  return nums
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

function maskTelefone(value: string) {
  const nums = value.replace(/\D/g, '')
  if (nums.length <= 10) {
    return nums
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d{1,4})$/, '$1-$2')
  }
  return nums
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{1,4})$/, '$1-$2')
}

function maskCep(value: string) {
  const nums = value.replace(/\D/g, '')
  return nums.replace(/(\d{5})(\d{1,3})$/, '$1-$2')
}

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cpf_cnpj: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    observacoes: ''
  })

  useEffect(() => {
    carregarCliente()
  }, [])

  const carregarCliente = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      if (data) {
        setForm({
          nome: data.nome || '',
          email: data.email || '',
          telefone: maskTelefone(data.telefone || ''),
          cpf_cnpj: maskCpfCnpj(data.cpf_cnpj || ''),
          endereco: data.endereco || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          cep: maskCep(data.cep || ''),
          observacoes: data.observacoes || ''
        })
      }
    } catch (error: any) {
      showToast('Erro ao carregar cliente', 'error')
      router.push('/dashboard/clientes')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let masked = value
    if (name === 'cpf_cnpj') masked = maskCpfCnpj(value)
    else if (name === 'telefone') masked = maskTelefone(value)
    else if (name === 'cep') masked = maskCep(value)
    setForm({ ...form, [name]: masked })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.nome.trim()) {
      showToast('Nome é obrigatório', 'error')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('clientes')
        .update({
          nome: form.nome.trim(),
          email: form.email.trim() || null,
          telefone: form.telefone.trim() || null,
          cpf_cnpj: form.cpf_cnpj.trim() || null,
          endereco: form.endereco.trim() || null,
          cidade: form.cidade.trim() || null,
          estado: form.estado || null,
          cep: form.cep.trim() || null,
          observacoes: form.observacoes.trim() || null
        })
        .eq('id', params.id)

      if (error) throw error

      showToast('Cliente atualizado com sucesso!', 'success')
      router.push('/dashboard/clientes')
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar cliente', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleExcluir = async () => {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return

    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      showToast('Cliente excluído com sucesso!', 'success')
      router.push('/dashboard/clientes')
    } catch (error: any) {
      showToast(error.message || 'Erro ao excluir cliente', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando cliente...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
          <p className="text-gray-600 mt-1">Atualize os dados do cliente</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="danger" onClick={handleExcluir}>
            Excluir
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/clientes')}>
            Voltar
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <Input
                  name="nome"
                  placeholder="Nome completo ou razão social"
                  value={form.nome}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CPF/CNPJ</label>
                <Input
                  name="cpf_cnpj"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  value={form.cpf_cnpj}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="email@exemplo.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <Input
                  name="telefone"
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Endereço</label>
                <Input
                  name="endereco"
                  placeholder="Rua, número, complemento"
                  value={form.endereco}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade</label>
                <Input
                  name="cidade"
                  placeholder="Cidade"
                  value={form.cidade}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione</option>
                  {estadosBrasil.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CEP</label>
                <Input
                  name="cep"
                  placeholder="00000-000"
                  value={form.cep}
                  onChange={handleChange}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
                <textarea
                  name="observacoes"
                  placeholder="Observações sobre o cliente..."
                  value={form.observacoes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" type="button" onClick={() => router.push('/dashboard/clientes')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
