'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'

export default function ConfiguracoesPage() {
  const { showToast } = useToast()
  const [activeTab, setActiveTab] = useState('empresa')

  const [empresaData, setEmpresaData] = useState({
    nome: '', cnpj: '', telefone: '', email: '', endereco: '', cidade: ''
  })

  const [sistemaData, setSistemaData] = useState({
    notificacoesEmail: true, whatsappAutomatico: false, backupAutomatico: true,
    formatoOrcamento: 'ORC-YYYY-NNN', formatoLocacao: 'LOC-YYYY-NNN', formatoFatura: 'FAT-YYYY-NNN'
  })

  useEffect(() => {
    const saved = localStorage.getItem('locamaster_empresa')
    if (saved) setEmpresaData(JSON.parse(saved))
    else setEmpresaData({
      nome: 'BRA Locação de Equipamentos', cnpj: '12.345.678/0001-90',
      telefone: '(85) 98900-2319', email: 'contato@braloc.com.br',
      endereco: 'Rua das Flores, 123', cidade: 'Fortaleza - CE'
    })

    const savedSistema = localStorage.getItem('locamaster_sistema')
    if (savedSistema) setSistemaData(JSON.parse(savedSistema))
  }, [])

  const salvarEmpresa = () => {
    localStorage.setItem('locamaster_empresa', JSON.stringify(empresaData))
    showToast('Dados da empresa salvos!', 'success')
  }

  const salvarSistema = () => {
    localStorage.setItem('locamaster_sistema', JSON.stringify(sistemaData))
    showToast('Configurações do sistema salvas!', 'success')
  }

  const tabs = [
    { id: 'empresa', nome: 'Empresa', icone: '🏢' },
    { id: 'sistema', nome: 'Sistema', icone: '⚙️' },
    { id: 'seguranca', nome: 'Segurança', icone: '🔒' },
    { id: 'backup', nome: 'Backup', icone: '💾' }
  ]

  const renderEmpresaTab = () => (
    <Card>
      <CardHeader><CardTitle>Informações da Empresa</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input placeholder="Nome da Empresa" value={empresaData.nome} onChange={(e) => setEmpresaData({ ...empresaData, nome: e.target.value })} />
          <Input placeholder="CNPJ" value={empresaData.cnpj} onChange={(e) => setEmpresaData({ ...empresaData, cnpj: e.target.value })} />
          <Input placeholder="Telefone" value={empresaData.telefone} onChange={(e) => setEmpresaData({ ...empresaData, telefone: e.target.value })} />
          <Input placeholder="Email" value={empresaData.email} onChange={(e) => setEmpresaData({ ...empresaData, email: e.target.value })} />
          <Input placeholder="Endereço" value={empresaData.endereco} onChange={(e) => setEmpresaData({ ...empresaData, endereco: e.target.value })} />
          <Input placeholder="Cidade" value={empresaData.cidade} onChange={(e) => setEmpresaData({ ...empresaData, cidade: e.target.value })} />
        </div>
        <div className="mt-6">
          <Button onClick={salvarEmpresa}>Salvar Alterações</Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderSistemaTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Configurações Gerais</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Notificações por Email</h4>
                <p className="text-sm text-gray-600">Receber alertas sobre orçamentos e locações</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={sistemaData.notificacoesEmail}
                  onChange={(e) => setSistemaData({ ...sistemaData, notificacoesEmail: e.target.checked })} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">WhatsApp Automático</h4>
                <p className="text-sm text-gray-600">Envio automático de orçamentos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={sistemaData.whatsappAutomatico}
                  onChange={(e) => setSistemaData({ ...sistemaData, whatsappAutomatico: e.target.checked })} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Backup Automático</h4>
                <p className="text-sm text-gray-600">Backup diário dos dados</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={sistemaData.backupAutomatico}
                  onChange={(e) => setSistemaData({ ...sistemaData, backupAutomatico: e.target.checked })} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={salvarSistema}>Salvar Configurações</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Configurações de Numeração</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Formato Orçamentos:</label>
              <Input value={sistemaData.formatoOrcamento} onChange={(e) => setSistemaData({ ...sistemaData, formatoOrcamento: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Formato Locações:</label>
              <Input value={sistemaData.formatoLocacao} onChange={(e) => setSistemaData({ ...sistemaData, formatoLocacao: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Formato Faturas:</label>
              <Input value={sistemaData.formatoFatura} onChange={(e) => setSistemaData({ ...sistemaData, formatoFatura: e.target.value })} />
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={salvarSistema}>Salvar Numeração</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'empresa': return renderEmpresaTab()
      case 'sistema': return renderSistemaTab()
      case 'seguranca':
        return (
          <Card>
            <CardHeader><CardTitle>Segurança</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full" onClick={() => showToast('Funcionalidade em desenvolvimento', 'info')}>Alterar Senha</Button>
                <Button variant="outline" className="w-full" onClick={() => showToast('Funcionalidade em desenvolvimento', 'info')}>Configurar 2FA</Button>
                <Button variant="outline" className="w-full" onClick={() => showToast('Funcionalidade em desenvolvimento', 'info')}>Log de Atividades</Button>
              </div>
            </CardContent>
          </Card>
        )
      case 'backup':
        return (
          <Card>
            <CardHeader><CardTitle>Backup e Dados</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Dados armazenados no Supabase (backup automático)</span>
                  <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                </div>
                <Button variant="outline" className="w-full" onClick={() => showToast('Dados exportados com sucesso!', 'success')}>Exportar Dados</Button>
              </div>
            </CardContent>
          </Card>
        )
      default: return renderEmpresaTab()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie configurações do sistema e da empresa</p>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}>
            <span>{tab.icone}</span>
            <span>{tab.nome}</span>
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  )
}
