"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { LeverageBadge } from "@/components/leverage-badge"
import { ImagePlus, Info, Zap, Sparkles } from "lucide-react"

const UNDERLYINGS = ["SOL-PERP", "BTC-PERP", "ETH-PERP", "DOGE-PERP"] as const
const LEVERAGES = [2, 3, 5, 10] as const
const EMOJIS = ["🚀", "🐻", "💎", "🐕", "🐸", "🎩", "☀️", "💀", "🔻", "⚔️", "🦍", "🤡", "👑", "🔥"]

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
        <div className="text-center mb-8 relative">
          <div className="absolute inset-x-0 top-1/2 -z-10 h-32 -translate-y-1/2 stripes opacity-20" />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border-2 border-accent bg-accent/10 text-accent font-mono text-[11px] uppercase tracking-widest mb-3">
            <Sparkles className="h-3 w-3" /> fair launch · no presale · no team alloc
          </div>
          <h1 className="font-display text-4xl md:text-6xl uppercase leading-none">
            launch a <span className="rainbow-text">leveraged</span> coin
          </h1>
          <p className="mt-3 text-sm text-muted-foreground font-mono max-w-xl mx-auto">
            deploy a meme token backed by a perp position. graduates to raydium at $69k mcap.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <form className="space-y-5">
            <Section step="01" title="identity">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5">image</label>
                  <button
                    type="button"
                    onClick={() => setEmoji(EMOJIS[Math.floor(Math.random() * EMOJIS.length)])}
                    className="group relative grid h-32 w-32 place-items-center rounded-xl border-2 border-dashed border-border bg-secondary/40 text-5xl hover:border-primary"
                  >
                    {emoji || <ImagePlus className="h-6 w-6 text-muted-foreground" />}
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-primary text-primary-foreground font-mono text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      randomize
                    </span>
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

            <Section step="02" title="leverage config">
              <Field label="underlying perp">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {UNDERLYINGS.map((u) => (
                    <button
                      type="button"
                      key={u}
                      onClick={() => setUnderlying(u)}
                      className={
                        u === underlying
                          ? "py-3 rounded-md border-2 border-primary bg-primary/10 text-primary font-display text-xs uppercase"
                          : "py-3 rounded-md border-2 border-border bg-secondary/40 hover:border-primary/50 font-mono text-xs"
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
                        ? "py-4 rounded-md border-2 border-primary bg-primary/10 text-primary font-display uppercase text-base"
                        : "py-4 rounded-md border-2 border-border bg-secondary/40 hover:border-primary/50 font-mono"
                    }
                  >
                    long ↗
                  </button>
                  <button
                    type="button"
                    onClick={() => setDirection("SHORT")}
                    className={
                      direction === "SHORT"
                        ? "py-4 rounded-md border-2 border-destructive bg-destructive/10 text-destructive font-display uppercase text-base"
                        : "py-4 rounded-md border-2 border-border bg-secondary/40 hover:border-destructive/50 font-mono"
                    }
                  >
                    short ↘
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
                          ? "py-4 rounded-md border-2 border-accent bg-accent/10 text-accent font-display uppercase text-base"
                          : "py-4 rounded-md border-2 border-border bg-secondary/40 hover:border-accent/50 font-mono"
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

            <Section step="03" title="dev buy (optional)">
              <Field label="initial buy in SOL">
                <input
                  value={initialBuy}
                  onChange={(e) => setInitialBuy(e.target.value)}
                  placeholder="0.5"
                  className="input"
                />
              </Field>
            </Section>

            <Section step="04" title="fees">
              <ul className="font-mono text-xs space-y-1.5 text-muted-foreground">
                <li className="flex justify-between border-b border-dashed border-border pb-1.5"><span>deploy</span><span className="text-foreground">0.1 SOL</span></li>
                <li className="flex justify-between border-b border-dashed border-border pb-1.5"><span>trading</span><span className="text-foreground">0.5%</span></li>
                <li className="flex justify-between border-b border-dashed border-border pb-1.5"><span>leverage borrow</span><span className="text-foreground">0.1% / day</span></li>
                <li className="flex justify-between"><span>graduation</span><span className="text-foreground">1%</span></li>
              </ul>
            </Section>
          </form>

          <aside className="lg:sticky lg:top-24 self-start space-y-4">
            <div className="rainbow-border rounded-xl">
              <div className="rounded-xl bg-card overflow-hidden">
                <div className="px-3 py-2 border-b-2 border-border font-display text-xs uppercase tracking-wider bg-secondary/40">
                  live preview
                </div>
                <div className="p-4 flex gap-3">
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-gradient-to-br from-primary/30 to-accent/30 text-3xl border-2 border-foreground/10">
                    {emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-base truncate uppercase">{name || "your token"}</div>
                    <div className="font-mono text-[11px] text-muted-foreground">${ticker || "TICKER"}</div>
                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                      <LeverageBadge leverage={leverage} direction={direction} />
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">
                        {underlying}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4 text-xs text-foreground/70 font-mono">
                  {desc || "your description shows up on the token page and the board card."}
                </div>
              </div>
            </div>

            <button className="brick w-full bg-primary text-primary-foreground py-4 rounded-md font-display uppercase tracking-wide text-lg hover:-translate-y-0.5 transition-transform inline-flex items-center justify-center gap-2">
              <Zap className="h-5 w-5" strokeWidth={3} />
              deploy for 0.1 sol
            </button>
            <p className="font-mono text-[11px] text-muted-foreground text-center text-balance">
              by deploying you accept that the token can go to <span className="text-destructive">zero</span> if the perp liquidates
            </p>
          </aside>
        </div>
      </main>

      <style>{`.input{width:100%;height:44px;border-radius:.5rem;border:2px solid var(--color-border);background:var(--color-input);padding:0 .75rem;font-family:var(--font-mono);font-size:.875rem;outline:none;transition:border-color .15s}.input:focus{border-color:var(--color-primary)}textarea.input{height:auto;padding:.5rem .75rem}`}</style>
    </div>
  )
}

function Section({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border-2 border-border bg-card p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 font-display text-7xl text-foreground/[0.04] leading-none pr-3 pt-1 select-none pointer-events-none">
        {step}
      </div>
      <h2 className="font-display uppercase text-base text-foreground mb-4 flex items-baseline gap-2">
        <span className="text-primary">{step}.</span> {title}
      </h2>
      <div className="space-y-3 relative">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5">{label}</label>
      {children}
    </div>
  )
}
