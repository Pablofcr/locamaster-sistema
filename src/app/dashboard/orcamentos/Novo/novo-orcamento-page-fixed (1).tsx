"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Plus,
  Calculator,
  Send,
  Save,
  Eye,
  Package,
  Calendar,
  DollarSign,
  User,
  FileText,
  X
} from "lucide-react"

// Componentes simples internos
function Label({ children, htmlFor }: { children: React.ReactNode, htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 mb-1">
      {children}
    </label>
  )
}

function Textarea({ value, onChange, placeholder, className = "" }: { 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, 
  placeholder?: string,
  className?: string 
}) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
      rows={4}
    />
  )
}

function Select({ value, onChange, children, className = "" }: { 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, 
  children: React.ReactNode,
  className?: string 
}) {
  return (
    <select
      value={value}
      onChange={onChange}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${className}`}
    >
      {children}
    </select>
  )
}

interface Equipamento {
  id: string
  nome: string
  categoria: string
  valorDiario: number
  disponivel: number
  descricao: string
}

interface ItemOrcamento {
  equipamento: Equipamento
  quantidade: number
  dias: number
  subtotal: number
}

export default function NovoOrcamentoPage() {
  const [cliente, setCliente] = useState("")
  const [novoCliente, setNovoCliente] = useState({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    cnpj: ""
  })
  const [itens, setItens] = useState<ItemOrcamento[]>([])
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState("")
  const [quantidade, setQuantidade] = useState(1)
  const [diasLocacao, setDiasLocacao] = useState(1)
  const [desconto, setDesconto] = useState(0)
  const [observacoes, setObservacoes] = useState("")
  const [tipoCliente, setTipoCliente] = useState("existente") // existente ou novo

  // Mock data - em produção virá do banco
  const clientes = [
    { id: "1", nome: "Construtora Alpha Ltda", email: "contato@alpha.com.br", telefone: "(11) 99999-1111" },
    { id: "2", nome: "João Silva Santos", email: "joao@email.com", telefone: "(11) 99999-2222" },
    { id: "3", nome: "Beta Engenharia S/A", email: "obras@beta.com.br", telefone: "(11) 99999-3333" },
    { id: "4", nome: "Construtora Horizonte", email: "contato@horizonte.com.br", telefone: "(11) 99999-4444" }
  ]

  const equipamentos: Equipamento[] = [
    {
      id: "1",
      nome: "Betoneira B350",
      categoria: "Concreto",
      valorDiario: 45.00,
      disponivel: 8,
      descricao: "Betoneira basculante 350L"
    },
    {
      id: "2", 
      nome: "Escavadeira CAT-320",
      categoria: "Escavação",
      valorDiario: 850.00,
      disponivel: 3,
      descricao: "Escavadeira hidráulica 20t"
    },
    {
      id: "3",
      nome: "Gerador GEN-50D",
      categoria: "Energia",
      valorDiario: 120.00,
      disponivel: 12,
      descricao: "Gerador diesel 50kVA"
    },
    {
      id: "4",
      nome: "Vibrador CV-2200",
      categoria: "Concreto", 
      valorDiario: 25.00,
      disponivel: 15,
      descricao: "Vibrador de concreto 2200W"
    },
    {
      id: "5",
      nome: "Compressor AC-500",
      categoria: "Ar Comprimido",
      valorDiario: 85.00,
      disponivel: 6,
      descricao: "Compressor de ar 500L/min"
    },
    {
      id: "6",
      nome: "Guincho G-15T",
      categoria: "Elevação",
      valorDiario: 320.00,
      disponivel: 4,
      descricao: "Guincho elétrico 15 toneladas"
    }
  ]

  const adicionarItem = () => {
    const equip = equipamentos.find(e => e.id === equipamentoSelecionado)
    if (!equip || quantidade <= 0 || diasLocacao <= 0) return

    const novoItem: ItemOrcamento = {
      equipamento: equip,
      quantidade: quantidade,
      dias: diasLocacao,
      subtotal: equip.valorDiario * quantidade * diasLocacao
    }

    setItens([...itens, novoItem])
    setEquipamentoSelecionado("")
    setQuantidade(1)
    setDiasLocacao(1)
  }

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index))
  }

  const calcularTotal = () => {
    const subtotal = itens.reduce((acc, item) => acc + item.subtotal, 0)
    const valorDesconto = (subtotal * desconto) / 100
    return {
      subtotal,
      desconto: valorDesconto,
      total: subtotal - valorDesconto
    }
  }

  const totais = calcularTotal()

  const gerarOrcamento = () => {
    // Aqui implementaria a geração do PDF e envio
    console.log("Gerando orçamento...")
    alert("Orçamento gerado com sucesso! (Em produção enviaria por email)")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            📋 Novo Orçamento
          </h1>
          <p className="text-gray-600 mt-1">Crie uma proposta personalizada para o cliente</p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            className="hover:scale-105 transition-transform"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Rascunho
          </Button>
          <Button 
            variant="outline"
            className="hover:scale-105 transition-transform"
          >
            <Eye className="w-4 h-4 mr-2" />
            Visualizar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário Principal */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Seleção de Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-500" />
                Informações do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4">
                <Button
                  variant={tipoCliente === "existente" ? "default" : "outline"}
                  onClick={() => setTipoCliente("existente")}
                  className="hover:scale-105 transition-transform"
                >
                  Cliente Existente
                </Button>
                <Button
                  variant={tipoCliente === "novo" ? "default" : "outline"}
                  onClick={() => setTipoCliente("novo")}
                  className="hover:scale-105 transition-transform"
                >
                  Novo Cliente
                </Button>
              </div>

              {tipoCliente === "existente" ? (
                <div>
                  <Label htmlFor="cliente">Selecionar Cliente</Label>
                  <Select 
                    value={cliente} 
                    onChange={(e) => setCliente(e.target.value)}
                    className="hover:border-blue-400 transition-colors"
                  >
                    <option value="">Escolha um cliente...</option>
                    {clientes.map((cli) => (
                      <option key={cli.id} value={cli.id}>
                        {cli.nome} - {cli.email} • {cli.telefone}
                      </option>
                    ))}
                  </Select>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nome">Nome/Razão Social</Label>
                    <Input
                      id="nome"
                      value={novoCliente.nome}
                      onChange={(e) => setNovoCliente({...novoCliente, nome: e.target.value})}
                      placeholder="Digite o nome..."
                      className="hover:border-blue-400 transition-colors"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cnpj">CNPJ/CPF</Label>
                    <Input
                      id="cnpj"
                      value={novoCliente.cnpj}
                      onChange={(e) => setNovoCliente({...novoCliente, cnpj: e.target.value})}
                      placeholder="000.000.000-00"
                      className="hover:border-blue-400 transition-colors"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={novoCliente.email}
                      onChange={(e) => setNovoCliente({...novoCliente, email: e.target.value})}
                      placeholder="email@exemplo.com"
                      className="hover:border-blue-400 transition-colors"
                    />
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input
                      id="telefone"
                      value={novoCliente.telefone}
                      onChange={(e) => setNovoCliente({...novoCliente, telefone: e.target.value})}
                      placeholder="(11) 99999-9999"
                      className="hover:border-blue-400 transition-colors"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={novoCliente.endereco}
                      onChange={(e) => setNovoCliente({...novoCliente, endereco: e.target.value})}
                      placeholder="Endereço completo..."
                      className="hover:border-blue-400 transition-colors"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Seleção de Equipamentos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-500" />
                Adicionar Equipamentos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="equipamento">Equipamento</Label>
                  <Select 
                    value={equipamentoSelecionado} 
                    onChange={(e) => setEquipamentoSelecionado(e.target.value)}
                    className="hover:border-blue-400 transition-colors"
                  >
                    <option value="">Escolha um equipamento...</option>
                    {equipamentos.map((equip) => (
                      <option key={equip.id} value={equip.id}>
                        {equip.nome} - R$ {equip.valorDiario.toFixed(2)}/dia • {equip.disponivel} disponível
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="quantidade">Quantidade</Label>
                  <Input
                    id="quantidade"
                    type="number"
                    min="1"
                    value={quantidade}
                    onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                    className="hover:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <Label htmlFor="dias">Dias</Label>
                  <Input
                    id="dias"
                    type="number"
                    min="1"
                    value={diasLocacao}
                    onChange={(e) => setDiasLocacao(parseInt(e.target.value) || 1)}
                    className="hover:border-blue-400 transition-colors"
                  />
                </div>
              </div>
              <Button 
                onClick={adicionarItem}
                className="hover:scale-105 hover:shadow-md transition-all duration-200"
                disabled={!equipamentoSelecionado}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Itens */}
          {itens.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-purple-500" />
                  Itens do Orçamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {itens.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-all duration-200">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.equipamento.nome}</h4>
                        <p className="text-sm text-gray-600">
                          {item.quantidade}x • {item.dias} dias • R$ {item.equipamento.valorDiario.toFixed(2)}/dia
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="font-bold text-lg">
                          R$ {item.subtotal.toFixed(2)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removerItem(index)}
                          className="hover:bg-red-50 hover:border-red-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="w-5 h-5 mr-2 text-orange-500" />
                Observações e Condições
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="desconto">Desconto (%)</Label>
                  <Input
                    id="desconto"
                    type="number"
                    min="0"
                    max="100"
                    value={desconto}
                    onChange={(e) => setDesconto(parseFloat(e.target.value) || 0)}
                    className="hover:border-blue-400 transition-colors"
                  />
                </div>
                <div>
                  <Label htmlFor="observacoes">Observações</Label>
                  <Textarea
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Condições especiais, prazos de entrega, etc..."
                    className="hover:border-blue-400 transition-colors"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Resumo e Totais */}
        <div className="space-y-6">
          <Card className="sticky top-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-green-500" />
                Resumo do Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Resumo dos Itens */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Equipamentos:</h4>
                {itens.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="truncate mr-2">{item.equipamento.nome}</span>
                    <span>R$ {item.subtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">R$ {totais.subtotal.toFixed(2)}</span>
                </div>
                
                {desconto > 0 && (
                  <div className="flex justify-between text-orange-600">
                    <span>Desconto ({desconto}%):</span>
                    <span>-R$ {totais.desconto.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-lg font-bold pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-green-600">R$ {totais.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="text-sm text-gray-600 space-y-1">
                <p>📅 Prazo de validade: 15 dias</p>
                <p>🚚 Entrega: A combinar</p>
                <p>💳 Pagamento: À vista ou parcelado</p>
              </div>

              {/* Ações */}
              <div className="space-y-2 pt-4">
                <Button 
                  onClick={gerarOrcamento}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 hover:shadow-lg transition-all duration-200"
                  disabled={itens.length === 0 || (!cliente && tipoCliente === "existente") || (tipoCliente === "novo" && !novoCliente.nome)}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Gerar e Enviar Orçamento
                </Button>
                
                <Button 
                  variant="outline"
                  className="w-full hover:bg-blue-50 hover:border-blue-400 transition-colors"
                  disabled={itens.length === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Rascunho
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informações de Ajuda */}
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <h4 className="font-medium text-blue-900 mb-2">💡 Dicas Rápidas:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Adicione observações para condições especiais</li>
                <li>• O prazo padrão de validade é 15 dias</li>
                <li>• Descontos são aplicados no valor total</li>
                <li>• O cliente receberá o orçamento por email</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
