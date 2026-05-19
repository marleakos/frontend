import Link from "next/link"
import type { Token } from "@/lib/mock-data"
import { LeverageBadge } from "@/components/leverage-badge"
import { MessageSquare, TrendingUp, TrendingDown, Skull, Users } from "lucide-react"

const HUES = [
  "from-primary/30 to-accent/20",
  "from-accent/25 to-info/20",
  "from-info/25 to-primary/20",
  "from-chart-5/25 to-primary/20",
  "from-chart-4/25 to-accent/20",
] as const

export function TokenCard({ token, index = 0 }: { token: Token; index?: number }) {
  const positive = token.change24h >= 0
  const danger = token.liqDistance < 15
  const hue = HUES[index % HUES.length]
  return (
    <Link
      href={`/token/${token.id}`}
      className="group relative block rounded-xl border-2 border-border bg-card overflow-hidden transition-all hover:-translate-y-1 hover:border-primary hover:shadow-[0_8px_0_0_color-mix(in_oklch,var(--primary)_60%,#000)] flex flex-col"
    >
      {/* avatar header */}
      <div className={`relative h-20 bg-gradient-to-br ${hue}`}>
        <div className="absolute inset-0 halftone opacity-40" />
        <div className="absolute inset-0 stripes opacity-30 mix-blend-overlay" />
        <div className="absolute -bottom-7 left-3 grid h-14 w-14 place-items-center rounded-xl bg-card border-2 border-foreground/10 text-3xl shadow-lg">
          {token.emoji}
        </div>
        <div className="absolute top-2 right-2 flex items-center gap-1">
          <LeverageBadge leverage={token.leverage} direction={token.direction} />
        </div>
        <div className="absolute bottom-2 right-2 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-background/70 text-foreground border border-border backdrop-blur-sm">
          {token.underlying}
        </div>
      </div>

      <div className="px-3 pt-9 pb-3 flex-1 flex flex-col">
        <div className="flex items-baseline gap-2">
          <h3 className="font-display text-base leading-tight truncate">
            {token.name.toUpperCase()}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <span className="text-primary font-bold">${token.ticker}</span>
          <span>·</span>
          <span>{ageLabel(token.ageMinutes)}</span>
          <span>·</span>
          <span className="truncate">by {token.creator}</span>
        </div>

        <p className="mt-2 text-[12px] text-foreground/70 line-clamp-2 leading-snug">
          {token.description}
        </p>

        {/* stats */}
        <div className="mt-3 grid grid-cols-3 gap-1 font-mono text-[10px]">
          <Cell label="mcap" value={`$${formatK(token.marketCap)}`} className="text-accent" />
          <Cell
            label="24h"
            value={`${positive ? "+" : ""}${token.change24h.toFixed(1)}%`}
            className={positive ? "text-primary" : "text-destructive"}
            icon={positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          />
          <Cell
            label="replies"
            value={String(token.replies)}
            icon={<MessageSquare className="h-3 w-3" />}
          />
        </div>

        {/* progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between font-mono text-[9px] mb-1 uppercase tracking-wider">
            <span className="text-muted-foreground">to raydium</span>
            <span className="text-primary font-bold">{token.progress}%</span>
          </div>
          <div className="relative h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent"
              style={{ width: `${token.progress}%` }}
            />
          </div>
        </div>

        {/* footer chips */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
            <Users className="h-3 w-3" /> {Math.floor(token.replies * 0.6)}
          </span>
          {danger ? (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/40 animate-pulse">
              <Skull className="h-3 w-3" /> liq {token.liqDistance}%
            </span>
          ) : (
            <span className="font-mono text-[10px] text-muted-foreground">
              liq {token.liqDistance}%
            </span>
          )}
        </div>
      </div>

      {/* CTA strip */}
      <div className="border-t-2 border-border bg-secondary/40 group-hover:bg-primary group-hover:text-primary-foreground py-2 text-center font-display text-xs uppercase tracking-wide transition-colors">
        ape in
      </div>
    </Link>
  )
}

function Cell({
  label,
  value,
  className,
  icon,
}: {
  label: string
  value: string
  className?: string
  icon?: React.ReactNode
}) {
  return (
    <div className="rounded border border-border/60 bg-background/60 px-1.5 py-1 min-w-0">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground leading-none mb-0.5">
        {label}
      </div>
      <div className={`flex items-center gap-0.5 font-bold truncate ${className ?? "text-foreground"}`}>
        {icon}
        <span className="truncate">{value}</span>
      </div>
    </div>
  )
}

function ageLabel(min: number) {
  if (min < 1) return "now"
  if (min < 60) return `${min}m`
  return `${Math.floor(min / 60)}h`
}

function formatK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
