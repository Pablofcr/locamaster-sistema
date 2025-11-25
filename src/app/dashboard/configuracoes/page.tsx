'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'

const usuariosDemo = [
  { id: 1, nome: 'Admin Sistema', email: 'admin@empresa.com', cargo: 'Administrador', ativo: true, ultimo: '2024-11-24' },
  { id: 2, nome: 'João Operador', email: 'joao@empresa.com', cargo: 'Operador', ativo: true, ultimo: '2024-11-23' },
  { id: 3, nome: 'Maria Financeiro', email: 'maria@empresa.com', cargo: 'Financeiro', ativo: false, ultimo: '2024-11-20' }
]

export default function ConfiguracoesPage() {
  const [activeTab, setActiveTab] = useState('empresa')
  const [showNovoUsuario, setShowNovoUsuario] = useState(false)

  const tabs = [
    { id: 'empresa', nome: 'Empresa', icone: '🏢' },
    { id: 'usuarios', nome: 'Usuários', icone: '👥' },
    { id: 'sistema', nome: 'Sistema', icone: '⚙️' },
    { id: 'integracao', nome: 'Integração', icone: '🔗' },
    { id: 'seguranca', nome: 'Segurança', icone: '🔒' },
    { id: 'backup', nome: 'Backup', icone: '💾' }
  ]

  const renderEmpresaTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🏢 Informações da Empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Nome da Empresa" defaultValue="BRA Locação de Equipamentos" />
            <Input placeholder="CNPJ" defaultValue="12.345.678/0001-90" />
            <Input placeholder="Telefone" defaultValue="(85) 98900-2319" />
            <Input placeholder="Email" defaultValue="contato@braloc.com.br" />
            <Input placeholder="Endereço" defaultValue="Rua das Flores, 123" />
            <Input placeholder="Cidade" defaultValue="Fortaleza - CE" />
          </div>
          <div className="mt-6">
            <Button className="bg-blue-600 hover:bg-blue-700">💾 Salvar Alterações</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🎨 Personalização Visual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cor Principal do Sistema:</label>
              <div className="flex space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded cursor-pointer border-2 border-blue-600"></div>
                <div className="w-8 h-8 bg-green-500 rounded cursor-pointer"></div>
                <div className="w-8 h-8 bg-orange-500 rounded cursor-pointer"></div>
                <div className="w-8 h-8 bg-purple-500 rounded cursor-pointer"></div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Logo da Empresa:</label>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-bold">BRA</span>
                </div>
                <Button variant="outline">📤 Upload Nova Logo</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderUsuariosTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">👥 Gestão de Usuários</h3>
        <Button 
          onClick={() => setShowNovoUsuario(!showNovoUsuario)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          ➕ Novo Usuário
        </Button>
      </div>

      {showNovoUsuario && (
        <Card>
          <CardHeader>
            <CardTitle>➕ Adicionar Novo Usuário</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input placeholder="Nome Completo" />
              <Input placeholder="Email" type="email" />
              <Input placeholder="Telefone" />
              <select className="px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Selecionar Cargo</option>
                <option value="admin">Administrador</option>
                <option value="operador">Operador</option>
                <option value="financeiro">Financeiro</option>
                <option value="vendas">Vendas</option>
              </select>
            </div>
            <div className="mt-6 flex space-x-3">
              <Button className="bg-blue-600 hover:bg-blue-700">👤 Criar Usuário</Button>
              <Button variant="outline" onClick={() => setShowNovoUsuario(false)}>❌ Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {usuariosDemo.map((usuario) => (
              <div key={usuario.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-blue-600">{usuario.nome.charAt(0)}</span>
                  </div>
                  <div>
                    <h4 className="font-medium">{usuario.nome}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>📧 {usuario.email}</span>
                      <span>👔 {usuario.cargo}</span>
                      <span>📅 Último acesso: {usuario.ultimo}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {usuario.ativo ? (
                    <Badge className="bg-green-100 text-green-800">✅ Ativo</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">❌ Inativo</Badge>
                  )}
                  <Button variant="outline" size="sm">✏️ Editar</Button>
                  <Button variant="outline" size="sm">🔒 Permissões</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderSistemaTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Configurações Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Notificações por Email</h4>
                <p className="text-sm text-gray-600">Receber alertas sobre orçamentos e locações</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">WhatsApp Automático</h4>
                <p className="text-sm text-gray-600">Envio automático de orçamentos por WhatsApp</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Backup Automático</h4>
                <p className="text-sm text-gray-600">Backup diário dos dados às 02:00</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔢 Configurações de Numeração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Formato Orçamentos:</label>
              <Input placeholder="ORC-2024-001" defaultValue="ORC-YYYY-NNN" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Formato Locações:</label>
              <Input placeholder="LOC-2024-001" defaultValue="LOC-YYYY-NNN" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Formato Faturas:</label>
              <Input placeholder="FAT-2024-001" defaultValue="FAT-YYYY-NNN" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Próximo Número:</label>
              <Input placeholder="005" defaultValue="005" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'empresa':
        return renderEmpresaTab()
      case 'usuarios':
        return renderUsuariosTab()
      case 'sistema':
        return renderSistemaTab()
      case 'integracao':
        return (
          <Card>
            <CardHeader>
              <CardTitle>🔗 Integrações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🚧</div>
                <h3 className="text-lg font-semibold mb-2">Integrações em Desenvolvimento</h3>
                <p className="text-gray-600">WhatsApp Business, PagSeguro, Mercado Pago</p>
              </div>
            </CardContent>
          </Card>
        )
      case 'seguranca':
        return (
          <Card>
            <CardHeader>
              <CardTitle>🔒 Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button variant="outline" className="w-full">🔑 Alterar Senha</Button>
                <Button variant="outline" className="w-full">📱 Configurar 2FA</Button>
                <Button variant="outline" className="w-full">📊 Log de Atividades</Button>
              </div>
            </CardContent>
          </Card>
        )
      case 'backup':
        return (
          <Card>
            <CardHeader>
              <CardTitle>💾 Backup e Dados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Último backup: 24/11/2024 02:00</span>
                  <Badge className="bg-green-100 text-green-800">✅ Sucesso</Badge>
                </div>
                <Button variant="outline" className="w-full">📥 Download Backup</Button>
                <Button variant="outline" className="w-full">🗑️ Exportar Dados</Button>
              </div>
            </CardContent>
          </Card>
        )
      default:
        return renderEmpresaTab()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">⚙️ Configurações</h1>
        <p className="text-gray-600">Gerencie configurações do sistema e da empresa</p>
      </div>

      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icone}</span>
            <span>{tab.nome}</span>
          </button>
        ))}
      </div>

      {renderContent()}
    </div>
  )
}