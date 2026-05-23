"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Token {
  mint_address: string
  name: string
  symbol: string
  leverage: number
  direction: string
}

// Simple cache for ticker data
let cachedTokens: Token[] | null = null
let cacheTime = 0
const CACHE_TTL = 30000 // 30 seconds

export function TradesTicker() {
  const [tokens, setTokens] = useState<Token[]>(cachedTokens || [])

  useEffect(() => {
    // Use cache if fresh
    if (cachedTokens && Date.now() - cacheTime < CACHE_TTL) {
      return
    }
    
    const fetchTokens = async () => {
      try {
        // Use API instead of direct Supabase to share cache
        const response = await fetch('/api/tokens', { 
          cache: 'no-store',
          headers: { 'Accept': 'application/json' }
        })
        if (response.ok) {
          const data = await response.json()
          const apiTokens = (data.tokens || []).slice(0, 5)
          cachedTokens = apiTokens
          cacheTime = Date.now()
          setTokens(apiTokens)
        }
      } catch (e) {
        console.log('TradesTicker: Could not fetch tokens')
      }
    }
    
    // Only fetch if no cache
    if (!cachedTokens) {
      fetchTokens()
    }
  }, [])

  if (tokens.length === 0) {
    return (
      <div className="border-b border-border bg-[#1a1a1a]">
        <div className="flex items-center justify-center gap-2 px-3 py-2 min-h-[44px]">
          <span className="font-mono text-[10px] text-muted-foreground">
            Launch your token to see activity
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="border-b border-border bg-[#1a1a1a] overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="shrink-0 font-mono text-[10px] text-muted-foreground">Latest:</span>
        <div className="flex gap-3 overflow-hidden">
          {tokens.map((t) => (
            <Link
              key={t.mint_address}
              href={`/token/${t.mint_address}`}
              className="font-mono text-[10px] text-primary hover:underline whitespace-nowrap"
            >
              ${t.symbol} · {t.leverage}x {t.direction}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
