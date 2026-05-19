"use client"

import { use } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { tokens } from "@/lib/mock-data"
import { ArrowLeft, Copy, ExternalLink } from "lucide-react"

const colors = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#ff66c4",
  "#ffd400",
  "#62d4ff",
]

function avatarColor(user: string) {
  let h = 0
  for (let i = 0; i < user.length; i++) h = (h * 31 + user.charCodeAt(i)) >>> 0
  return colors[h % colors.length]
}

// Mock user data generator
function getUserData(userId: string) {
  const hash = userId.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  
  // Generate some deterministic mock data based on userId
  const tokensCreated = tokens.filter((_, i) => (hash + i) % 7 === 0).slice(0, 3)
  const tokensHeld = tokens.filter((_, i) => (hash + i) % 4 === 0).slice(0, 5)
  
  const totalPnl = (hash % 20000) - 5000
  const tradesCount = 50 + (hash % 200)
  const winRate = 45 + (hash % 35)
  const joinedDaysAgo = 10 + (hash % 90)
  
  const recentTrades = [
    { id: "1", ticker: "MSOL5", side: "BUY" as const, sol: 2.4, ago: "2m", pnl: 420 },
    { id: "2", ticker: "DOGE10", side: "SELL" as const, sol: 1.2, ago: "15m", pnl: -88 },
    { id: "3", ticker: "ETH3X", side: "BUY" as const, sol: 5.1, ago: "1h", pnl: 1240 },
    { id: "4", ticker: "BEARBTC", side: "BUY" as const, sol: 0.8, ago: "3h", pnl: 312 },
    { id: "5", ticker: "WIF5X", side: "SELL" as const, sol: 3.3, ago: "6h", pnl: -156 },
  ]
  
  const comments = [
    { id: "1", ticker: "MSOL5", text: "this is the one. aping with conviction.", ago: "12m", likes: 24 },
    { id: "2", ticker: "DOGE10", text: "10x leverage on doge is peak degen", ago: "2h", likes: 18 },
    { id: "3", ticker: "ETH3X", text: "eth flippening loading...", ago: "1d", likes: 42 },
  ]
  
  return {
    id: userId,
    fullAddr: `${userId}...${userId.split("").reverse().join("")}`,
    totalPnl,
    tradesCount,
    winRate,
    joinedDaysAgo,
    tokensCreated,
    tokensHeld,
    recentTrades,
    comments,
  }
}

