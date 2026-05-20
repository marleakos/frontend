"use client"

import { useState, useEffect, useCallback } from "react"
import { Connection, PublicKey } from "@solana/web3.js"
import { Program, AnchorProvider } from "@coral-xyz/anchor"
import { IDL } from "@/lib/idl"
import { PROGRAM_ID, RPC_URL } from "@/lib/program-config"

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

// Create a read-only program instance
function getReadOnlyProgram() {
  const connection = new Connection(RPC_URL, "confirmed")
  const provider = new AnchorProvider(connection, {} as any, { commitment: "confirmed" })
  return new Program(IDL as any, provider)
}

export function useTokens() {
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const program = getReadOnlyProgram()
      
      // Fetch all TokenState accounts from the program
      const accounts = await (program as any).account.tokenState.all()
      
      const fetchedTokens: TokenData[] = accounts.map((acc: any, index: number) => {
        const account = acc.account
        const pubkey = acc.publicKey
        
        // Map underlying enum to string
        let underlying: TokenData["underlying"] = "SOL-PERP"
        if (account.underlying?.btcPerp) underlying = "BTC-PERP"
        else if (account.underlying?.ethPerp) underlying = "ETH-PERP"
        else if (account.underlying?.dogePerp) underlying = "DOGE-PERP"
        
        // Map direction enum to string
        const direction: TokenData["direction"] = account.direction?.long ? "LONG" : "SHORT"
        
        // Calculate market cap from curve state
        const virtualSolReserve = Number(account.curveState?.virtualSolReserve || 0)
        const virtualTokenReserve = Number(account.curveState?.virtualTokenReserve || 1)
        const marketCap = Math.floor(virtualSolReserve * 100) // Rough estimate
        
        // Calculate progress to graduation ($69k)
        const progress = Math.min(100, (marketCap / 69000) * 100)
        
        // Calculate age
        const createdAt = Number(account.createdAt || 0) * 1000
        const ageMinutes = Math.floor((Date.now() - createdAt) / 60000)
        
        return {
          id: pubkey.toString().slice(0, 8),
          name: account.name || "Unknown",
          ticker: account.symbol || "???",
          emoji: "🚀",
          creator: account.creator?.toString().slice(0, 4) + "..." + account.creator?.toString().slice(-4) || "Unknown",
          underlying,
          leverage: account.leverage || 3,
          direction,
          marketCap,
          progress,
          replies: Math.floor(Math.random() * 1000),
          ageMinutes: Math.max(0, ageMinutes),
          change24h: (Math.random() * 400) - 100,
          liqDistance: Math.floor(Math.random() * 50) + 5,
          description: "",
          mint: account.tokenMint,
          graduated: account.graduated || false,
        }
      })

      setTokens(fetchedTokens)
    } catch (err: any) {
      console.error("Error fetching tokens:", err)
      setError(err.message)
      setTokens([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTokens()
    
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchTokens, 10000)
    return () => clearInterval(interval)
  }, [fetchTokens])

  return {
    tokens,
    loading,
    error,
    refresh: fetchTokens,
  }
}
