import type { Token } from "@/lib/mock-data"
import { Crown, MessageSquare, TrendingUp, Skull, Flame, Eye } from "lucide-react"
import { LeverageBadge } from "@/components/leverage-badge"
import Link from "next/link"

export function KingOfTheHill({ token }: { token: Token }) {
  return (
    <section className="mb-8">
      {/* label strip */}
      <div className="flex items-center gap-3 mb-3">
        <div className="inline-flex items-center gap-2 rounded-full border-2 border-accent bg-accent/10 px-3 py-1">
          <Crown className="h-3.5 w-3.5 text-accent animate-wobble" />
          <span className="font-display text-xs uppercase tracking-wider text-accent">king of the hill</span>
        </div>
        <div className="flex-1 h-0.5 stripes" />
        <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
          <Eye className="h-3 w-3" /> 2,481 watching
        </span>
      </div>

      <div className="rainbow-border rounded-2xl">
        <div className="rounded-2xl bg-card overflow-hidden">
          <div className="relative grid md:grid-cols-[auto_1fr_auto] gap-5 items-center p-5">
            {/* halftone bg */}
            <div className="absolute inset-0 halftone opacity-30 pointer-events-none" />

            {/* avatar */}
            <div className="relative shrink-0">
              <div className="grid h-28 w-28 place-items-center rounded-2xl bg-gradient-to-br from-primary/30 to-accent/30 text-6xl border-2 border-foreground/10 animate-bounce-soft">
                {token.emoji}
              </div>
              <div className="absolute -top-2 -right-2 grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground border-2 border-background shadow-lg">
                <Crown className="h-4 w-4" strokeWidth={3} />
              </div>
            </div>

            {/* info */}
            <div className="relative min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-display text-2xl md:text-3xl leading-none">
                  {token.name.toUpperCase()}
                </h3>
                <span className="font-mono text-sm text-muted-foreground">${token.ticker}</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                <LeverageBadge leverage={token.leverage} direction={token.direction} />
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                  {token.underlying}
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-accent/15 text-accent border border-accent/40">
                  <Flame className="h-2.5 w-2.5" /> trending #1
                </span>
                {token.liqDistance < 20 && (
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/40 animate-pulse">
                    <Skull className="h-2.5 w-2.5" /> {token.liqDistance}% to liq
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/80 mb-3 max-w-xl text-pretty">
                {token.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
                <Stat label="market cap" value={`$${token.marketCap.toLocaleString()}`} accent />
                <Stat
                  label="24h"
                  value={`+${token.change24h.toFixed(1)}%`}
                  color="text-primary"
                  icon={<TrendingUp className="h-3 w-3" />}
                />
                <Stat label="replies" value={String(token.replies)} icon={<MessageSquare className="h-3 w-3" />} />
                <Stat label="holders" value="1.2k" />
              </div>
            </div>

            {/* progress + cta */}
            <div className="relative w-full md:w-72 shrink-0">
              <div className="rounded-xl border-2 border-border bg-secondary/40 p-3">
                <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
                  <span className="text-muted-foreground uppercase tracking-wider">to raydium</span>
                  <span className="text-primary font-bold">{token.progress}%</span>
                </div>
                <div className="relative h-3 rounded-full bg-background overflow-hidden border border-border">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-marquee"
                    style={{ width: `${token.progress}%` }}
                  />
                </div>
                <div className="mt-1 text-[10px] font-mono text-muted-foreground">
                  graduates at $69,000 mcap
                </div>
              </div>
              <Link
                href={`/token/${token.id}`}
                className="brick mt-3 grid place-items-center w-full rounded-md bg-primary text-primary-foreground font-display text-sm uppercase tracking-wide py-3 hover:-translate-y-0.5 transition-transform"
              >
                ape in &rarr;
              </Link>
            </div>
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
    <div className="rounded-md border border-border/70 bg-background/60 px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`flex items-center gap-1 ${accent ? "text-accent" : color ?? "text-foreground"} font-bold`}>
        {icon}
        {value}
      </div>
    </div>
  )
}
