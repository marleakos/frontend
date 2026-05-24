// Fetch token data from multiple sources
// DexScreener as primary, pump.fun API as fallback

export interface TokenMarketData {
  price: number
  marketCap: number
  volume24h: number
  priceChange24h: number
  complete: boolean
}

// Fetch from DexScreener API
export async function getDexScreenerData(mintAddress: string): Promise<TokenMarketData | null> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`, {
      headers: { 'Accept': 'application/json' }
    })
    
    if (!response.ok) {
      console.log('DexScreener API error:', response.status)
      return null
    }
    
    const data = await response.json()
    
    if (!data.pairs || data.pairs.length === 0) {
      console.log('No pairs found on DexScreener for:', mintAddress)
      return null
    }
    
    // Get the pair with highest liquidity
    const pair = data.pairs.sort((a: any, b: any) => 
      (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0)
    )[0]
    
    const marketData: TokenMarketData = {
      price: parseFloat(pair.priceUsd) || 0,
      marketCap: pair.marketCap || 0,
      volume24h: pair.volume?.h24 || 0,
      priceChange24h: pair.priceChange?.h24 || 0,
      complete: pair.marketCap > 85000 || false
    }
    
    console.log('DexScreener data:', marketData)
    return marketData
  } catch (e) {
    console.error('Error fetching from DexScreener:', e)
    return null
  }
}

// Fetch token metadata from pump.fun (may fail due to CORS)
export async function getPumpFunToken(mintAddress: string): Promise<any | null> {
  try {
    const response = await fetch(`https://frontend-api.pump.fun/coins/${mintAddress}`, {
      headers: { 'Accept': 'application/json' },
      // Add cache control to prevent caching errors
      cache: 'no-cache'
    })
    
    if (!response.ok) {
      console.log('Pump.fun API returned:', response.status)
      return null
    }
    
    const data = await response.json()
    console.log('Pump.fun API data:', data)
    return data
  } catch (e) {
    console.log('Pump.fun API failed (CORS or network):', e)
    return null
  }
}

// Get comprehensive token data
export async function getTokenMarketData(mintAddress: string): Promise<TokenMarketData | null> {
  // Try DexScreener first
  const dexData = await getDexScreenerData(mintAddress)
  if (dexData && dexData.marketCap > 0) {
    return dexData
  }
  
  // Fallback: try to calculate from pump.fun bonding curve
  // This would require on-chain fetching which we can add later
  console.log('No market data available for:', mintAddress)
  return null
}

// Legacy function for compatibility
export async function getBondingCurveData(
  mintAddress: string,
  _rpcUrl?: string
): Promise<any | null> {
  return getTokenMarketData(mintAddress)
}
