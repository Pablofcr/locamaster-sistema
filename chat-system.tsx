"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/lib/notifications'
import {
  MessageSquare,
  Send,
  Paperclip,
  MoreVertical,
  Phone,
  Video,
  User,
  Bot,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Minimize2,
  Maximize2,
  HeadphonesIcon,
  MessageCircle,
  Smile,
  Image as ImageIcon
} from 'lucide-react'

interface Message {
  id: string
  content: string
  sender: 'user' | 'agent' | 'bot'
  timestamp: Date
  type: 'text' | 'image' | 'file' | 'system'
  status?: 'sending' | 'sent' | 'delivered' | 'read'
  attachments?: Array<{
    name: string
    url: string
    type: string
  }>
}

interface ChatAgent {
  id: string
  name: string
  avatar: string
  status: 'online' | 'away' | 'busy' | 'offline'
  department: string
}

const mockMessages: Message[] = [
  {
    id: '1',
    content: 'Olá! Como posso ajudá-lo hoje?',
    sender: 'agent',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    type: 'text',
    status: 'read'
  },
  {
    id: '2',
    content: 'Preciso de ajuda com uma locação de equipamento',
    sender: 'user',
    timestamp: new Date(Date.now() - 1000 * 60 * 4),
    type: 'text',
    status: 'read'
  },
  {
    id: '3',
    content: 'Claro! Qual equipamento você está interessado?',
    sender: 'agent',
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    type: 'text',
    status: 'read'
  }
]

const mockAgent: ChatAgent = {
  id: 'agent_001',
  name: 'Ana Silva',
  avatar: '/avatars/agent-ana.jpg',
  status: 'online',
  department: 'Atendimento'
}

