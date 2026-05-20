"use client"

import { useState, useEffect, useCallback } from "react"
import { Connection, PublicKey } from "@solana/web3.js"
import { Program, AnchorProvider } from "@coral-xyz/anchor"
import { RPC_URL, PROGRAM_ID } from "@/lib/program-config"
import { IDL } from "@/lib/idl"

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

      // Create connection and provider
      const connection = new Connection(RPC_URL, "confirmed")
      const provider = new AnchorProvider(connection, {} as any, { commitment: "confirmed" })
      const program = new Program(IDL as any, provider)

      // Fetch all tokenState accounts from the program
      const accounts = await (program as any).account.tokenState.all()

      // Transform on-chain data to frontend format
      const tokenData: TokenData[] = accounts.map((acc: any) => {
        const account = acc.account
        const mint = account.tokenMint
        const createdAt = account.createdAt?.toNumber?.() || 0
        const ageMinutes = Math.floor((Date.now() / 1000 - createdAt) / 60)

        // Calculate market cap from curve state
        const virtualSol = account.curveState?.virtualSolReserve?.toNumber?.() || 0
        const virtualToken = account.curveState?.virtualTokenReserve?.toNumber?.() || 1
        const price = virtualSol / virtualToken
        const supply = account.curveState?.realTokenReserve?.toNumber?.() || 0
        const marketCap = Math.floor(price * supply)

        // Progress to graduation (69k)
        const progress = Math.min(100, Math.floor((marketCap / 69000) * 100))

        return {
          id: mint.toString(),
          name: account.name,
          ticker: account.symbol,
          emoji: getEmoji(account.name, account.symbol),
          creator: account.creator.toString(),
          underlying: formatUnderlying(account.underlying),
          leverage: account.leverage as 2 | 3 | 5 | 10,
          direction: formatDirection(account.direction),
          marketCap,
          progress,
          replies: 0, // Not stored on-chain, would need indexer
          ageMinutes: Math.max(0, ageMinutes),
          change24h: 0, // Would need historical data
          liqDistance: 100, // Would need oracle price
          description: "", // Not stored on-chain
          mint,
          graduated: account.graduated,
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
