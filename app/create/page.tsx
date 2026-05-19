"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { Button } from "@/components/ui/button"
import { LeverageBadge } from "@/components/leverage-badge"
import { ImagePlus, Info, Zap } from "lucide-react"

const UNDERLYINGS = ["SOL-PERP", "BTC-PERP", "ETH-PERP", "DOGE-PERP"] as const
const LEVERAGES = [2, 3, 5, 10] as const

export default function CreatePage() {
  const [name, setName] = useState("")
  const [ticker, setTicker] = useState("")
  const [emoji, setEmoji] = useState("🚀")
  const [desc, setDesc] = useState("")
  const [underlying, setUnderlying] = useState<(typeof UNDERLYINGS)[number]>("SOL-PERP")
  const [leverage, setLeverage] = useState<(typeof LEVERAGES)[number]>(3)
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG")
  const [initialBuy, setInitialBuy] = useState("0.5")

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1100px] px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-mono font-bold text-3xl md:text-4xl">launch a leveraged coin</h1>
          <p className="mt-2 text-sm text-muted-foreground font-mono">
            deploy a meme token backed by a perp position. graduates to raydium at $69k mcap.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <form className="space-y-5">
            <Section title="01. identity">
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-3">
                <div>
                  <label className="font-mono text-[11px] text-muted-foreground block mb-1.5">image</label>
                  <button
                    type="button"
                    className="grid h-28 w-28 place-items-center rounded-md border border-dashed border-border bg-secondary/40 text-4xl hover:border-primary"
                    onClick={() =>
                      setEmoji(["🚀", "🐻", "💎", "🐕", "🐸", "🎩", "☀️", "💀", "🔻", "⚔️"][Math.floor(Math.random() * 10)])
                    }
                  >
                    {emoji || <ImagePlus className="h-6 w-6 text-muted-foreground" />}
                  </button>
                </div>
                <div className="space-y-3">
                  <Field label="name">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mega Sol Bull"
                      className="input"
                    />
                  </Field>
                  <Field label="ticker">
                    <input
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 8))}
                      placeholder="MSOL5"
                      className="input"
                    />
                  </Field>
                  <Field label="description">
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      rows={3}
                      placeholder="sol to 1000. wagmi or rekt."
                      className="input resize-none"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section title="02. leverage config">
              <Field label="underlying perp">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {UNDERLYINGS.map((u) => (
                    <button
                      type="button"
                      key={u}
                      onClick={() => setUnderlying(u)}
                      className={
                        u === underlying
                          ? "py-2.5 rounded-md border border-primary bg-primary/10 text-primary font-mono text-xs font-bold"
                          : "py-2.5 rounded-md border border-border bg-secondary/40 text-foreground hover:border-primary/50 font-mono text-xs"
                      }
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="direction">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDirection("LONG")}
                    className={
                      direction === "LONG"
                        ? "py-3 rounded-md border border-primary bg-primary/10 text-primary font-mono font-bold"
                        : "py-3 rounded-md border border-border bg-secondary/40 hover:border-primary/50 font-mono"
                    }
                  >
                    LONG
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("SHORT")}
                    className={
                      direction === "SHORT"
                        ? "py-3 rounded-md border border-destructive bg-destructive/10 text-destructive font-mono font-bold"
                        : "py-3 rounded-md border border-border bg-secondary/40 hover:border-destructive/50 font-mono"
                    }
                  >
                    SHORT
                  </button>
                </div>
              </Field>

              <Field label={`leverage — ${leverage}x`}>
                <div className="grid grid-cols-4 gap-2">
                  {LEVERAGES.map((lv) => (
                    <button
                      type="button"
                      key={lv}
                      onClick={() => setLeverage(lv)}
                      className={
                        lv === leverage
                          ? "py-3 rounded-md border border-accent bg-accent/10 text-accent font-mono font-bold"
                          : "py-3 rounded-md border border-border bg-secondary/40 hover:border-accent/50 font-mono"
                      }
                    >
                      {lv}x
                    </button>
                  ))}
                </div>
                <p className="mt-2 font-mono text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                  <Info className="h-3 w-3" />
                  higher leverage = more violent moves and tighter liquidation distance
                </p>
              </Field>
            </Section>

            <Section title="03. dev buy (optional)">
              <Field label="initial buy in SOL">
                <input
                  value={initialBuy}
                  onChange={(e) => setInitialBuy(e.target.value)}
                  placeholder="0.5"
                  className="input"
                />
              </Field>
            </Section>

            <Section title="04. fees">
              <ul className="font-mono text-xs space-y-1.5 text-muted-foreground">
                <li className="flex justify-between"><span>deploy</span><span className="text-foreground">0.1 SOL</span></li>
                <li className="flex justify-between"><span>trading</span><span className="text-foreground">0.5%</span></li>
                <li className="flex justify-between"><span>leverage borrow</span><span className="text-foreground">0.1% / day</span></li>
                <li className="flex justify-between"><span>graduation</span><span className="text-foreground">1%</span></li>
              </ul>
            </Section>
          </form>

          <aside className="lg:sticky lg:top-24 self-start space-y-4">
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <div className="px-3 py-2 border-b border-border font-mono text-xs text-muted-foreground">
                live preview
              </div>
              <div className="p-4 flex gap-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-secondary text-3xl border border-border">
                  {emoji}
                </div>
                <div className="min-w-0">
                  <div className="font-mono font-bold text-sm truncate">{name || "your token name"}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">${ticker || "TICKER"}</div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <LeverageBadge leverage={leverage} direction={direction} />
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                      {underlying}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-4 pb-4 text-xs text-muted-foreground">
                {desc || "your description shows up on the token page and the board card."}
              </div>
            </div>

            <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold glow-primary">
              <Zap className="h-4 w-4 mr-1.5" strokeWidth={3} />
              [ deploy for 0.1 SOL ]
            </Button>
            <p className="font-mono text-[11px] text-muted-foreground text-center">
              by deploying you accept that the token can go to zero if the perp liquidates
            </p>
          </aside>
        </div>
      </main>

      <style>{`.input{width:100%;height:42px;border-radius:.5rem;border:1px solid var(--color-border);background:var(--color-input);padding:0 .75rem;font-family:var(--font-mono);font-size:.875rem;outline:none}.input:focus{box-shadow:0 0 0 2px var(--color-ring)}textarea.input{height:auto;padding:.5rem .75rem}`}</style>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card p-4">
      <h2 className="font-mono font-bold text-sm text-foreground mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[11px] text-muted-foreground block mb-1.5">{label}</label>
      {children}
    </div>
  )
}
