"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { TokenChart } from "@/components/token-chart"
import { TradePanel } from "@/components/trade-panel"
import { ThreadSection } from "@/components/thread-section"
import { TokenRuggedGate } from "@/components/token-rugged-gate"
import { TradeHistory } from "@/components/trade-history"
import { TokenStats } from "@/components/token-stats"
import { ArrowLeft, Copy, Wallet, Skull } from "lucide-react"
import { toast } from "sonner"
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js"
import { RPC_URL } from "@/lib/program-config"
import type { TokenData } from "@/hooks/use-tokens"

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

export default function TokenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [token, setToken] = useState<TokenData | null>(null)
  const [feeVaultData, setFeeVaultData] = useState<{ totalCollected: number; creatorClaimed: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [claimingFees, setClaimingFees] = useState(false)

  useEffect(() => {
    async function fetchToken() {
      try {
        // For pump.fun tokens, fetch from localStorage
        const storedTokens = JSON.parse(localStorage.getItem('leverageTokens') || '[]')
        const storedToken = storedTokens.find((t: any) => t.mintAddress === id)
        
        if (!storedToken) {
          // Token not found in localStorage - could be a pump.fun token not created through our UI
          // Create a minimal token object with the mint address
          setToken({
            id: id,
            name: "Unknown Token",
            ticker: "???",
            emoji: "🪙",
            creator: "",
            underlying: "SOL-PERP",
            leverage: 2,
            direction: "LONG",
            marketCap: 0,
            progress: 0,
            replies: 0,
            ageMinutes: 0,
            change24h: 0,
            liqDistance: 100,
            description: "Token data not available. This token may not have been created through this UI.",
            mint: new PublicKey(id),
            graduated: false,
          })
          setLoading(false)
          return
        }

        const createdAt = new Date(storedToken.createdAt).getTime()
        const ageMinutes = Math.floor((Date.now() - createdAt) / 60000)

        setToken({
          id: storedToken.mintAddress,
          name: storedToken.name,
          ticker: storedToken.symbol,
          emoji: getEmoji(storedToken.name, storedToken.symbol),
          creator: "",
          underlying: `${storedToken.underlying || 'SOL'}-PERP`,
          leverage: storedToken.leverage as 2 | 3 | 5 | 10,
          direction: storedToken.direction as "LONG" | "SHORT",
          marketCap: 0,
          progress: 0,
          replies: 0,
          ageMinutes: Math.max(0, ageMinutes),
          change24h: 0,
          liqDistance: 100,
          description: "",
          mint: new PublicKey(storedToken.mintAddress),
          graduated: false,
        })

        // Fee vault not applicable for pump.fun tokens
        setFeeVaultData(null)
      } catch (err) {
        console.error("Error fetching token:", err)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    fetchToken()
  }, [id, router])

  const copyMint = () => {
    if (token) {
      navigator.clipboard.writeText(token.mint.toString())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const claimFees = async () => {
    // Fee claiming not available for pump.fun tokens
    toast.error("Fee claiming not available for pump.fun tokens", { id: "claim-fees" })
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-background text-foreground flex items-center justify-center">
        <div className="font-mono text-sm text-muted-foreground">Loading token...</div>
      </div>
    )
  }

  if (!token) return null

  const positive = token.change24h >= 0
  const danger = token.liqDistance < 15
  const GRAD = 69000
  const progress = Math.min(100, (token.marketCap / GRAD) * 100)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1400px] px-3 py-4 md:px-4 md:py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground mb-3"
        >
          <ArrowLeft className="h-3 w-3" /> back
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-3">
          <div className="space-y-3">
            {/* Token header */}
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="flex gap-3 p-3 md:p-4">
                <div className="relative grid h-16 w-16 md:h-24 md:w-24 shrink-0 place-items-center rounded-md bg-secondary text-3xl md:text-5xl">
                  {token.emoji}
                </div>

                <div className="flex-1 flex flex-col gap-1.5 md:gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h1 className="font-display text-xl md:text-3xl leading-none uppercase">{token.name}</h1>
                    <span className="font-mono text-xs text-muted-foreground">${token.ticker}</span>
                    <span className="rounded border border-primary/40 bg-primary/15 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-primary">
                      {token.leverage}x {token.direction.toLowerCase()}
                    </span>
                    <span className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-muted-foreground">
                      {token.underlying}
                    </span>
                    {danger && (
                      <span className="inline-flex items-center gap-1 rounded border border-destructive/40 bg-destructive/15 px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-destructive">
                        <Skull className="h-3 w-3" /> near liq · {token.liqDistance}%
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-[10px] md:text-[11px] text-muted-foreground flex-wrap">
                    <button 
                      onClick={copyMint}
                      className="inline-flex items-center gap-1 rounded border border-border bg-secondary px-2 py-0.5 hover:border-foreground"
                    >
                      <Copy className="h-3 w-3" /> {copied ? "copied!" : `${token.mint.toString().slice(0, 6)}...${token.mint.toString().slice(-4)}`}
                    </button>
                    <a
                      href={`https://solscan.io/token/${token.mint.toString()}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded border border-border bg-secondary px-2 py-0.5 hover:border-foreground hover:text-primary"
                    >
                      solscan <span className="text-[10px]">↗</span>
                    </a>
                    <span>by <Link href={`/user/${token.creator.slice(0, 6)}`} className="text-foreground hover:text-primary">{token.creator.slice(0, 6)}...{token.creator.slice(-4)}</Link></span>
                  </div>
                </div>
              </div>

              {/* stat strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border">
                <Stat label="price" value="$--" />
                <Stat
                  label="24h"
                  value={`${positive ? "+" : ""}${token.change24h.toFixed(1)}%`}
                  accent={positive ? "primary" : "destructive"}
                />
                <Stat label="mcap" value={`$${formatK(token.marketCap)}`} />
                <Stat
                  label="liq dist"
                  value={`${token.liqDistance}%`}
                  accent={danger ? "destructive" : undefined}
                />
              </div>

              {/* graduation strip */}
              <div className="px-3 md:px-4 py-2 border-t border-border bg-secondary/20">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider mb-1.5">
                  <span className="text-muted-foreground">graduation</span>
                  <span className="text-primary font-bold">
                    {progress.toFixed(0)}% · ${formatK(token.marketCap)} / $69k
                  </span>
                </div>
                <div className="relative h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-primary" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Creator fees section - only show if fee vault data exists */}
              {feeVaultData && (
                <div className="px-3 md:px-4 py-2 border-t border-border bg-pink-500/5">
                  <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider mb-1.5">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Wallet className="h-3 w-3" /> creator fees
                    </span>
                    <span className="text-pink-500 font-bold">
                      {(feeVaultData.totalCollected - feeVaultData.creatorClaimed).toFixed(4)} SOL claimable
                    </span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span>total: {feeVaultData.totalCollected.toFixed(4)} SOL</span>
                    <span>claimed: {feeVaultData.creatorClaimed.toFixed(4)} SOL</span>
                  </div>
                  <button
                    onClick={claimFees}
                    disabled={claimingFees || (feeVaultData.totalCollected - feeVaultData.creatorClaimed) <= 0}
                    className="mt-2 w-full py-1.5 rounded border border-pink-500/50 bg-pink-500/10 text-pink-500 font-mono text-[10px] uppercase hover:bg-pink-500/20 transition-colors disabled:opacity-50"
                  >
                    {claimingFees ? "claiming..." : "claim creator fees"}
                  </button>
                </div>
              )}
            </div>

            <TokenRuggedGate
              id={token.id}
              ticker={token.ticker}
              leverage={token.leverage}
              direction={token.direction}
            >
              <TokenChart tokenMint={token.id} ticker={token.ticker} underlying={token.underlying} />
              <TokenStats />
              <TradeHistory />
            </TokenRuggedGate>
          </div>

          <aside className="space-y-3">
            <TradePanel token={token} />
          </aside>
        </div>
      </main>
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: "primary" | "destructive"
}) {
  return (
    <div className="px-3 py-2 border-r border-border last:border-r-0">
      <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={
          accent === "primary"
            ? "font-display text-base text-primary"
            : accent === "destructive"
              ? "font-display text-base text-destructive"
              : "font-display text-base text-foreground"
        }
      >
        {value}
      </div>
    </div>
  )
}

function formatK(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}
