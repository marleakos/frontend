import { liveTrades } from "@/lib/mock-data"

export function TradesTicker() {
  const items = [...liveTrades, ...liveTrades]
  return (
    <div className="border-b border-border bg-card/40 overflow-hidden">
      <div className="flex animate-marquee whitespace-nowrap py-2 gap-6 text-xs font-mono">
        {items.map((t, i) => (
          <span key={`${t.id}-${i}`} className="flex items-center gap-2">
            <span
              className={
                t.side === "BUY" ? "text-primary font-bold" : "text-destructive font-bold"
              }
            >
              {t.side}
            </span>
            <span className="text-foreground">${t.ticker}</span>
            <span className="text-muted-foreground">{t.amount} SOL</span>
            <span className="text-muted-foreground">by {t.user}</span>
            <span className="text-muted-foreground">· {t.ago}</span>
            <span className="text-border">|</span>
          </span>
        ))}
      </div>
    </div>
  )
}
