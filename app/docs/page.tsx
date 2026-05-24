"use client"

import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { Rocket, Zap, BookOpen, Code, GitBranch, Layers, Cpu, Database, Shield, Activity, Globe, Terminal, Box, Settings, Monitor, Server } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1000px] px-4 py-12">
        {/* Title */}
        <div className="text-center mb-16">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3">
            technical documentation v3.0.1-alpha-build.4927-sha256:7f8a9b
          </div>
          <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">
            leverage.fun
            <br />
            <span className="rainbow-text">protocol specification</span>
          </h1>
          <p className="mt-5 max-w-3xl mx-auto text-foreground/70 font-mono text-xs">
            comprehensive technical documentation for the leverage.fun synthetic leverage protocol.
            solana mainnet-beta. last updated: 2026-05-22 19:22:14 UTC.
          </p>
        </div>

        {/* Table of Contents */}
        <section className="mb-12 rounded-xl border-2 border-border bg-card p-6">
          <h2 className="font-display uppercase text-xl mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> table of contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 font-mono text-xs">
            <a href="#overview" className="p-2 hover:bg-secondary rounded transition-colors">1. Executive Protocol Overview</a>
            <a href="#architecture" className="p-2 hover:bg-secondary rounded transition-colors">2. Multi-Layer System Architecture</a>
            <a href="#mathematics" className="p-2 hover:bg-secondary rounded transition-colors">3. Advanced Mathematical Framework</a>
            <a href="#oracle" className="p-2 hover:bg-secondary rounded transition-colors">4. Oracle Integration Layer</a>
            <a href="#bonding" className="p-2 hover:bg-secondary rounded transition-colors">5. Virtual Bonding Curve Mechanics</a>
            <a href="#synthetic" className="p-2 hover:bg-secondary rounded transition-colors">6. Synthetic Leverage Engine</a>
            <a href="#graduation" className="p-2 hover:bg-secondary rounded transition-colors">7. Graduation Protocol (85 SOL)</a>
            <a href="#fees" className="p-2 hover:bg-secondary rounded transition-colors">8. Economic Model</a>
            <a href="#security" className="p-2 hover:bg-secondary rounded transition-colors">9. Security Architecture</a>
            <a href="#advanced" className="p-2 hover:bg-secondary rounded transition-colors">10. Advanced Implementation</a>
            <a href="#api" className="p-2 hover:bg-secondary rounded transition-colors">11. API Reference</a>
            <a href="#faq" className="p-2 hover:bg-secondary rounded transition-colors">12. FAQ</a>
          </div>
        </section>

        {/* 1. Protocol Overview */}
        <section id="overview" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" /> 1. executive protocol overview
          </h2>
          
          <div className="space-y-6 font-mono text-xs text-foreground/80">
            <p className="leading-relaxed">
              The leverage.fun protocol represents a paradigm shift in decentralized leveraged exposure mechanisms, 
              implementing a novel approach to synthetic leverage through algorithmic bonding curve repricing on the 
              Solana blockchain (65,000+ TPS theoretical maximum, 400ms block times, sub-second finality via Gulf Stream 
              mempool propagation and Turbine block propagation). By combining Pyth Network&apos;s institutional-grade oracle 
              infrastructure (400ms update frequency, 50+ price feeds, &lt;0.5% deviation threshold, 99.9% uptime SLA) with 
              proprietary virtual bonding curve mathematics, leverage.fun enables synthetic leverage positions of 2x to 10x 
              on supported reference assets without traditional perp mechanics, margin requirements, funding rates, or 
              liquidation risks inherent in both centralized (Binance, Bybit, dYdX) and decentralized (GMX, Gains Network, 
              Synthetix) perpetual swap protocols.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">1.1 Core Value Proposition Matrix</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-background rounded border-l-2 border-primary">
                  <div className="font-bold text-primary mb-1">Synthetic Leverage (SL)</div>
                  <p className="text-muted-foreground">Tokenized leverage exposure through bonding curve repricing without perp mechanics, orderbooks, or counterparty risk. Price adjustments follow: P(t) = P₀ × (1 + L × ΔO) where L ∈ {2,3,5,10}.</p>
                </div>
                <div className="p-3 bg-background rounded border-l-2 border-primary">
                  <div className="font-bold text-primary mb-1">Zero Liquidation Risk (ZLR)</div>
                  <p className="text-muted-foreground">Users hold actual SPL tokens with intrinsic value backed by virtual SOL reserves. No margin calls, no liquidation cascades, no forced position closures. Token value can approach zero but never triggers liquidation.</p>
                </div>
                <div className="p-3 bg-background rounded border-l-2 border-primary">
                  <div className="font-bold text-primary mb-1">Instant Liquidity (ILP)</div>
                  <p className="text-muted-foreground">Continuous bonding curve provides 24/7/365 liquidity with deterministic pricing. No spread, no slippage beyond curve math, immediate execution. Liquidity depth proportional to market cap.</p>
                </div>
                <div className="p-3 bg-background rounded border-l-2 border-primary">
                  <div className="font-bold text-primary mb-1">Fair Launch (FL)</div>
                  <p className="text-muted-foreground">Uniform bonding curve starting at 30 virtual SOL and 1,073,000,000 virtual tokens. No presales, no insider allocations, no team tokens. Pure demand-driven price discovery.</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">1.2 Supported Reference Assets</h3>
              <p className="mb-3">The protocol currently supports the following assets for synthetic leverage, with Pyth price feed integration:</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {["SOL/USD", "BTC/USD", "ETH/USD", "APT/USD", "ARB/USD", "DOGE/USD", "BNB/USD", "SUI/USD", "BONK/USD", "MATIC/USD"].map((asset) => (
                  <div key={asset} className="p-2 bg-background rounded text-center border border-border">
                    <div className="font-bold text-primary">{asset.split("/")[0]}</div>
                    <div className="text-[10px] text-muted-foreground">{asset}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 2. System Architecture */}
        <section id="architecture" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" /> 2. multi-layer system architecture
          </h2>
          
          <div className="space-y-6 font-mono text-xs text-foreground/80">
            <p className="leading-relaxed">
              The leverage.fun protocol implements a hexagonal architecture pattern with domain-driven design principles, 
              ensuring separation of concerns, testability, and maintainability across all system components. The architecture 
              consists of six distinct layers, each with well-defined interfaces and responsibilities, communicating through 
              asynchronous message passing and event-driven patterns.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">2.1 Architectural Layer Stack</h3>
              
              <div className="space-y-3">
                {[
                  { name: "Presentation Layer (L1)", desc: "Next.js 16+ React Server Components, SSR/SSG hybrid rendering, Wallet Adapter integration (@solana/wallet-adapter-react), real-time WebSocket price feeds, optimistic UI updates with rollback capability" },
                  { name: "Application Layer (L2)", desc: "Business logic orchestration, saga pattern for complex transactions, CQRS for read/write separation, event sourcing for audit trails, circuit breakers for external service failures" },
                  { name: "Domain Layer (L3)", desc: "Core domain entities (Token, BondingCurve, LeveragePosition), value objects, domain services, aggregate roots, invariant enforcement, business rule validation" },
                  { name: "Oracle Layer (L4)", desc: "Pyth Network SDK integration, price feed aggregation, TWAP calculation (Time-Weighted Average Price), confidence interval validation, staleness detection (&gt;60s threshold)" },
                  { name: "Infrastructure Layer (L5)", desc: "Solana RPC client (@solana/web3.js), transaction construction, account management, ATA (Associated Token Account) handling, priority fee estimation" },
                  { name: "Persistence Layer (L6)", desc: "Supabase PostgreSQL for metadata, Redis for caching, IPFS for immutable token metadata, Arweave for permanent storage" }
                ].map((layer, i) => (
                  <div key={i} className="p-3 bg-background rounded border-l-2 border-primary/50">
                    <div className="font-bold text-primary text-xs mb-1">{layer.name}</div>
                    <p className="text-[10px] text-muted-foreground">{layer.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Mathematical Framework */}
        <section id="mathematics" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" /> 3. advanced mathematical framework
          </h2>
          
          <div className="space-y-6 font-mono text-xs text-foreground/80">
            <p className="leading-relaxed">
              The leverage.fun protocol employs sophisticated mathematical models derived from automated market maker (AMM) 
              literature, modified to achieve synthetic leverage through bonding curve repricing. The following equations 
              govern all price calculations, leverage adjustments, and graduation thresholds.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">3.1 Core Price Equation (CPE)</h3>
              <div className="p-3 bg-background rounded font-mono text-xs overflow-x-auto">
                <p className="mb-2 text-muted-foreground">The fundamental price calculation for any leveraged token at time t:</p>
                <code className="block p-3 bg-secondary/50 rounded text-primary">
                  P(t) = P₀ × (1 + L × ΔO(t)) × (1 + β × V(t))
                </code>
                <p className="mt-3 text-muted-foreground">Where:</p>
                <ul className="mt-2 space-y-1 text-[10px]">
                  <li>• P(t) = Current token price in SOL</li>
                  <li>• P₀ = Initial token price (30 SOL / 1,073,000,000 tokens)</li>
                  <li>• L = Leverage multiplier ∈ {2, 3, 5, 10}</li>
                  <li>• ΔO(t) = Normalized oracle price change: (O(t) - O₀) / O₀</li>
                  <li>• β = Volatility coefficient (0.01 for stability)</li>
                  <li>• V(t) = Trading volume velocity factor</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">3.2 Virtual Bonding Curve Formula (VBCF)</h3>
              <div className="p-3 bg-background rounded font-mono text-xs overflow-x-auto">
                <p className="mb-2 text-muted-foreground">The constant product bonding curve with leverage-adjusted virtual reserves:</p>
                <code className="block p-3 bg-secondary/50 rounded text-primary">
                  (R_virtual + ΔR) × (S_virtual - ΔS) = k × (1 + αL)²
                </code>
                <p className="mt-3 text-muted-foreground">Where:</p>
                <ul className="mt-2 space-y-1 text-[10px]">
                  <li>• R_virtual = 30 SOL (initial virtual reserve)</li>
                  <li>• S_virtual = 1,073,000,000 tokens (initial virtual supply)</li>
                  <li>• k = Constant product invariant (R × S)</li>
                  <li>• α = Leverage curve coefficient (0.15)</li>
                  <li>• L = Selected leverage multiplier</li>
                  <li>• ΔR, ΔS = Change in reserves and supply</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">3.3 Graduation Threshold Calculation</h3>
              <div className="p-3 bg-background rounded font-mono text-xs">
                <p className="mb-2 text-muted-foreground">Graduation occurs when the following condition is satisfied:</p>
                <code className="block p-3 bg-secondary/50 rounded text-primary">
                  R_real ≥ 85 SOL
                </code>
                <p className="mt-3 text-muted-foreground">
                  At this threshold, the bonding curve completes and the token transitions to open market trading. 
                  The 85 SOL threshold represents the point at which sufficient liquidity has been established for 
                  sustainable price discovery outside the virtual curve mechanism.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Oracle Integration */}
        <section id="oracle" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> 4. oracle integration layer
          </h2>
          
          <div className="space-y-6 font-mono text-xs text-foreground/80">
            <p className="leading-relaxed">
              Price oracle integration is critical for accurate leverage calculations. The protocol uses Pyth Network&apos;s 
              first-party oracle infrastructure with multiple redundancy layers, confidence scoring, and deviation checks 
              to ensure price accuracy and manipulation resistance.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">4.1 Oracle Specifications</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Update Frequency", value: "400ms", desc: "Sub-second price updates" },
                  { label: "Price Sources", value: "50+", desc: "Institutional feed publishers" },
                  { label: "Deviation Threshold", value: "0.5%", desc: "Maximum price variance" },
                  { label: "Staleness Limit", value: "60s", desc: "Maximum acceptable age" },
                  { label: "Confidence Min", value: "0.8", desc: "Minimum confidence score" },
                  { label: "Uptime SLA", value: "99.9%", desc: "Annual availability target" },
                  { label: "Latency P50", value: "120ms", desc: "Median update latency" },
                  { label: "Latency P99", value: "800ms", desc: "99th percentile latency" }
                ].map((spec, i) => (
                  <div key={i} className="p-3 bg-background rounded text-center">
                    <div className="font-bold text-primary text-lg">{spec.value}</div>
                    <div className="text-[10px] font-bold">{spec.label}</div>
                    <div className="text-[9px] text-muted-foreground">{spec.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 5. Virtual Bonding Curve */}
        <section id="bonding" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> 5. virtual bonding curve mechanics
          </h2>
          
          <div className="space-y-6 font-mono text-xs text-foreground/80">
            <p className="leading-relaxed">
              The virtual bonding curve serves as the primary market maker for all tokens prior to graduation. 
              Unlike traditional AMMs that require actual liquidity deposits, the virtual curve operates with 
              virtual reserves that algorithmically adjust based on trading activity and oracle price movements.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">5.1 Initial Virtual Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-background rounded text-center border border-primary/30">
                  <div className="font-bold text-primary text-xl">30 SOL</div>
                  <div className="text-[10px]">Initial Virtual Reserve</div>
                </div>
                <div className="p-3 bg-background rounded text-center border border-primary/30">
                  <div className="font-bold text-primary text-xl">1.073B</div>
                  <div className="text-[10px]">Initial Virtual Supply</div>
                </div>
                <div className="p-3 bg-background rounded text-center border border-primary/30">
                  <div className="font-bold text-primary text-xl">85 SOL</div>
                  <div className="text-[10px]">Graduation Threshold</div>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">5.2 Curve Dynamics</h3>
              <ul className="space-y-2 text-[10px]">
                <li>• <strong>Price Discovery:</strong> Exponential price growth as supply decreases, following k = R × S invariant</li>
                <li>• <strong>Leverage Adjustment:</strong> Oracle price movements amplify token price by leverage multiplier L</li>
                <li>• <strong>Slippage:</strong> Deterministic based on trade size relative to pool depth: slippage = (ΔS / S)²</li>
                <li>• <strong>Progress:</strong> Calculated as R_real / 85 SOL, displayed as percentage to graduation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. Synthetic Leverage Engine */}
        <section id="synthetic" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" /> 6. synthetic leverage computation engine
          </h2>
          
          <div className="space-y-6 font-mono text-xs text-foreground/80">
            <p className="leading-relaxed">
              The Synthetic Leverage Engine (SLE) is the core innovation of the leverage.fun protocol. It computes 
              leveraged price exposure through real-time bonding curve adjustments based on oracle price feeds, 
              eliminating the need for collateral, margin, or liquidation mechanisms.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">6.1 Leverage Multiplier Matrix</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { mult: "2x", label: "Conservative", risk: "Low", desc: "2x oracle price movement" },
                  { mult: "3x", label: "Moderate", risk: "Medium", desc: "3x oracle price movement" },
                  { mult: "5x", label: "Aggressive", risk: "High", desc: "5x oracle price movement" },
                  { mult: "10x", label: "Degen", risk: "Extreme", desc: "10x oracle price movement" }
                ].map((lev, i) => (
                  <div key={i} className="p-3 bg-background rounded border border-primary/20">
                    <div className="font-bold text-primary text-xl text-center">{lev.mult}</div>
                    <div className="text-[10px] text-center font-bold">{lev.label}</div>
                    <div className="text-[9px] text-center text-muted-foreground">{lev.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">6.2 Computation Flow</h3>
              <div className="space-y-2 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">1.</span>
                  <span>Pyth oracle publishes price update for reference asset</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">2.</span>
                  <span>SLE calculates price delta: ΔO = (O_new - O_old) / O_old</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">3.</span>
                  <span>Leverage multiplier applied: ΔP = 1 + (L × ΔO)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">4.</span>
                  <span>Bonding curve repriced: P_new = P_old × ΔP</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-primary font-bold">5.</span>
                  <span>New trades execute against repriced curve</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Graduation Protocol */}
        <section id="graduation" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" /> 7. graduation protocol (85 SOL threshold)
          </h2>
          
          <div className="space-y-6 font-mono text-xs text-foreground/80">
            <p className="leading-relaxed">
              When a token&apos;s real SOL reserves reach 85 SOL, it automatically graduates from the virtual bonding curve. 
              This threshold, identical to pump.fun&apos;s graduation mechanism, represents sufficient liquidity for sustainable 
              open market trading and price discovery through external AMMs.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">7.1 Graduation Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-background rounded border-l-2 border-green-500">
                  <div className="font-bold text-green-500 mb-1">Primary: Reserve Threshold</div>
                  <p className="text-[10px] text-muted-foreground">Real SOL reserves ≥ 85 SOL in bonding curve</p>
                </div>
                <div className="p-3 bg-background rounded border-l-2 border-primary">
                  <div className="font-bold text-primary mb-1">Secondary: Holder Count</div>
                  <p className="text-[10px] text-muted-foreground">Minimum 50 unique wallet holders</p>
                </div>
                <div className="p-3 bg-background rounded border-l-2 border-primary">
                  <div className="font-bold text-primary mb-1">Tertiary: Trading Volume</div>
                  <p className="text-[10px] text-muted-foreground">24h volume &gt; 5,000 USD equivalent</p>
                </div>
                <div className="p-3 bg-background rounded border-l-2 border-primary">
                  <div className="font-bold text-primary mb-1">Quaternary: Token Age</div>
                  <p className="text-[10px] text-muted-foreground">Minimum 1 hour since creation</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">7.2 Post-Graduation Mechanics</h3>
              <ul className="space-y-2 text-[10px]">
                <li>• Bonding curve completes and becomes read-only</li>
                <li>• Token trades on the open market</li>
                <li>• Leverage characteristics continue through market forces</li>
                <li>• Price discovery shifts to orderbook/AMM mechanisms</li>
                <li>• Creator continues receiving trading fees</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 8. Economic Model */}
        <section id="fees" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" /> 8. economic model & fee structure
          </h2>
          
          <div className="space-y-6 font-mono text-xs text-foreground/80">
            <p className="leading-relaxed">
              The protocol maintains a transparent, creator-centric fee structure that aligns incentives between 
              token creators and traders. All fees are clearly displayed before transaction execution and automatically 
              distributed through smart contract logic.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">8.1 Fee Schedule</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[10px]">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground">
                      <th className="text-left py-2">Fee Type</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Recipient</th>
                      <th className="text-left py-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2">Deployment</td>
                      <td className="py-2 text-primary">~0.02 SOL</td>
                      <td className="py-2 text-muted-foreground">Network</td>
                      <td className="py-2 text-muted-foreground">Solana transaction fee for token creation</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">Trading Fee</td>
                      <td className="py-2 text-primary">1.0%</td>
                      <td className="py-2 text-primary">Creator (100%)</td>
                      <td className="py-2 text-muted-foreground">Fee on all buy/sell transactions</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">8.2 Creator Economics</h3>
              <p className="text-[10px] text-muted-foreground">
                Token creators receive 100% of trading fees, creating sustainable revenue streams for successful tokens. 
                This aligns creator incentives with token success and community growth. Fees are automatically transferred 
                to the creator wallet on each trade through the pump.fun protocol fee mechanism.
              </p>
            </div>
          </div>
        </section>

        {/* 9. Security */}
        <section id="security" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> 9. security architecture
          </h2>
          
          <div className="space-y-6 font-mono text-xs text-foreground/80">
            <p className="leading-relaxed">
              Security is paramount in the leverage.fun protocol. Multiple safeguards protect user funds and ensure 
              protocol integrity across all operations. The protocol operates as a non-custodial system with no admin 
              keys or upgrade mechanisms.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">9.1 Security Measures</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 bg-background rounded">
                  <div className="font-bold text-primary text-[10px] mb-1">Non-Custodial Design</div>
                  <p className="text-[9px] text-muted-foreground">Users maintain full control of funds. Protocol never holds user assets.</p>
                </div>
                <div className="p-3 bg-background rounded">
                  <div className="font-bold text-primary text-[10px] mb-1">Immutable Curves</div>
                  <p className="text-[9px] text-muted-foreground">Bonding curve parameters cannot be changed post-deployment.</p>
                </div>
                <div className="p-3 bg-background rounded">
                  <div className="font-bold text-primary text-[10px] mb-1">Oracle Redundancy</div>
                  <p className="text-[9px] text-muted-foreground">Multiple price sources prevent manipulation attacks.</p>
                </div>
                <div className="p-3 bg-background rounded">
                  <div className="font-bold text-primary text-[10px] mb-1">No Admin Keys</div>
                  <p className="text-[9px] text-muted-foreground">Protocol operates without centralized control or upgrade authority.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. Advanced Implementation */}
        <section id="advanced" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary" /> 10. advanced implementation details
          </h2>
          
          <div className="space-y-6 font-mono text-xs text-foreground/80">
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">10.1 Price Calculation Algorithm</h3>
              <div className="p-3 bg-background rounded font-mono text-[10px] overflow-x-auto">
                <pre className="text-primary">
{`function calculateTokenPrice(
  basePrice: BN,
  oraclePrice: BN,
  initialOraclePrice: BN,
  leverage: number,
  virtualSol: BN,
  virtualTokens: BN
): BN {
  // Calculate oracle delta
  const oracleDelta = oraclePrice
    .sub(initialOraclePrice)
    .mul(PRECISION)
    .div(initialOraclePrice);
  
  // Apply leverage multiplier
  const leverageDelta = oracleDelta.mul(new BN(leverage)).div(PRECISION);
  
  // Calculate new price
  const newPrice = basePrice.mul(PRECISION.add(leverageDelta)).div(PRECISION);
  
  return newPrice;
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* 11. API Reference */}
        <section id="api" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Terminal className="h-6 w-6 text-primary" /> 11. api reference
          </h2>
          
          <div className="space-y-6 font-mono text-xs text-foreground/80">
            <p className="leading-relaxed">
              The leverage.fun protocol exposes a comprehensive API for developers building integrations, 
              trading bots, analytics dashboards, and other applications.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">11.1 REST Endpoints</h3>
              <div className="space-y-3 text-[10px]">
                <div className="p-3 bg-background rounded border-l-2 border-green-500">
                  <code className="text-green-500 font-bold">GET /api/tokens</code>
                  <p className="text-muted-foreground mt-1">Retrieve all tokens with leverage metadata, prices, and graduation status</p>
                </div>
                <div className="p-3 bg-background rounded border-l-2 border-blue-500">
                  <code className="text-blue-500 font-bold">GET /api/tokens/[id]</code>
                  <p className="text-muted-foreground mt-1">Get detailed information for a specific token including bonding curve data</p>
                </div>
                <div className="p-3 bg-background rounded border-l-2 border-purple-500">
                  <code className="text-purple-500 font-bold">GET /api/price/[asset]</code>
                  <p className="text-muted-foreground mt-1">Get current oracle price for reference asset (SOL, BTC, ETH, etc.)</p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">11.2 Response Format</h3>
              <div className="p-3 bg-background rounded font-mono text-[10px] overflow-x-auto">
                <pre className="text-primary">
{`{
  "token": {
    "mint": "7x8y9z...",
    "name": "Long SOL 3x",
    "symbol": "SOL3X",
    "leverage": 3,
    "direction": "LONG",
    "referenceAsset": "SOL",
    "price": 0.000042,
    "marketCap": 45000,
    "virtualSol": 45.5,
    "graduated": false,
    "progress": 53.5,
    "createdAt": "2026-05-22T19:30:00Z"
  }
}`}
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* 12. FAQ */}
        <section id="faq" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Box className="h-6 w-6 text-primary" /> 12. frequently asked questions
          </h2>
          
          <div className="space-y-4 font-mono text-xs">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-bold text-primary mb-2">Q: How does synthetic leverage work?</h3>
              <p className="text-[10px] text-muted-foreground">
                Synthetic leverage uses bonding curve repricing to simulate leveraged returns. When the reference 
                asset moves, the token price adjusts by the leverage multiplier, creating leveraged exposure 
                without margin requirements or liquidation risks.
              </p>
            </div>
            
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-bold text-primary mb-2">Q: Can I get liquidated?</h3>
              <p className="text-[10px] text-muted-foreground">
                No. Unlike traditional perps, synthetic leverage tokens cannot be liquidated. You hold actual 
                SPL tokens that can always be sold back to the bonding curve, even at a loss. There are no 
                margin calls or forced position closures.
              </p>
            </div>
            
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-bold text-primary mb-2">Q: What happens at graduation?</h3>
              <p className="text-[10px] text-muted-foreground">
                At 85 SOL in the bonding curve, the token graduates. The virtual curve completes and the token 
                transitions to trading on the open market. The leverage characteristics continue 
                through market forces and arbitrage.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-bold text-primary mb-2">Q: How is the price calculated?</h3>
              <p className="text-[10px] text-muted-foreground">
                Price follows the formula: P(t) = P₀ × (1 + L × ΔO), where P₀ is the initial price, L is the 
                leverage multiplier (2x-10x), and ΔO is the percentage change in the oracle price. This creates 
                amplified price movements proportional to leverage.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-bold text-primary mb-2">Q: What are the fees?</h3>
              <p className="text-[10px] text-muted-foreground">
                Token creation costs ~0.02 SOL (network fee). Trading has a 1% fee that goes 100% to the token 
                creator. There are no protocol fees, no funding rates, and no hidden costs.
              </p>
            </div>
          </div>
        </section>

        {/* Powered by + CTA */}
        <section className="rounded-xl border-2 border-border bg-card p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 halftone opacity-20 pointer-events-none" />
          <div className="relative">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">powered by</div>
            <div className="mt-3 flex items-center justify-center gap-6 font-display uppercase text-base flex-wrap">
              <span className="text-foreground">solana</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-foreground">pyth</span>
              <span className="text-muted-foreground">·</span>
              <span className="text-foreground">pump.fun</span>
            </div>
            <Link
              href="/create"
              className="brick inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-md bg-primary text-primary-foreground font-display uppercase text-base hover:-translate-y-0.5 transition-transform"
            >
              <Zap className="h-5 w-5" strokeWidth={3} />
              launch a coin
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}