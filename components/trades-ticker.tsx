"use client"

import { useEffect, useState, useCallback } from "react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"
import { Connection, PublicKey } from "@solana/web3.js"
import { RPC_URL, PROGRAM_ID } from "@/lib/program-config"

const MAX = 14
const POLL_INTERVAL = 5000 // Poll every 5 seconds

interface LiveTrade {
  id: string
  ticker: string
  side: "BUY" | "SELL"
  amount: number
  user: string
  tokenMint: string
  timestamp: number
}

// Get emoji based on token name/symbol
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

export function TradesTicker() {
  const [feed, setFeed] = useState<LiveTrade[]>([])
  const [tokenMap, setTokenMap] = useState<Map<string, { name: string; symbol: string }>>(new Map())
  const [lastSignature, setLastSignature] = useState<string | null>(null)

  // Fetch token info to map mint -> ticker
  const fetchTokenInfo = useCallback(async () => {
    try {
      const connection = new Connection(RPC_URL, "confirmed")
      
      // Get program accounts to build token map
      const accounts = await connection.getProgramAccounts(PROGRAM_ID, {
        filters: [
          { dataSize: 500 }, // Approximate size for TokenState
        ],
      })

      const newTokenMap = new Map<string, { name: string; symbol: string }>()
      
      for (const acc of accounts) {
        try {
          // Parse token state account data
          // TokenState layout: creator(32) + mint(32) + name(len + str) + symbol(len + str) + ...
          const data = acc.account.data
          const mint = new PublicKey(data.slice(32, 64))
          
          // Parse name (4 bytes length + string)
          let offset = 64
          const nameLen = data.readUInt32LE(offset)
          offset += 4
          const name = data.slice(offset, offset + nameLen).toString('utf8')
          offset += nameLen
          
          // Parse symbol
          const symbolLen = data.readUInt32LE(offset)
          offset += 4
          const symbol = data.slice(offset, offset + symbolLen).toString('utf8')
          
          newTokenMap.set(mint.toString(), { name, symbol })
        } catch (e) {
          // Skip accounts that don't parse correctly
        }
      }
      
      setTokenMap(newTokenMap)
    } catch (err) {
      console.error("Error fetching token info:", err)
    }
  }, [])

  // Fetch recent transactions for the program
  const fetchRecentTrades = useCallback(async () => {
    try {
      const connection = new Connection(RPC_URL, "confirmed")
      
      // Get signatures for the program
      const signatures = await connection.getSignaturesForAddress(PROGRAM_ID, {
        limit: 20,
        until: lastSignature || undefined,
      })

      if (signatures.length === 0) return

      // Update last signature for next poll
      setLastSignature(signatures[0].signature)

      const newTrades: LiveTrade[] = []

      for (const sigInfo of signatures) {
        try {
          // Get transaction details
          const tx = await connection.getTransaction(sigInfo.signature, {
            commitment: "confirmed",
          })

          if (!tx || !tx.meta) continue

          // Look for buy/sell instructions in the logs
          const logs = tx.meta.logMessages || []
          
          // Check if this is a buy or sell transaction
          const isBuy = logs.some(log => log.includes("TokenBought"))
          const isSell = logs.some(log => log.includes("TokenSold"))
          
          if (!isBuy && !isSell) continue

          // Extract token mint from accounts
          const accountKeys = tx.transaction.message.accountKeys
          // Token mint is usually at index 2 for buy/sell (buyer/seller, tokenState, tokenMint, ...)
          const tokenMint = accountKeys[2]?.toString()
          
          if (!tokenMint) continue

          // Get token info
          const tokenInfo = tokenMap.get(tokenMint) || { name: "Unknown", symbol: "???" }
          
          // Extract amount from logs or compute from balance changes
          let amount = 0.1 // Default fallback
          
          // Try to extract from logs
          const buyMatch = logs.join(" ").match(/sol_amount:\s*(\d+)/)
          if (buyMatch) {
            amount = parseInt(buyMatch[1]) / 1e9 // Convert lamports to SOL
          }

          // Get user (first account is usually the signer)
          const user = accountKeys[0]?.toString().slice(0, 4) || "????"

          newTrades.push({
            id: sigInfo.signature,
            ticker: tokenInfo.symbol,
            side: isBuy ? "BUY" : "SELL",
            amount: Math.max(0.01, amount),
            user,
            tokenMint,
            timestamp: sigInfo.blockTime ? sigInfo.blockTime * 1000 : Date.now(),
          })
        } catch (e) {
          console.error("Error parsing transaction:", e)
        }
      }

      if (newTrades.length > 0) {
        setFeed(prev => {
          const combined = [...newTrades, ...prev]
          // Remove duplicates by id
          const unique = combined.filter((trade, index, self) => 
            index === self.findIndex(t => t.id === trade.id)
          )
          return unique.slice(0, MAX)
        })
      }
    } catch (err) {
      console.error("Error fetching trades:", err)
    }
  }, [lastSignature, tokenMap])

  // Initial load and polling
  useEffect(() => {
    // Fetch token info first
    fetchTokenInfo()
    
    // Then start polling for trades
    const interval = setInterval(() => {
      fetchRecentTrades()
    }, POLL_INTERVAL)

    // Initial fetch
    fetchRecentTrades()

    return () => clearInterval(interval)
  }, [fetchTokenInfo, fetchRecentTrades])

  // Refresh token map periodically
  useEffect(() => {
    const interval = setInterval(fetchTokenInfo, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [fetchTokenInfo])

  return (
    <div className="relative border-b border-border bg-[#1a1a1a] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 min-h-[44px]">
        <span className="shrink-0 inline-flex items-center gap-1.5 rounded bg-[#39ff14]/20 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-[#39ff14]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#39ff14] opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#39ff14]" />
          </span>
          LIVE TRADES
        </span>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div layout className="flex items-center gap-2">
              {feed.length === 0 ? (
                <span className="font-mono text-[10px] text-muted-foreground">
                  Waiting for trades...
                </span>
              ) : (
                feed.map((t, i) => (
                  <TradePill 
                    key={t.id} 
                    t={t} 
                    fresh={i === 0} 
                    tokenMap={tokenMap}
                  />
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* fade-out edge */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-background to-transparent" />
      </div>
    </div>
  )
}

function TradePill({ 
  t, 
  fresh, 
  tokenMap 
}: { 
  t: LiveTrade
  fresh: boolean
  tokenMap: Map<string, { name: string; symbol: string }>
}) {
  const buy = t.side === "BUY"
  const tokenInfo = tokenMap.get(t.tokenMint)
  const emoji = tokenInfo ? getEmoji(tokenInfo.name, tokenInfo.symbol) : "🪙"

  return (
    <motion.div
      layout
      initial={{ x: 220, opacity: 0, scale: 0.85 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.7, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 500, damping: 32 }}
      className="shrink-0"
    >
      <Link
        href={`/token/${t.tokenMint}`}
        className={`relative inline-flex items-center gap-1.5 rounded-md border px-2 py-1 font-mono text-[11px] whitespace-nowrap transition-colors ${
          buy
            ? "border-primary/40 bg-primary/10 hover:bg-primary/20"
            : "border-destructive/40 bg-destructive/10 hover:bg-destructive/20"
        }`}
      >
        {fresh && (
          <motion.span
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.7 }}
            className={`absolute inset-0 rounded-md ${buy ? "bg-primary/40" : "bg-destructive/40"}`}
          />
        )}
        <span className="relative text-base leading-none">{emoji}</span>
        <span className={`relative font-bold ${buy ? "text-primary" : "text-destructive"}`}>{t.side}</span>
        <span className="relative font-bold text-foreground">${t.ticker}</span>
        <span className="relative tabular-nums text-foreground">{t.amount.toFixed(2)}</span>
        <span className="relative text-muted-foreground">SOL</span>
        <span className="relative text-muted-foreground">by {t.user}</span>
      </Link>
    </motion.div>
  )
}
