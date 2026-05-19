import Link from "next/link"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { fees, faqs } from "@/lib/extra-data"
import { Book, Coins, ShieldAlert, Rocket, Zap } from "lucide-react"

export default function DocsPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1100px] px-4 py-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-secondary/50 font-mono text-[11px] text-muted-foreground mb-4">
            <Book className="h-3.5 w-3.5 text-primary" /> docs · v0.1
          </div>
          <h1 className="font-mono font-bold text-4xl md:text-5xl text-balance">
            pump.fun <span className="text-primary">with leverage</span>.
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-muted-foreground font-mono text-pretty">
            every coin launched on leverage.fun is backed by a perp position on drift. price = underlying ×
            leverage. graduate at $69k to raydium. liquidate and the coin goes to zero. that&apos;s it.
          </p>
        </div>

        {/* How it works */}
        <section className="mb-10">
          <h2 className="font-mono font-bold text-xl mb-4 flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" /> how it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Step n={1} title="deploy" body="creator picks a name, ticker, image, underlying perp (SOL/BTC/ETH), leverage (2/3/5x) and direction (long/short). pays 0.1 SOL." />
            <Step n={2} title="trade" body="users buy on a bonding curve. every buy adds liquidity and opens more of the backing perp on drift." />
            <Step n={3} title="track" body="price = underlying × leverage. if SOL is up 10% on a 5x long, the token is up ~50%." />
            <Step n={4} title="graduate" body="at $69k mcap the LP migrates to raydium. perp is closed. token now trades like any other SPL." />
          </div>
        </section>

        {/* Example */}
        <section className="mb-10 rounded-lg border border-border bg-card p-6">
          <h2 className="font-mono font-bold text-xl mb-3 flex items-center gap-2">
            <Zap className="h-5 w-5 text-accent" /> example: $BULL
          </h2>
          <ul className="font-mono text-sm space-y-2">
            <li><span className="text-muted-foreground">deploy:</span> $BULL — 3x SOL-PERP long</li>
            <li><span className="text-muted-foreground">SOL goes from $158 → $173.8 (+10%):</span> $BULL is up <span className="text-primary font-bold">~30%</span></li>
            <li><span className="text-muted-foreground">SOL goes from $158 → $134.3 (-15%):</span> $BULL is down <span className="text-destructive font-bold">~45%</span></li>
            <li><span className="text-muted-foreground">SOL drops &gt;33%:</span> backing perp liquidates, $BULL goes to <span className="text-destructive font-bold">$0</span></li>
          </ul>
        </section>

        {/* Fees */}
        <section className="mb-10">
          <h2 className="font-mono font-bold text-xl mb-4 flex items-center gap-2">
            <Coins className="h-5 w-5 text-accent" /> fees
          </h2>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full font-mono text-sm">
              <thead className="text-muted-foreground bg-secondary/40">
                <tr className="text-left">
                  <th className="px-4 py-2 font-normal">type</th>
                  <th className="px-4 py-2 font-normal">amount</th>
                  <th className="px-4 py-2 font-normal">note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {fees.map((f) => (
                  <tr key={f.label}>
                    <td className="px-4 py-3 font-bold">{f.label}</td>
                    <td className="px-4 py-3 text-primary">{f.value}</td>
                    <td className="px-4 py-3 text-muted-foreground">{f.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Risks */}
        <section className="mb-10 rounded-lg border border-destructive/40 bg-destructive/10 p-6">
          <h2 className="font-mono font-bold text-xl mb-3 flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" /> risks
          </h2>
          <ul className="font-mono text-sm space-y-2 text-foreground">
            <li>— leveraged tokens can go to <span className="text-destructive font-bold">zero</span> if the underlying perp liquidates.</li>
            <li>— higher leverage = tighter liquidation distance. a 5x long is wiped by a 20% adverse move.</li>
            <li>— bonding-curve trades are subject to slippage; large buys move the price quickly.</li>
            <li>— smart contracts are unaudited beta. don&apos;t deposit more than you can lose.</li>
          </ul>
        </section>

        {/* FAQ */}
        <section className="mb-10">
          <h2 className="font-mono font-bold text-xl mb-4">faq</h2>
          <div className="space-y-2">
            {faqs.map((f) => (
              <details key={f.q} className="rounded-lg border border-border bg-card group">
                <summary className="cursor-pointer list-none px-4 py-3 font-mono text-sm font-bold flex items-center justify-between">
                  {f.q}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform">+</span>
                </summary>
                <div className="px-4 pb-4 font-mono text-sm text-muted-foreground">{f.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Powered by + CTA */}
        <section className="rounded-lg border border-border bg-card p-6 text-center">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">powered by</div>
          <div className="mt-2 flex items-center justify-center gap-6 font-mono text-sm">
            <span className="text-foreground">solana</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-foreground">drift</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-foreground">pyth</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-foreground">raydium</span>
          </div>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-md bg-primary text-primary-foreground font-mono font-bold glow-primary hover:bg-primary/90"
          >
            <Zap className="h-4 w-4" strokeWidth={3} />
            [ launch a coin ]
          </Link>
        </section>
      </main>
    </div>
  )
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground font-mono font-bold text-xs">
        {n}
      </div>
      <h3 className="mt-3 font-mono font-bold text-sm">{title}</h3>
      <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  )
}
