"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PDFGeneratorDemo } from "@/components/features/pdf/pdf-generator-demo"
import { ImageUploadDemo } from "@/components/features/upload/image-upload"
import { InteractiveCharts } from "@/components/features/charts/interactive-charts"
import { SupportCenter } from "@/components/features/support/chat-system"
import { 
  Sparkles, 
  FileText, 
  Camera, 
  BarChart3, 
  MessageSquare, 
  Shield,
  Zap,
  Star,
  Crown,
  Award,
  Rocket,
  Target
} from "lucide-react"

export default function PremiumFeaturesPage() {
  const [activeFeature, setActiveFeature] = useState("overview")

  const features = [
    {
      id: "pdf",
      name: "Geração de PDF",
      description: "Contratos e faturas profissionais",
      icon: FileText,
      color: "text-blue-600 bg-blue-100",
      implemented: true,
      highlight: "Novo!"
    },
    {
      id: "upload",
      name: "Upload de Imagens",
      description: "Sistema completo de upload",
      icon: Camera,
      color: "text-green-600 bg-green-100",
      implemented: true,
      highlight: "Novo!"
    },
    {
      id: "charts",
      name: "Charts Interativos",
      description: "Analytics avançados em tempo real",
      icon: BarChart3,
      color: "text-purple-600 bg-purple-100",
      implemented: true,
      highlight: "Premium"
    },
    {
      id: "chat",
      name: "Sistema de Chat",
      description: "Suporte em tempo real",
      icon: MessageSquare,
      color: "text-orange-600 bg-orange-100",
      implemented: true,
      highlight: "Premium"
    },
    {
      id: "auth",
      name: "Autenticação Avançada",
      description: "Login seguro e permissões",
      icon: Shield,
      color: "text-red-600 bg-red-100",
      implemented: true,
      highlight: "Segurança"
    }
  ]

  return (
    <div className="px-6 space-y-8">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 rounded-xl p-8 text-white">
        <div className="flex items-center mb-4">
          <Crown className="h-8 w-8 mr-3 text-yellow-300" />
          <h1 className="text-3xl font-bold">Funcionalidades Premium</h1>
          <span className="ml-3 px-3 py-1 bg-yellow-500 text-yellow-900 rounded-full text-sm font-medium">
            ✨ Novo
          </span>
        </div>
        <p className="text-xl opacity-90 mb-6">
          Descubra as funcionalidades avançadas que transformam o LocaMaster Pro em uma solução completa
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Zap className="h-5 w-5 mr-2 text-yellow-300" />
              <span className="font-medium">5 Funcionalidades</span>
            </div>
            <p className="text-sm opacity-75">Implementadas e funcionais</p>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Target className="h-5 w-5 mr-2 text-green-300" />
              <span className="font-medium">100% Operacional</span>
            </div>
            <p className="text-sm opacity-75">Prontas para produção</p>
          </div>
          
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <Rocket className="h-5 w-5 mr-2 text-red-300" />
              <span className="font-medium">Performance</span>
            </div>
            <p className="text-sm opacity-75">Otimizado e responsivo</p>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon
          return (
            <Card 
              key={feature.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-lg border-l-4 
                ${activeFeature === feature.id ? 'border-l-blue-500 shadow-lg' : 'border-l-gray-200'}
                ${feature.implemented ? 'bg-white' : 'bg-gray-50 opacity-75'}`}
              onClick={() => setActiveFeature(feature.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${feature.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex items-center space-x-1">
                    {feature.implemented && (
                      <Award className="h-4 w-4 text-green-600" />
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full font-medium
                      ${feature.highlight === 'Novo!' ? 'bg-green-100 text-green-800' :
                        feature.highlight === 'Premium' ? 'bg-purple-100 text-purple-800' :
                        'bg-blue-100 text-blue-800'}`}>
                      {feature.highlight}
                    </span>
                  </div>
                </div>
                <div>
                  <CardTitle className="text-lg">{feature.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-medium
                    ${feature.implemented ? 'text-green-600' : 'text-gray-500'}`}>
                    {feature.implemented ? '✅ Implementado' : '🚧 Em desenvolvimento'}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={!feature.implemented}
                  >
                    {feature.implemented ? 'Testar' : 'Em breve'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Feature Demos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Sparkles className="h-5 w-5 mr-2 text-purple-600" />
            Demonstrações Interativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeFeature} onValueChange={setActiveFeature}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pdf" className="flex items-center">
                <FileText className="h-4 w-4 mr-1" />
                PDF
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center">
                <Camera className="h-4 w-4 mr-1" />
                Upload
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-1" />
                Charts
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="auth" className="flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Auth
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="pdf" className="space-y-4">
                <div className="border rounded-lg p-4 bg-blue-50">
                  <h3 className="text-lg font-medium text-blue-900 mb-2 flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Geração Automática de PDF
                  </h3>
                  <p className="text-blue-800 mb-4">
                    Sistema completo para gerar contratos e faturas profissionais em PDF
                  </p>
                </div>
                <PDFGeneratorDemo />
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div className="border rounded-lg p-4 bg-green-50">
                  <h3 className="text-lg font-medium text-green-900 mb-2 flex items-center">
                    <Camera className="h-5 w-5 mr-2" />
                    Sistema de Upload Avançado
                  </h3>
                  <p className="text-green-800 mb-4">
                    Upload de múltiplas imagens com drag & drop, preview e validação
                  </p>
                </div>
                <ImageUploadDemo />
              </TabsContent>

              <TabsContent value="charts" className="space-y-4">
                <div className="border rounded-lg p-4 bg-purple-50">
                  <h3 className="text-lg font-medium text-purple-900 mb-2 flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Analytics Avançados
                  </h3>
                  <p className="text-purple-800 mb-4">
                    Dashboards interativos com métricas em tempo real
                  </p>
                </div>
                <InteractiveCharts />
              </TabsContent>

              <TabsContent value="chat" className="space-y-4">
                <div className="border rounded-lg p-4 bg-orange-50">
                  <h3 className="text-lg font-medium text-orange-900 mb-2 flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Suporte em Tempo Real
                  </h3>
                  <p className="text-orange-800 mb-4">
                    Chat widget e central de suporte integrados
                  </p>
                </div>
                <SupportCenter />
              </TabsContent>

              <TabsContent value="auth" className="space-y-4">
                <div className="border rounded-lg p-4 bg-red-50">
                  <h3 className="text-lg font-medium text-red-900 mb-2 flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Autenticação Avançada
                  </h3>
                  <p className="text-red-800 mb-4">
                    Sistema de login seguro com NextAuth.js já implementado
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contas de Teste</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="font-medium text-red-800">👑 Administrador</p>
                        <p className="text-sm text-red-600">admin@locamaster.com.br</p>
                        <p className="text-xs text-red-500">Senha: password123</p>
                      </div>
                      
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="font-medium text-blue-800">🏢 Gerente</p>
                        <p className="text-sm text-blue-600">manager@locamaster.com.br</p>
                        <p className="text-xs text-blue-500">Senha: password123</p>
                      </div>
                      
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="font-medium text-purple-800">👤 Cliente</p>
                        <p className="text-sm text-purple-600">cliente@construtoraalpha.com.br</p>
                        <p className="text-xs text-purple-500">Senha: password123</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recursos Implementados</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">✅</span>
                          Login com email e senha
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">✅</span>
                          Diferentes níveis de permissão
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">✅</span>
                          Sessão segura com JWT
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">✅</span>
                          Middleware de proteção
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">✅</span>
                          Logout automático
                        </div>
                        <div className="flex items-center">
                          <span className="text-green-600 mr-2">✅</span>
                          Interface de login responsiva
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="p-6">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">
                        Para testar a autenticação, faça logout e tente acessar novamente
                      </p>
                      <Button 
                        variant="outline"
                        onClick={() => window.location.href = '/auth/signin'}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Ir para Página de Login
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>

      {/* Success Summary */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <Award className="h-6 w-6 mr-2" />
            🎉 Implementação Concluída com Sucesso!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-green-800 mb-3">✅ Funcionalidades Implementadas:</h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• Sistema de autenticação real com NextAuth.js</li>
                <li>• Geração automática de PDF para contratos e faturas</li>
                <li>• Upload de múltiplas imagens com validação</li>
                <li>• Charts interativos e analytics avançados</li>
                <li>• Sistema de chat e suporte em tempo real</li>
                <li>• Interface responsiva e acessível</li>
                <li>• Notificações toast profissionais</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-800 mb-3">🚀 Tecnologias Utilizadas:</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• <strong>NextAuth.js</strong> - Autenticação</li>
                <li>• <strong>jsPDF</strong> - Geração de PDF</li>
                <li>• <strong>React Dropzone</strong> - Upload de arquivos</li>
                <li>• <strong>Recharts</strong> - Charts interativos</li>
                <li>• <strong>React Hot Toast</strong> - Notificações</li>
                <li>• <strong>Tailwind CSS</strong> - Styling moderno</li>
                <li>• <strong>TypeScript</strong> - Tipagem forte</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg border border-green-200">
            <p className="text-center text-green-800 font-medium">
              🎯 O LocaMaster Pro V2 agora possui todas as funcionalidades premium e está pronto para uso em produção!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
