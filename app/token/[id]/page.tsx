import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { TokenChart } from "@/components/token-chart"
import { TradePanel } from "@/components/trade-panel"
import { ThreadSection } from "@/components/thread-section"
import { TokenRuggedGate } from "@/components/token-rugged-gate"
import { tokens } from "@/lib/mock-data"
import { ArrowLeft, Copy, Twitter, Globe, Send } from "lucide-react"

export default async function TokenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = tokens.find((t) => t.id === id)
  if (!token) notFound()

  const positive = token.change24h >= 0
  const danger = token.liqDistance < 15
  const GRAD = 69000
  const progress = Math.min(100, (token.marketCap / GRAD) * 100)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1400px] px-4 py-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3 w-3" /> back to board
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          <div className="space-y-4">
            {/* Token header — pump-card style */}
            <div
              className="relative border-2 border-foreground bg-card"
              style={{ boxShadow: "6px 6px 0 0 hsl(var(--foreground))" }}
            >
              {danger && (
                <div
                  className="absolute -top-2.5 -right-2.5 z-10 select-none border-2 border-foreground bg-destructive px-2.5 py-0.5 font-display text-[11px] uppercase tracking-wider text-destructive-foreground"
                  style={{ transform: "rotate(6deg)", boxShadow: "2px 2px 0 0 hsl(var(--foreground))" }}
                >
                  near liq · {token.liqDistance}%
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-[160px_1fr]">
                <div className="relative grid place-items-center bg-primary border-b-2 sm:border-b-0 sm:border-r-2 border-foreground p-4">
                  <div className="text-[88px] leading-none drop-shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
                    {token.emoji}
                  </div>
                  <div className="absolute top-1.5 right-1.5 border border-primary-foreground/40 bg-primary-foreground/10 px-1 py-0.5 font-mono text-[9px] font-bold text-primary-foreground">
                    {token.leverage}x {token.direction.toLowerCase()}
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-primary-foreground/80">
                    {token.underlying}
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-display text-2xl md:text-3xl leading-none uppercase">{token.name}</h1>
                    <span className="font-mono text-sm text-muted-foreground">${token.ticker}</span>
                  </div>
                  <p className="text-sm text-foreground/80 max-w-xl">{token.description}</p>

                  <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-muted-foreground flex-wrap">
                    <button className="inline-flex items-center gap-1 border border-border bg-secondary px-2 py-0.5 hover:border-foreground">
                      <Copy className="h-3 w-3" /> 7Hk29...mP3qr
                    </button>
                    <span>by <span className="text-foreground">{token.creator}</span></span>
                    <span className="text-foreground">·</span>
                    <a href="#" className="hover:text-foreground"><Twitter className="h-3 w-3" /></a>
                    <a href="#" className="hover:text-foreground"><Send className="h-3 w-3" /></a>
                    <a href="#" className="hover:text-foreground"><Globe className="h-3 w-3" /></a>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 mt-2 border-2 border-foreground">
                    <Stat label="price" value={`$0.0034`} />
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
                </div>
              </div>

              {/* graduation strip */}
              <div className="px-4 py-3 border-t-2 border-foreground bg-secondary/30">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-wider mb-1">
                  <span className="text-muted-foreground">graduation to raydium</span>
                  <span className="text-primary font-bold">
                    {progress.toFixed(0)}% · ${formatK(token.marketCap)} / $69k
                  </span>
                </div>
                <div className="relative h-2 w-full border border-foreground bg-card">
                  <div
                    className="absolute left-0 top-0 h-full bg-primary"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <TokenRuggedGate
              id={token.id}
              ticker={token.ticker}
              leverage={token.leverage}
              direction={token.direction}
            >
              <TokenChart ticker={token.ticker} underlying={token.underlying} />
            </TokenRuggedGate>

            <ThreadSection ticker={token.ticker} replies={token.replies} />
          </div>

          <aside className="space-y-4">
            <TradePanel token={token} />
            <HoldersList />
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
    <div className="px-3 py-2 border-r-2 border-foreground last:border-r-0 bg-card">
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

function HoldersList() {
  const holders = [
    { addr: "9xQe...4Rk", pct: 12.4, isCreator: true, pnl: 4820 },
    { addr: "Hk2p...9Lm", pct: 6.8, pnl: 1840 },
    { addr: "Zx81...2Ap", pct: 4.2, pnl: -240 },
    { addr: "Mn4q...7Vc", pct: 3.1, pnl: 612 },
    { addr: "Pl9k...3Nb", pct: 2.7, pnl: -88 },
    { addr: "Ty3w...8Df", pct: 2.0, pnl: 420 },
    { addr: "Qa8r...1Ws", pct: 1.6, pnl: 144 },
    { addr: "Vb2x...5Hg", pct: 1.2, pnl: -56 },
  ]
  const max = Math.max(...holders.map((h) => h.pct))

  return (
    <div
      className="border-2 border-foreground bg-card"
      style={{ boxShadow: "6px 6px 0 0 hsl(var(--foreground))" }}
    >
      <div className="px-3 py-2 border-b-2 border-foreground bg-secondary/40 font-display text-xs uppercase tracking-wider">
        top holders
      </div>
      <ul>
        {holders.map((h, i) => (
          <li
            key={h.addr}
            className="relative px-3 py-2 border-t border-border first:border-t-0 font-mono text-xs overflow-hidden"
          >
            <div
              className="absolute inset-y-0 left-0 bg-primary/10 pointer-events-none"
              style={{ width: `${(h.pct / max) * 100}%` }}
            />
            <div className="relative flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-muted-foreground w-4">{i + 1}</span>
                <span>{h.addr}</span>
                {h.isCreator && (
                  <span className="text-[9px] px-1 border border-foreground bg-foreground text-background font-bold uppercase">
                    dev
                  </span>
                )}
              </span>
              <span className="flex items-center gap-2">
                <span
                  className={
                    h.pnl >= 0 ? "text-primary text-[10px] font-bold" : "text-destructive text-[10px] font-bold"
                  }
                >
                  {h.pnl >= 0 ? "+" : ""}
                  {h.pnl}$
                </span>
                <span className="text-foreground font-bold">{h.pct.toFixed(1)}%</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function formatK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
