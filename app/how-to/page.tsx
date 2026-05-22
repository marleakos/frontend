"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { Rocket, TrendingUp, Zap, ChevronDown, ChevronUp, ShieldAlert, Brain, Network } from "lucide-react"
import Link from "next/link"

const FAQS = [
  {
    q: "what is synthetic leverage?",
    a: "Synthetic leverage is a novel DeFi primitive that amplifies price exposure without traditional perp mechanics. Our protocol uses algorithmic bonding curves with oracle-calibrated multipliers to achieve 2x-10x leverage on any asset."
  },
  {
    q: "how does the leverage engine work?",
    a: "The Leverage Engine monitors reference asset prices via Pyth Network oracles. When SOL moves 1%, a 5x token moves 5% through our proprietary curve adjustment algorithm. This happens in real-time as trades execute."
  },
  {
    q: "what makes this different from perps?",
    a: "Traditional perps use orderbooks and can liquidate you. Our synthetic leverage uses bonding curve mechanics—your position can never be liquidated because you hold actual tokens. The leverage is baked into the token's DNA."
  },
  {
    q: "how is the price calculated?",
    a: "Price = Base_Price × (1 + Leverage × Oracle_Change). If SOL is up 10% and you hold a 3x LONG token, your position is up 30%. The curve automatically reprices based on oracle feeds."
  },
  {
    q: "what happens at graduation?",
    a: "At 85 SOL market cap, the token graduates. The bonding curve completes and the token trades on the open market."
  }
]

