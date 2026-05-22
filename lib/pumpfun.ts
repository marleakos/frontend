// Fetch pump.fun bonding curve data directly from Solana
// This works for ALL tokens, even brand new ones

import { Connection, PublicKey } from '@solana/web3.js'

const PUMP_PROGRAM = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P')

// Bonding curve account layout (from pump.fun SDK)
// Discriminator (8) + virtualSolReserves (8) + virtualTokenReserves (8) + realSolReserves (8) + realTokenReserves (8) + tokenTotalSupply (8) + complete (1)

export interface BondingCurveData {
  virtualSolReserves: number
  virtualTokenReserves: number
  realSolReserves: number
  realTokenReserves: number
  tokenTotalSupply: number
  complete: boolean
  // Calculated fields
  price: number // Price in SOL per token
  marketCap: number // Market cap in USD
  progress: number // Progress to graduation (0-100)
}

export async function getBondingCurveData(
  mintAddress: string,
  rpcUrl?: string
): Promise<BondingCurveData | null> {
  try {
    // Use provided RPC, env variable, or fallback to public RPC
    const finalRpcUrl = rpcUrl || process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
    console.log('Using RPC:', finalRpcUrl)
    const connection = new Connection(finalRpcUrl, 'confirmed')
    const mint = new PublicKey(mintAddress)
    
    // Derive bonding curve PDA
    const [bondingCurve] = PublicKey.findProgramAddressSync(
      [Buffer.from('bonding-curve'), mint.toBuffer()],
      PUMP_PROGRAM
    )
    
    console.log('Fetching bonding curve:', bondingCurve.toString())
    
    const accountInfo = await connection.getAccountInfo(bondingCurve)
    
    if (!accountInfo) {
      console.log('No bonding curve found for', mintAddress)
      return null
    }
    
    console.log('Account data length:', accountInfo.data.length)
    
    // Parse the account data
    const data = accountInfo.data
    
    // Check minimum size (8 discriminator + 41 bytes of data)
    if (data.length < 49) {
      console.log('Account data too short:', data.length)
      return null
    }
    
    let offset = 8 // Skip discriminator
    
    const virtualSolReserves = Number(data.readBigUInt64LE(offset))
    offset += 8
    const virtualTokenReserves = Number(data.readBigUInt64LE(offset))
    offset += 8
    const realSolReserves = Number(data.readBigUInt64LE(offset))
    offset += 8
    const realTokenReserves = Number(data.readBigUInt64LE(offset))
    offset += 8
    const tokenTotalSupply = Number(data.readBigUInt64LE(offset))
    offset += 8
    const complete = data[offset] === 1
    
    // Calculate price: virtualSolReserves / virtualTokenReserves (in lamports per base token)
    // Pump.fun uses 6 decimals for tokens, 9 for SOL
    const price = virtualTokenReserves > 0 
      ? (virtualSolReserves / 1e9) / (virtualTokenReserves / 1e6)
      : 0
    
    // Calculate market cap
    // Total supply * price in SOL * SOL price in USD (~$150)
    const solPrice = 150
    const marketCap = (tokenTotalSupply / 1e6) * price * solPrice
    
    // Progress to graduation (69k USD)
    const progress = Math.min(100, Math.floor((marketCap / 69000) * 100))
    
    console.log('Bonding curve data:', {
      virtualSolReserves: virtualSolReserves / 1e9,
      virtualTokenReserves: virtualTokenReserves / 1e6,
      price,
      marketCap,
      complete
    })
    
    return {
      virtualSolReserves,
      virtualTokenReserves,
      realSolReserves,
      realTokenReserves,
      tokenTotalSupply,
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
