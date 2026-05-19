"use client"

import { useEffect, useMemo, useRef, useState } from "react"
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
  const seed = useMemo(() => makeCandles(60), [range])
  const [series, setSeries] = useState<Candle[]>(seed)
  const [lastTrade, setLastTrade] = useState<{ side: "BUY" | "SELL"; at: number } | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

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
      timer = window.setTimeout(tick, 900 + Math.random() * 1100)
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
  const range01 = Math.max(1e-9, max - min)
  const padded = { min: min - range01 * 0.08, max: max + range01 * 0.08 }
  const maxV = Math.max(...series.map((c) => c.v))

  // SVG geometry
  const W = 900
  const PRICE_H = 320
  const VOL_H = 70
  const padL = 8
  const padR = 64 // dedicated gutter for price labels
  const padT = 10
  const padB = 8
  const innerW = W - padL - padR
  const innerH = PRICE_H - padT - padB
  const stepX = innerW / series.length
  const candleW = Math.max(2, stepX * 0.7)

  const yScale = (v: number) =>
    padT + innerH * (1 - (v - padded.min) / (padded.max - padded.min))

  function pickIndex(clientX: number) {
    const el = wrapRef.current
    if (!el) return null
    const rect = el.getBoundingClientRect()
    const xRel = ((clientX - rect.left) / rect.width) * W - padL
    const i = Math.floor(xRel / stepX)
    return Math.max(0, Math.min(series.length - 1, i))
  }

  const hovered = hover != null ? series[hover] : null

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/20 flex-wrap gap-2">
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

      <div
        ref={wrapRef}
        className="relative bg-background/30"
        onMouseMove={(e) => setHover(pickIndex(e.clientX))}
        onMouseLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${PRICE_H}`} className="w-full block" style={{ height: PRICE_H }}>
          {/* horizontal grid + right-gutter labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((g) => {
            const y = padT + innerH * g
            const v = padded.max - (padded.max - padded.min) * g
            return (
              <g key={g}>
                <line
                  x1={padL}
                  x2={W - padR}
                  y1={y}
                  y2={y}
                  stroke="hsl(var(--border))"
                  strokeOpacity={0.45}
                  strokeDasharray="2 4"
                />
                <text
                  x={W - padR + 4}
                  y={y + 3}
                  fontSize={10}
                  fontFamily="monospace"
                  fill="hsl(var(--muted-foreground))"
                >
                  {v.toFixed(5)}
                </text>
              </g>
            )
          })}

          {/* candles */}
          {series.map((c, i) => {
            const cx = padL + i * stepX + stepX / 2
            const x = cx - candleW / 2
            const up = c.c >= c.o
            const yHigh = yScale(c.h)
            const yLow = yScale(c.l)
            const yOpen = yScale(c.o)
            const yClose = yScale(c.c)
            const top = Math.min(yOpen, yClose)
            const bodyH = Math.max(1.5, Math.abs(yClose - yOpen))
            const color = up ? "hsl(var(--primary))" : "hsl(var(--destructive))"
            return (
              <g key={i}>
                <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={color} strokeWidth={1.4} />
                <rect x={x} y={top} width={candleW} height={bodyH} fill={color} rx={0.5} />
              </g>
            )
          })}

          {/* crosshair */}
          {hover != null && (
            <g pointerEvents="none">
              <line
                x1={padL + hover * stepX + stepX / 2}
                x2={padL + hover * stepX + stepX / 2}
                y1={padT}
                y2={padT + innerH}
                stroke="hsl(var(--foreground))"
                strokeOpacity={0.25}
                strokeDasharray="2 3"
              />
              <line
                x1={padL}
                x2={W - padR}
                y1={yScale(series[hover].c)}
                y2={yScale(series[hover].c)}
                stroke="hsl(var(--foreground))"
                strokeOpacity={0.25}
                strokeDasharray="2 3"
              />
            </g>
          )}

          {/* live last-price tag (sits in right gutter, not over candles) */}
          <g>
            <line
              x1={padL}
              x2={W - padR}
              y1={yScale(last.c)}
              y2={yScale(last.c)}
              stroke={positive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
              strokeOpacity={0.55}
              strokeDasharray="3 3"
            />
            <rect
              x={W - padR + 1}
              y={yScale(last.c) - 9}
              width={padR - 2}
              height={18}
              rx={2}
              fill={positive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
            />
            <text
              x={W - padR + 5}
              y={yScale(last.c) + 4}
              fontSize={10.5}
              fontFamily="monospace"
              fontWeight={700}
              fill={positive ? "hsl(var(--primary-foreground))" : "hsl(var(--destructive-foreground))"}
            >
              {last.c.toFixed(5)}
            </text>
          </g>
        </svg>

        {/* OHLC tooltip */}
        {hovered && hover != null && (
          <div className="pointer-events-none absolute top-2 left-2 rounded border border-border bg-card/90 backdrop-blur px-2 py-1 font-mono text-[10px] flex gap-2.5">
            <span className="text-muted-foreground">
              o <span className="text-foreground">{hovered.o.toFixed(5)}</span>
            </span>
            <span className="text-muted-foreground">
              h <span className="text-primary">{hovered.h.toFixed(5)}</span>
            </span>
            <span className="text-muted-foreground">
              l <span className="text-destructive">{hovered.l.toFixed(5)}</span>
            </span>
            <span className="text-muted-foreground">
              c{" "}
              <span className={hovered.c >= hovered.o ? "text-primary" : "text-destructive"}>
                {hovered.c.toFixed(5)}
              </span>
            </span>
          </div>
        )}

        {/* volume strip */}
        <svg
          viewBox={`0 0 ${W} ${VOL_H}`}
          className="w-full block border-t border-border"
          style={{ height: VOL_H }}
        >
          <text x={padL + 2} y={12} fontSize={9} fontFamily="monospace" fill="hsl(var(--muted-foreground))">
            volume
          </text>
          {series.map((c, i) => {
            const cx = padL + i * stepX + stepX / 2
            const x = cx - candleW / 2
            const up = c.c >= c.o
            const h = (VOL_H - 6) * (c.v / maxV)
            return (
              <rect
                key={i}
                x={x}
                y={VOL_H - 3 - h}
                width={candleW}
                height={h}
                fill={up ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                opacity={0.5}
              />
            )
          })}
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
