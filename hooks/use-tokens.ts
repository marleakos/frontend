"use client"

import { useState, useEffect, useCallback, useRef } from "react"
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

// Cache for token data (5 minute TTL)
const tokenCache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Fetch all token data in parallel with caching
async function fetchTokenMarketDataBatch(mintAddresses: string[]): Promise<Map<string, any>> {
  const results = new Map<string, any>()
  const uncachedAddresses: string[] = []
  
  // Check cache first
  const now = Date.now()
  for (const address of mintAddresses) {
    const cached = tokenCache.get(address)
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      results.set(address, cached.data)
    } else {
      uncachedAddresses.push(address)
    }
  }
  
  if (uncachedAddresses.length === 0) {
    return results
  }
  
  // Fetch uncached tokens in parallel batches
  const batchSize = 5
  for (let i = 0; i < uncachedAddresses.length; i += batchSize) {
    const batch = uncachedAddresses.slice(i, i + batchSize)
    const batchPromises = batch.map(async (address) => {
      try {
        // Fetch market data and metadata in parallel
        const [{ getTokenData }, { getTokenMetadata }] = await Promise.all([
          import('@/lib/dexscreener'),
          import('@/lib/token-metadata')
        ])
        
        const [dexData, metadata] = await Promise.all([
          getTokenData(address).catch(() => null),
          getTokenMetadata(address).catch(() => null)
        ])
        
        if (dexData || metadata) {
          const data = {
            marketCap: dexData?.marketCap || 0,
            price: dexData?.priceUsd || 0,
            volume24h: dexData?.volume?.h24 || 0,
            priceChange24h: dexData?.priceChange?.h24 || 0,
            image: metadata?.image || dexData?.image
          }
          
          // Cache the result
          tokenCache.set(address, { data, timestamp: now })
          return { address, data }
        }
        
        // Fallback to bonding curve
        const { getBondingCurveData } = await import('@/lib/pumpfun')
        const bondingData = await getBondingCurveData(address)
        
        if (bondingData) {
          const data = {
            marketCap: bondingData.marketCap || 0,
            price: bondingData.price || 0,
            volume24h: 0,
            priceChange24h: 0,
            image: undefined
          }
          
          tokenCache.set(address, { data, timestamp: now })
          return { address, data }
        }
        
        return { address, data: null }
      } catch (e) {
        return { address, data: null }
      }
    })
    
    const batchResults = await Promise.all(batchPromises)
    batchResults.forEach(({ address, data }) => {
      if (data) {
        results.set(address, data)
      }
    })
  }
  
  return results
}

export function useTokens() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMounted = useRef(true)

  const fetchTokens = useCallback(async () => {
    if (!isMounted.current) return
    
    try {
      setLoading(true)
      setError(null)

      // Fetch tokens from Supabase
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
        try {
          const response = await fetch('/api/tokens')
          const data = await response.json()
          apiTokens = data.tokens || []
        } catch (e2) {
          console.log('Could not fetch from API')
        }
      }
      
      // Get localStorage tokens
      const storedTokensRaw = localStorage.getItem('leverageTokens')
      const storedTokens = JSON.parse(storedTokensRaw || '[]')
      
      // Merge lists (avoid duplicates)
      const allTokens = [...apiTokens]
      storedTokens.forEach((token: any) => {
        if (!allTokens.find((t: any) => t.mintAddress === token.mintAddress)) {
          allTokens.push(token)
        }
      })
      
      if (allTokens.length === 0) {
        setTokens([])
        setLoading(false)
        return
      }
      
      console.log("Total tokens:", allTokens.length)
      
      // Fetch all market data in parallel batches
      const mintAddresses = allTokens.map((t: any) => t.mintAddress)
      const marketDataMap = await fetchTokenMarketDataBatch(mintAddresses)
      
      // Process all tokens with cached/fetched data
      const tokenData = allTokens.map((token: any) => {
        const createdAt = new Date(token.createdAt).getTime()
        const ageMinutes = Math.floor((Date.now() - createdAt) / 60000)
        
        const marketData = marketDataMap.get(token.mintAddress)
        const marketCap = marketData?.marketCap || 0
        const price = marketData?.price || 0
        const priceChange24h = marketData?.priceChange24h || 0
        const imageUrl = marketData?.image
        
        // Calculate progress to 85 SOL graduation (approximate)
        const solPrice = 150 // Approximate SOL price
        const solInCurve = marketCap / solPrice
        const progress = Math.min(100, Math.floor((solInCurve / 85) * 100))
        const graduated = solInCurve >= 85
        
        return {
          id: token.mintAddress,
          name: token.name,
          ticker: token.symbol,
          emoji: getEmoji(token.name, token.symbol),
          image: imageUrl,
          creator: token.creator || "",
          underlying: `${token.underlying || 'SOL'}-PERP`,
          leverage: (token.leverage || 3) as 2 | 3 | 5 | 10,
          direction: (token.direction || 'LONG') as "LONG" | "SHORT",
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
      
      if (isMounted.current) {
        setTokens(tokenData)
      }
    } catch (err: any) {
      console.error("Error fetching tokens:", err)
      if (isMounted.current) {
        setError(err.message || "Failed to fetch tokens")
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    fetchTokens()
    
    return () => {
      isMounted.current = false
    }
  }, [fetchTokens])

  return {
    tokens,
    loading,
    error,
    refresh: fetchTokens,
  }
}
