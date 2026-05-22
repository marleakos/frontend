// Fetch pump.fun token data from their API
// This is more reliable than parsing on-chain data

export interface PumpFunToken {
  mint: string
  name: string
  symbol: string
  description: string
  image_uri: string
  video_uri: string | null
  metadata_uri: string
  twitter: string | null
  telegram: string | null
  bonding_curve: string
  associated_bonding_curve: string
  creator: string
  created_timestamp: number
  raydium_pool: string | null
  complete: boolean
  virtual_sol_reserves: number
  virtual_token_reserves: number
  total_supply: number
  website: string | null
  show_name: boolean
  king_of_the_hill_timestamp: number | null
  market_cap: number
  reply_count: number
  last_reply: number
  nsfw: boolean
  market_id: string | null
  inverted: boolean | null
  is_banned: boolean
  is_pump_swap: boolean
}

export interface BondingCurveData {
  virtualSolReserves: number
  virtualTokenReserves: number
  realSolReserves: number
  realTokenReserves: number
  tokenTotalSupply: number
  complete: boolean
  price: number
  marketCap: number
  progress: number
}

// Fetch token data from pump.fun API
export async function getPumpFunToken(mintAddress: string): Promise<PumpFunToken | null> {
  try {
    const response = await fetch(`https://frontend-api.pump.fun/coins/${mintAddress}`, {
      headers: {
        'Accept': 'application/json',
      }
    })
    
    if (!response.ok) {
      console.log('Token not found on pump.fun:', mintAddress)
      return null
    }
    
    const data = await response.json()
    console.log('Pump.fun API data:', data)
    return data
  } catch (e) {
    console.error('Error fetching from pump.fun API:', e)
    return null
  }
}

// Get bonding curve data from pump.fun API
export async function getBondingCurveData(
  mintAddress: string,
  _rpcUrl?: string
): Promise<BondingCurveData | null> {
  try {
    const token = await getPumpFunToken(mintAddress)
    
    if (!token) {
      return null
    }
    
    // Use pump.fun's market cap directly
    const marketCap = token.market_cap || 0
    const complete = token.complete || false
    
    // Calculate price from reserves
    const virtualSolReserves = token.virtual_sol_reserves || 0
    const virtualTokenReserves = token.virtual_token_reserves || 0
    const totalSupply = token.total_supply || 0
    
    // Price in SOL per token
    const price = virtualTokenReserves > 0 
      ? (virtualSolReserves / 1e9) / (virtualTokenReserves / 1e6)
      : 0
    
    // Progress to graduation (69k USD market cap)
    const progress = Math.min(100, Math.floor((marketCap / 69000) * 100))
    
    console.log('Bonding curve data from API:', {
      price,
      marketCap,
      complete,
      progress,
      raw_market_cap: token.market_cap,
      virtual_sol: virtualSolReserves,
      virtual_token: virtualTokenReserves
    })
    
    return {
      virtualSolReserves,
      virtualTokenReserves,
      realSolReserves: 0,
      realTokenReserves: 0,
      tokenTotalSupply: totalSupply,
      complete,
      price,
      marketCap,
      progress
    }
  } catch (e) {
    console.error('Error fetching bonding curve:', e)
    return null
  }
}
