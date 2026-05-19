import { notFound } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { LeverageBadge } from "@/components/leverage-badge"
import { TokenChart } from "@/components/token-chart"
import { TradePanel } from "@/components/trade-panel"
import { ThreadSection } from "@/components/thread-section"
import { tokens } from "@/lib/mock-data"
import { ArrowLeft, Copy, ExternalLink, Skull, TrendingDown, TrendingUp, Users } from "lucide-react"

export default async function TokenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const token = tokens.find((t) => t.id === id)
  if (!token) notFound()

  const positive = token.change24h >= 0
  const danger = token.liqDistance < 15

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
            {/* Token header */}
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start gap-4 flex-wrap">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-md bg-secondary text-5xl border border-border">
                  {token.emoji}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="font-mono font-bold text-2xl text-foreground">{token.name}</h1>
                    <span className="font-mono text-sm text-muted-foreground">${token.ticker}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <LeverageBadge leverage={token.leverage} direction={token.direction} />
                    <span className="font-mono text-[11px] px-2 py-1 rounded bg-secondary text-muted-foreground">
                      {token.underlying}
                    </span>
                    <span className="font-mono text-[11px] px-2 py-1 rounded bg-secondary text-muted-foreground inline-flex items-center gap-1">
                      <Users className="h-3 w-3" /> 1,284 holders
                    </span>
                    {danger && (
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-1 rounded bg-destructive/15 text-destructive border border-destructive/40">
                        <Skull className="h-3 w-3" />
                        near liquidation
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{token.description}</p>
                  <div className="flex items-center gap-3 mt-3 font-mono text-[11px] text-muted-foreground">
                    <button className="inline-flex items-center gap-1 hover:text-foreground">
                      <Copy className="h-3 w-3" /> 7Hk29...mP3qr
                    </button>
                    <span>by {token.creator}</span>
                    <a className="inline-flex items-center gap-1 hover:text-foreground" href="#">
                      drift <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full sm:w-auto">
                  <Stat label="price" value={`$0.0${"0".repeat(2)}${Math.floor(Math.random() * 9000 + 1000)}`} />
                  <Stat
                    label="24h"
                    value={`${positive ? "+" : ""}${token.change24h.toFixed(1)}%`}
                    valueClass={positive ? "text-primary" : "text-destructive"}
                    icon={positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  />
                  <Stat label="mcap" value={`$${formatK(token.marketCap)}`} valueClass="text-accent" />
                  <Stat
                    label="liq dist"
                    value={`${token.liqDistance}%`}
                    valueClass={danger ? "text-destructive" : "text-foreground"}
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
                  <span className="text-muted-foreground">graduation to raydium @ $69k</span>
                  <span className="text-primary font-bold">
                    {token.progress}% — ${formatK(token.marketCap)} / $69k
                  </span>
                </div>
                <div className="h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${token.progress}%` }} />
                </div>
              </div>
            </div>

            <TokenChart ticker={token.ticker} underlying={token.underlying} />

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
  valueClass,
  icon,
}: {
  label: string
  value: string
  valueClass?: string
  icon?: React.ReactNode
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`font-mono font-bold text-base flex items-center gap-1 ${valueClass ?? "text-foreground"}`}>
        {icon}
        {value}
      </div>
    </div>
  )
}

function HoldersList() {
  const holders = [
    { addr: "9xQe...4Rk", pct: 12.4, isCreator: true },
    { addr: "Hk2p...9Lm", pct: 6.8 },
    { addr: "Zx81...2Ap", pct: 4.2 },
    { addr: "Mn4q...7Vc", pct: 3.1 },
    { addr: "Pl9k...3Nb", pct: 2.7 },
    { addr: "Ty3w...8Df", pct: 2.0 },
    { addr: "Qa8r...1Ws", pct: 1.6 },
    { addr: "Vb2x...5Hg", pct: 1.2 },
  ]
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="px-3 py-2 border-b border-border font-mono text-xs text-muted-foreground">
        top holders
      </div>
      <ul className="divide-y divide-border">
        {holders.map((h) => (
          <li key={h.addr} className="flex items-center justify-between px-3 py-2 font-mono text-xs">
            <span className="flex items-center gap-2">
              <span>{h.addr}</span>
              {h.isCreator && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/40">
                  creator
                </span>
              )}
            </span>
            <span className="text-foreground">{h.pct.toFixed(1)}%</span>
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
