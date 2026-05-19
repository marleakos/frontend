import { liveTrades } from "@/lib/mock-data"
import { ArrowUp, ArrowDown } from "lucide-react"

export function TradesTicker() {
  const a = [...liveTrades, ...liveTrades]
  const b = [...liveTrades.slice().reverse(), ...liveTrades.slice().reverse()]
  return (
    <div className="border-b-2 border-border bg-card/60">
      {/* row 1 — fast left */}
      <div className="overflow-hidden">
        <div className="flex animate-marquee-fast whitespace-nowrap py-1.5 gap-5 text-[11px] font-mono">
          {a.map((t, i) => (
            <span key={`a-${t.id}-${i}`} className="flex items-center gap-1.5">
              {t.side === "BUY" ? (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/15 text-primary font-bold border border-primary/30">
                  <ArrowUp className="h-3 w-3" /> {t.side}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-bold border border-destructive/30">
                  <ArrowDown className="h-3 w-3" /> {t.side}
                </span>
              )}
              <span className="text-foreground font-bold">${t.ticker}</span>
              <span className="text-muted-foreground">{t.amount} SOL</span>
              <span className="text-muted-foreground">· {t.user}</span>
              <span className="text-border">|</span>
            </span>
          ))}
        </div>
      </div>
      {/* row 2 — slow right */}
      <div className="overflow-hidden border-t border-border/60">
        <div className="flex animate-marquee-reverse whitespace-nowrap py-1.5 gap-5 text-[11px] font-mono opacity-80">
          {b.map((t, i) => (
            <span key={`b-${t.id}-${i}`} className="flex items-center gap-1.5">
              <span className="text-accent">●</span>
              <span className="text-foreground">${t.ticker}</span>
              <span className="text-muted-foreground">graduated +{((i % 7) + 1) * 12}%</span>
              <span className="text-border">|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
