"use client"

import { useState } from "react"
import Link from "next/link"
import { Activity, ExternalLink } from "lucide-react"

interface Trade {
  id: string
  type: "buy" | "sell"
  trader: string
  sol: number
  tokens: string
  time: string
}

const MOCK_TRADES: Trade[] = [
  { id: "1", type: "buy", trader: "Zcc3Zc...Z6xn", sol: 9.32, tokens: "19.34M", time: "9s ago" },
  { id: "2", type: "buy", trader: "vR8BFx...b59a", sol: 4.92, tokens: "10.2M", time: "3m ago" },
  { id: "3", type: "sell", trader: "kxyDb...zBa3", sol: 5.64, tokens: "8.71M", time: "3h ago" },
  { id: "4", type: "buy", trader: "VuZfc...uq2T", sol: 1.98, tokens: "4.71M", time: "3h ago" },
  { id: "5", type: "buy", trader: "cixzEt...tRGX", sol: 1.01, tokens: "2.33M", time: "3h ago" },
  { id: "6", type: "sell", trader: "Aj3qx...LzaQ", sol: 7.15, tokens: "31.96M", time: "4h ago" },
  { id: "7", type: "buy", trader: "XF9RAs...5yn8", sol: 7.38, tokens: "13.31M", time: "4h ago" },
  { id: "8", type: "buy", trader: "Fdb4xs...7Vtr", sol: 2.57, tokens: "2.70M", time: "4h ago" },
  { id: "9", type: "sell", trader: "XzCgHH...aMGq", sol: 8.54, tokens: "29.51M", time: "4h ago" },
  { id: "10", type: "buy", trader: "Hf3VyB...zQj7", sol: 3.33, tokens: "6.10M", time: "5h ago" },
  { id: "11", type: "sell", trader: "BXVEY5...tbuN", sol: 3.33, tokens: "12.65M", time: "5h ago" },
  { id: "12", type: "buy", trader: "XhQ4gX...oeY1", sol: 6.49, tokens: "20.38M", time: "5h ago" },
  { id: "13", type: "sell", trader: "wrKBGU...nc5b", sol: 6.95, tokens: "29.74M", time: "6h ago" },
  { id: "14", type: "buy", trader: "pvo3hQ...uk37", sol: 1.37, tokens: "2.53M", time: "7h ago" },
]

export function TradeHistory() {
  const [visibleCount, setVisibleCount] = useState(10)
  const visibleTrades = MOCK_TRADES.slice(0, visibleCount)
  const hasMore = visibleCount < MOCK_TRADES.length

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-3 py-2 border-b border-border font-display text-xs uppercase tracking-wider flex items-center gap-2">
        <Activity className="h-3.5 w-3.5 text-primary" />
        trade history ({MOCK_TRADES.length})
      </div>
      
      <div className="divide-y divide-border">
        {visibleTrades.map((trade) => (
          <div key={trade.id} className="px-3 py-2.5 flex items-center justify-between hover:bg-secondary/20">
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                trade.type === "buy" 
                  ? "bg-[#39ff14] text-black" 
                  : "bg-destructive text-destructive-foreground"
              }`}>
                {trade.type === "buy" ? "▲ BUY" : "▼ SELL"}
              </span>
              <Link 
                href={`/user/${trade.trader.split("...")[0]}`}
                className="font-mono text-xs text-muted-foreground hover:text-primary"
              >
                {trade.trader}
              </Link>
            </div>
            
            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="font-mono text-xs font-bold">{trade.sol} SOL</div>
                <div className="font-mono text-[10px] text-muted-foreground">{trade.tokens} tokens</div>
              </div>
              <div className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                {trade.time}
                <ExternalLink className="h-3 w-3" />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <button
          onClick={() => setVisibleCount(prev => prev + 10)}
          className="w-full py-3 font-mono text-xs text-muted-foreground hover:text-foreground hover:bg-secondary/20 transition-colors border-t border-border"
        >
          Load More
        </button>
      )}
    </div>
  )
}
