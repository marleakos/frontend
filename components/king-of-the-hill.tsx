import type { Token } from "@/lib/mock-data"
import Link from "next/link"

export function KingOfTheHill({ token }: { token: Token }) {
  return (
    <section className="my-8 grid place-items-center">
      {/* The single wow: giant rainbow conic-gradient spinning around a tiny card */}
      <div className="relative">
        {/* spinning aura */}
        <div className="absolute -inset-6 rounded-[2rem] rainbow-aura blur-2xl opacity-70" />
        <div className="absolute -inset-2 rounded-[1.25rem] rainbow-aura" />

        <Link
          href={`/token/${token.id}`}
          className="relative grid grid-cols-[auto_1fr] items-center gap-4 rounded-2xl bg-background px-5 py-4 min-w-[460px] max-w-[520px]"
        >
          <div className="grid h-20 w-20 place-items-center rounded-xl bg-card text-5xl border border-border">
            {token.emoji}
          </div>

          <div className="min-w-0">
            <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
              king of the hill
            </div>
            <div className="font-display text-2xl leading-none truncate">
              {token.name.toUpperCase()}{" "}
              <span className="text-muted-foreground text-base">${token.ticker}</span>
            </div>
            <div className="mt-2 flex items-center gap-3 font-mono text-xs">
              <span className="text-primary font-bold">{token.leverage}x {token.direction.toLowerCase()}</span>
              <span className="text-muted-foreground">·</span>
              <span>{token.underlying}</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-foreground font-bold">${token.marketCap.toLocaleString()}</span>
              <span className="text-muted-foreground">mcap</span>
            </div>
          </div>
        </Link>
      </div>

      {/* big chunky CTA below — wobble */}
      <Link
        href="/create"
        className="brick mt-8 inline-flex items-center rounded-md bg-primary px-6 h-12 font-display text-lg uppercase text-primary-foreground hover:animate-wobble"
      >
        [ start a new coin ]
      </Link>
    </section>
  )
}
