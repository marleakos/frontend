import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { traders } from "@/lib/extra-data"
import { tokens } from "@/lib/mock-data"
import { Trophy, Crown, Medal } from "lucide-react"

export default function LeaderboardPage() {
  const topTokens = [...tokens].sort((a, b) => b.marketCap - a.marketCap).slice(0, 5)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="mb-6">
          <h1 className="font-mono font-bold text-3xl md:text-4xl flex items-center gap-3">
            <Trophy className="h-8 w-8 text-accent" />
            leaderboard
          </h1>
          <p className="mt-1 text-sm text-muted-foreground font-mono">
            top traders ranked by realized PnL across all leveraged meme tokens.
          </p>
        </div>

        {/* Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          {traders.slice(0, 3).map((t) => (
            <div
              key={t.user}
              className={
                t.rank === 1
                  ? "rounded-lg border border-accent bg-card p-4 glow-primary order-first md:order-2"
                  : "rounded-lg border border-border bg-card p-4"
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {t.rank === 1 ? (
                    <Crown className="h-5 w-5 text-accent" />
                  ) : (
                    <Medal className={t.rank === 2 ? "h-5 w-5 text-foreground" : "h-5 w-5 text-muted-foreground"} />
                  )}
                  <span className="font-mono font-bold text-sm">#{t.rank}</span>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">{t.trades} trades</span>
              </div>
              <div className="mt-3 font-mono text-base font-bold">{t.user}</div>
              <div className="mt-1 font-mono text-2xl font-bold text-primary">+${(t.pnl / 1000).toFixed(1)}k</div>
              <div className="mt-3 grid grid-cols-3 gap-2 font-mono text-[11px]">
                <Mini label="vol" value={`$${(t.volume / 1e6).toFixed(2)}M`} />
                <Mini label="winrate" value={`${t.winRate}%`} />
                <Mini label="liqs" value={String(t.liquidations)} tone="destructive" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          {/* Full table */}
          <section className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border font-mono text-sm font-bold">all traders</div>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-xs">
                <thead className="text-muted-foreground">
                  <tr className="text-left">
                    <th className="px-4 py-2 font-normal">#</th>
                    <th className="px-4 py-2 font-normal">trader</th>
                    <th className="px-4 py-2 font-normal">pnl</th>
                    <th className="px-4 py-2 font-normal">volume</th>
                    <th className="px-4 py-2 font-normal">trades</th>
                    <th className="px-4 py-2 font-normal">winrate</th>
                    <th className="px-4 py-2 font-normal">liqs</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {traders.map((t) => (
                    <tr key={t.user} className="hover:bg-secondary/40">
                      <td className="px-4 py-2.5 text-muted-foreground">{t.rank}</td>
                      <td className="px-4 py-2.5 font-bold">{t.user}</td>
                      <td className="px-4 py-2.5 text-primary">+${(t.pnl / 1000).toFixed(1)}k</td>
                      <td className="px-4 py-2.5 text-foreground">${(t.volume / 1000).toFixed(0)}k</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{t.trades}</td>
                      <td className="px-4 py-2.5">{t.winRate}%</td>
                      <td className="px-4 py-2.5 text-destructive">{t.liquidations}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Side panel: top tokens */}
          <aside className="rounded-lg border border-border bg-card overflow-hidden self-start">
            <div className="px-4 py-2.5 border-b border-border font-mono text-sm font-bold">top tokens by mcap</div>
            <ul className="divide-y divide-border">
              {topTokens.map((tk, i) => (
                <li key={tk.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="font-mono text-xs text-muted-foreground w-4">{i + 1}</span>
                  <span className="text-2xl">{tk.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-mono text-sm font-bold truncate">${tk.ticker}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">
                      {tk.leverage}x {tk.direction} · {tk.underlying}
                    </div>
                  </div>
                  <div className="font-mono text-xs text-accent font-bold">
                    ${(tk.marketCap / 1000).toFixed(1)}k
                  </div>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </main>
    </div>
  )
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: "destructive" }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={tone === "destructive" ? "font-bold text-destructive" : "font-bold text-foreground"}>
        {value}
      </div>
    </div>
  )
}
