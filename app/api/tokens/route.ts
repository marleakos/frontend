import { NextRequest, NextResponse } from 'next/server'
import { getAllTokens, saveToken } from '@/lib/supabase'

// Fallback in-memory storage (used when Supabase is not configured)
const memoryTokens: any[] = []

export async function GET() {
  // Try Supabase first
  const dbTokens = await getAllTokens()
  
  // If Supabase has data, use it
  if (dbTokens.length > 0) {
    return NextResponse.json({ tokens: dbTokens })
  }
  
  // Fallback to memory
  return NextResponse.json({ tokens: memoryTokens })
}

export async function POST(request: NextRequest) {
  try {
    const token = await request.json()
    
    // Check if token already exists in memory
    const exists = memoryTokens.find(t => t.mintAddress === token.mintAddress)
    if (!exists) {
      const tokenData = {
        ...token,
        createdAt: new Date().toISOString()
      }
      
      // Add to memory
      memoryTokens.push(tokenData)
      
      // Try to save to Supabase
      await saveToken({
        mint_address: token.mintAddress,
        name: token.name,
        symbol: token.symbol,
        leverage: token.leverage,
        direction: token.direction,
        underlying: token.underlying,
        creator: token.creator
      })
    }
    
    return NextResponse.json({ success: true, token })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid token data' }, { status: 400 })
  }
}
