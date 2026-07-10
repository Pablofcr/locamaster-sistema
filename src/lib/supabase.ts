import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'ATENÇÃO: variáveis do Supabase não configuradas ' +
      '(NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). ' +
      'Configure-as no .env.local (local) ou nas Environment Variables da Vercel.'
  )
}

// Blindagem: usa placeholders válidos como fallback para o createClient não
// lançar "supabaseUrl is required." e derrubar o build (prerender) quando as
// variáveis estiverem ausentes. Em produção as variáveis reais são injetadas.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
)
