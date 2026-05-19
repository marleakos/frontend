import Link from "next/link"
import { liveTrades } from "@/lib/mock-data"

export function TradesTicker() {
  const items = [...liveTrades, ...liveTrades, ...liveTrades]
  return (
    <div className="border-b border-border overflow-hidden">
      <div className="flex animate-marquee-fast whitespace-nowrap py-2 font-mono text-[11px]">
        {items.map((t, i) => (
          <Link
            key={`${t.id}-${i}`}
            href="/"
            className="mx-3 inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <span className={t.side === "BUY" ? "text-primary font-bold" : "text-destructive font-bold"}>
              {t.side}
            </span>
            <span className="text-foreground">${t.ticker}</span>
            <span className="text-muted-foreground">{t.amount} SOL</span>
            <span className="text-muted-foreground">by {t.user}</span>
            <span className="text-border">·</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
