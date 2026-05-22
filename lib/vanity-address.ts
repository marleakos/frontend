// Vanity address generator for pump.fun tokens
// Creates addresses starting with direction + leverage + asset

import { Keypair } from "@solana/web3.js"

const DIRECTION_PREFIX: Record<string, string> = {
  LONG: "L",
  SHORT: "S",
}

const LEVERAGE_PREFIX: Record<number, string> = {
  2: "2",
  3: "3",
  5: "5",
  10: "X", // X for 10x
}

export const ASSET_PREFIX: Record<string, string> = {
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
 * Generate a vanity address that starts with the pattern:
 * {Direction}{Leverage}{Asset}...
 * 
 * Examples:
 * - LONG 5x SOL -> "L5S..."
 * - SHORT 10x BTC -> "SXB..."
 */
export async function generateVanityAddress(
  direction: "LONG" | "SHORT",
  leverage: number,
  asset: string,
  maxAttempts: number = 100000
): Promise<Keypair> {
  const prefix = `${DIRECTION_PREFIX[direction]}${LEVERAGE_PREFIX[leverage]}${ASSET_PREFIX[asset] || asset[0]}`.toLowerCase()
  
  console.log(`Generating vanity address with prefix: ${prefix}...`)
  
  let attempts = 0
  const startTime = Date.now()
  
  while (attempts < maxAttempts) {
    const keypair = Keypair.generate()
    const address = keypair.publicKey.toBase58()
    
    if (address.toLowerCase().startsWith(prefix)) {
      const elapsed = (Date.now() - startTime) / 1000
      console.log(`Found vanity address after ${attempts} attempts (${elapsed.toFixed(2)}s): ${address}`)
      return keypair
    }
    
    attempts++
    
    // Log progress every 10000 attempts
    if (attempts % 10000 === 0) {
      console.log(`Attempts: ${attempts}...`)
    }
  }
  
  console.log(`Could not find vanity address with prefix ${prefix} after ${maxAttempts} attempts`)
  throw new Error(`Could not generate vanity address with prefix ${prefix}. Try again or use a shorter prefix.`)
}

/**
 * Generate a vanity address with a custom prefix
 */
export async function generateCustomVanityAddress(
  prefix: string,
  maxAttempts: number = 100000
): Promise<Keypair> {
  const cleanPrefix = prefix.toLowerCase()
  
  console.log(`Generating vanity address with custom prefix: ${cleanPrefix}...`)
  
  let attempts = 0
  const startTime = Date.now()
  
  while (attempts < maxAttempts) {
    const keypair = Keypair.generate()
    const address = keypair.publicKey.toBase58()
    
    if (address.toLowerCase().startsWith(cleanPrefix)) {
      const elapsed = (Date.now() - startTime) / 1000
      console.log(`Found vanity address after ${attempts} attempts (${elapsed.toFixed(2)}s): ${address}`)
      return keypair
    }
    
    attempts++
    
    if (attempts % 10000 === 0) {
      console.log(`Attempts: ${attempts}...`)
    }
  }
  
  throw new Error(`Could not generate vanity address with prefix ${cleanPrefix} after ${maxAttempts} attempts`)
}

/**
 * Get the expected prefix for a given configuration
 */
export function getExpectedPrefix(
  direction: "LONG" | "SHORT",
  leverage: number,
  asset: string
): string {
  return `${DIRECTION_PREFIX[direction]}${LEVERAGE_PREFIX[leverage]}${ASSET_PREFIX[asset] || asset[0]}`.toLowerCase()
}
