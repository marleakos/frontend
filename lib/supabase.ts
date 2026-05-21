import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

console.log('Supabase URL:', supabaseUrl ? 'Set' : 'Not set')
console.log('Supabase Key:', supabaseKey ? 'Set' : 'Not set')

// Only create client if both URL and key are provided
export const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

if (!supabase) {
  console.warn('Supabase not configured - tokens will not persist!')
}

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
    console.log('Supabase not configured, skipping save')
    return null
  }
  
  console.log('Saving token to Supabase:', token.mint_address)
  
  try {
    const { data, error } = await supabase
      .from('tokens')
      .insert([token])
      .select()
    
    if (error) {
      console.error('Supabase insert error:', error)
      throw error
    }
    console.log('Token saved successfully:', data)
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

  console.log('Fetching tokens from Supabase...')

  try {
    const { data, error } = await supabase
      .from('tokens')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase select error:', error)
      throw error
    }
    console.log('Fetched tokens:', data?.length || 0)
    return data || []
  } catch (e) {
    console.error('Error fetching tokens:', e)
    return []
  }
}
