// Vanity address generator for pump.fun tokens
// Simplified version - uses short prefixes for faster generation

import { Keypair } from "@solana/web3.js"

// Short 1-2 character prefixes that are much easier to find
const DIRECTION_PREFIX: Record<string, string> = {
  LONG: "L",
  SHORT: "S",
}

const LEVERAGE_PREFIX: Record<number, string> = {
  2: "2",
  3: "3", 
  5: "5",
  10: "X",
}

const ASSET_PREFIX: Record<string, string> = {
  SOL: "S",
  BTC: "B",
  ETH: "E",
  APT: "A",
  ARB: "R",
  DOGE: "D",
  BNB: "N",
  SUI: "U",
  BONK: "K",
  MATIC: "M",
}

/**
 * Generate a vanity address with a short 2-3 character prefix
 * Much faster than long word patterns
 * 
 * Examples:
 * - LONG 5x SOL -> "L5S..."
 * - SHORT 10x BTC -> "SXB..."
 */
export async function generateVanityAddress(
  direction: "LONG" | "SHORT",
  leverage: number,
  asset: string,
  maxAttempts: number = 50000
): Promise<Keypair> {
  // Build short prefix: L5S, SXB, etc.
  const prefix = `${DIRECTION_PREFIX[direction]}${LEVERAGE_PREFIX[leverage]}${ASSET_PREFIX[asset] || asset[0]}`.toLowerCase()
  
  console.log(`Generating vanity address with prefix: ${prefix}...`)
  
  // Use setTimeout to yield control and prevent UI blocking
  return new Promise((resolve, reject) => {
    let attempts = 0
    const startTime = Date.now()
    
    const tryGenerate = () => {
      // Process in batches of 500 for faster generation
      for (let i = 0; i < 500; i++) {
        if (attempts >= maxAttempts) {
          reject(new Error(`Could not find vanity address with prefix ${prefix} after ${maxAttempts} attempts`))
          return
        }
        
        const keypair = Keypair.generate()
        const address = keypair.publicKey.toBase58()
        
        if (address.toLowerCase().startsWith(prefix)) {
          const elapsed = (Date.now() - startTime) / 1000
          console.log(`Found vanity address after ${attempts} attempts (${elapsed.toFixed(2)}s): ${address}`)
          resolve(keypair)
          return
        }
        
        attempts++
      }
      
      // Schedule next batch
      setTimeout(tryGenerate, 0)
    }
    
    tryGenerate()
  })
}

/**
 * Generate a regular address (no vanity) - instant
 */
export function generateRegularAddress(): Keypair {
  return Keypair.generate()
}

/**
 * Get the expected address prefix for display
 */
export function getExpectedPrefix(
  direction: "LONG" | "SHORT",
  leverage: number,
  asset: string
): string {
  return `${DIRECTION_PREFIX[direction]}${LEVERAGE_PREFIX[leverage]}${ASSET_PREFIX[asset] || asset[0]}`
}

// Export for use in create page
export { DIRECTION_PREFIX, LEVERAGE_PREFIX, ASSET_PREFIX }
