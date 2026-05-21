"use client"

import { useState, useEffect, useCallback } from "react"
import { Connection, PublicKey } from "@solana/web3.js"
import { RPC_URL } from "@/lib/program-config"

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

export function useTokens() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // For pump.fun integration, fetch tokens from localStorage
      // These are tokens created through our UI
      const storedTokens = JSON.parse(localStorage.getItem('leverageTokens') || '[]')
      
      const tokenData: TokenData[] = storedTokens.map((token: any) => {
        const createdAt = new Date(token.createdAt).getTime()
        const ageMinutes = Math.floor((Date.now() - createdAt) / 60000)
        
        return {
          id: token.mintAddress,
          name: token.name,
          ticker: token.symbol,
          emoji: getEmoji(token.name, token.symbol),
          creator: "", // Not stored for pump.fun tokens
          underlying: `${token.underlying || 'SOL'}-PERP`,
          leverage: token.leverage as 2 | 3 | 5 | 10,
          direction: token.direction as "LONG" | "SHORT",
          marketCap: 0, // Would need to fetch from pump.fun
          progress: 0,  // Would need to fetch from pump.fun
          replies: 0,
          ageMinutes: Math.max(0, ageMinutes),
          change24h: 0,
          liqDistance: 100,
          description: "",
          mint: new PublicKey(token.mintAddress),
          graduated: false,
        }
      })

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
