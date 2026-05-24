import { Connection, PublicKey } from '@solana/web3.js'

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'

// Pump.fun program IDs
const PUMP_FUN_PROGRAM = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P')
const PUMP_FUN_ACCOUNT = new PublicKey('Ce6TQqeHC9p8KetsN6JsjHK7UTZkNUvlXxWLfVU7S9B9')

// Bonding curve seeds
const BONDING_CURVE_SEED = 'bonding-curve'

export interface BondingCurveData {
  virtualSolReserves: number
  virtualTokenReserves: number
  realSolReserves: number
  realTokenReserves: number
  tokenTotalSupply: number
  complete: boolean
}

// Derive bonding curve PDA for a token
export function getBondingCurvePDA(mint: PublicKey): PublicKey {
  const [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from(BONDING_CURVE_SEED), mint.toBuffer()],
    PUMP_FUN_PROGRAM
  )
  return bondingCurve
}

// Fetch bonding curve data directly from Solana
export async function getBondingCurveData(mintAddress: string): Promise<BondingCurveData | null> {
  try {
    const connection = new Connection(RPC_URL, 'confirmed')
    const mint = new PublicKey(mintAddress)
    const bondingCurvePDA = getBondingCurvePDA(mint)
    
    console.log('Fetching bonding curve for:', mintAddress)
    console.log('Bonding curve PDA:', bondingCurvePDA.toString())
    
    const accountInfo = await connection.getAccountInfo(bondingCurvePDA)
    
    if (!accountInfo) {
      console.log('No bonding curve found for:', mintAddress)
      return null
    }
    
    // Parse bonding curve data
    // Account layout: discriminator (8) + virtualSolReserves (8) + virtualTokenReserves (8) + 
    //                 realSolReserves (8) + realTokenReserves (8) + tokenTotalSupply (8) + complete (1)
    const data = accountInfo.data
    
    // Skip 8 byte discriminator
    let offset = 8
    
    // Read u64 values (8 bytes each, little-endian)
    const virtualSolReserves = Number(data.readBigUInt64LE(offset)) / 1e9
    offset += 8
    
    const virtualTokenReserves = Number(data.readBigUInt64LE(offset)) / 1e6
    offset += 8
    
    const realSolReserves = Number(data.readBigUInt64LE(offset)) / 1e9
    offset += 8
    
    const realTokenReserves = Number(data.readBigUInt64LE(offset)) / 1e6
    offset += 8
    
    const tokenTotalSupply = Number(data.readBigUInt64LE(offset)) / 1e6
    offset += 8
    
    const complete = data[offset] === 1
    
    const result: BondingCurveData = {
      virtualSolReserves,
      virtualTokenReserves,
      realSolReserves,
      realTokenReserves,
      tokenTotalSupply,
      complete
    }
    
    console.log('Bonding curve data:', result)
    return result
    
  } catch (e) {
    console.error('Error fetching bonding curve:', e)
    return null
  }
}

// Calculate price from bonding curve
export function calculateBondingCurvePrice(curve: BondingCurveData): number {
  if (curve.virtualTokenReserves === 0) return 0
  return curve.virtualSolReserves / curve.virtualTokenReserves
}

// Calculate market cap in SOL
export function calculateMarketCapSOL(curve: BondingCurveData): number {
  const price = calculateBondingCurvePrice(curve)
  return price * curve.tokenTotalSupply
}
