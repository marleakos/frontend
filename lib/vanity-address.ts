// Vanity address generator for pump.fun tokens
// Creates addresses with full words: Longx3...SOL, Shortx10...BTC, etc.

import { Keypair } from "@solana/web3.js"

export const ASSET_SUFFIX: Record<string, string> = {
  SOL: "SOL",
  BTC: "BTC",
  ETH: "ETH",
  APT: "APT",
  ARB: "ARB",
  DOGE: "DOGE",
  BNB: "BNB",
  SUI: "SUI",
  BONK: "BONK",
  MATIC: "MATIC",
}

/**
 * Generate a vanity address with pattern:
 * {Direction}x{Leverage}...{Asset}
 * 
 * Examples:
 * - LONG 5x SOL -> "Longx5...SOL"
 * - SHORT 10x BTC -> "Shortx10...BTC"
 */
export async function generateVanityAddress(
  direction: "LONG" | "SHORT",
  leverage: number,
  asset: string,
  maxAttempts: number = 200000
): Promise<Keypair> {
  // Build the pattern: Longx5...SOL or Shortx10...BTC
  const dirPrefix = direction === "LONG" ? "Long" : "Short"
  const levStr = leverage === 10 ? "10" : leverage.toString()
  const startPattern = `${dirPrefix}x${levStr}`.toLowerCase()
  const endPattern = (ASSET_SUFFIX[asset] || asset).toLowerCase()
  
  console.log(`Generating vanity address with pattern: ${startPattern}...${endPattern}`)
  
  let attempts = 0
  const startTime = Date.now()
  
  while (attempts < maxAttempts) {
    const keypair = Keypair.generate()
    const address = keypair.publicKey.toBase58()
    const addrLower = address.toLowerCase()
    
    // Check if address starts with pattern and ends with asset
    if (addrLower.startsWith(startPattern) && addrLower.endsWith(endPattern)) {
      const elapsed = (Date.now() - startTime) / 1000
      console.log(`Found vanity address after ${attempts} attempts (${elapsed.toFixed(2)}s): ${address}`)
      return keypair
    }
    
    attempts++
    
    // Log progress every 20000 attempts
    if (attempts % 20000 === 0) {
      console.log(`Attempts: ${attempts}...`)
    }
  }
  
  console.log(`Could not find vanity address with pattern ${startPattern}...${endPattern} after ${maxAttempts} attempts`)
  throw new Error(`Could not generate vanity address. The pattern ${startPattern}...${endPattern} is very rare. Try again or use a simpler pattern.`)
}

/**
 * Generate a vanity address with just the start pattern (faster)
 */
export async function generateVanityAddressStartOnly(
  direction: "LONG" | "SHORT",
  leverage: number,
  maxAttempts: number = 100000
): Promise<Keypair> {
  const dirPrefix = direction === "LONG" ? "Long" : "Short"
  const levStr = leverage === 10 ? "10" : leverage.toString()
  const pattern = `${dirPrefix}x${levStr}`.toLowerCase()
  
  console.log(`Generating vanity address starting with: ${pattern}...`)
  
  let attempts = 0
  const startTime = Date.now()
  
  while (attempts < maxAttempts) {
    const keypair = Keypair.generate()
    const address = keypair.publicKey.toBase58()
    
    if (address.toLowerCase().startsWith(pattern)) {
      const elapsed = (Date.now() - startTime) / 1000
      console.log(`Found vanity address after ${attempts} attempts (${elapsed.toFixed(2)}s): ${address}`)
      return keypair
    }
    
    attempts++
    
    if (attempts % 10000 === 0) {
      console.log(`Attempts: ${attempts}...`)
    }
  }
  
  throw new Error(`Could not generate vanity address starting with ${pattern} after ${maxAttempts} attempts`)
}

/**
 * Get the expected address pattern for display
 */
export function getExpectedPattern(
  direction: "LONG" | "SHORT",
  leverage: number,
  asset: string
): string {
  const dirPrefix = direction === "LONG" ? "Long" : "Short"
  const levStr = leverage === 10 ? "10" : leverage.toString()
  const assetSuffix = ASSET_SUFFIX[asset] || asset
  return `${dirPrefix}x${levStr}...${assetSuffix}`
}
