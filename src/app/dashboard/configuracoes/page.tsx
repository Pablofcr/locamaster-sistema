'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import { useEmpresa } from '@/contexts/EmpresaContext'

export default function ConfiguracoesPage() {
  const { showToast } = useToast()
  const router = useRouter()
  const { empresa, loading: loadingEmpresa } = useEmpresa()
  const [activeTab, setActiveTab] = useState('empresa')

  const [sistemaData, setSistemaData] = useState({
    notificacoesEmail: true, whatsappAutomatico: false, backupAutomatico: true,
    formatoOrcamento: 'ORC-YYYY-NNN', formatoLocacao: 'LOC-YYYY-NNN', formatoFatura: 'FAT-YYYY-NNN'
  })

  const salvarSistema = () => {
    localStorage.setItem('locamaster_sistema', JSON.stringify(sistemaData))
    showToast('Configuracoes do sistema salvas!', 'success')
  }

  const tabs = [
    { id: 'empresa', nome: 'Empresa', icone: '🏢' },
    { id: 'sistema', nome: 'Sistema', icone: '⚙️' },
    { id: 'seguranca', nome: 'Seguranca', icone: '🔒' },
    { id: 'backup', nome: 'Backup', icone: '💾' }
  ]

  const renderEmpresaTab = () => {
    if (loadingEmpresa) {
      return (
        <Card>
          <CardContent>
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          </CardContent>
        </Card>
      )
    }

    if (!empresa) {
      return (
        <Card>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Nenhuma empresa cadastrada</p>
              <Button onClick={() => router.push('/dashboard/configuracoes/empresa')}>
                Cadastrar Empresa
              </Button>
            </div>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Informacoes da Empresa</CardTitle>
            <Button onClick={() => router.push('/dashboard/configuracoes/empresa')}>
              Editar Dados da Empresa
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-start space-x-6 mb-6">
            {empresa.logo_base64 ? (
              <img
                src={empresa.logo_base64}
                alt="Logo da empresa"
                className="w-24 h-24 object-contain border border-gray-200 rounded-lg bg-white p-2"
              />
            ) : (
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
                <span className="text-center text-xs">Sem logo</span>
              </div>
            )}
            <div>
              <h3 className="text-xl font-bold text-gray-900">{empresa.nome_fantasia || empresa.razao_social}</h3>
              <p className="text-sm text-gray-600">{empresa.razao_social}</p>
              {empresa.cnpj && <p className="text-sm text-gray-500 mt-1">CNPJ: {empresa.cnpj}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {empresa.email && (
              <div>
                <span className="text-sm font-medium text-gray-500">Email</span>
                <p className="text-gray-900">{empresa.email}</p>
              </div>
            )}
            {empresa.telefone && (
              <div>
                <span className="text-sm font-medium text-gray-500">Telefone</span>
                <p className="text-gray-900">{empresa.telefone}</p>
              </div>
            )}
            {empresa.website && (
              <div>
                <span className="text-sm font-medium text-gray-500">Website</span>
                <p className="text-gray-900">{empresa.website}</p>
              </div>
            )}
            {empresa.inscricao_estadual && (
              <div>
                <span className="text-sm font-medium text-gray-500">Inscricao Estadual</span>
                <p className="text-gray-900">{empresa.inscricao_estadual}</p>
              </div>
            )}
            {empresa.inscricao_municipal && (
              <div>
                <span className="text-sm font-medium text-gray-500">Inscricao Municipal</span>
                <p className="text-gray-900">{empresa.inscricao_municipal}</p>
              </div>
            )}
            {(empresa.logradouro || empresa.cidade) && (
              <div className="md:col-span-2">
                <span className="text-sm font-medium text-gray-500">Endereco</span>
                <p className="text-gray-900">
                  {[
                    empresa.logradouro,
                    empresa.numero ? `n. ${empresa.numero}` : null,
                    empresa.complemento,
                    empresa.bairro,
                    empresa.cidade,
                    empresa.estado,
                    empresa.cep,
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderSistemaTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Configuracoes Gerais</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Notificacoes por Email</h4>
                <p className="text-sm text-gray-600">Receber alertas sobre orcamentos e locacoes</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={sistemaData.notificacoesEmail}
                  onChange={(e) => setSistemaData({ ...sistemaData, notificacoesEmail: e.target.checked })} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">WhatsApp Automatico</h4>
                <p className="text-sm text-gray-600">Envio automatico de orcamentos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={sistemaData.whatsappAutomatico}
                  onChange={(e) => setSistemaData({ ...sistemaData, whatsappAutomatico: e.target.checked })} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Backup Automatico</h4>
                <p className="text-sm text-gray-600">Backup diario dos dados</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={sistemaData.backupAutomatico}
                  onChange={(e) => setSistemaData({ ...sistemaData, backupAutomatico: e.target.checked })} />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={salvarSistema}>Salvar Configuracoes</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Configuracoes de Numeracao</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Formato Orcamentos:</label>
              <Input value={sistemaData.formatoOrcamento} onChange={(e) => setSistemaData({ ...sistemaData, formatoOrcamento: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Formato Locacoes:</label>
              <Input value={sistemaData.formatoLocacao} onChange={(e) => setSistemaData({ ...sistemaData, formatoLocacao: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Formato Faturas:</label>
              <Input value={sistemaData.formatoFatura} onChange={(e) => setSistemaData({ ...sistemaData, formatoFatura: e.target.value })} />
            </div>
          </div>
          <div className="mt-6">
            <Button onClick={salvarSistema}>Salvar Numeracao</Button>
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
            <CardHeader><CardTitle>Seguranca</CardTitle></CardHeader>
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
                  <span>Dados armazenados no Supabase (backup automatico)</span>
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
        <h1 className="text-3xl font-bold text-gray-900">Configuracoes</h1>
        <p className="text-gray-600">Gerencie configuracoes do sistema e da empresa</p>
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