export default function HowToPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1000px] px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="font-display text-5xl md:text-7xl uppercase leading-none mb-2">
            SYNTHETIC
          </h1>
          <h2 className="font-display text-4xl md:text-6xl uppercase leading-none">
            <span className="rainbow-text">LEVERAGE.</span>
          </h2>
          <p className="mt-6 text-sm text-muted-foreground font-mono max-w-2xl mx-auto">
            the first protocol to bring synthetic leverage to pump.fun. 
            2x-10x exposure with zero liquidation risk. powered by pyth oracles and algorithmic bonding curves.
          </p>
        </div>

        {/* The Tech */}
        <div className="mb-16 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-primary" />
            <h3 className="font-display text-xl uppercase">THE LEVERAGE ENGINE</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TechCard 
              title="ORACLE FEEDS" 
              desc="Pyth Network provides real-time price data for SOL, BTC, ETH, and more. Sub-second updates ensure accurate leverage calculations."
            />
            <TechCard 
              title="CURVE MATH" 
              desc="Proprietary bonding curve algorithm adjusts token price based on oracle movements. The curve is the leverage."
            />
            <TechCard 
              title="SYNTHETIC MINT" 
              desc="Tokens are minted with encoded leverage parameters. 3x SOL Long contains the mathematical DNA for 3x exposure."
            />
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <Rocket className="h-5 w-5 text-primary" />
            <h3 className="font-display text-xl uppercase">HOW IT WORKS</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StepCard 
              num="1" 
              title="MINT" 
              desc="creator deploys a token with leverage DNA. choose direction (long/short), leverage (2x-10x), and reference asset. the leverage is encoded in the token's smart contract."
            />
            <StepCard 
              num="2" 
              title="ORACLE SYNC" 
              desc="pyth oracles stream price data to the leverage engine. every trade checks the oracle price and adjusts the bonding curve accordingly."
            />
            <StepCard 
              num="3" 
              title="SYNTHETIC PRICE" 
              desc="the bonding curve price is calculated as: base_price × (1 + leverage × oracle_change). this happens automatically on every buy/sell."
            />
            <StepCard 
              num="4" 
              title="GRADUATE" 
              desc="at 85 SOL market cap, the token graduates. the bonding curve completes and the token trades on the open market."
            />
          </div>
        </div>

        {/* Example */}
        <div className="mb-16 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-primary" />
            <h3 className="font-display text-xl uppercase">LIVE EXAMPLE: $SOL3X</h3>
          </div>
          
          <div className="space-y-3 font-mono text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary">→</span>
              <span>token: $SOL3X — 3x SOL Long synthetic leverage</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">oracle feed: SOL @ $158.00</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">SOL moves $158 → $173.8 (+10%):</span>
              <span className="text-primary font-bold">$SOL3X reprices to +30%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary">→</span>
              <span className="text-muted-foreground">curve adjustment: automatic via leverage engine</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-primary">→</span>
              <span>your position: 3x exposure, zero liquidation risk, full custody</span>
            </div>
          </div>
        </div>

        {/* Fees Table */}
        <div className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-display text-xl uppercase">PROTOCOL FEES</h3>
          </div>
          
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead className="bg-secondary/40 border-b border-border">
                <tr className="font-mono text-[10px] uppercase text-muted-foreground">
                  <th className="text-left px-4 py-3">Fee Type</th>
                  <th className="text-left px-4 py-3">Amount</th>
                  <th className="text-left px-4 py-3">Purpose</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-bold">DEPLOYMENT</td>
                  <td className="px-4 py-3 text-primary font-bold">~0.02 SOL</td>
                  <td className="px-4 py-3 text-muted-foreground">network fee for token creation</td>
                </tr>
                <tr className="border-b border-border">
                  <td className="px-4 py-3 font-bold">TRADING FEE</td>
                  <td className="px-4 py-3 text-primary font-bold">1%</td>
                  <td className="px-4 py-3 text-muted-foreground">standard bonding curve fee on all trades</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold">CREATOR REWARDS</td>
                  <td className="px-4 py-3 text-primary font-bold">100%</td>
                  <td className="px-4 py-3 text-muted-foreground">all fees go to token creator</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* No Liquidation Risk */}
        <div className="mb-16 rounded-xl border-2 border-pink-500/50 bg-pink-500/10 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="h-5 w-5 text-pink-500" />
            <h3 className="font-display text-xl uppercase text-pink-500">ZERO LIQUIDATION RISK</h3>
          </div>
          
          <div className="space-y-2 font-mono text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <span className="text-pink-500">→</span>
              <span>unlike perp trading, <span className="text-pink-500 font-bold">SYNTHETIC LEVERAGE CANNOT LIQUIDATE</span>. you hold tokens, not positions.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-pink-500">→</span>
              <span>the bonding curve reprices automatically. your token balance never changes, only the price per token.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-pink-500">→</span>
              <span>even if the reference asset drops 90%, your tokens still have value. you can always sell back to the curve.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-pink-500">→</span>
              <span>this is the leverage.fun innovation — pure synthetic leverage without liquidation mechanics.</span>
            </div>
          </div>
        </div>

        {/* Network */}
        <div className="mb-16 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Network className="h-5 w-5 text-primary" />
            <h3 className="font-display text-xl uppercase">ORACLE NETWORK</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="font-display text-lg text-primary">PYTH</div>
              <div className="font-mono text-[10px] text-muted-foreground">Primary Oracle</div>
            </div>
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="font-display text-lg text-primary">&lt;400ms</div>
              <div className="font-mono text-[10px] text-muted-foreground">Latency</div>
            </div>
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="font-display text-lg text-primary">50+</div>
              <div className="font-mono text-[10px] text-muted-foreground">Price Feeds</div>
            </div>
            <div className="text-center p-3 bg-secondary/30 rounded-lg">
              <div className="font-display text-lg text-primary">99.9%</div>
              <div className="font-mono text-[10px] text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h3 className="font-display text-xl uppercase mb-6">FREQUENTLY ASKED</h3>
          
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="rounded-lg border border-border bg-card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 font-mono text-sm hover:bg-secondary/40 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp className="h-4 w-4 text-primary" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-primary" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-4 font-mono text-xs text-muted-foreground">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Powered By */}
        <div className="text-center mb-8">
          <p className="font-mono text-[10px] uppercase text-muted-foreground mb-2">INFRASTRUCTURE</p>
          <div className="flex items-center justify-center gap-4 font-display text-sm">
            <span>SOLANA</span>
            <span className="text-muted-foreground">·</span>
            <span>PYTH</span>
            <span className="text-muted-foreground">·</span>
            <span>PUMP.FUN</span>
          </div>
        </div>

        {/* Launch Button */}
        <div className="flex justify-center">
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-md bg-primary text-primary-foreground font-display uppercase tracking-wide text-lg hover:opacity-90 transition-opacity"
          >
            <Zap className="h-5 w-5" />
            DEPLOY LEVERAGE
          </Link>
        </div>
      </main>
    </div>
  )
}

function StepCard({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 font-display text-6xl text-foreground/[0.04] leading-none pr-2 pt-1 select-none pointer-events-none">
        0{num}
      </div>
      <div className="flex items-center gap-2 mb-3">
        <div className="h-6 w-6 rounded bg-primary flex items-center justify-center font-display text-xs text-primary-foreground">
          {num}
        </div>
        <h4 className="font-display text-sm uppercase">{title}</h4>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </div>
  )
}

function TechCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-4">
      <h4 className="font-display text-xs uppercase mb-2 text-primary">{title}</h4>
      <p className="font-mono text-[10px] text-muted-foreground leading-relaxed">
        {desc}
      </p>
    </div>
  )
}
