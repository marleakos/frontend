"use client"

import { useEffect, useState, useCallback } from "react"
import { AnimatePresence, motion } from "motion/react"
import Link from "next/link"

const MAX = 14
const POLL_INTERVAL = 10000 // Poll every 10 seconds

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

// Generate deterministic "random" numbers from a seed
// This ensures the same "random" trades appear consistently
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export function TradesTicker() {
  const [feed, setFeed] = useState<LiveTrade[]>([])
  const [tokenMap, setTokenMap] = useState<Map<string, { name: string; symbol: string }>>(new Map())

  // Fetch token info from our API
  const fetchTokenInfo = useCallback(async () => {
    try {
      const response = await fetch('/api/tokens')
      const data = await response.json()
      
      const newTokenMap = new Map<string, { name: string; symbol: string }>()
      
      for (const token of data.tokens || []) {
        newTokenMap.set(token.mintAddress, { 
          name: token.name, 
          symbol: token.symbol 
        })
      }
      
      // Also check localStorage
      const storedTokens = JSON.parse(localStorage.getItem('leverageTokens') || '[]')
      for (const token of storedTokens) {
        if (!newTokenMap.has(token.mintAddress)) {
          newTokenMap.set(token.mintAddress, {
            name: token.name,
            symbol: token.symbol
          })
        }
      }
      
      setTokenMap(newTokenMap)
    } catch (err) {
      console.error("Error fetching token info:", err)
    }
  }, [])

  // Generate demo trades - clearly labeled as such
  const generateDemoTrades = useCallback(() => {
    const tokens = Array.from(tokenMap.entries())
    if (tokens.length === 0) return

    const newTrades: LiveTrade[] = []
    const now = Date.now()
    
    // Use deterministic "random" based on time seed
    const seed = Math.floor(now / 10000)

    // Generate 1-3 demo trades
    const numTrades = Math.floor(seededRandom(seed) * 3) + 1
    
    for (let i = 0; i < numTrades; i++) {
      const tokenIndex = Math.floor(seededRandom(seed + i) * tokens.length)
      const [mint, info] = tokens[tokenIndex]
      const isBuy = seededRandom(seed + i + 100) > 0.4
      const amount = seededRandom(seed + i + 200) * 2 + 0.1
      
      newTrades.push({
        id: `demo-${now}-${i}`,
        ticker: info.symbol,
        side: isBuy ? "BUY" : "SELL",
        amount: Math.round(amount * 100) / 100,
        user: `USER${Math.floor(seededRandom(seed + i + 300) * 1000)}`,
        tokenMint: mint,
        timestamp: now - i * 1000,
      })
    }

    setFeed(prev => {
      const combined = [...newTrades, ...prev]
      const unique = combined.filter((trade, index, self) => 
        index === self.findIndex(t => t.id === trade.id)
      )
      return unique.slice(0, MAX)
    })
  }, [tokenMap])

  // Initial load
  useEffect(() => {
    fetchTokenInfo()
  }, [fetchTokenInfo])

  // Polling for demo trades
  useEffect(() => {
    if (tokenMap.size === 0) return
    
    generateDemoTrades()
    
    const interval = setInterval(() => {
      generateDemoTrades()
    }, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [tokenMap, generateDemoTrades])

  // Refresh token map periodically
  useEffect(() => {
    const interval = setInterval(fetchTokenInfo, 30000)
    return () => clearInterval(interval)
  }, [fetchTokenInfo])

  return (
    <div className="relative border-b border-border bg-[#1a1a1a] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 min-h-[44px]">
        <span className="shrink-0 inline-flex items-center gap-1.5 rounded bg-yellow-500/20 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-yellow-500">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-yellow-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-yellow-500" />
          </span>
          DEMO ACTIVITY
        </span>

        <div className="flex-1 overflow-hidden">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.div layout className="flex items-center gap-2">
              {feed.length === 0 ? (
                <span className="font-mono text-[10px] text-muted-foreground">
                  Waiting for tokens...
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
      </Link>
    </motion.div>
  )
}
