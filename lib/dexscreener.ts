// DexScreener API - Free, no API key needed
// Docs: https://docs.dexscreener.com/

export interface DexScreenerPair {
  chainId: string
  dexId: string
  url: string
  pairAddress: string
  baseToken: {
    address: string
    name: string
    symbol: string
  }
  quoteToken: {
    address: string
    name: string
    symbol: string
  }
  priceNative: string
  priceUsd: string
  txns: {
    m5: { buys: number; sells: number }
    h1: { buys: number; sells: number }
    h6: { buys: number; sells: number }
    h24: { buys: number; sells: number }
  }
  volume: {
    h24: number
    h6: number
    h1: number
    m5: number
  }
  priceChange: {
    m5: number
    h1: number
    h6: number
    h24: number
  }
  fdv: number
  marketCap: number
}

export interface DexScreenerResponse {
  schemaVersion: string
  pairs: DexScreenerPair[]
}

// Get token data by mint address
export async function getTokenData(mintAddress: string): Promise<DexScreenerPair | null> {
  try {
    // DexScreener API endpoint for Solana tokens
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`, {
      headers: { 'Accept': 'application/json' }
    })
    
    if (!response.ok) {
      console.log('DexScreener API error:', response.status)
      return null
    }
    
    const data: DexScreenerResponse = await response.json()
    
    if (!data.pairs || data.pairs.length === 0) {
      console.log('No pairs found for', mintAddress)
      return null
    }
    
    // Find pump.fun pair if available, otherwise first pair
    const pair = data.pairs.find(p => p.dexId === 'pumpfun') || data.pairs[0]
    
    console.log('DexScreener data for', mintAddress, {
      priceUsd: pair.priceUsd,
      marketCap: pair.marketCap,
      volume24h: pair.volume.h24,
      priceChange24h: pair.priceChange.h24
    })
    
    return pair
  } catch (e) {
    console.error('Error fetching from DexScreener:', e)
    return null
  }
}

// Get multiple tokens data
export async function getMultipleTokensData(mintAddresses: string[]): Promise<Map<string, DexScreenerPair>> {
  const results = new Map<string, DexScreenerPair>()
  
  // Fetch in parallel
  const promises = mintAddresses.map(async (mint) => {
    const data = await getTokenData(mint)
    if (data) {
      results.set(mint, data)
    }
  })
  
  await Promise.all(promises)
  return results
}
