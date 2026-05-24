import { NextRequest, NextResponse } from 'next/server'
import { getAllTokens, saveToken } from '@/lib/supabase'

// Fallback in-memory storage (used when Supabase is not configured)
const memoryTokens: any[] = [
  // Main platform token - LEVERAGE PUMP
  {
    mintAddress: "EjwEjwaBeYrQ3dC1Pd7577Sj3nBYPrhoQQVxRjn7pump",
    name: "LEVERAGE PUMP",
    symbol: "PUMPX10",
    leverage: 10,
    direction: "LONG",
    underlying: "SOL",
    creator: "platform",
    createdAt: "2026-05-24T19:56:00Z",
    isPlatformToken: true,
    image: "https://i.imgur.com/GC2U90i.png"
  }
]

export async function GET() {
  // Try Supabase first
  const dbTokens = await getAllTokens()
  
  // If Supabase has data, normalize it to camelCase
  if (dbTokens.length > 0) {
    const normalizedTokens = dbTokens.map((t: any) => ({
      mintAddress: t.mint_address,
      name: t.name,
      symbol: t.symbol,
      leverage: t.leverage,
      direction: t.direction,
      underlying: t.underlying,
      creator: t.creator,
      createdAt: t.created_at
    }))
    return NextResponse.json({ tokens: normalizedTokens })
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
