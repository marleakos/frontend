"use client"

import { useState, useEffect, useCallback } from "react"
import { Connection, PublicKey } from "@solana/web3.js"
import { RPC_URL, PROGRAM_ID } from "@/lib/program-config"

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

export function useTokens() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      // For now, show empty state - no tokens exist yet on devnet
      // This will be replaced with proper fetching once tokens are created
      setTokens([])
      
    } catch (err: any) {
      console.error("Error fetching tokens:", err)
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
