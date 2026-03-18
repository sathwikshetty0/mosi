import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 🛡️ DEFENSIVE: Ensure URL is valid before creating client
const isValidUrl = (url: string) => {
  try {
    return (url.startsWith('https://') || url.startsWith('http://')) && url.includes('.supabase.co')
  } catch {
    return false
  }
}

let supabaseClient: any = null

if (isValidUrl(supabaseUrl) && supabaseAnonKey && !supabaseAnonKey.includes('your-anon-key')) {
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('Supabase credentials missing or invalid. Cloud sync disabled.')
}

export const supabase = supabaseClient
