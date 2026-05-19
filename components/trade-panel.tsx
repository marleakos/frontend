"use client"

import { useState } from "react"
import type { Token } from "@/lib/mock-data"
import { AlertTriangle, Zap } from "lucide-react"

export function TradePanel({ token }: { token: Token }) {
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState("")
  const presets = [0.1, 0.5, 1, 5]
  const danger = token.liqDistance < 15

  return (
    <div className="rounded-xl border-2 border-border bg-card overflow-hidden relative">
      <div className="absolute -top-px left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="grid grid-cols-2 border-b-2 border-border">
        <button
          onClick={() => setSide("buy")}
          className={
            side === "buy"
              ? "py-3 font-display uppercase tracking-wider text-sm bg-primary text-primary-foreground"
              : "py-3 font-display uppercase tracking-wider text-sm bg-secondary text-muted-foreground hover:text-foreground"
          }
        >
          buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={
            side === "sell"
              ? "py-3 font-display uppercase tracking-wider text-sm bg-destructive text-destructive-foreground"
              : "py-3 font-display uppercase tracking-wider text-sm bg-secondary text-muted-foreground hover:text-foreground"
          }
        >
          sell
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-center justify-between font-mono text-[11px] text-muted-foreground mb-1.5">
            <span>amount ({side === "buy" ? "SOL" : `$${token.ticker}`})</span>
            <span>balance: 12.4 SOL</span>
          </div>
          <div className="relative">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0"
              className="w-full h-14 rounded-md border-2 border-border bg-input px-3 font-display text-2xl outline-none focus:border-primary"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-muted-foreground">
              {side === "buy" ? "SOL" : token.ticker}
            </span>
          </div>
          <div className="flex gap-1.5 mt-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className="flex-1 py-1.5 rounded-md border border-border bg-secondary hover:border-primary hover:text-primary font-mono text-xs"
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setAmount("12.4")}
              className="flex-1 py-1.5 rounded-md border border-accent bg-accent/10 text-accent font-mono text-xs font-bold"
            >
              max
            </button>
          </div>
        </div>

        <div className="rounded-md border-2 border-border bg-background/40 p-3 space-y-1.5 font-mono text-[11px]">
          <Row label="leverage" value={`${token.leverage}x ${token.direction}`} valueClass="text-primary" />
          <Row label="underlying" value={token.underlying} />
          <Row label="entry price" value="$0.00342" />
          <Row label="slippage" value="1.0%" />
          <Row label="trade fee" value="0.5%" />
          <Row
            label="liq @ underlying"
            value={`$${(158 * (token.direction === "LONG" ? 1 - 0.01 * token.liqDistance : 1 + 0.01 * token.liqDistance)).toFixed(2)}`}
            valueClass={danger ? "text-destructive" : "text-foreground"}
          />
        </div>

        {danger && (
          <div className="flex items-start gap-2 rounded-md border-2 border-destructive bg-destructive/10 p-3 text-[11px] font-mono text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0 animate-pulse" />
            <span>
              this token is <b>{token.liqDistance}%</b> from liquidation. a move against the position wipes out the
              backing perp and the token goes to <b>zero</b>.
            </span>
          </div>
        )}

        <button
          className={
            side === "buy"
              ? "brick w-full bg-primary text-primary-foreground py-3 rounded-md font-display uppercase tracking-wide text-base hover:-translate-y-0.5 transition-transform inline-flex items-center justify-center gap-1.5"
              : "brick w-full bg-destructive text-destructive-foreground py-3 rounded-md font-display uppercase tracking-wide text-base hover:-translate-y-0.5 transition-transform inline-flex items-center justify-center gap-1.5"
          }
        >
          <Zap className="h-4 w-4" strokeWidth={3} />
          {side === "buy" ? `ape ${amount || "0"} sol` : "dump bags"}
        </button>
      </div>
    </div>
  )
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground uppercase tracking-wider text-[10px]">{label}</span>
      <span className={valueClass ?? "text-foreground"}>{value}</span>
    </div>
  )
}
