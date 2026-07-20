import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Sem as variáveis de ambiente, o app roda em modo demonstração (sem backend). */
export const modoDemo = !url || !anonKey

export const supabase: SupabaseClient | null = modoDemo ? null : createClient(url!, anonKey!)
