"use client"

import { useState, useEffect, useCallback } from "react"
import { PublicKey } from "@solana/web3.js"
import { getAllTokens } from "@/lib/supabase"

export interface TokenData {
  id: string
  name: string
  ticker: string
  emoji: string
  creator: string
  underlying: "SOL-PERP" | "BTC-PERP" | "ETH-PERP" | "DOGE-PERP"
  leverage: 2 | 3 | 5 | 10
  direction: "LONG" | "SHORT"
  marketCap: number
  progress: number
  replies: number
  ageMinutes: number
  change24h: number
  liqDistance: number
  description: string
  mint: PublicKey
  graduated: boolean
}

// Map on-chain underlying enum to display format
function formatUnderlying(underlying: any): "SOL-PERP" | "BTC-PERP" | "ETH-PERP" | "DOGE-PERP" {
  if (underlying?.solPerp !== undefined) return "SOL-PERP"
  if (underlying?.btcPerp !== undefined) return "BTC-PERP"
  if (underlying?.ethPerp !== undefined) return "ETH-PERP"
  if (underlying?.dogePerp !== undefined) return "DOGE-PERP"
  return "SOL-PERP"
}

// Map on-chain direction enum to display format
function formatDirection(direction: any): "LONG" | "SHORT" {
  return direction?.long !== undefined ? "LONG" : "SHORT"
}

// Get emoji based on symbol/name
function getEmoji(name: string, symbol: string): string {
  const lower = (name + symbol).toLowerCase()
  if (lower.includes("doge") || lower.includes("dog")) return "🐕"
  if (lower.includes("pepe") || lower.includes("frog")) return "🐸"
  if (lower.includes("cat") || lower.includes("kitty")) return "🐱"
  if (lower.includes("moon")) return "🌙"
  if (lower.includes("rocket")) return "🚀"
  if (lower.includes("btc") || lower.includes("bitcoin")) return "₿"
  if (lower.includes("eth") || lower.includes("ethereum")) return "Ξ"
  if (lower.includes("sol")) return "◎"
  return "🪙"
}

// Fetch token data from pump.fun program directly
async function fetchPumpFunData(mintAddress: string): Promise<{ marketCap: number; graduated: boolean; price: number } | null> {
  try {
    const { Connection, PublicKey } = await import('@solana/web3.js')
    const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
    
    const mint = new PublicKey(mintAddress)
    const PUMP_PROGRAM = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P')
    
    // Derive bonding curve PDA
    const [bondingCurve] = PublicKey.findProgramAddressSync(
      [Buffer.from('bonding-curve'), mint.toBuffer()],
      PUMP_PROGRAM
    )
    
    // Fetch the account data
    const accountInfo = await connection.getAccountInfo(bondingCurve)
    
    if (!accountInfo) {
      console.log('No bonding curve found for', mintAddress)
      return null
    }
    
    // Parse the bonding curve data
    // BondingCurve layout: discriminator(8) + virtualSolReserve(8) + virtualTokenReserve(8) + realSolReserve(8) + realTokenReserve(8) + tokenTotalSupply(8)
    const data = accountInfo.data
    let offset = 8 // Skip discriminator
    
    const virtualSolReserve = Number(data.readBigUInt64LE(offset))
    offset += 8
    const virtualTokenReserve = Number(data.readBigUInt64LE(offset))
    offset += 8
    const realSolReserve = Number(data.readBigUInt64LE(offset))
    offset += 8
    const realTokenReserve = Number(data.readBigUInt64LE(offset))
    
    // Calculate price and market cap
    const price = virtualTokenReserve > 0 ? virtualSolReserve / virtualTokenReserve : 0
    const marketCap = Math.floor((virtualSolReserve * 2) / 1e9 * 150) // Convert lamports to SOL, *2 for bonding curve, *150 for USD
    
    console.log('On-chain data for', mintAddress, {
      virtualSolReserve,
      virtualTokenReserve,
      price,
      marketCap
    })
    
    return {
      marketCap,
      graduated: false, // Would need to check if AMM pool exists
      price
    }
  } catch (e) {
    console.log('Error fetching on-chain data:', e)
    return null
  }
}

export function useTokens() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch tokens from Supabase first
      let apiTokens: any[] = []
      try {
        const dbTokens = await getAllTokens()
        apiTokens = dbTokens.map((t: any) => ({
          mintAddress: t.mint_address,
          name: t.name,
          symbol: t.symbol,
          leverage: t.leverage,
          direction: t.direction,
          underlying: t.underlying,
          creator: t.creator,
          createdAt: t.created_at
        }))
      } catch (e) {
        console.log('Could not fetch from Supabase, trying API')
        // Fallback to API
        try {
          const response = await fetch('/api/tokens')
          const data = await response.json()
          apiTokens = data.tokens || []
        } catch (e2) {
          console.log('Could not fetch from API')
        }
      }
      
      // Also get localStorage tokens (for immediate display of user's own tokens)
      const storedTokensRaw = localStorage.getItem('leverageTokens')
      const storedTokens = JSON.parse(storedTokensRaw || '[]')
      
      // Merge both lists (avoid duplicates)
      const allTokens = [...apiTokens]
      storedTokens.forEach((token: any) => {
        if (!allTokens.find((t: any) => t.mintAddress === token.mintAddress)) {
          allTokens.push(token)
        }
      })
      
      console.log("Total tokens:", allTokens.length)
      
      // Fetch pump.fun data for each token
      const tokenDataPromises = allTokens.map(async (token: any) => {
        const createdAt = new Date(token.createdAt).getTime()
        const ageMinutes = Math.floor((Date.now() - createdAt) / 60000)
        
        // Fetch real data from pump.fun
        const pumpData = await fetchPumpFunData(token.mintAddress)
        const marketCap = pumpData?.marketCap || 0
        const graduated = pumpData?.graduated || false
        const price = pumpData?.price || 0
        
        // Calculate progress to graduation (69k)
        const progress = Math.min(100, Math.floor((marketCap / 69000) * 100))
        
        return {
          id: token.mintAddress,
          name: token.name,
          ticker: token.symbol,
          emoji: getEmoji(token.name, token.symbol),
          creator: token.creator || "",
          underlying: `${token.underlying || 'SOL'}-PERP`,
          leverage: token.leverage as 2 | 3 | 5 | 10,
          direction: token.direction as "LONG" | "SHORT",
          marketCap,
          progress,
          replies: 0,
          ageMinutes: Math.max(0, ageMinutes),
          change24h: 0,
          liqDistance: 100,
          description: "",
          mint: new PublicKey(token.mintAddress),
          graduated,
          price,
        }
      })
      
      const tokenData = await Promise.all(tokenDataPromises)

      setTokens(tokenData)
    } catch (err: any) {
      console.error("Error fetching tokens:", err)
      setError(err.message || "Failed to fetch tokens")
      setTokens([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTokens()
  }, [fetchTokens])

  return {
    tokens,
    loading,
    error,
    refresh: fetchTokens,
  }
}
