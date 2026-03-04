'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'

interface Classe {
  id: number
  codigo: string
  nome: string
}

interface Subclasse {
  id: number
  class_id: number
  codigo: string
  nome: string
}

interface TipoTecnico {
  id: number
  codigo: string
  nome: string
}

function maskMoeda(value: string) {
  const nums = value.replace(/\D/g, '')
  if (!nums) return ''
  const val = (parseInt(nums) / 100).toFixed(2)
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(val))
}

function parseMoeda(value: string): number {
  const nums = value.replace(/\D/g, '')
  if (!nums) return 0
  return parseInt(nums) / 100
}

export default function NovoEquipamentoPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [saving, setSaving] = useState(false)

  // Classification data
  const [classes, setClasses] = useState<Classe[]>([])
  const [subclasses, setSubclasses] = useState<Subclasse[]>([])
  const [tipos, setTipos] = useState<TipoTecnico[]>([])
  const [subclassesFiltradas, setSubclassesFiltradas] = useState<Subclasse[]>([])
  const [assetIdPreview, setAssetIdPreview] = useState('')

  const [form, setForm] = useState({
    nome: '',
    marca: '',
    modelo: '',
    numero_patrimonio: '',
    classe_id: '',
    subclasse_id: '',
    tipo_id: '',
    numero_serie: '',
    ano_fabricacao: '',
    numero_frota: '',
    status: 'disponivel',
    preco_unitario_dia: '',
    preco_dia: '',
    preco_mensal: '',
    observacoes: ''
  })

  useEffect(() => {
    carregarClassificacoes()
  }, [])

  useEffect(() => {
    if (form.classe_id) {
      const filtered = subclasses.filter(s => s.class_id === parseInt(form.classe_id))
      setSubclassesFiltradas(filtered)
      // Reset subclasse if it doesn't belong to new class
      if (form.subclasse_id) {
        const stillValid = filtered.some(s => s.id === parseInt(form.subclasse_id))
        if (!stillValid) {
          setForm(prev => ({ ...prev, subclasse_id: '' }))
        }
      }
    } else {
      setSubclassesFiltradas([])
      setForm(prev => ({ ...prev, subclasse_id: '' }))
    }
  }, [form.classe_id, subclasses])

  useEffect(() => {
    gerarAssetIdPreview()
  }, [form.classe_id, form.subclasse_id, form.tipo_id])

  const carregarClassificacoes = async () => {
    try {
      const [classesRes, subclassesRes, tiposRes] = await Promise.all([
        supabase.from('equipment_classes').select('*').order('codigo'),
        supabase.from('equipment_subclasses').select('*').order('codigo'),
        supabase.from('equipment_types').select('*').order('codigo')
      ])
      setClasses(classesRes.data || [])
      setSubclasses(subclassesRes.data || [])
      setTipos(tiposRes.data || [])
    } catch {
      console.error('Erro ao carregar classificacoes')
    }
  }

  const gerarAssetIdPreview = () => {
    const classe = classes.find(c => c.id === parseInt(form.classe_id))
    const subclasse = subclassesFiltradas.find(s => s.id === parseInt(form.subclasse_id))
    const tipo = tipos.find(t => t.id === parseInt(form.tipo_id))

    if (classe && subclasse) {
      const tipoCodigo = tipo ? tipo.codigo : ''
      const preview = tipoCodigo
        ? `${classe.codigo}-${subclasse.codigo}-${tipoCodigo}-XXXX`
        : `${classe.codigo}-${subclasse.codigo}-XXXX`
      setAssetIdPreview(preview)
    } else {
      setAssetIdPreview('')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    let masked = value

    if (name === 'preco_unitario_dia' || name === 'preco_dia' || name === 'preco_mensal') {
      masked = maskMoeda(value)
    }

    setForm({ ...form, [name]: masked })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.nome.trim()) {
      showToast('Nome do equipamento e obrigatorio', 'error')
      return
    }

    setSaving(true)
    try {
      // Generate asset_id
      let asset_id = null
      let numero_ativo = null

      if (form.classe_id && form.subclasse_id) {
        const classe = classes.find(c => c.id === parseInt(form.classe_id))
        const subclasse = subclasses.find(s => s.id === parseInt(form.subclasse_id))
        const tipo = form.tipo_id ? tipos.find(t => t.id === parseInt(form.tipo_id)) : null

        if (classe && subclasse) {
          // Get next sequential number for this subclass
          const { data: maxData } = await supabase
            .from('equipamentos')
            .select('numero_ativo')
            .eq('subclasse_id', parseInt(form.subclasse_id))
            .order('numero_ativo', { ascending: false })
            .limit(1)

          numero_ativo = (maxData && maxData.length > 0 && maxData[0].numero_ativo)
            ? maxData[0].numero_ativo + 1
            : 1

          const numStr = String(numero_ativo).padStart(4, '0')
          asset_id = tipo
            ? `${classe.codigo}-${subclasse.codigo}-${tipo.codigo}-${numStr}`
            : `${classe.codigo}-${subclasse.codigo}-${numStr}`
        }
      }

      const { error } = await supabase.from('equipamentos').insert({
        nome: form.nome.trim(),
        marca: form.marca.trim() || null,
        modelo: form.modelo.trim() || null,
        numero_patrimonio: form.numero_patrimonio.trim() || null,
        classe_id: form.classe_id ? parseInt(form.classe_id) : null,
        subclasse_id: form.subclasse_id ? parseInt(form.subclasse_id) : null,
        tipo_id: form.tipo_id ? parseInt(form.tipo_id) : null,
        numero_ativo: numero_ativo,
        asset_id: asset_id,
        numero_serie: form.numero_serie.trim() || null,
        ano_fabricacao: form.ano_fabricacao ? parseInt(form.ano_fabricacao) : null,
        numero_frota: form.numero_frota.trim() || null,
        status: form.status,
        ativo: true,
        preco_unitario_dia: parseMoeda(form.preco_unitario_dia),
        preco_dia: parseMoeda(form.preco_dia),
        preco_mensal: parseMoeda(form.preco_mensal),
        observacoes: form.observacoes.trim() || null
      })

      if (error) throw error

      showToast('Equipamento cadastrado com sucesso!', 'success')
      router.push('/dashboard/equipamentos')
    } catch (error: any) {
      showToast(error.message || 'Erro ao cadastrar equipamento', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Novo Equipamento</h1>
          <p className="text-gray-600 mt-1">Preencha os dados para cadastrar um novo equipamento</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/equipamentos')}>
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Classificação */}
        <Card>
          <CardHeader>
            <CardTitle>Classificacao do Ativo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Classe</label>
                <select
                  name="classe_id"
                  value={form.classe_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Selecione uma classe</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.codigo} - {c.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subclasse</label>
                <select
                  name="subclasse_id"
                  value={form.subclasse_id}
                  onChange={handleChange}
                  disabled={!form.classe_id}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  <option value="">Selecione uma subclasse</option>
                  {subclassesFiltradas.map(s => (
                    <option key={s.id} value={s.id}>{s.codigo} - {s.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Tecnico (opcional)</label>
                <select
                  name="tipo_id"
                  value={form.tipo_id}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Nenhum</option>
                  {tipos.map(t => (
                    <option key={t.id} value={t.id}>{t.codigo} - {t.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {assetIdPreview && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-blue-700">Asset ID (preview):</span>
                  <span className="text-lg font-bold font-mono text-blue-900">{assetIdPreview}</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">O numero sequencial sera gerado automaticamente ao salvar</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Dados do Equipamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Equipamento *</label>
                <Input
                  name="nome"
                  placeholder="Ex: Retroescavadeira, Gerador 150kVA..."
                  value={form.nome}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                <Input
                  name="marca"
                  placeholder="Ex: Caterpillar, JCB, Volvo..."
                  value={form.marca}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
                <Input
                  name="modelo"
                  placeholder="Ex: 416F2, 3CX..."
                  value={form.modelo}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N. Patrimonio</label>
                <Input
                  name="numero_patrimonio"
                  placeholder="Ex: PAT-001"
                  value={form.numero_patrimonio}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N. Serie</label>
                <Input
                  name="numero_serie"
                  placeholder="Ex: SN-123456789"
                  value={form.numero_serie}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano Fabricacao</label>
                <Input
                  name="ano_fabricacao"
                  type="number"
                  placeholder="Ex: 2023"
                  value={form.ano_fabricacao}
                  onChange={handleChange}
                  min="1950"
                  max="2030"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">N. Frota</label>
                <Input
                  name="numero_frota"
                  placeholder="Ex: FRT-001"
                  value={form.numero_frota}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="disponivel">Disponivel</option>
                  <option value="locado">Locado</option>
                  <option value="manutencao">Em Manutencao</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Valores de Locacao</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Unitario/Dia</label>
                <Input
                  name="preco_unitario_dia"
                  placeholder="R$ 0,00"
                  value={form.preco_unitario_dia}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Diaria</label>
                <Input
                  name="preco_dia"
                  placeholder="R$ 0,00"
                  value={form.preco_dia}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Mensal</label>
                <Input
                  name="preco_mensal"
                  placeholder="R$ 0,00"
                  value={form.preco_mensal}
                  onChange={handleChange}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Informacoes Adicionais</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Observacoes</label>
              <textarea
                name="observacoes"
                placeholder="Observacoes sobre o equipamento..."
                value={form.observacoes}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button variant="outline" type="button" onClick={() => router.push('/dashboard/equipamentos')}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Salvando...' : 'Cadastrar Equipamento'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
