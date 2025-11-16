"use client"

import { useState } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/lib/notifications"
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Shield,
  Zap,
  ArrowRight,
  Package,
  Users,
  Building,
  AlertCircle
} from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const toast = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log("Tentando login com:", { email, password });

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      console.log("Resultado do signIn:", result);

      if (result?.error) {
        console.log("Erro no login:", result.error);
        toast.error("Email ou senha incorretos")
        setIsLoading(false)
        return
      }

      console.log("Login bem-sucedido, obtendo sessão...");
      // Get session to determine redirect
      const session = await getSession()
      console.log("Sessão obtida:", session);
      
      if (session?.user?.role === "client") {
        router.push("/client-portal/dashboard")
        toast.success(`Bem-vindo, ${session.user.name}!`)
      } else {
        router.push("/dashboard")
        toast.success(`Bem-vindo ao sistema, ${session?.user?.name}!`)
      }

    } catch (error) {
      console.error("Login error:", error)
      toast.error("Erro ao fazer login. Tente novamente.")
      setIsLoading(false)
    }
  }

  const demoAccounts = [
    { 
      email: "admin@locamaster.com.br", 
      password: "password123", 
      role: "Administrador",
      description: "Acesso total ao sistema",
      icon: Shield,
      color: "text-red-600 bg-red-50 border-red-200"
    },
    { 
      email: "manager@locamaster.com.br", 
      password: "password123", 
      role: "Gerente",
      description: "Gestão de equipamentos e clientes", 
      icon: Building,
      color: "text-blue-600 bg-blue-50 border-blue-200"
    },
    { 
      email: "cliente@construtoraalpha.com.br", 
      password: "password123", 
      role: "Cliente",
      description: "Portal do cliente",
      icon: Users, 
      color: "text-purple-600 bg-purple-50 border-purple-200"
    }
  ]

  const fillDemoAccount = (email: string, password: string) => {
    setEmail(email)
    setPassword(password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 xl:px-24">
          <div className="mx-auto max-w-xl">
            <div className="flex items-center mb-8">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="ml-4">
                <h1 className="text-3xl font-bold text-gray-900">LocaMaster Pro</h1>
                <p className="text-gray-600">Sistema de Gestão Profissional</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Bem-vindo de volta!
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Gerencie sua locadora com eficiência e profissionalismo.
            </p>

            <div className="grid gap-4">
              <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <Zap className="h-8 w-8 text-yellow-500 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Gestão Inteligente</h3>
                  <p className="text-gray-600 text-sm">Controle total de equipamentos e locações</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <Users className="h-8 w-8 text-blue-500 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Portal do Cliente</h3>
                  <p className="text-gray-600 text-sm">Interface dedicada para seus clientes</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                <Shield className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <h3 className="font-semibold text-gray-900">Segurança Avançada</h3>
                  <p className="text-gray-600 text-sm">Proteção total dos seus dados</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="mx-auto w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden flex items-center justify-center mb-8">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-2xl font-bold text-gray-900">LocaMaster Pro</h1>
              </div>
            </div>

            <Card className="shadow-xl border-0">
              <CardHeader className="space-y-1 pb-6">
                <CardTitle className="text-2xl font-bold text-center">Fazer Login</CardTitle>
                <p className="text-gray-600 text-center">Entre com suas credenciais</p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Senha
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Entrando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        Entrar no Sistema
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </div>
                    )}
                  </Button>
                </form>

                {/* Demo Accounts */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2 text-blue-600" />
                    Contas de Demonstração
                  </h3>
                  
                  <div className="space-y-3">
                    {demoAccounts.map((account, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => fillDemoAccount(account.email, account.password)}
                        className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-md ${account.color}`}
                      >
                        <div className="flex items-center">
                          <account.icon className="h-5 w-5 mr-3" />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{account.role}</p>
                            <p className="text-xs opacity-75">{account.description}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 opacity-50" />
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-3 text-center">
                    Clique em qualquer conta para preencher automaticamente
                  </p>
                </div>
              </CardContent>
            </Card>

            <p className="mt-6 text-center text-sm text-gray-600">
              Desenvolvido com ❤️ por{" "}
              <span className="font-semibold text-blue-600">LocaMaster Pro Team</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
