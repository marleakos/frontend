import type { Token } from "@/lib/mock-data"
import { LeverageBadge } from "@/components/leverage-badge"
import { MessageSquare, TrendingUp, TrendingDown, Skull } from "lucide-react"

export function TokenCard({ token }: { token: Token }) {
  const positive = token.change24h >= 0
  const danger = token.liqDistance < 15
  return (
    <article className="group rounded-lg border border-border bg-card hover:border-primary/60 transition-colors overflow-hidden flex flex-col">
      <div className="flex gap-3 p-3">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-secondary text-3xl border border-border">
          {token.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-mono font-bold text-sm text-foreground truncate">
              {token.name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[11px] text-muted-foreground">
            <span>${token.ticker}</span>
            <span>·</span>
            <span>{ageLabel(token.ageMinutes)}</span>
            <span>·</span>
            <span className="truncate">by {token.creator}</span>
          </div>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            <LeverageBadge leverage={token.leverage} direction={token.direction} />
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
              {token.underlying}
            </span>
            {danger && (
              <span className="inline-flex items-center gap-1 font-mono text-[10px] px-1.5 py-0.5 rounded bg-destructive/15 text-destructive border border-destructive/40">
                <Skull className="h-2.5 w-2.5" />
                near liq
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="px-3 text-xs text-muted-foreground line-clamp-2 mb-3">
        {token.description}
      </p>

      <div className="px-3 grid grid-cols-3 gap-2 font-mono text-[11px]">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">mcap</div>
          <div className="text-accent font-bold">${formatK(token.marketCap)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">24h</div>
          <div
            className={`font-bold flex items-center gap-0.5 ${
              positive ? "text-primary" : "text-destructive"
            }`}
          >
            {positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {positive ? "+" : ""}
            {token.change24h.toFixed(1)}%
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">replies</div>
          <div className="text-foreground font-bold flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            {token.replies}
          </div>
        </div>
      </div>

      <div className="p-3 mt-3">
        <div className="flex items-center justify-between font-mono text-[10px] mb-1">
          <span className="text-muted-foreground">graduation</span>
          <span className="text-primary font-bold">{token.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${token.progress}%` }}
          />
        </div>
      </div>

      <button className="mt-auto border-t border-border bg-secondary/40 group-hover:bg-primary group-hover:text-primary-foreground py-2 font-mono text-xs font-bold text-foreground transition-colors">
        [ ape in ]
      </button>
    </article>
  )
}

function ageLabel(min: number) {
  if (min < 1) return "now"
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  return `${h}h`
}

function formatK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}
