"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

const ranges = ["15s", "1m", "5m", "1h", "1d"] as const
type Range = (typeof ranges)[number]

type Candle = { o: number; h: number; l: number; c: number; v: number; t: number }

// Fixed pump.fun-style chart colors. Don't use CSS vars — SVG fill needs concrete values.
const UP = "#22c55e"
const DOWN = "#ef4444"
const GRID = "rgba(255,255,255,0.06)"
const AXIS = "rgba(255,255,255,0.45)"

function makeCandles(n: number, start = 0.0034): Candle[] {
  const out: Candle[] = []
  let p = start
  let t = Date.now() - n * 60_000
  for (let i = 0; i < n; i++) {
    const o = p
    const drift = (Math.random() - 0.45) * 0.06
    const c = Math.max(0.0001, o * (1 + drift))
    const h = Math.max(o, c) * (1 + Math.random() * 0.025)
    const l = Math.min(o, c) * (1 - Math.random() * 0.025)
    const v = Math.random() * 100 + 20
    out.push({ o, h, l, c, v, t })
    p = c
    t += 60_000
  }
  return out
}

function fmtPrice(v: number) {
  if (v >= 1) return v.toFixed(4)
  if (v >= 0.01) return v.toFixed(5)
  return v.toFixed(6)
}

function fmtTime(t: number) {
  const d = new Date(t)
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
}

