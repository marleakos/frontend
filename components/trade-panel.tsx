"use client"

import { useState } from "react"
import type { Token } from "@/lib/mock-data"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export function TradePanel({ token }: { token: Token }) {
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const [amount, setAmount] = useState("")
  const presets = [0.1, 0.5, 1, 5]
  const danger = token.liqDistance < 15

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-2">
        <button
          onClick={() => setSide("buy")}
          className={
            side === "buy"
              ? "py-3 font-mono font-bold text-sm bg-primary text-primary-foreground"
              : "py-3 font-mono font-bold text-sm bg-secondary text-muted-foreground hover:text-foreground"
          }
        >
          buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={
            side === "sell"
              ? "py-3 font-mono font-bold text-sm bg-destructive text-destructive-foreground"
              : "py-3 font-mono font-bold text-sm bg-secondary text-muted-foreground hover:text-foreground"
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
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            className="w-full h-12 rounded-md border border-border bg-input px-3 font-mono text-lg outline-none focus:ring-2 focus:ring-ring"
          />
          <div className="flex gap-1.5 mt-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className="flex-1 py-1.5 rounded-md bg-secondary hover:bg-accent hover:text-accent-foreground font-mono text-xs"
              >
                {p} SOL
              </button>
            ))}
            <button
              onClick={() => setAmount("12.4")}
              className="flex-1 py-1.5 rounded-md bg-secondary hover:bg-accent hover:text-accent-foreground font-mono text-xs"
            >
              max
            </button>
          </div>
        </div>

        <div className="rounded-md border border-border bg-secondary/40 p-3 space-y-1.5 font-mono text-[11px]">
          <Row label="leverage" value={`${token.leverage}x ${token.direction}`} />
          <Row label="underlying" value={token.underlying} />
          <Row label="entry price" value="$0.00342" />
          <Row label="slippage" value="1.0%" />
          <Row label="fee" value="0.5%" />
          <Row
            label="liq @ underlying"
            value={`$${(158 * (token.direction === "LONG" ? 1 - 0.01 * token.liqDistance : 1 + 0.01 * token.liqDistance)).toFixed(2)}`}
            valueClass={danger ? "text-destructive" : "text-foreground"}
          />
        </div>

        {danger && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-[11px] font-mono text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              this token is {token.liqDistance}% from liquidation. a move against the position wipes out the
              backing perp and the token goes to zero.
            </span>
          </div>
        )}

        <Button
          className={
            side === "buy"
              ? "w-full bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold glow-primary"
              : "w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 font-mono font-bold"
          }
        >
          {side === "buy" ? `[ ape ${amount || "0"} SOL ]` : "[ dump ]"}
        </Button>
      </div>
    </div>
  )
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={valueClass ?? "text-foreground"}>{value}</span>
    </div>
  )
}
