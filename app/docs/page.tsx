"use client"

import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { Rocket, Zap, BookOpen, Code, GitBranch, Layers, Cpu, Database, Shield, Activity, Globe, Terminal, Box, Share2, Lock, Key, FileCode, Workflow, Settings, Monitor, Server, Wifi, HardDrive, Cloud } from "lucide-react"
import Link from "next/link"

export default function DocsPage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1000px] px-4 py-12">
        {/* Title */}
        <div className="text-center mb-16">
          <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground mb-3">technical documentation</div>
          <h1 className="font-display text-5xl md:text-7xl uppercase leading-none">
            leverage.fun
            <br />
            <span className="rainbow-text">protocol specification</span>
          </h1>
          <p className="mt-5 max-w-2xl mx-auto text-foreground/70 font-mono text-pretty">
            comprehensive technical documentation for the leverage.fun synthetic leverage protocol.
            version 2.1.0-alpha. last updated: 2026-05-22.
          </p>
        </div>

        {/* Table of Contents */}
        <section className="mb-12 rounded-xl border-2 border-border bg-card p-6">
          <h2 className="font-display uppercase text-xl mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> table of contents
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-xs">
            <a href="#overview" className="p-2 hover:bg-secondary rounded transition-colors">1. Protocol Overview</a>
            <a href="#architecture" className="p-2 hover:bg-secondary rounded transition-colors">2. System Architecture</a>
            <a href="#mathematics" className="p-2 hover:bg-secondary rounded transition-colors">3. Mathematical Framework</a>
            <a href="#oracle" className="p-2 hover:bg-secondary rounded transition-colors">4. Oracle Integration Layer</a>
            <a href="#bonding" className="p-2 hover:bg-secondary rounded transition-colors">5. Bonding Curve Mechanics</a>
            <a href="#synthetic" className="p-2 hover:bg-secondary rounded transition-colors">6. Synthetic Leverage Engine</a>
            <a href="#graduation" className="p-2 hover:bg-secondary rounded transition-colors">7. Graduation Protocol</a>
            <a href="#fees" className="p-2 hover:bg-secondary rounded transition-colors">8. Fee Structure & Economics</a>
            <a href="#security" className="p-2 hover:bg-secondary rounded transition-colors">9. Security Considerations</a>
            <a href="#governance" className="p-2 hover:bg-secondary rounded transition-colors">10. Governance & Upgrades</a>
            <a href="#api" className="p-2 hover:bg-secondary rounded transition-colors">11. API Reference</a>
            <a href="#faq" className="p-2 hover:bg-secondary rounded transition-colors">12. Frequently Asked Questions</a>
          </div>
        </section>

        {/* 1. Protocol Overview */}
        <section id="overview" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Rocket className="h-6 w-6 text-primary" /> 1. protocol overview
          </h2>
          
          <div className="space-y-6 font-mono text-sm text-foreground/80">
            <p>
              The leverage.fun protocol represents a paradigm shift in decentralized leveraged exposure mechanisms. 
              By leveraging the Solana blockchain&apos;s high-throughput, low-latency infrastructure, combined with 
              Pyth Network&apos;s institutional-grade oracle infrastructure, leverage.fun enables synthetic leverage 
              positions of 2x to 10x on any supported reference asset without traditional liquidation risks.
            </p>
            
            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-2 text-primary">1.1 Core Value Proposition</h3>
              <ul className="space-y-2 text-xs">
                <li>• <strong>Synthetic Leverage:</strong> Tokenized leverage exposure without perp mechanics</li>
                <li>• <strong>Zero Liquidation Risk:</strong> Bonding curve repricing eliminates forced closures</li>
                <li>• <strong>Instant Liquidity:</strong> Continuous bonding curve enables 24/7 trading</li>
                <li>• <strong>Fair Launch:</strong> Uniform bonding curve prevents insider advantages</li>
                <li>• <strong>Graduation Mechanism:</strong> Automatic transition at $85k market cap</li>
              </ul>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-2 text-primary">1.2 Supported Assets</h3>
              <p className="text-xs mb-2">The protocol currently supports the following reference assets for synthetic leverage:</p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
                <div className="p-2 bg-background rounded text-center">SOL</div>
                <div className="p-2 bg-background rounded text-center">BTC</div>
                <div className="p-2 bg-background rounded text-center">ETH</div>
                <div className="p-2 bg-background rounded text-center">APT</div>
                <div className="p-2 bg-background rounded text-center">ARB</div>
                <div className="p-2 bg-background rounded text-center">DOGE</div>
                <div className="p-2 bg-background rounded text-center">BNB</div>
                <div className="p-2 bg-background rounded text-center">SUI</div>
                <div className="p-2 bg-background rounded text-center">BONK</div>
                <div className="p-2 bg-background rounded text-center">MATIC</div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. System Architecture */}
        <section id="architecture" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" /> 2. system architecture
          </h2>
          
          <div className="space-y-6 font-mono text-sm text-foreground/80">
            <p>
              The leverage.fun protocol operates through a multi-layered architecture designed for maximum 
              composability, security, and performance. Each layer serves a distinct function while maintaining 
              tight integration with adjacent components.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">2.1 Architectural Layers</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-background rounded">
                  <div className="font-bold text-primary mb-1">Layer 1: Presentation Layer</div>
                  <p className="text-xs">User interface components, wallet integration, transaction signing, and real-time price displays. Built with Next.js 16+ and React Server Components for optimal performance.</p>
                </div>
                
                <div className="p-3 bg-background rounded">
                  <div className="font-bold text-primary mb-1">Layer 2: Application Layer</div>
                  <p className="text-xs">Business logic for token creation, leverage calculations, trade execution, and graduation monitoring. Handles all user interactions and state management.</p>
                </div>
                
                <div className="p-3 bg-background rounded">
                  <div className="font-bold text-primary mb-1">Layer 3: Oracle Integration Layer</div>
                  <p className="text-xs">Pyth Network price feed aggregation, data validation, staleness checks, and price deviation monitoring. Ensures accurate leverage calculations.</p>
                </div>
                
                <div className="p-3 bg-background rounded">
                  <div className="font-bold text-primary mb-1">Layer 4: Bonding Curve Layer</div>
                  <p className="text-xs">Mathematical models for token pricing, liquidity management, and synthetic leverage implementation. The core engine of the protocol.</p>
                </div>
                
                <div className="p-3 bg-background rounded">
                  <div className="font-bold text-primary mb-1">Layer 5: Blockchain Layer</div>
                  <p className="text-xs">Solana smart contract interactions, transaction submission, account management, and on-chain state verification.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. Mathematical Framework */}
        <section id="mathematics" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Code className="h-6 w-6 text-primary" /> 3. mathematical framework
          </h2>
          
          <div className="space-y-6 font-mono text-sm text-foreground/80">
            <p>
              The leverage.fun protocol employs sophisticated mathematical models to achieve synthetic leverage 
              without traditional perp mechanics. The following equations govern all price calculations and 
              leverage adjustments.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">3.1 Core Price Equation</h3>
              <div className="p-3 bg-background rounded font-mono text-xs overflow-x-auto">
                <p className="mb-2">The fundamental price calculation for any leveraged token:</p>
                <code className="block p-2 bg-secondary/50 rounded">
                  P(t) = P₀ × (1 + L × ΔO)
                </code>
                <p className="mt-2 text-muted-foreground">Where:</p>
                <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                  <li>• P(t) = Current token price</li>
                  <li>• P₀ = Initial token price</li>
                  <li>• L = Leverage multiplier (2x, 3x, 5x, 10x)</li>
                  <li>• ΔO = Percentage change in oracle price</li>
                </ul>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">3.2 Bonding Curve Formula</h3>
              <div className="p-3 bg-background rounded font-mono text-xs overflow-x-auto">
                <p className="mb-2">The constant product bonding curve with leverage adjustment:</p>
                <code className="block p-2 bg-secondary/50 rounded">
                  R × S = k × (1 + αL)
                </code>
                <p className="mt-2 text-muted-foreground">Where:</p>
                <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                  <li>• R = Reserve balance (SOL)</li>
                  <li>• S = Token supply</li>
                  <li>• k = Constant product invariant</li>
                  <li>• α = Leverage coefficient (0.1 to 0.5)</li>
                  <li>• L = Leverage multiplier</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Oracle Integration */}
        <section id="oracle" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" /> 4. oracle integration layer
          </h2>
          
          <div className="space-y-6 font-mono text-sm text-foreground/80">
            <p>
              Price oracle integration is critical for accurate leverage calculations. The protocol uses 
              Pyth Network&apos;s institutional-grade oracle infrastructure with multiple redundancy layers 
              and deviation checks.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">4.1 Oracle Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-background rounded">
                  <div className="font-bold text-primary">Update Frequency</div>
                  <p className="text-muted-foreground">400ms average latency</p>
                </div>
                <div className="p-3 bg-background rounded">
                  <div className="font-bold text-primary">Price Sources</div>
                  <p className="text-muted-foreground">50+ institutional feeds</p>
                </div>
                <div className="p-3 bg-background rounded">
                  <div className="font-bold text-primary">Deviation Threshold</div>
                  <p className="text-muted-foreground">0.5% maximum variance</p>
                </div>
                <div className="p-3 bg-background rounded">
                  <div className="font-bold text-primary">Staleness Limit</div>
                  <p className="text-muted-foreground">60 seconds maximum age</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. Bonding Curve Mechanics */}
        <section id="bonding" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Activity className="h-6 w-6 text-primary" /> 5. bonding curve mechanics
          </h2>
          
          <div className="space-y-6 font-mono text-sm text-foreground/80">
            <p>
              The bonding curve serves as the primary market maker for all tokens prior to graduation. 
              It provides instant liquidity and continuous price discovery through algorithmic pricing.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">5.1 Curve Parameters</h3>
              <ul className="space-y-2 text-xs">
                <li>• <strong>Initial Virtual SOL:</strong> 30 SOL</li>
                <li>• <strong>Initial Virtual Tokens:</strong> 1,073,000,000</li>
                <li>• <strong>Target Market Cap:</strong> $85,000 USD</li>
                <li>• <strong>Price Growth:</strong> Exponential with leverage multiplier</li>
                <li>• <strong>Liquidity Depth:</strong> Proportional to market cap</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 6. Synthetic Leverage Engine */}
        <section id="synthetic" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" /> 6. synthetic leverage engine
          </h2>
          
          <div className="space-y-6 font-mono text-sm text-foreground/80">
            <p>
              The Synthetic Leverage Engine (SLE) is the core innovation of the leverage.fun protocol. 
              It enables leveraged price exposure without traditional margin requirements or liquidation risks.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">6.1 Leverage Multipliers</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div className="p-3 bg-background rounded text-center">
                  <div className="font-bold text-primary text-lg">2x</div>
                  <div className="text-muted-foreground">Conservative</div>
                </div>
                <div className="p-3 bg-background rounded text-center">
                  <div className="font-bold text-primary text-lg">3x</div>
                  <div className="text-muted-foreground">Moderate</div>
                </div>
                <div className="p-3 bg-background rounded text-center">
                  <div className="font-bold text-primary text-lg">5x</div>
                  <div className="text-muted-foreground">Aggressive</div>
                </div>
                <div className="p-3 bg-background rounded text-center">
                  <div className="font-bold text-primary text-lg">10x</div>
                  <div className="text-muted-foreground">Degenerate</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. Graduation Protocol */}
        <section id="graduation" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <GitBranch className="h-6 w-6 text-primary" /> 7. graduation protocol
          </h2>
          
          <div className="space-y-6 font-mono text-sm text-foreground/80">
            <p>
              When a token reaches $85,000 market capitalization, it automatically graduates from the 
              bonding curve to open market trading. This milestone represents sufficient liquidity 
              and community interest for independent price discovery.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">7.1 Graduation Requirements</h3>
              <ul className="space-y-2 text-xs">
                <li>• <strong>Market Cap:</strong> $85,000 USD minimum</li>
                <li>• <strong>Holders:</strong> Minimum 50 unique wallets</li>
                <li>• <strong>Trading Volume:</strong> 24h volume &gt; $5,000</li>
                <li>• <strong>Token Age:</strong> Minimum 1 hour since creation</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 8. Fee Structure */}
        <section id="fees" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Database className="h-6 w-6 text-primary" /> 8. fee structure & economics
          </h2>
          
          <div className="space-y-6 font-mono text-sm text-foreground/80">
            <p>
              The protocol maintains a simple, transparent fee structure that rewards creators while 
              ensuring sustainable protocol operations. All fees are clearly displayed before transaction execution.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">8.1 Fee Schedule</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="border-b border-border">
                    <tr className="text-muted-foreground">
                      <th className="text-left py-2">Fee Type</th>
                      <th className="text-left py-2">Amount</th>
                      <th className="text-left py-2">Recipient</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2">Deployment</td>
                      <td className="py-2 text-primary">~0.02 SOL</td>
                      <td className="py-2 text-muted-foreground">Network</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2">Trading Fee</td>
                      <td className="py-2 text-primary">1%</td>
                      <td className="py-2 text-muted-foreground">Creator (100%)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* 9. Security */}
        <section id="security" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" /> 9. security considerations
          </h2>
          
          <div className="space-y-6 font-mono text-sm text-foreground/80">
            <p>
              Security is paramount in the leverage.fun protocol. Multiple safeguards protect user funds 
              and ensure protocol integrity across all operations.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">9.1 Security Measures</h3>
              <ul className="space-y-2 text-xs">
                <li>• <strong>Non-Custodial:</strong> Users maintain full control of funds at all times</li>
                <li>• <strong>Immutable Curves:</strong> Bonding curve parameters cannot be changed post-deployment</li>
                <li>• <strong>Oracle Redundancy:</strong> Multiple price sources prevent manipulation</li>
                <li>• <strong>Graduation Locks:</strong> Liquidity automatically transitions at threshold</li>
                <li>• <strong>No Admin Keys:</strong> Protocol operates without centralized control</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 10. Governance */}
        <section id="governance" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Settings className="h-6 w-6 text-primary" /> 10. governance & upgrades
          </h2>
          
          <div className="space-y-6 font-mono text-sm text-foreground/80">
            <p>
              The protocol operates as a fully decentralized system with no admin keys or upgrade mechanisms 
              that could compromise user funds. All parameters are immutable after deployment.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">10.1 Decentralization Principles</h3>
              <ul className="space-y-2 text-xs">
                <li>• <strong>Immutable Core:</strong> Smart contracts cannot be modified</li>
                <li>• <strong>No Admin Keys:</strong> No privileged access exists</li>
                <li>• <strong>Permissionless:</strong> Anyone can create tokens</li>
                <li>• <strong>Censorship Resistant:</strong> No ability to block transactions</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 11. API Reference */}
        <section id="api" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Terminal className="h-6 w-6 text-primary" /> 11. api reference
          </h2>
          
          <div className="space-y-6 font-mono text-sm text-foreground/80">
            <p>
              The leverage.fun protocol exposes a comprehensive API for developers building integrations, 
              trading bots, analytics dashboards, and other applications.
            </p>

            <div className="rounded-lg border border-border bg-secondary/20 p-4">
              <h3 className="font-display text-sm uppercase mb-3 text-primary">11.1 Endpoints</h3>
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-background rounded">
                  <code className="text-primary">GET /api/tokens</code>
                  <p className="text-muted-foreground mt-1">Retrieve all tokens with leverage metadata</p>
                </div>
                <div className="p-3 bg-background rounded">
                  <code className="text-primary">GET /api/tokens/[id]</code>
                  <p className="text-muted-foreground mt-1">Get detailed information for a specific token</p>
                </div>
                <div className="p-3 bg-background rounded">
                  <code className="text-primary">GET /api/price/[asset]</code>
                  <p className="text-muted-foreground mt-1">Get current oracle price for reference asset</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 12. FAQ */}
        <section id="faq" className="mb-16">
          <h2 className="font-display uppercase text-2xl mb-6 flex items-center gap-2">
            <Box className="h-6 w-6 text-primary" /> 12. frequently asked questions
          </h2>
          
          <div className="space-y-4 font-mono text-sm">
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-bold text-primary mb-2">Q: How does synthetic leverage work?</h3>
              <p className="text-xs text-muted-foreground">
                Synthetic leverage uses bonding curve repricing to simulate leveraged returns. When the reference 
                asset moves, the token price adjusts by the leverage multiplier, creating leveraged exposure 
                without margin requirements.
              </p>
            </div>
            
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-bold text-primary mb-2">Q: Can I get liquidated?</h3>
              <p className="text-xs text-muted-foreground">
                No. Unlike traditional perps, synthetic leverage tokens cannot be liquidated. You hold actual 
                tokens that can always be sold back to the bonding curve, even at a loss.
              </p>
            </div>
            
            <div className="rounded-lg border border-border bg-card p-4">
              <h3 className="font-bold text-primary mb-2">Q: What happens at graduation?</h3>
              <p className="text-xs text-muted-foreground">
                At $85k market cap, the token graduates from the bonding curve and trades on the open market. 
                The leverage characteristics continue through protocol mechanics.
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
