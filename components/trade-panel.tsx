"use client"

import { useState } from "react"
import { motion } from "motion/react"
import type { TokenData } from "@/hooks/use-tokens"
import { AlertTriangle, ExternalLink } from "lucide-react"

export function TradePanel({ token }: { token: TokenData }) {
  const [side, setSide] = useState<"buy" | "sell">("buy")
  const danger = token.liqDistance < 15
  const isBuy = side === "buy"

  // Pump.fun trade URL
  const pumpFunUrl = `https://pump.fun/coin/${token.mint.toString()}`

  return (
    <div className="relative rounded-lg border border-border bg-card overflow-hidden">
      <div className="grid grid-cols-2 border-b border-border">
        <button
          onClick={() => setSide("buy")}
          className={
            isBuy
              ? "py-2.5 font-display uppercase tracking-wider text-sm bg-primary text-primary-foreground"
              : "py-2.5 font-display uppercase tracking-wider text-sm bg-secondary text-muted-foreground hover:text-foreground"
          }
        >
          buy
        </button>
        <button
          onClick={() => setSide("sell")}
          className={
            !isBuy
              ? "py-2.5 font-display uppercase tracking-wider text-sm bg-destructive text-destructive-foreground"
              : "py-2.5 font-display uppercase tracking-wider text-sm bg-secondary text-muted-foreground hover:text-foreground"
          }
        >
          sell
        </button>
      </div>

      <div className="p-4 space-y-3">
        <div className="rounded-md border border-border bg-secondary/30 p-3 space-y-1.5 font-mono text-[11px]">
          <Row
            label="leverage"
            value={`${token.leverage}x ${token.direction}`}
            valueClass={token.direction === "LONG" ? "text-primary" : "text-destructive"}
          />
          <Row label="underlying" value={token.underlying} />
          <Row label="market cap" value={`$${token.marketCap.toLocaleString()}`} />
          <Row label="progress" value={`${token.progress}% to grad`} />
          <Row
            label="liq distance"
            value={`${token.liqDistance}%`}
            valueClass={danger ? "text-destructive font-bold" : "text-foreground"}
          />
        </div>

        {danger && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-[11px] font-mono text-destructive">
            <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              this token is <b>{token.liqDistance}%</b> from liquidation. one bad move and the token goes to{" "}
              <b>zero</b>.
            </span>
          </div>
        )}

        <div className="rounded-md border border-primary/40 bg-primary/10 p-3">
          <p className="font-mono text-[11px] text-muted-foreground mb-2">
            Trading is handled on pump.fun
          </p>
          <motion.a
            href={pumpFunUrl}
            target="_blank"
            rel="noopener noreferrer"
            whileTap={{ scale: 0.97 }}
            className="flex items-center justify-center gap-2 w-full h-11 rounded-md bg-primary text-primary-foreground font-display uppercase tracking-wide text-base hover:brightness-110"
          >
            {isBuy ? "[ buy on pump.fun ]" : "[ sell on pump.fun ]"}
            <ExternalLink className="h-4 w-4" />
          </motion.a>
        </div>

        <p className="text-center font-mono text-[10px] text-muted-foreground">
          You&apos;ll be redirected to pump.fun to complete the trade
        </p>
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