export function TokenChart({ ticker, underlying }: { ticker: string; underlying: string }) {
  const [range, setRange] = useState<Range>("1m")
  const seed = useMemo(() => makeCandles(70), [range])
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
        return [...s.slice(1), { o, h, l, c, v, t: last.t + 60_000 }]
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
  const r = Math.max(1e-9, max - min)
  const padded = { min: min - r * 0.08, max: max + r * 0.08 }
  const maxV = Math.max(...series.map((c) => c.v))

  // SVG geometry
  const W = 900
  const PRICE_H = 360
  const VOL_H = 80
  const padL = 4
  const padR = 64
  const padT = 8
  const padB = 24 // time axis
  const innerW = W - padL - padR
  const innerH = PRICE_H - padT - padB
  const stepX = innerW / series.length
  const candleW = Math.max(2.5, stepX * 0.72)

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

  // 5 evenly-spaced time ticks across the bottom
  const timeTickIdx = [0, 1, 2, 3, 4].map((i) =>
    Math.min(series.length - 1, Math.floor((i / 4) * (series.length - 1))),
  )

  return (
    <div className="rounded-lg border border-border bg-[#0d0d0f] overflow-hidden">
      {/* top bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/20 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="font-display text-base">${ticker}</div>
          <div className="font-mono text-[11px] text-muted-foreground">vs {underlying}</div>
          <div className="font-mono text-xs">
            <span className="text-muted-foreground">o </span>
            <span className="text-foreground">{fmtPrice(first.o)}</span>
            <span className="text-muted-foreground"> h </span>
            <span style={{ color: UP }}>{fmtPrice(max)}</span>
            <span className="text-muted-foreground"> l </span>
            <span style={{ color: DOWN }}>{fmtPrice(min)}</span>
            <span className="text-muted-foreground"> c </span>
            <span style={{ color: positive ? UP : DOWN }}>{fmtPrice(last.c)}</span>
            <span className="ml-2" style={{ color: positive ? UP : DOWN }}>
              {positive ? "+" : ""}
              {(((last.c - first.o) / first.o) * 100).toFixed(2)}%
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
        className="relative bg-[#0d0d0f]"
        onMouseMove={(e) => setHover(pickIndex(e.clientX))}
        onMouseLeave={() => setHover(null)}
      >
        <svg viewBox={`0 0 ${W} ${PRICE_H}`} className="w-full block" style={{ height: PRICE_H }}>
          {/* horizontal grid + right-gutter price labels */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((g) => {
            const y = padT + innerH * g
            const v = padded.max - (padded.max - padded.min) * g
            return (
              <g key={g}>
                <line x1={padL} x2={W - padR} y1={y} y2={y} stroke={GRID} />
                <text
                  x={W - padR + 6}
                  y={y + 3}
                  fontSize={10}
                  fontFamily="ui-monospace, monospace"
                  fill={AXIS}
                >
                  {fmtPrice(v)}
                </text>
              </g>
            )
          })}

          {/* vertical grid every ~10 candles */}
          {series.map((_, i) =>
            i % 10 === 0 && i !== 0 ? (
              <line
                key={`v${i}`}
                x1={padL + i * stepX}
                x2={padL + i * stepX}
                y1={padT}
                y2={padT + innerH}
                stroke={GRID}
              />
            ) : null,
          )}

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
            const color = up ? UP : DOWN
            return (
              <g key={i}>
                <line x1={cx} x2={cx} y1={yHigh} y2={yLow} stroke={color} strokeWidth={1} />
                <rect x={x} y={top} width={candleW} height={bodyH} fill={color} />
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
                stroke={AXIS}
                strokeDasharray="3 4"
              />
              <line
                x1={padL}
                x2={W - padR}
                y1={yScale(series[hover].c)}
                y2={yScale(series[hover].c)}
                stroke={AXIS}
                strokeDasharray="3 4"
              />
              <rect
                x={W - padR + 1}
                y={yScale(series[hover].c) - 9}
                width={padR - 2}
                height={18}
                fill="rgba(255,255,255,0.9)"
              />
              <text
                x={W - padR + 5}
                y={yScale(series[hover].c) + 4}
                fontSize={11}
                fontFamily="ui-monospace, monospace"
                fontWeight={700}
                fill="#0d0d0f"
              >
                {fmtPrice(series[hover].c)}
              </text>
            </g>
          )}

          {/* live last-price tag — solid color, sits in right gutter, never over candles */}
          <g>
            <line
              x1={padL}
              x2={W - padR}
              y1={yScale(last.c)}
              y2={yScale(last.c)}
              stroke={positive ? UP : DOWN}
              strokeOpacity={0.6}
              strokeDasharray="4 4"
            />
            <rect
              x={W - padR + 1}
              y={yScale(last.c) - 9}
              width={padR - 2}
              height={18}
              fill={positive ? UP : DOWN}
            />
            <text
              x={W - padR + 5}
              y={yScale(last.c) + 4}
              fontSize={11}
              fontFamily="ui-monospace, monospace"
              fontWeight={700}
              fill="#000"
            >
              {fmtPrice(last.c)}
            </text>
          </g>

          {/* time axis */}
          <line x1={padL} x2={W - padR} y1={PRICE_H - padB} y2={PRICE_H - padB} stroke={GRID} />
          {timeTickIdx.map((i) => (
            <text
              key={`t${i}`}
              x={padL + i * stepX + stepX / 2}
              y={PRICE_H - 8}
              fontSize={10}
              textAnchor="middle"
              fontFamily="ui-monospace, monospace"
              fill={AXIS}
            >
              {fmtTime(series[i].t)}
            </text>
          ))}
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
              className="pointer-events-none absolute top-2 right-3 select-none"
            >
              <div
                className="rounded border px-2 py-0.5 font-mono text-[10px] font-bold uppercase"
                style={{
                  color: lastTrade.side === "BUY" ? UP : DOWN,
                  borderColor: lastTrade.side === "BUY" ? UP : DOWN,
                  background:
                    lastTrade.side === "BUY" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                }}
              >
                {lastTrade.side === "BUY" ? "+ buy" : "- sell"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* volume strip */}
        <svg
          viewBox={`0 0 ${W} ${VOL_H}`}
          className="w-full block border-t border-border"
          style={{ height: VOL_H }}
        >
          <text x={padL + 4} y={12} fontSize={9} fontFamily="ui-monospace, monospace" fill={AXIS}>
            volume
          </text>
          {series.map((c, i) => {
            const cx = padL + i * stepX + stepX / 2
            const x = cx - candleW / 2
            const up = c.c >= c.o
            const h = (VOL_H - 16) * (c.v / maxV)
            return (
              <rect
                key={i}
                x={x}
                y={VOL_H - 4 - h}
                width={candleW}
                height={h}
                fill={up ? UP : DOWN}
                opacity={0.55}
              />
            )
          })}
        </svg>
      </div>

      {/* OHLC tooltip */}
      {hovered && (
        <div className="px-3 py-1.5 border-t border-border bg-secondary/20 font-mono text-[11px] flex items-center gap-3">
          <span className="text-muted-foreground">{fmtTime(hovered.t)}</span>
          <span className="text-muted-foreground">
            o <span className="text-foreground">{fmtPrice(hovered.o)}</span>
          </span>
          <span className="text-muted-foreground">
            h <span style={{ color: UP }}>{fmtPrice(hovered.h)}</span>
          </span>
          <span className="text-muted-foreground">
            l <span style={{ color: DOWN }}>{fmtPrice(hovered.l)}</span>
          </span>
          <span className="text-muted-foreground">
            c{" "}
            <span style={{ color: hovered.c >= hovered.o ? UP : DOWN }}>{fmtPrice(hovered.c)}</span>
          </span>
          <span className="text-muted-foreground">
            v <span className="text-foreground">{hovered.v.toFixed(0)}</span>
          </span>
        </div>
      )}
    </div>
  )
}
