import type { Token } from "@/lib/mock-data"
import { Crown, MessageSquare, TrendingUp, TrendingDown } from "lucide-react"
import { LeverageBadge } from "@/components/leverage-badge"

export function KingOfTheHill({ token }: { token: Token }) {
  const isLong = token.direction === "LONG"
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Crown className="h-4 w-4 text-accent" />
        <h2 className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          king of the hill
        </h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="rounded-xl border border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card p-5 glow-primary">
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-lg bg-secondary text-5xl border border-border">
            {token.emoji}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="font-mono font-bold text-xl text-foreground">
                {token.name}
              </h3>
              <span className="font-mono text-sm text-muted-foreground">
                ${token.ticker}
              </span>
              <LeverageBadge leverage={token.leverage} direction={token.direction} />
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground">
                {token.underlying}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {token.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <Stat label="market cap" value={`$${token.marketCap.toLocaleString()}`} accent />
              <Stat
                label="24h"
                value={`${isLong ? "+" : ""}${token.change24h.toFixed(1)}%`}
                color={token.change24h >= 0 ? "text-primary" : "text-destructive"}
                icon={token.change24h >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              />
              <Stat label="replies" value={String(token.replies)} icon={<MessageSquare className="h-3 w-3" />} />
              <Stat label="liq distance" value={`${token.liqDistance}%`} color={token.liqDistance < 15 ? "text-destructive" : "text-foreground"} />
            </div>
          </div>

          <div className="w-full md:w-64 shrink-0">
            <div className="flex items-center justify-between font-mono text-xs mb-1.5">
              <span className="text-muted-foreground">graduation</span>
              <span className="text-primary font-bold">{token.progress}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${token.progress}%` }}
              />
            </div>
            <div className="mt-1 text-[10px] font-mono text-muted-foreground">
              graduates to raydium at $69k mcap
            </div>
            <button className="mt-3 w-full rounded-md bg-primary text-primary-foreground font-mono font-bold py-2 text-sm hover:bg-primary/90">
              [ ape in ]
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

function Stat({
  label,
  value,
  color,
  accent,
  icon,
}: {
  label: string
  value: string
  color?: string
  accent?: boolean
  icon?: React.ReactNode
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`flex items-center gap-1 ${accent ? "text-accent" : color ?? "text-foreground"} font-bold`}>
        {icon}
        {value}
      </div>
    </div>
  )
}
