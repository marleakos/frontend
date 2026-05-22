"use client"

import { useState, useEffect, useCallback } from "react"
import { PublicKey } from "@solana/web3.js"
import { getAllTokens } from "@/lib/supabase"

export interface TokenData {
  id: string
  name: string
  ticker: string
  emoji: string
  image?: string
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
  price: number
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

// Fetch token data from pump.fun bonding curve (works for ALL tokens)
import { getBondingCurveData } from '@/lib/pumpfun'
// Fallback to DexScreener for price change data
import { getTokenData } from '@/lib/dexscreener'

async function fetchTokenMarketData(mintAddress: string): Promise<{ 
  marketCap: number
  price: number
  volume24h: number
  priceChange24h: number
} | null> {
  // Try bonding curve first (works for new tokens)
  const bondingData = await getBondingCurveData(mintAddress)
  
  if (!bondingData) {
    return null
  }
  
  // Try DexScreener for volume and price change
  let volume24h = 0
  let priceChange24h = 0
  try {
    const dexData = await getTokenData(mintAddress)
    if (dexData) {
      volume24h = dexData.volume?.h24 || 0
      priceChange24h = dexData.priceChange?.h24 || 0
    }
  } catch (e) {
    console.log('Could not fetch DexScreener data for', mintAddress)
  }
  
  return {
    marketCap: bondingData.marketCap || 0,
    price: bondingData.price || 0,
    volume24h,
    priceChange24h
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
        console.log('Fetching tokens from Supabase...')
        const dbTokens = await getAllTokens()
        console.log('Supabase returned:', dbTokens.length, 'tokens')
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
        console.log('Could not fetch from Supabase, trying API:', e)
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
        
        // Fetch real data from DexScreener
        const marketData = await fetchTokenMarketData(token.mintAddress)
        const marketCap = marketData?.marketCap || 0
        const price = marketData?.price || 0
        const volume24h = marketData?.volume24h || 0
        const priceChange24h = marketData?.priceChange24h || 0
        
        // Fetch image from DexScreener
        let imageUrl: string | undefined = undefined
        try {
          const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${token.mintAddress}`)
          const dexData = await response.json()
          if (dexData.pairs && dexData.pairs.length > 0) {
            imageUrl = dexData.pairs[0].baseToken?.icon || dexData.pairs[0].info?.imageUrl || undefined
          }
        } catch (e) {
          console.log('Could not fetch image for', token.mintAddress)
        }
        
        // Calculate progress to graduation (69k)
        const progress = Math.min(100, Math.floor((marketCap / 69000) * 100))
        
        // Graduated if market cap > 69k
        const graduated = marketCap >= 69000
        
        return {
          id: token.mintAddress,
          name: token.name,
          ticker: token.symbol,
          emoji: getEmoji(token.name, token.symbol),
          image: imageUrl,
          creator: token.creator || "",
          underlying: `${token.underlying || 'SOL'}-PERP`,
          leverage: token.leverage as 2 | 3 | 5 | 10,
          direction: token.direction as "LONG" | "SHORT",
          marketCap,
          progress,
          replies: 0,
          ageMinutes: Math.max(0, ageMinutes),
          change24h: priceChange24h,
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
