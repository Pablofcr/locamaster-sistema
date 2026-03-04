'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { supabase } from '@/lib/supabase'

interface Classe {
  id: number
  codigo: string
  nome: string
  descricao: string | null
}

interface Subclasse {
  id: number
  class_id: number
  codigo: string
  nome: string
  descricao: string | null
}

interface TipoTecnico {
  id: number
  codigo: string
  nome: string
  descricao: string | null
}

export default function ClassificacaoPage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'classes' | 'subclasses' | 'tipos'>('classes')

  // Classes
  const [classes, setClasses] = useState<Classe[]>([])
  const [showFormClasse, setShowFormClasse] = useState(false)
  const [editingClasse, setEditingClasse] = useState<Classe | null>(null)
  const [formClasse, setFormClasse] = useState({ codigo: '', nome: '', descricao: '' })

  // Subclasses
  const [subclasses, setSubclasses] = useState<Subclasse[]>([])
  const [filtroClasseId, setFiltroClasseId] = useState<string>('')
  const [showFormSubclasse, setShowFormSubclasse] = useState(false)
  const [editingSubclasse, setEditingSubclasse] = useState<Subclasse | null>(null)
  const [formSubclasse, setFormSubclasse] = useState({ class_id: '', codigo: '', nome: '', descricao: '' })

  // Tipos
  const [tipos, setTipos] = useState<TipoTecnico[]>([])
  const [showFormTipo, setShowFormTipo] = useState(false)
  const [editingTipo, setEditingTipo] = useState<TipoTecnico | null>(null)
  const [formTipo, setFormTipo] = useState({ codigo: '', nome: '', descricao: '' })

  useEffect(() => {
    carregarDados()
  }, [])

  const carregarDados = async () => {
    setLoading(true)
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
      showToast('Erro ao carregar dados', 'error')
    } finally {
      setLoading(false)
    }
  }

  // === CLASSES ===
  const salvarClasse = async () => {
    if (!formClasse.codigo.trim() || !formClasse.nome.trim()) {
      showToast('Codigo e nome sao obrigatorios', 'error')
      return
    }
    const codigo = formClasse.codigo.toUpperCase().slice(0, 3)
    try {
      if (editingClasse) {
        const { error } = await supabase.from('equipment_classes')
          .update({ codigo, nome: formClasse.nome.trim(), descricao: formClasse.descricao.trim() || null })
          .eq('id', editingClasse.id)
        if (error) throw error
        showToast('Classe atualizada!', 'success')
      } else {
        const { error } = await supabase.from('equipment_classes')
          .insert({ codigo, nome: formClasse.nome.trim(), descricao: formClasse.descricao.trim() || null })
        if (error) throw error
        showToast('Classe criada!', 'success')
      }
      setShowFormClasse(false)
      setEditingClasse(null)
      setFormClasse({ codigo: '', nome: '', descricao: '' })
      carregarDados()
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar classe', 'error')
    }
  }

  const editarClasse = (c: Classe) => {
    setEditingClasse(c)
    setFormClasse({ codigo: c.codigo, nome: c.nome, descricao: c.descricao || '' })
    setShowFormClasse(true)
  }

  const excluirClasse = async (id: number) => {
    if (!confirm('Excluir esta classe? As subclasses vinculadas tambem serao removidas.')) return
    try {
      const { error } = await supabase.from('equipment_classes').delete().eq('id', id)
      if (error) throw error
      showToast('Classe excluida!', 'success')
      carregarDados()
    } catch (error: any) {
      showToast(error.message || 'Erro ao excluir', 'error')
    }
  }

  // === SUBCLASSES ===
  const salvarSubclasse = async () => {
    if (!formSubclasse.class_id || !formSubclasse.codigo.trim() || !formSubclasse.nome.trim()) {
      showToast('Classe, codigo e nome sao obrigatorios', 'error')
      return
    }
    const codigo = formSubclasse.codigo.toUpperCase().slice(0, 3)
    try {
      if (editingSubclasse) {
        const { error } = await supabase.from('equipment_subclasses')
          .update({ class_id: parseInt(formSubclasse.class_id), codigo, nome: formSubclasse.nome.trim(), descricao: formSubclasse.descricao.trim() || null })
          .eq('id', editingSubclasse.id)
        if (error) throw error
        showToast('Subclasse atualizada!', 'success')
      } else {
        const { error } = await supabase.from('equipment_subclasses')
          .insert({ class_id: parseInt(formSubclasse.class_id), codigo, nome: formSubclasse.nome.trim(), descricao: formSubclasse.descricao.trim() || null })
        if (error) throw error
        showToast('Subclasse criada!', 'success')
      }
      setShowFormSubclasse(false)
      setEditingSubclasse(null)
      setFormSubclasse({ class_id: '', codigo: '', nome: '', descricao: '' })
      carregarDados()
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar subclasse', 'error')
    }
  }

  const editarSubclasse = (s: Subclasse) => {
    setEditingSubclasse(s)
    setFormSubclasse({ class_id: String(s.class_id), codigo: s.codigo, nome: s.nome, descricao: s.descricao || '' })
    setShowFormSubclasse(true)
  }

  const excluirSubclasse = async (id: number) => {
    if (!confirm('Excluir esta subclasse?')) return
    try {
      const { error } = await supabase.from('equipment_subclasses').delete().eq('id', id)
      if (error) throw error
      showToast('Subclasse excluida!', 'success')
      carregarDados()
    } catch (error: any) {
      showToast(error.message || 'Erro ao excluir', 'error')
    }
  }

  // === TIPOS ===
  const salvarTipo = async () => {
    if (!formTipo.codigo.trim() || !formTipo.nome.trim()) {
      showToast('Codigo e nome sao obrigatorios', 'error')
      return
    }
    const codigo = formTipo.codigo.toUpperCase().slice(0, 4)
    try {
      if (editingTipo) {
        const { error } = await supabase.from('equipment_types')
          .update({ codigo, nome: formTipo.nome.trim(), descricao: formTipo.descricao.trim() || null })
          .eq('id', editingTipo.id)
        if (error) throw error
        showToast('Tipo atualizado!', 'success')
      } else {
        const { error } = await supabase.from('equipment_types')
          .insert({ codigo, nome: formTipo.nome.trim(), descricao: formTipo.descricao.trim() || null })
        if (error) throw error
        showToast('Tipo criado!', 'success')
      }
      setShowFormTipo(false)
      setEditingTipo(null)
      setFormTipo({ codigo: '', nome: '', descricao: '' })
      carregarDados()
    } catch (error: any) {
      showToast(error.message || 'Erro ao salvar tipo', 'error')
    }
  }

  const editarTipo = (t: TipoTecnico) => {
    setEditingTipo(t)
    setFormTipo({ codigo: t.codigo, nome: t.nome, descricao: t.descricao || '' })
    setShowFormTipo(true)
  }

  const excluirTipo = async (id: number) => {
    if (!confirm('Excluir este tipo?')) return
    try {
      const { error } = await supabase.from('equipment_types').delete().eq('id', id)
      if (error) throw error
      showToast('Tipo excluido!', 'success')
      carregarDados()
    } catch (error: any) {
      showToast(error.message || 'Erro ao excluir', 'error')
    }
  }

  const subclassesFiltradas = filtroClasseId
    ? subclasses.filter(s => s.class_id === parseInt(filtroClasseId))
    : subclasses

  const getClasseNome = (classId: number) => {
    const c = classes.find(cl => cl.id === classId)
    return c ? `${c.codigo} - ${c.nome}` : ''
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando classificacoes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Classificacao de Equipamentos</h1>
          <p className="text-gray-600 mt-1">Gerencie classes, subclasses e tipos tecnicos</p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard/equipamentos')}>
          Voltar
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setTab('classes')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'classes' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Classes ({classes.length})
        </button>
        <button
          onClick={() => setTab('subclasses')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'subclasses' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Subclasses ({subclasses.length})
        </button>
        <button
          onClick={() => setTab('tipos')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            tab === 'tipos' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Tipos ({tipos.length})
        </button>
      </div>

      {/* TAB: Classes */}
      {tab === 'classes' && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Classes de Equipamentos</CardTitle>
                <Button onClick={() => { setEditingClasse(null); setFormClasse({ codigo: '', nome: '', descricao: '' }); setShowFormClasse(true) }}>
                  + Nova Classe
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {classes.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nenhuma classe cadastrada</p>
              ) : (
                <div className="space-y-3">
                  {classes.map(c => {
                    const qtdSub = subclasses.filter(s => s.class_id === c.id).length
                    return (
                      <div key={c.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <Badge className="bg-blue-100 text-blue-800 font-mono text-sm">{c.codigo}</Badge>
                          <div>
                            <h3 className="font-semibold text-gray-900">{c.nome}</h3>
                            {c.descricao && <p className="text-sm text-gray-500">{c.descricao}</p>}
                            <p className="text-xs text-gray-400">{qtdSub} subclasse(s)</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => editarClasse(c)}>Editar</Button>
                          <Button variant="danger" size="sm" onClick={() => excluirClasse(c.id)}>Excluir</Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {showFormClasse && (
            <Card>
              <CardHeader>
                <CardTitle>{editingClasse ? 'Editar Classe' : 'Nova Classe'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Codigo (3 letras) *</label>
                    <Input
                      value={formClasse.codigo}
                      onChange={(e) => setFormClasse({ ...formClasse, codigo: e.target.value.toUpperCase().slice(0, 3) })}
                      placeholder="EAR"
                      maxLength={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <Input
                      value={formClasse.nome}
                      onChange={(e) => setFormClasse({ ...formClasse, nome: e.target.value })}
                      placeholder="Terraplanagem"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                    <Input
                      value={formClasse.descricao}
                      onChange={(e) => setFormClasse({ ...formClasse, descricao: e.target.value })}
                      placeholder="Descricao da classe..."
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <Button onClick={salvarClasse}>{editingClasse ? 'Salvar' : 'Criar Classe'}</Button>
                  <Button variant="outline" onClick={() => { setShowFormClasse(false); setEditingClasse(null) }}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* TAB: Subclasses */}
      {tab === 'subclasses' && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Subclasses de Equipamentos</CardTitle>
                <Button onClick={() => { setEditingSubclasse(null); setFormSubclasse({ class_id: filtroClasseId || '', codigo: '', nome: '', descricao: '' }); setShowFormSubclasse(true) }}>
                  + Nova Subclasse
                </Button>
              </div>
              <div className="mt-2">
                <select
                  value={filtroClasseId}
                  onChange={(e) => setFiltroClasseId(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">Todas as classes</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.codigo} - {c.nome}</option>
                  ))}
                </select>
              </div>
            </CardHeader>
            <CardContent>
              {subclassesFiltradas.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nenhuma subclasse encontrada</p>
              ) : (
                <div className="space-y-3">
                  {subclassesFiltradas.map(s => (
                    <div key={s.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <Badge className="bg-green-100 text-green-800 font-mono text-sm">{s.codigo}</Badge>
                        <div>
                          <h3 className="font-semibold text-gray-900">{s.nome}</h3>
                          <p className="text-xs text-gray-500">{getClasseNome(s.class_id)}</p>
                          {s.descricao && <p className="text-sm text-gray-400">{s.descricao}</p>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => editarSubclasse(s)}>Editar</Button>
                        <Button variant="danger" size="sm" onClick={() => excluirSubclasse(s.id)}>Excluir</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {showFormSubclasse && (
            <Card>
              <CardHeader>
                <CardTitle>{editingSubclasse ? 'Editar Subclasse' : 'Nova Subclasse'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Classe *</label>
                    <select
                      value={formSubclasse.class_id}
                      onChange={(e) => setFormSubclasse({ ...formSubclasse, class_id: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Selecione...</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.codigo} - {c.nome}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Codigo (3 letras) *</label>
                    <Input
                      value={formSubclasse.codigo}
                      onChange={(e) => setFormSubclasse({ ...formSubclasse, codigo: e.target.value.toUpperCase().slice(0, 3) })}
                      placeholder="RET"
                      maxLength={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <Input
                      value={formSubclasse.nome}
                      onChange={(e) => setFormSubclasse({ ...formSubclasse, nome: e.target.value })}
                      placeholder="Retroescavadeira"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                    <Input
                      value={formSubclasse.descricao}
                      onChange={(e) => setFormSubclasse({ ...formSubclasse, descricao: e.target.value })}
                      placeholder="Descricao..."
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <Button onClick={salvarSubclasse}>{editingSubclasse ? 'Salvar' : 'Criar Subclasse'}</Button>
                  <Button variant="outline" onClick={() => { setShowFormSubclasse(false); setEditingSubclasse(null) }}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* TAB: Tipos */}
      {tab === 'tipos' && (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Tipos Tecnicos</CardTitle>
                <Button onClick={() => { setEditingTipo(null); setFormTipo({ codigo: '', nome: '', descricao: '' }); setShowFormTipo(true) }}>
                  + Novo Tipo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {tipos.length === 0 ? (
                <p className="text-center py-8 text-gray-500">Nenhum tipo cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {tipos.map(t => (
                    <div key={t.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-4">
                        <Badge className="bg-purple-100 text-purple-800 font-mono text-sm">{t.codigo}</Badge>
                        <div>
                          <h3 className="font-semibold text-gray-900">{t.nome}</h3>
                          {t.descricao && <p className="text-sm text-gray-500">{t.descricao}</p>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => editarTipo(t)}>Editar</Button>
                        <Button variant="danger" size="sm" onClick={() => excluirTipo(t.id)}>Excluir</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {showFormTipo && (
            <Card>
              <CardHeader>
                <CardTitle>{editingTipo ? 'Editar Tipo' : 'Novo Tipo'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Codigo (ate 4 chars) *</label>
                    <Input
                      value={formTipo.codigo}
                      onChange={(e) => setFormTipo({ ...formTipo, codigo: e.target.value.toUpperCase().slice(0, 4) })}
                      placeholder="STD"
                      maxLength={4}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
                    <Input
                      value={formTipo.nome}
                      onChange={(e) => setFormTipo({ ...formTipo, nome: e.target.value })}
                      placeholder="Standard"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                    <Input
                      value={formTipo.descricao}
                      onChange={(e) => setFormTipo({ ...formTipo, descricao: e.target.value })}
                      placeholder="Descricao..."
                    />
                  </div>
                </div>
                <div className="flex space-x-3 mt-4">
                  <Button onClick={salvarTipo}>{editingTipo ? 'Salvar' : 'Criar Tipo'}</Button>
                  <Button variant="outline" onClick={() => { setShowFormTipo(false); setEditingTipo(null) }}>Cancelar</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
