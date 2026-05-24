"use client"

import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { LiveBoard } from "@/components/live-board"
import { useTokens } from "@/hooks/use-tokens"
import { Loader2 } from "lucide-react"
import Link from "next/link"

export default function Page() {
  const { tokens, loading, error, refresh } = useTokens()

  if (loading && tokens.length === 0) {
    return (
      <main className="min-h-screen text-foreground">
        <Header />
        <TradesTicker />
        <div className="mx-auto max-w-[1400px] px-4 py-20 flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="font-mono text-sm text-muted-foreground">Loading tokens...</p>
        </div>
      </main>
    )
  }

  if (error && tokens.length === 0) {
    return (
      <main className="min-h-screen text-foreground">
        <Header />
        <TradesTicker />
        <div className="mx-auto max-w-[1400px] px-4 py-20 flex flex-col items-center justify-center">
          <p className="font-mono text-sm text-destructive mb-2">Error loading tokens</p>
          <p className="font-mono text-xs text-muted-foreground mb-4">{error}</p>
          <button
            onClick={refresh}
            className="px-4 py-2 rounded-md bg-primary text-primary-foreground font-mono text-sm"
          >
            Retry
          </button>
        </div>
      </main>
    )
  }

  // No tokens yet - show empty state
  if (tokens.length === 0) {
    return (
      <main className="min-h-screen text-foreground">
        <Header />
        <TradesTicker />
        <div className="mx-auto max-w-[1400px] px-4 py-20 flex flex-col items-center justify-center">
          <p className="font-display text-2xl uppercase mb-4">No tokens yet</p>
          <p className="font-mono text-sm text-muted-foreground mb-6">
            Be the first to launch a leveraged meme coin!
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-primary text-primary-foreground font-display uppercase tracking-wide hover:opacity-90 transition-opacity"
          >
            Launch Token
          </Link>
        </div>
        <footer className="border-t border-border mt-16 py-6">
          <div className="mx-auto max-w-[1400px] px-4 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
            <span>leveragepump.fun · not financial advice · you will get rekt</span>
            <span>built on solana · powered by pyth oracles</span>
          </div>
        </footer>
      </main>
    )
  }

  // Sort by market cap for KOTH
  const sortedTokens = [...tokens].sort((a, b) => b.marketCap - a.marketCap)
  const koth = sortedTokens[0]
  // Show all tokens in the grid (including KOTH, it will just be first)
  const rest = sortedTokens

  return (
    <main className="min-h-screen text-foreground">
      <Header />
      <TradesTicker />
      <div className="mx-auto max-w-[1400px] px-4">
        <LiveBoard initial={rest} koth={koth} />
      </div>
      <footer className="border-t border-border mt-16 py-6">
        <div className="mx-auto max-w-[1400px] px-4 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
          <span>leveragepump.fun · not financial advice · you will get rekt</span>
          <span>built on solana · powered by pyth oracles</span>
        </div>
      </footer>
    </main>
  )
}
