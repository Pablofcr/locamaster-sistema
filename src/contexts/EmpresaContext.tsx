'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'

export interface Empresa {
  id: string
  razao_social: string
  nome_fantasia: string | null
  cnpj: string | null
  inscricao_estadual: string | null
  inscricao_municipal: string | null
  telefone: string | null
  email: string | null
  website: string | null
  logradouro: string | null
  numero: string | null
  complemento: string | null
  bairro: string | null
  cidade: string | null
  estado: string | null
  cep: string | null
  logo_base64: string | null
}

interface EmpresaContextValue {
  empresa: Empresa | null
  loading: boolean
  empresaConfigurada: boolean
  refreshEmpresa: () => Promise<void>
}

const EmpresaContext = createContext<EmpresaContextValue | null>(null)

export function useEmpresa() {
  const context = useContext(EmpresaContext)
  if (!context) {
    return {
      empresa: null,
      loading: true,
      empresaConfigurada: false,
      refreshEmpresa: async () => {}
    }
  }
  return context
}

export function EmpresaProvider({ children }: { children: ReactNode }) {
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchEmpresa = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('empresa')
        .select('*')
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao buscar empresa:', error)
      }

      setEmpresa(data || null)
    } catch (err) {
      console.error('Erro ao buscar empresa:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmpresa()
  }, [fetchEmpresa])

  const empresaConfigurada = !loading && empresa !== null

  return (
    <EmpresaContext.Provider value={{ empresa, loading, empresaConfigurada, refreshEmpresa: fetchEmpresa }}>
      {children}
    </EmpresaContext.Provider>
  )
}
