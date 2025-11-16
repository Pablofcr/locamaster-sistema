import { toast as hotToast, Toaster } from 'react-hot-toast'
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react'

// Custom toast component for better styling
const CustomToast = ({ type, message }: { type: 'success' | 'error' | 'warning' | 'info', message: string }) => {
  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-500" />,
    error: <XCircle className="h-5 w-5 text-red-500" />,
    warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    info: <Info className="h-5 w-5 text-blue-500" />
  }

  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    warning: 'bg-yellow-50 border-yellow-200',
    info: 'bg-blue-50 border-blue-200'
  }

  return (
    <div className={`flex items-center p-4 border rounded-lg shadow-lg ${bgColors[type]}`}>
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-800">{message}</p>
      </div>
    </div>
  )
}

// Main toast functions
export const toast = {
  success: (message: string) => {
    hotToast.custom(() => <CustomToast type="success" message={message} />, {
      duration: 4000,
      position: 'top-right'
    })
  },
  
  error: (message: string) => {
    hotToast.custom(() => <CustomToast type="error" message={message} />, {
      duration: 5000,
      position: 'top-right'
    })
  },
  
  warning: (message: string) => {
    hotToast.custom(() => <CustomToast type="warning" message={message} />, {
      duration: 4500,
      position: 'top-right'
    })
  },
  
  info: (message: string) => {
    hotToast.custom(() => <CustomToast type="info" message={message} />, {
      duration: 4000,
      position: 'top-right'
    })
  },

  // Specific use cases
  equipmentAdded: (name: string) => {
    toast.success(`Equipamento "${name}" foi adicionado com sucesso!`)
  },

  equipmentUpdated: (name: string) => {
    toast.success(`Equipamento "${name}" foi atualizado!`)
  },

  equipmentDeleted: (name: string) => {
    toast.info(`Equipamento "${name}" foi removido`)
  },

  customerAdded: (name: string) => {
    toast.success(`Cliente "${name}" foi cadastrado!`)
  },

  customerUpdated: (name: string) => {
    toast.success(`Dados do cliente "${name}" foram atualizados!`)
  },

  rentalCreated: (customer: string) => {
    toast.success(`Nova locação criada para ${customer}`)
  },

  invoiceGenerated: (number: string) => {
    toast.success(`Fatura ${number} gerada com sucesso!`)
  },

  paymentReceived: (amount: string) => {
    toast.success(`Pagamento de ${amount} confirmado!`)
  },

  maintenanceScheduled: (equipment: string, date: string) => {
    toast.info(`Manutenção agendada para ${equipment} em ${date}`)
  },

  // Loading states
  loading: (message: string = 'Carregando...') => {
    return hotToast.loading(message, {
      style: {
        borderRadius: '8px',
        background: '#f3f4f6',
        color: '#374151'
      }
    })
  },

  // Dismiss functions
  dismiss: (toastId?: string) => {
    hotToast.dismiss(toastId)
  },

  // Promise-based toasts for async operations
  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string
      error: string
    }
  ): Promise<T> => {
    return hotToast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error
    }, {
      style: {
        borderRadius: '8px',
        background: '#fff',
        color: '#374151',
        border: '1px solid #e5e7eb'
      },
      success: {
        duration: 4000,
        iconTheme: {
          primary: '#10b981',
          secondary: '#fff'
        }
      },
      error: {
        duration: 5000,
        iconTheme: {
          primary: '#ef4444',
          secondary: '#fff'
        }
      }
    })
  }
}

// Toast container component to be added to app layout
export const ToastContainer = () => {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#374151',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '16px'
        },
        success: {
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff'
          }
        },
        error: {
          iconTheme: {
            primary: '#ef4444', 
            secondary: '#fff'
          }
        }
      }}
      containerStyle={{
        top: 20,
        right: 20
      }}
    />
  )
}

// Hook for toast notifications
export const useToast = () => {
  return toast
}

// Utility function for handling API responses with toast
export const handleApiResponse = async <T,>(
  apiCall: () => Promise<T>,
  options: {
    loadingMessage?: string
    successMessage?: string
    errorMessage?: string
    onSuccess?: (data: T) => void
    onError?: (error: any) => void
  } = {}
) => {
  const {
    loadingMessage = 'Processando...',
    successMessage = 'Operação realizada com sucesso!',
    errorMessage = 'Ocorreu um erro. Tente novamente.',
    onSuccess,
    onError
  } = options

  try {
    const promise = apiCall()
    
    const result = await toast.promise(promise, {
      loading: loadingMessage,
      success: successMessage,
      error: errorMessage
    })

    if (onSuccess) {
      onSuccess(result)
    }

    return result
  } catch (error) {
    console.error('API Error:', error)
    
    if (onError) {
      onError(error)
    }
    
    throw error
  }
}

// Notification types for different contexts
export const notifications = {
  equipment: {
    added: (name: string) => toast.equipmentAdded(name),
    updated: (name: string) => toast.equipmentUpdated(name),
    deleted: (name: string) => toast.equipmentDeleted(name),
    maintenanceAlert: (name: string) => toast.warning(`${name} precisa de manutenção!`),
    rented: (name: string, customer: string) => toast.success(`${name} foi locado para ${customer}`),
    returned: (name: string) => toast.info(`${name} foi devolvido`)
  },
  
  customer: {
    added: (name: string) => toast.customerAdded(name),
    updated: (name: string) => toast.customerUpdated(name),
    creditAlert: (name: string) => toast.warning(`Cliente ${name} excedeu limite de crédito`),
    paymentOverdue: (name: string) => toast.error(`Pagamento em atraso: ${name}`)
  },
  
  rental: {
    created: (customer: string) => toast.rentalCreated(customer),
    extended: (customer: string) => toast.info(`Locação de ${customer} foi prorrogada`),
    finished: (customer: string) => toast.success(`Locação de ${customer} finalizada`),
    overdue: (customer: string) => toast.warning(`Locação de ${customer} está em atraso`)
  },
  
  financial: {
    invoiceGenerated: (number: string) => toast.invoiceGenerated(number),
    paymentReceived: (amount: string) => toast.paymentReceived(amount),
    paymentOverdue: (amount: string) => toast.error(`Pagamento em atraso: ${amount}`),
    creditLimitExceeded: () => toast.warning('Limite de crédito excedido')
  },
  
  system: {
    backupCompleted: () => toast.success('Backup realizado com sucesso!'),
    updateAvailable: () => toast.info('Nova atualização disponível'),
    maintenanceMode: () => toast.warning('Sistema entrará em manutenção às 02:00'),
    connectionLost: () => toast.error('Conexão perdida. Tentando reconectar...'),
    connectionRestored: () => toast.success('Conexão restaurada!')
  }
}
