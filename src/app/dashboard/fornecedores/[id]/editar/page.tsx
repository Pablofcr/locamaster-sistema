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

function maskCnpj(value: string) {
  const nums = value.replace(/\D/g, '')
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

export default function EditarFornecedorPage() {
  const router = useRouter()
  const params = useParams()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    contato: '',
    endereco: '',
    cidade: '',
    estado: '',
    cep: '',
    categoria: '',
    observacoes: ''
  })

  useEffect(() => {
    carregarFornecedor()
  }, [])

  const carregarFornecedor = async () => {
    try {
      const { data, error } = await supabase
        .from('fornecedores')
        .select('*')
        .eq('id', params.id)
        .single()

      if (error) throw error

      if (data) {
        setForm({
          nome: data.nome || '',
          cnpj: maskCnpj(data.cnpj || ''),
          email: data.email || '',
          telefone: maskTelefone(data.telefone || ''),
          contato: data.contato || '',
          endereco: data.endereco || '',
          cidade: data.cidade || '',
          estado: data.estado || '',
          cep: maskCep(data.cep || ''),
          categoria: data.categoria || '',
          observacoes: data.observacoes || ''
        })
      }
    } catch (error: any) {
      showToast('Erro ao carregar fornecedor', 'error')
      router.push('/dashboard/fornecedores')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let masked = value
    if (name === 'cnpj') masked = maskCnpj(value)
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
        .from('fornecedores')
        .update({
          nome: form.nome.trim(),
          cnpj: form.cnpj.trim() || null,
          email: form.email.trim() || null,
          telefone: form.telefone.trim() || null,
          contato: form.contato.trim() || null,
          endereco: form.endereco.trim() || null,
          cidade: form.cidade.trim() || null,
          estado: form.estado || null,
          cep: form.cep.trim() || null,
          categoria: form.categoria.trim() || null,
          observacoes: form.observacoes.trim() || null
        })
        .eq('id', params.id)

      if (error) throw error

      showToast('Fornecedor atualizado com sucesso!', 'success')
      router.push('/dashboard/fornecedores')
    } catch (error: any) {
      showToast(error.message || 'Erro ao atualizar fornecedor', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleExcluir = async () => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return

    try {
      const { error } = await supabase
        .from('fornecedores')
        .delete()
        .eq('id', params.id)

      if (error) throw error

      showToast('Fornecedor excluído com sucesso!', 'success')
      router.push('/dashboard/fornecedores')
    } catch (error: any) {
      showToast(error.message || 'Erro ao excluir fornecedor', 'error')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando fornecedor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Editar Fornecedor</h1>
          <p className="text-gray-600 mt-1">Atualize os dados do fornecedor</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="danger" onClick={handleExcluir}>
            Excluir
          </Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/fornecedores')}>
            Voltar
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Dados do Fornecedor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                <Input
                  name="nome"
                  placeholder="Razão social do fornecedor"
                  value={form.nome}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <Input
                  name="cnpj"
                  placeholder="00.000.000/0000-00"
                  value={form.cnpj}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="email@fornecedor.com"
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pessoa de Contato</label>
                <Input
                  name="contato"
                  placeholder="Nome do contato"
                  value={form.contato}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                <Input
                  name="categoria"
                  placeholder="Ex: Peças, Serviços, Equipamentos..."
                  value={form.categoria}
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
                  placeholder="Observações sobre o fornecedor..."
                  value={form.observacoes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" type="button" onClick={() => router.push('/dashboard/fornecedores')}>
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
