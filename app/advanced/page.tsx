"use client"

import Link from "next/link"
import { useState } from "react"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { LeverageBadge } from "@/components/leverage-badge"
import { TokenChart } from "@/components/token-chart"
import { TradePanel } from "@/components/trade-panel"
import { tokens, liveTrades } from "@/lib/mock-data"
import { Search } from "lucide-react"

export default function AdvancedPage() {
  const [activeId, setActiveId] = useState(tokens[0].id)
  const [filter, setFilter] = useState("")
  const active = tokens.find((t) => t.id === activeId)!

  const filtered = tokens.filter(
    (t) =>
      t.ticker.toLowerCase().includes(filter.toLowerCase()) ||
      t.name.toLowerCase().includes(filter.toLowerCase()),
  )

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1600px] px-3 py-3">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_320px] gap-3 h-[calc(100dvh-9rem)]">
          {/* Watchlist */}
          <aside className="rounded-lg border border-border bg-card overflow-hidden flex flex-col">
            <div className="p-2 border-b border-border">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="filter"
                  className="w-full h-8 rounded-md border border-border bg-input pl-7 pr-2 text-xs font-mono outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>
            <ul className="overflow-y-auto divide-y divide-border">
              {filtered.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => setActiveId(t.id)}
                    className={
                      t.id === activeId
                        ? "w-full flex items-center gap-2 px-3 py-2 bg-secondary text-left"
                        : "w-full flex items-center gap-2 px-3 py-2 hover:bg-secondary/50 text-left"
                    }
                  >
                    <span className="text-xl">{t.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-xs font-bold truncate">${t.ticker}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">
                        {t.leverage}x {t.direction}
                      </div>
                    </div>
                    <span
                      className={
                        t.change24h >= 0
                          ? "font-mono text-[11px] text-primary"
                          : "font-mono text-[11px] text-destructive"
                      }
                    >
                      {t.change24h >= 0 ? "+" : ""}
                      {t.change24h.toFixed(0)}%
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Chart + book area */}
          <section className="grid grid-rows-[auto_1fr_220px] gap-3 min-h-0">
            <div className="rounded-lg border border-border bg-card px-4 py-2.5 flex items-center gap-3 flex-wrap">
              <span className="text-2xl">{active.emoji}</span>
              <Link href={`/token/${active.id}`} className="font-mono font-bold hover:text-primary">
                ${active.ticker}
              </Link>
              <span className="font-mono text-xs text-muted-foreground">{active.name}</span>
              <LeverageBadge leverage={active.leverage} direction={active.direction} />
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                {active.underlying}
              </span>
              <div className="ml-auto flex items-center gap-4 font-mono text-xs">
                <span>
                  <span className="text-muted-foreground">mcap </span>
                  <span className="text-accent font-bold">${(active.marketCap / 1000).toFixed(1)}k</span>
                </span>
                <span>
                  <span className="text-muted-foreground">24h </span>
                  <span className={active.change24h >= 0 ? "text-primary" : "text-destructive"}>
                    {active.change24h >= 0 ? "+" : ""}
                    {active.change24h.toFixed(1)}%
                  </span>
                </span>
                <span>
                  <span className="text-muted-foreground">liq </span>
                  <span className={active.liqDistance < 15 ? "text-destructive" : "text-foreground"}>
                    {active.liqDistance}%
                  </span>
                </span>
              </div>
            </div>

            <div className="min-h-0">
              <TokenChart ticker={active.ticker} underlying={active.underlying} />
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-4 py-2 border-b border-border font-mono text-xs text-muted-foreground">
                live trades — ${active.ticker}
              </div>
              <div className="overflow-y-auto h-[180px]">
                <table className="w-full font-mono text-[11px]">
                  <thead className="text-muted-foreground sticky top-0 bg-card">
                    <tr className="text-left">
                      <th className="px-4 py-1.5 font-normal">side</th>
                      <th className="px-4 py-1.5 font-normal">amount</th>
                      <th className="px-4 py-1.5 font-normal">user</th>
                      <th className="px-4 py-1.5 font-normal text-right">ago</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {liveTrades.map((tr) => (
                      <tr key={tr.id}>
                        <td
                          className={
                            tr.side === "BUY" ? "px-4 py-1.5 text-primary font-bold" : "px-4 py-1.5 text-destructive font-bold"
                          }
                        >
                          {tr.side}
                        </td>
                        <td className="px-4 py-1.5">{tr.amount} SOL</td>
                        <td className="px-4 py-1.5 text-muted-foreground">{tr.user}</td>
                        <td className="px-4 py-1.5 text-right text-muted-foreground">{tr.ago}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* Trade panel */}
          <aside className="min-h-0 overflow-y-auto">
            <TradePanel token={active} />
          </aside>
        </div>
      </main>
    </div>
  )
}