const quickReplies = [
  'Preciso de uma cotação',
  'Qual o prazo de entrega?',
  'Como funciona a locação?',
  'Quais são os preços?',
  'Falar com vendas',
  'Suporte técnico'
]

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>(mockMessages)
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isAgentOnline, setIsAgentOnline] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const toast = useToast()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim()) return

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      content: newMessage,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
      status: 'sending'
    }

    setMessages(prev => [...prev, userMessage])
    setNewMessage('')

    // Simulate typing indicator
    setIsTyping(true)
    
    // Simulate agent response
    setTimeout(() => {
      setIsTyping(false)
      
      const agentResponse: Message = {
        id: `msg_${Date.now() + 1}`,
        content: generateAgentResponse(newMessage),
        sender: 'agent',
        timestamp: new Date(),
        type: 'text',
        status: 'sent'
      }
      
      setMessages(prev => [...prev, agentResponse])
      toast.info('Nova mensagem do atendimento')
    }, 2000)
  }

  const generateAgentResponse = (userMessage: string): string => {
    const responses = {
      cotacao: 'Posso sim te ajudar com uma cotação! Qual equipamento você precisa e por quanto tempo?',
      prazo: 'Nossos equipamentos podem ser entregues no mesmo dia para a região metropolitana.',
      preco: 'Nossos preços variam conforme o equipamento e período. Que tipo de equipamento você precisa?',
      default: 'Entendi. Deixe-me verificar isso para você. Em alguns instantes retorno com mais informações.'
    }

    const lowerMessage = userMessage.toLowerCase()
    
    if (lowerMessage.includes('cotação') || lowerMessage.includes('cotacao') || lowerMessage.includes('orçamento')) {
      return responses.cotacao
    } else if (lowerMessage.includes('prazo') || lowerMessage.includes('entrega')) {
      return responses.prazo
    } else if (lowerMessage.includes('preço') || lowerMessage.includes('preco') || lowerMessage.includes('valor')) {
      return responses.preco
    }
    
    return responses.default
  }

  const formatTimestamp = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const sendQuickReply = (reply: string) => {
    setNewMessage(reply)
    setTimeout(() => sendMessage(), 100)
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-gray-400" />
      case 'delivered':
        return <CheckCircle className="h-3 w-3 text-blue-400" />
      case 'read':
        return <CheckCircle className="h-3 w-3 text-green-400" />
      default:
        return null
    }
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-shadow bg-blue-600 hover:bg-blue-700"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
        
        {/* Notification bubble */}
        <div className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-xs text-white font-bold">3</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-80 transition-all duration-300 ${isMinimized ? 'h-14' : 'h-96'} shadow-xl`}>
        
        {/* Chat Header */}
        <CardHeader className="p-3 bg-blue-600 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="relative">
                <div className="h-8 w-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <HeadphonesIcon className="h-4 w-4" />
                </div>
                <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white
                  ${isAgentOnline ? 'bg-green-400' : 'bg-gray-400'}`} />
              </div>
              <div className="ml-3">
                <p className="font-medium text-sm">{mockAgent.name}</p>
                <p className="text-xs opacity-75">
                  {isAgentOnline ? 'Online' : 'Offline'} • {mockAgent.department}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0 text-white hover:bg-white hover:bg-opacity-20"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-6 w-6 p-0 text-white hover:bg-white hover:bg-opacity-20"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Chat Messages */}
            <CardContent className="p-0 h-64 overflow-y-auto bg-gray-50">
              <div className="p-3 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs ${
                      message.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-l-2xl rounded-tr-2xl rounded-br-sm' 
                        : 'bg-white text-gray-900 rounded-r-2xl rounded-tl-2xl rounded-bl-sm border'
                    } p-3 shadow-sm`}>
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className={`text-xs ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTimestamp(message.timestamp)}
                        </span>
                        {message.sender === 'user' && getStatusIcon(message.status)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-900 rounded-r-2xl rounded-tl-2xl rounded-bl-sm border p-3 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </CardContent>

            {/* Quick Replies */}
            <div className="px-3 py-2 bg-white border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {quickReplies.slice(0, 3).map((reply, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => sendQuickReply(reply)}
                    className="text-xs h-6 px-2"
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <div className="p-3 bg-white border-t border-gray-100 rounded-b-lg">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Paperclip className="h-4 w-4" />
                </Button>
                
                <div className="flex-1 flex">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Digite sua mensagem..."
                    className="rounded-r-none border-r-0 text-sm h-8"
                  />
                  <Button
                    onClick={sendMessage}
                    className="rounded-l-none h-8 px-3"
                    disabled={!newMessage.trim()}
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Smile className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}

// Support ticket system
interface SupportTicket {
  id: string
  title: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  createdAt: Date
  updatedAt: Date
  assignedTo?: string
  customer: {
    name: string
    email: string
    company: string
  }
}

export function SupportCenter() {
  const [tickets] = useState<SupportTicket[]>([
    {
      id: 'TICK-001',
      title: 'Problema com equipamento defeituoso',
      description: 'Betoneira apresentou problema no motor durante a locação',
      status: 'open',
      priority: 'high',
      category: 'Equipamento',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30),
      assignedTo: 'João Santos',
      customer: {
        name: 'Carlos Silva',
        email: 'carlos@construtora.com',
        company: 'Construtora ABC'
      }
    },
    {
      id: 'TICK-002',
      title: 'Dúvida sobre prazo de entrega',
      description: 'Preciso saber se é possível entregar no sábado',
      status: 'in_progress',
      priority: 'medium',
      category: 'Logística',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
      updatedAt: new Date(Date.now() - 1000 * 60 * 15),
      assignedTo: 'Maria Costa',
      customer: {
        name: 'Ana Paula',
        email: 'ana@obras.com',
        company: 'Obras & Cia'
      }
    }
  ])

  const getStatusBadge = (status: string) => {
    const badges = {
      open: 'bg-red-100 text-red-800',
      in_progress: 'bg-blue-100 text-blue-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      open: 'Aberto',
      in_progress: 'Em Andamento', 
      resolved: 'Resolvido',
      closed: 'Fechado'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const badges = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    }
    
    const labels = {
      low: 'Baixa',
      medium: 'Média',
      high: 'Alta',
      urgent: 'Urgente'
    }

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badges[priority as keyof typeof badges]}`}>
        {labels[priority as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Central de Suporte</h1>
          <p className="text-gray-600">Gerencie tickets e atendimento ao cliente</p>
        </div>
        <Button>
          <MessageCircle className="h-4 w-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tickets Abertos</p>
                <p className="text-2xl font-bold text-red-600">12</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-blue-600">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolvidos Hoje</p>
                <p className="text-2xl font-bold text-green-600">25</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HeadphonesIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
                <p className="text-2xl font-bold text-purple-600">2.5h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>Tickets Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div key={ticket.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-medium text-gray-900">{ticket.id}</span>
                      {getStatusBadge(ticket.status)}
                      {getPriorityBadge(ticket.priority)}
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{ticket.title}</h4>
                    <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span>Cliente: {ticket.customer.name}</span>
                      <span>Categoria: {ticket.category}</span>
                      <span>Atribuído: {ticket.assignedTo || 'Não atribuído'}</span>
                      <span>Criado: {ticket.createdAt.toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Widget Integration */}
      <ChatWidget />
    </div>
  )
}
