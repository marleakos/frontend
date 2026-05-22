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

export function TradesTicker() {
  const [feed, setFeed] = useState<LiveTrade[]>([])
  const [tokenMap, setTokenMap] = useState<Map<string, { name: string; symbol: string }>>(new Map())
  const [showDemoLabel, setShowDemoLabel] = useState(true)

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

  // Generate synthetic trades for demo
  const generateSyntheticTrades = useCallback(() => {
    const tokens = Array.from(tokenMap.entries())
    if (tokens.length === 0) return

    const newTrades: LiveTrade[] = []
    const now = Date.now()

    // Generate 1-3 random trades
    const numTrades = Math.floor(Math.random() * 3) + 1
    
    for (let i = 0; i < numTrades; i++) {
      const [mint, info] = tokens[Math.floor(Math.random() * tokens.length)]
      const isBuy = Math.random() > 0.4 // 60% buy, 40% sell
      const amount = Math.random() * 2 + 0.1 // 0.1 - 2.1 SOL
      
      newTrades.push({
        id: `${now}-${i}`,
        ticker: info.symbol,
        side: isBuy ? "BUY" : "SELL",
        amount: parseFloat(amount.toFixed(2)),
        user: Math.random().toString(36).substring(2, 6).toUpperCase(),
        tokenMint: mint,
        timestamp: now - i * 1000,
      })
    }

    setFeed(prev => {
      const combined = [...newTrades, ...prev]
      // Remove duplicates by id
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

  // Polling for trades
  useEffect(() => {
    if (tokenMap.size === 0) return
    
    // Generate initial trades
    generateSyntheticTrades()
    
    const interval = setInterval(() => {
      generateSyntheticTrades()
    }, POLL_INTERVAL)

    return () => clearInterval(interval)
  }, [tokenMap, generateSyntheticTrades])

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
          DEMO TRADES
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
