import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { HeroBanner } from "@/components/hero-banner"
import { StatsBar, NowMintingRail } from "@/components/stats-bar"
import { KingOfTheHill } from "@/components/king-of-the-hill"
import { FiltersBar } from "@/components/filters-bar"
import { TokenGrid } from "@/components/token-grid"
import { tokens } from "@/lib/mock-data"

export default function Page() {
  const koth = tokens[0]
  return (
    <main className="min-h-screen text-foreground">
      <Header />
      <TradesTicker />
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <HeroBanner />
        <StatsBar />
        <NowMintingRail />
        <KingOfTheHill token={koth} />
        <FiltersBar />
        <TokenGrid tokens={tokens.slice(1)} />
      </div>
      <footer className="border-t-2 border-border mt-12 py-8">
        <div className="mx-auto max-w-[1400px] px-4 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="font-display text-sm">
            leverage<span className="text-primary">.fun</span>
            <span className="ml-3 font-mono text-[11px] text-muted-foreground">© 2026 · not financial advice · you will get rekt</span>
          </div>
          <div className="font-mono text-[11px] text-muted-foreground flex gap-3">
            <span>built on solana</span>
            <span>·</span>
            <span>perps by drift</span>
            <span>·</span>
            <span>oracle by pyth</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
