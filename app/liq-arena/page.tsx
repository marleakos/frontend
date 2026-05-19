import Link from "next/link"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { LeverageBadge } from "@/components/leverage-badge"
import { tokens } from "@/lib/mock-data"
import { Skull, Flame, AlertTriangle, ShieldCheck } from "lucide-react"

export default function LiqArenaPage() {
  const sorted = [...tokens].sort((a, b) => a.liqDistance - b.liqDistance)
  const danger = sorted.filter((t) => t.liqDistance < 15)
  const watch = sorted.filter((t) => t.liqDistance >= 15 && t.liqDistance < 30)
  const safe = sorted.filter((t) => t.liqDistance >= 30)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1400px] px-4 py-8">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="font-mono font-bold text-3xl md:text-4xl flex items-center gap-3">
              <Flame className="h-8 w-8 text-destructive" />
              liquidation arena
            </h1>
            <p className="mt-1 text-sm text-muted-foreground font-mono">
              live perp positions backing every token. closer to 0% = closer to zero.
            </p>
          </div>
          <div className="flex gap-3 font-mono text-xs">
            <Pill label="near liq" value={danger.length} tone="destructive" />
            <Pill label="watchlist" value={watch.length} tone="accent" />
            <Pill label="safe" value={safe.length} tone="primary" />
          </div>
        </div>

        {/* Heatmap */}
        <section className="rounded-lg border border-border bg-card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-mono font-bold text-sm">heatmap</h2>
            <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
              <span className="inline-block w-3 h-3 rounded bg-destructive" /> &lt;15%
              <span className="inline-block w-3 h-3 rounded bg-accent ml-2" /> &lt;30%
              <span className="inline-block w-3 h-3 rounded bg-primary ml-2" /> safe
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
            {sorted.map((t) => {
              const tone =
                t.liqDistance < 15
                  ? "bg-destructive/80 text-destructive-foreground"
                  : t.liqDistance < 30
                    ? "bg-accent/80 text-accent-foreground"
                    : "bg-primary/70 text-primary-foreground"
              return (
                <Link
                  key={t.id}
                  href={`/token/${t.id}`}
                  className={`rounded-md p-2 ${tone} hover:opacity-90 transition-opacity`}
                >
                  <div className="font-mono text-[11px] font-bold truncate">${t.ticker}</div>
                  <div className="font-mono text-[10px] opacity-80">{t.liqDistance}% to liq</div>
                  <div className="font-mono text-[10px] opacity-80">
                    {t.leverage}x {t.direction}
                  </div>
                </Link>
              )
            })}
          </div>
        </section>

        <Group title="near liquidation" icon={<Skull className="h-4 w-4 text-destructive" />} rows={danger} tone="destructive" />
        <Group title="watchlist" icon={<AlertTriangle className="h-4 w-4 text-accent" />} rows={watch} tone="accent" />
        <Group title="safe" icon={<ShieldCheck className="h-4 w-4 text-primary" />} rows={safe} tone="primary" />
      </main>
    </div>
  )
}

function Pill({ label, value, tone }: { label: string; value: number; tone: "destructive" | "accent" | "primary" }) {
  const cls =
    tone === "destructive"
      ? "border-destructive/40 bg-destructive/10 text-destructive"
      : tone === "accent"
        ? "border-accent/40 bg-accent/10 text-accent"
        : "border-primary/40 bg-primary/10 text-primary"
  return (
    <div className={`px-3 py-1.5 rounded-md border ${cls}`}>
      <span className="opacity-70">{label}</span> <span className="font-bold">{value}</span>
    </div>
  )
}

function Group({
  title,
  icon,
  rows,
  tone,
}: {
  title: string
  icon: React.ReactNode
  rows: typeof tokens
  tone: "destructive" | "accent" | "primary"
}) {
  if (rows.length === 0) return null
  const bar =
    tone === "destructive" ? "bg-destructive" : tone === "accent" ? "bg-accent" : "bg-primary"
  return (
    <section className="rounded-lg border border-border bg-card mb-4 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border font-mono text-sm font-bold">
        {icon}
        {title}
        <span className="text-muted-foreground font-normal">({rows.length})</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <thead className="text-muted-foreground">
            <tr className="text-left">
              <th className="px-4 py-2 font-normal">token</th>
              <th className="px-4 py-2 font-normal">leverage</th>
              <th className="px-4 py-2 font-normal">underlying</th>
              <th className="px-4 py-2 font-normal">mcap</th>
              <th className="px-4 py-2 font-normal">24h</th>
              <th className="px-4 py-2 font-normal">liq distance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((t) => (
              <tr key={t.id} className="hover:bg-secondary/40">
                <td className="px-4 py-2.5">
                  <Link href={`/token/${t.id}`} className="flex items-center gap-2 hover:text-primary">
                    <span className="text-xl">{t.emoji}</span>
                    <span className="font-bold">${t.ticker}</span>
                    <span className="text-muted-foreground truncate">{t.name}</span>
                  </Link>
                </td>
                <td className="px-4 py-2.5">
                  <LeverageBadge leverage={t.leverage} direction={t.direction} />
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{t.underlying}</td>
                <td className="px-4 py-2.5 text-accent">${(t.marketCap / 1000).toFixed(1)}k</td>
                <td className={t.change24h >= 0 ? "px-4 py-2.5 text-primary" : "px-4 py-2.5 text-destructive"}>
                  {t.change24h >= 0 ? "+" : ""}
                  {t.change24h.toFixed(1)}%
                </td>
                <td className="px-4 py-2.5 w-64">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full ${bar}`} style={{ width: `${Math.min(100, t.liqDistance * 2)}%` }} />
                    </div>
                    <span className="text-foreground w-10 text-right">{t.liqDistance}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
