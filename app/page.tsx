import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { KingOfTheHill } from "@/components/king-of-the-hill"
import { FiltersBar } from "@/components/filters-bar"
import { TokenGrid } from "@/components/token-grid"
import { tokens } from "@/lib/mock-data"

export default function Page() {
  const koth = tokens[0]
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <TradesTicker />
      <div className="mx-auto max-w-[1400px] px-4 py-6">
        <KingOfTheHill token={koth} />
        <FiltersBar />
        <TokenGrid tokens={tokens.slice(1)} />
      </div>
      <footer className="border-t border-border mt-12 py-6 text-center text-xs text-muted-foreground font-mono">
        leverage.fun — not financial advice. you will get rekt.
      </footer>
    </main>
  )
}
