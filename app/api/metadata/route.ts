import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const uri = searchParams.get('uri')
  
  if (!uri) {
    return NextResponse.json({ error: 'No URI provided' }, { status: 400 })
  }
  
  try {
    // Try multiple IPFS gateways
    const gateways = [
      uri,
      uri.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/'),
      uri.replace('ipfs://', 'https://cloudflare-ipfs.com/ipfs/'),
      uri.replace('ipfs://', 'https://ipfs.io/ipfs/')
    ]
    
    for (const url of gateways) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)
        
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' }
        })
        
        clearTimeout(timeoutId)
        
        if (response.ok) {
          const metadata = await response.json()
          return NextResponse.json(metadata)
        }
      } catch (e) {
        console.log('Gateway failed:', url)
        continue
      }
    }
    
    return NextResponse.json({ error: 'All gateways failed' }, { status: 500 })
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch metadata' }, { status: 500 })
  }
}
