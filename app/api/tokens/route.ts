import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for tokens (will reset on deploy, use database for production)
const tokens: any[] = []

export async function GET() {
  return NextResponse.json({ tokens })
}

export async function POST(request: NextRequest) {
  try {
    const token = await request.json()
    
    // Check if token already exists
    const exists = tokens.find(t => t.mintAddress === token.mintAddress)
    if (!exists) {
      tokens.push({
        ...token,
        createdAt: new Date().toISOString()
      })
    }
    
    return NextResponse.json({ success: true, token })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid token data' }, { status: 400 })
  }
}
