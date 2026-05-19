"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

const ranges = ["1m", "5m", "1h", "1d", "all"] as const
type Range = (typeof ranges)[number]

type Candle = { o: number; h: number; l: number; c: number; v: number }

function makeCandles(n: number, start = 0.0034): Candle[] {
  const out: Candle[] = []
  let p = start
  for (let i = 0; i < n; i++) {
    const o = p
    const drift = (Math.random() - 0.45) * 0.06
    const c = Math.max(0.0001, o * (1 + drift))
    const h = Math.max(o, c) * (1 + Math.random() * 0.025)
    const l = Math.min(o, c) * (1 - Math.random() * 0.025)
    const v = Math.random() * 100 + 20
    out.push({ o, h, l, c, v })
    p = c
  }
  return out
}

export function TokenChart({ ticker, underlying }: { ticker: string; underlying: string }) {
  const [range, setRange] = useState<Range>("1h")
  const seed = useMemo(() => makeCandles(72), [range])
  const [series, setSeries] = useState<Candle[]>(seed)
  const [lastTrade, setLastTrade] = useState<{ side: "BUY" | "SELL"; at: number } | null>(null)

  useEffect(() => setSeries(seed), [seed])

  // live tick
  useEffect(() => {
    let alive = true
    let timer: number
    const tick = () => {
      if (!alive) return
      setSeries((s) => {
        const last = s[s.length - 1]
        const isBuy = Math.random() < 0.55
        const drift = (Math.random() - (isBuy ? 0.25 : 0.55)) * 0.05
        const o = last.c
        const c = Math.max(0.0001, o * (1 + drift))
        const h = Math.max(o, c) * (1 + Math.random() * 0.02)
        const l = Math.min(o, c) * (1 - Math.random() * 0.02)
        const v = Math.random() * 120 + 30
        if (isBuy && Math.random() < 0.35) setLastTrade({ side: "BUY", at: Date.now() })
        else if (!isBuy && Math.random() < 0.18) setLastTrade({ side: "SELL", at: Date.now() })
        return [...s.slice(1), { o, h, l, c, v }]
      })
      timer = window.setTimeout(tick, 800 + Math.random() * 1000)
    }
    timer = window.setTimeout(tick, 1200)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [])

  const last = series[series.length - 1]
  const first = series[0]
  const positive = last.c >= first.o
  const min = Math.min(...series.map((c) => c.l))
  const max = Math.max(...series.map((c) => c.h))
  const maxV = Math.max(...series.map((c) => c.v))
  const W = 800
  const PRICE_H = 320
  const VOL_H = 64
  const pad = 14
  const innerW = W - pad * 2
  const candleW = (innerW / series.length) * 0.7
  const stepX = innerW / series.length
  const yScale = (v: number) => pad + (PRICE_H - pad * 2) * (1 - (v - min) / Math.max(1e-9, max - min))

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/30 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="font-display text-base">${ticker}</div>
          <div className="font-mono text-[11px] text-muted-foreground">vs {underlying}</div>
          <div className={`font-mono text-xs font-bold ${positive ? "text-primary" : "text-destructive"}`}>
            ${last.c.toFixed(6)}{" "}
            <span>
              [{positive ? "+" : ""}
              {(((last.c - first.o) / first.o) * 100).toFixed(1)}%]
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={
                r === range
                  ? "px-2 py-0.5 rounded border border-border bg-secondary text-foreground"
                  : "px-2 py-0.5 text-muted-foreground hover:text-foreground"
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="relative bg-background/40">
        <svg viewBox={`0 0 ${W} ${PRICE_H}`} className="w-full block" style={{ height: PRICE_H }}>
          {/* grid */}
          {[0.2, 0.4, 0.6, 0.8].map((g) => (
            <line
              key={g}
              x1={pad}
              x2={W - pad}
              y1={pad + (PRICE_H - pad * 2) * g}
              y2={pad + (PRICE_H - pad * 2) * g}
              stroke="hsl(var(--border))"
              strokeOpacity={0.5}
              strokeDasharray="2 4"
            />
          ))}

          {/* y-axis price labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((g) => {
            const v = max - (max - min) * g
            return (
              <text
                key={g}
                x={W - pad - 2}
                y={pad + (PRICE_H - pad * 2) * g + 3}
                fontSize={9}
                fontFamily="monospace"
                fill="hsl(var(--muted-foreground))"
                textAnchor="end"
              >
                {v.toFixed(5)}
              </text>
            )
          })}

          {/* candles */}
          {series.map((c, i) => {
            const x = pad + i * stepX + (stepX - candleW) / 2
            const cx = x + candleW / 2
            const up = c.c >= c.o
            const yHigh = yScale(c.h)
            const yLow = yScale(c.l)
            const yOpen = yScale(c.o)
            const yClose = yScale(c.c)
            const top = Math.min(yOpen, yClose)
            const bodyH = Math.max(1, Math.abs(yClose - yOpen))
            const color = up ? "hsl(var(--primary))" : "hsl(var(--destructive))"
            return (
              <g key={i}>
                <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={color} strokeWidth={1} />
                <rect x={x} y={top} width={candleW} height={bodyH} fill={color} />
              </g>
            )
          })}

          {/* live last-price dashed line */}
          <line
            x1={pad}
            x2={W - pad}
            y1={yScale(last.c)}
            y2={yScale(last.c)}
            stroke={positive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
            strokeOpacity={0.5}
            strokeDasharray="3 3"
          />
          <rect
            x={W - pad - 70}
            y={yScale(last.c) - 8}
            width={68}
            height={16}
            rx={2}
            fill={positive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
          />
          <text
            x={W - pad - 4}
            y={yScale(last.c) + 3}
            fontSize={10}
            fontFamily="monospace"
            fontWeight={700}
            fill={positive ? "hsl(var(--primary-foreground))" : "hsl(var(--destructive-foreground))"}
            textAnchor="end"
          >
            {last.c.toFixed(6)}
          </text>
        </svg>

        {/* volume strip */}
        <svg viewBox={`0 0 ${W} ${VOL_H}`} className="w-full block border-t border-border" style={{ height: VOL_H }}>
          {series.map((c, i) => {
            const x = pad + i * stepX + (stepX - candleW) / 2
            const up = c.c >= c.o
            const h = (VOL_H - 4) * (c.v / maxV)
            return (
              <rect
                key={i}
                x={x}
                y={VOL_H - 2 - h}
                width={candleW}
                height={h}
                fill={up ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                opacity={0.45}
              />
            )
          })}
          <text x={pad + 2} y={11} fontSize={9} fontFamily="monospace" fill="hsl(var(--muted-foreground))">
            volume
          </text>
        </svg>

        {/* trade flash */}
        <AnimatePresence>
          {lastTrade && (
            <motion.div
              key={lastTrade.at}
              initial={{ opacity: 0.9, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="pointer-events-none absolute top-2 right-2 select-none"
            >
              <div
                className={
                  lastTrade.side === "BUY"
                    ? "rounded border border-primary bg-primary/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-primary"
                    : "rounded border border-destructive bg-destructive/15 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-destructive"
                }
              >
                {lastTrade.side === "BUY" ? "+ buy" : "- sell"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-4 border-t border-border font-mono text-[11px]">
        <Cell label="open" value={`$${first.o.toFixed(6)}`} />
        <Cell label="high" value={`$${max.toFixed(6)}`} accent="primary" />
        <Cell label="low" value={`$${min.toFixed(6)}`} accent="destructive" />
        <Cell label="last" value={`$${last.c.toFixed(6)}`} accent={positive ? "primary" : "destructive"} />
      </div>
    </div>
  )
}

function Cell({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: "primary" | "destructive"
}) {
  return (
    <div className="px-3 py-2 border-r border-border last:border-r-0">
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={
          accent === "primary"
            ? "text-primary font-bold"
            : accent === "destructive"
              ? "text-destructive font-bold"
              : "text-foreground"
        }
      >
        {value}
      </div>
    </div>
  )
}
