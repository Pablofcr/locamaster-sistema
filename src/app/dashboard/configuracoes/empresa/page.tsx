'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useEmpresa } from '@/contexts/EmpresaContext'
import { supabase } from '@/lib/supabase'
import { estadosBrasil, maskCnpj, maskTelefone, maskCep } from '@/lib/masks'

export default function EmpresaPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { empresa, loading: loadingEmpresa, refreshEmpresa } = useEmpresa()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [saving, setSaving] = useState(false)
  const [consultando, setConsultando] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    razao_social: '',
    nome_fantasia: '',
    cnpj: '',
    inscricao_estadual: '',
    inscricao_municipal: '',
    telefone: '',
    email: '',
    website: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    logo_base64: '',
  })

  const isEditing = !!empresa

  useEffect(() => {
    if (empresa) {
      setForm({
        razao_social: empresa.razao_social || '',
        nome_fantasia: empresa.nome_fantasia || '',
        cnpj: empresa.cnpj || '',
        inscricao_estadual: empresa.inscricao_estadual || '',
        inscricao_municipal: empresa.inscricao_municipal || '',
        telefone: empresa.telefone || '',
        email: empresa.email || '',
        website: empresa.website || '',
        logradouro: empresa.logradouro || '',
        numero: empresa.numero || '',
        complemento: empresa.complemento || '',
        bairro: empresa.bairro || '',
        cidade: empresa.cidade || '',
        estado: empresa.estado || '',
        cep: empresa.cep || '',
        logo_base64: empresa.logo_base64 || '',
      })
      if (empresa.logo_base64) {
        setLogoPreview(empresa.logo_base64)
      }
    }
  }, [empresa])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    let masked = value
    if (name === 'cnpj') masked = maskCnpj(value)
    else if (name === 'telefone') masked = maskTelefone(value)
    else if (name === 'cep') masked = maskCep(value)
    setForm({ ...form, [name]: masked })
  }

  const consultarCnpj = async () => {
    const cnpjNumeros = form.cnpj.replace(/\D/g, '')
    if (cnpjNumeros.length !== 14) {
      showToast('Digite um CNPJ completo (14 digitos)', 'warning')
      return
    }

    setConsultando(true)
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjNumeros}`)
      if (!res.ok) throw new Error('CNPJ nao encontrado')
      const data = await res.json()

      const telefone = data.ddd_telefone_1
        ? data.ddd_telefone_1.replace(/\D/g, '')
        : ''

      setForm(prev => ({
        ...prev,
        razao_social: data.razao_social || prev.razao_social,
        nome_fantasia: data.nome_fantasia || prev.nome_fantasia,
        email: data.email || prev.email,
        telefone: telefone ? maskTelefone(telefone) : prev.telefone,
        logradouro: data.logradouro || prev.logradouro,
        numero: data.numero || prev.numero,
        complemento: data.complemento || prev.complemento,
        bairro: data.bairro || prev.bairro,
        cidade: data.municipio || prev.cidade,
        estado: data.uf || prev.estado,
        cep: data.cep ? maskCep(data.cep.replace(/\D/g, '')) : prev.cep,
      }))

      showToast(`CNPJ encontrado: ${data.razao_social}`, 'success')
    } catch {
      showToast('CNPJ nao encontrado na Receita Federal', 'error')
    } finally {
      setConsultando(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Selecione um arquivo de imagem', 'error')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('Imagem deve ter no maximo 5MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const maxSize = 400
        let width = img.width
        let height = img.height

        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize
            width = maxSize
          } else {
            width = (width / height) * maxSize
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        const base64 = canvas.toDataURL('image/png')
        setLogoPreview(base64)
        setForm(prev => ({ ...prev, logo_base64: base64 }))
      }
      img.src = ev.target?.result as string
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoPreview(null)
    setForm(prev => ({ ...prev, logo_base64: '' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.razao_social.trim()) {
      showToast('Razao Social e obrigatoria', 'error')
      return
    }

    setSaving(true)
    try {
      const payload = {
        razao_social: form.razao_social.trim(),
        nome_fantasia: form.nome_fantasia.trim() || null,
        cnpj: form.cnpj.trim() || null,
        inscricao_estadual: form.inscricao_estadual.trim() || null,
        inscricao_municipal: form.inscricao_municipal.trim() || null,
        telefone: form.telefone.trim() || null,
        email: form.email.trim() || null,
        website: form.website.trim() || null,
        logradouro: form.logradouro.trim() || null,
        numero: form.numero.trim() || null,
        complemento: form.complemento.trim() || null,
        bairro: form.bairro.trim() || null,
        cidade: form.cidade.trim() || null,
        estado: form.estado || null,
        cep: form.cep.trim() || null,
        logo_base64: form.logo_base64 || null,
        updated_at: new Date().toISOString(),
      }

      if (isEditing && empresa) {
        const { error } = await supabase
          .from('empresa')
          .update(payload)
          .eq('id', empresa.id)
        if (error) throw error
        await refreshEmpresa()
        showToast('Dados da empresa atualizados!', 'success')
        router.push('/dashboard/configuracoes')
      } else {
        const { error } = await supabase
          .from('empresa')
          .insert(payload)
        if (error) throw error
        await refreshEmpresa()
        showToast('Empresa cadastrada com sucesso!', 'success')
        router.push('/dashboard')
      }
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar dados da empresa', 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loadingEmpresa) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Empresa' : 'Cadastro da Empresa'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing
              ? 'Atualize os dados da sua empresa'
              : 'Preencha os dados da sua empresa para comecar a usar o sistema'}
          </p>
        </div>
        {isEditing && (
          <Button variant="outline" onClick={() => router.push('/dashboard/configuracoes')}>
            Voltar
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Dados Principais */}
        <Card>
          <CardHeader>
            <CardTitle>Dados Principais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <div className="flex space-x-2">
                  <Input
                    name="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={form.cnpj}
                    onChange={handleChange}
                    className="flex-1"
                  />
                  {form.cnpj.replace(/\D/g, '').length >= 14 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={consultarCnpj}
                      disabled={consultando}
                      className="whitespace-nowrap"
                    >
                      {consultando ? 'Consultando...' : 'Consultar CNPJ'}
                    </Button>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Razao Social *</label>
                <Input
                  name="razao_social"
                  placeholder="Razao Social da empresa"
                  value={form.razao_social}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Fantasia</label>
                <Input
                  name="nome_fantasia"
                  placeholder="Nome Fantasia"
                  value={form.nome_fantasia}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inscricao Estadual</label>
                <Input
                  name="inscricao_estadual"
                  placeholder="Inscricao Estadual"
                  value={form.inscricao_estadual}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Inscricao Municipal</label>
                <Input
                  name="inscricao_municipal"
                  placeholder="Inscricao Municipal"
                  value={form.inscricao_municipal}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Contato</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <Input
                  name="email"
                  type="email"
                  placeholder="contato@empresa.com"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                <Input
                  name="website"
                  placeholder="www.empresa.com.br"
                  value={form.website}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endereco */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Endereco</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Logradouro</label>
                <Input
                  name="logradouro"
                  placeholder="Rua, Avenida, Travessa..."
                  value={form.logradouro}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Numero</label>
                <Input
                  name="numero"
                  placeholder="Ex: 123"
                  value={form.numero}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complemento</label>
                <Input
                  name="complemento"
                  placeholder="Sala, Bloco, Galpao..."
                  value={form.complemento}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bairro</label>
                <Input
                  name="bairro"
                  placeholder="Bairro"
                  value={form.bairro}
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
            </div>
          </CardContent>
        </Card>

        {/* Logomarca */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Logomarca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                {logoPreview ? (
                  <div className="relative">
                    <img
                      src={logoPreview}
                      alt="Logo da empresa"
                      className="w-32 h-32 object-contain border border-gray-200 rounded-lg bg-white p-2"
                    />
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      X
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                    <span className="text-center text-sm">Sem logo</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Formatos aceitos: PNG, JPG, JPEG. Tamanho maximo: 5MB.
                  A imagem sera redimensionada para no maximo 400x400px.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-3 mt-6">
          {isEditing && (
            <Button variant="outline" type="button" onClick={() => router.push('/dashboard/configuracoes')}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? 'Salvando...' : isEditing ? 'Atualizar Empresa' : 'Cadastrar Empresa'}
          </Button>
        </div>
      </form>
    </div>
  )
}