export default function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const user = getUserData(id)
  
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />
      
      <main className="mx-auto max-w-[900px] px-4 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3 w-3" /> back to board
        </Link>
        
        {/* Profile header */}
        <div className="rounded-lg border border-border bg-card overflow-hidden mb-4">
          <div className="p-5">
            <div className="flex items-center gap-4">
              <div
                className="grid h-16 w-16 place-items-center rounded-full text-2xl font-bold text-background"
                style={{ background: avatarColor(id) }}
              >
                {id[0]?.toUpperCase()}
              </div>
              <div>
                <h1 className="font-display text-2xl uppercase">{id}</h1>
                <button className="inline-flex items-center gap-1.5 mt-1 font-mono text-xs text-muted-foreground hover:text-foreground">
                  <Copy className="h-3 w-3" /> {user.fullAddr}
                </button>
                <div className="flex items-center gap-2 mt-1">
                  <a
                    href={`https://solscan.io/account/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-primary"
                  >
                    <ExternalLink className="h-3 w-3" /> solscan
                  </a>
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  joined {user.joinedDaysAgo}d ago
                </div>
              </div>
            </div>
          </div>
          
          {/* Stats strip */}
          <div className="grid grid-cols-4 border-t border-border">
            <StatBox
              label="total pnl"
              value={`${user.totalPnl >= 0 ? "+" : ""}$${user.totalPnl.toLocaleString()}`}
              accent={user.totalPnl >= 0 ? "primary" : "destructive"}
            />
            <StatBox label="trades" value={user.tradesCount.toString()} />
            <StatBox label="win rate" value={`${user.winRate}%`} accent={user.winRate >= 50 ? "primary" : undefined} />
            <StatBox label="coins created" value={user.tokensCreated.length.toString()} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Tokens held */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border font-display text-xs uppercase tracking-wider">
              tokens held ({user.tokensHeld.length})
            </div>
            {user.tokensHeld.length === 0 ? (
              <div className="p-6 text-center font-mono text-xs text-muted-foreground">no tokens held</div>
            ) : (
              <ul>
                {user.tokensHeld.map((t) => (
                  <li key={t.id} className="px-4 py-2.5 border-t border-border first:border-t-0 hover:bg-secondary/20">
                    <Link href={`/token/${t.id}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{t.emoji}</span>
                        <div>
                          <div className="font-display text-sm">{t.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">${t.ticker}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs text-foreground">${formatK(t.marketCap)}</div>
                        <div className={`font-mono text-[10px] ${t.change24h >= 0 ? "text-primary" : "text-destructive"}`}>
                          {t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(1)}%
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* Tokens created */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border font-display text-xs uppercase tracking-wider">
              tokens created ({user.tokensCreated.length})
            </div>
            {user.tokensCreated.length === 0 ? (
              <div className="p-6 text-center font-mono text-xs text-muted-foreground">no tokens created</div>
            ) : (
              <ul>
                {user.tokensCreated.map((t) => (
                  <li key={t.id} className="px-4 py-2.5 border-t border-border first:border-t-0 hover:bg-secondary/20">
                    <Link href={`/token/${t.id}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{t.emoji}</span>
                        <div>
                          <div className="font-display text-sm">{t.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">${t.ticker}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs text-foreground">${formatK(t.marketCap)}</div>
                        <div className="font-mono text-[10px] text-primary">{t.progress}% to grad</div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        
        {/* Recent trades */}
        <div className="rounded-lg border border-border bg-card overflow-hidden mt-4">
          <div className="px-4 py-2.5 border-b border-border font-display text-xs uppercase tracking-wider">
            recent trades
          </div>
          <ul>
            {user.recentTrades.map((tx) => (
              <li
                key={tx.id}
                className="px-4 py-2.5 border-t border-border first:border-t-0 hover:bg-secondary/20"
              >
                <div className="flex items-center justify-between font-mono text-sm">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold uppercase tracking-wide text-[11px] ${
                        tx.side === "BUY" ? "text-primary" : "text-destructive"
                      }`}
                    >
                      {tx.side === "BUY" ? "+ buy" : "- sell"}
                    </span>
                    <Link href={`/token/1`} className="text-foreground hover:text-primary">
                      ${tx.ticker}
                    </Link>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-foreground font-bold">{tx.sol} SOL</span>
                    <span className={tx.pnl >= 0 ? "text-primary font-bold" : "text-destructive font-bold"}>
                      {tx.pnl >= 0 ? "+" : ""}{tx.pnl}$
                    </span>
                    <span className="text-muted-foreground">{tx.ago}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Recent comments */}
        <div className="rounded-lg border border-border bg-card overflow-hidden mt-4">
          <div className="px-4 py-2.5 border-b border-border font-display text-xs uppercase tracking-wider">
            recent comments
          </div>
          <ul>
            {user.comments.map((c) => (
              <li key={c.id} className="px-4 py-3 border-t border-border first:border-t-0 hover:bg-secondary/20">
                <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground mb-1.5">
                  <Link href={`/token/1`} className="text-primary hover:underline">${c.ticker}</Link>
                  <span>·</span>
                  <span>{c.ago}</span>
                  <span>·</span>
                  <span>{"<3"} {c.likes}</span>
                </div>
                <p className="text-sm text-foreground">{c.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  )
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: "primary" | "destructive"
}) {
  return (
    <div className="px-3 py-3 border-r border-border last:border-r-0 text-center">
      <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={
          accent === "primary"
            ? "font-display text-lg text-primary"
            : accent === "destructive"
              ? "font-display text-lg text-destructive"
              : "font-display text-lg text-foreground"
        }
      >
        {value}
      </div>
    </div>
  )
}

function formatK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
