import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Only create client if both URL and key are provided
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

export interface TokenRecord {
  id?: string
  mint_address: string
  name: string
  symbol: string
  leverage: number
  direction: string
  underlying: string
  creator: string
  created_at?: string
}

export async function saveToken(token: TokenRecord) {
  if (!supabase) {
    console.log('Supabase not configured, skipping')
    return null
  }
  
  try {
    const { data, error } = await supabase
      .from('tokens')
      .insert([token])
      .select()
    
    if (error) throw error
    return data
  } catch (e) {
    console.error('Error saving token:', e)
    return null
  }
}

export async function getAllTokens() {
  if (!supabase) {
    console.log('Supabase not configured, returning empty')
    return []
  }

  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (e) {
    console.error('Error fetching tokens:', e)
    return []
  }
}
