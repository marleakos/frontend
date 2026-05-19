"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { motion, AnimatePresence } from "motion/react"

const ranges = ["1m", "5m", "1h", "1d", "all"] as const
type Range = (typeof ranges)[number]

export function TokenChart({ ticker, underlying }: { ticker: string; underlying: string }) {
  const [range, setRange] = useState<Range>("1h")

  // seed price series
  const seed = useMemo(() => {
    const points = 96
    let p = 0.0034
    const out: number[] = []
    for (let i = 0; i < points; i++) {
      p = Math.max(0.0001, p * (1 + (Math.random() - 0.45) * 0.06))
      out.push(p)
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range])

  const [series, setSeries] = useState<number[]>(seed)
  const [lastTrade, setLastTrade] = useState<{ side: "BUY" | "SELL"; at: number } | null>(null)

  // resync when range changes
  useEffect(() => setSeries(seed), [seed])

  // live tick: every 800-1800ms push a new candle, occasionally a "buy" pop
  useEffect(() => {
    let alive = true
    const tick = () => {
      if (!alive) return
      setSeries((s) => {
        const last = s[s.length - 1]
        const isBuy = Math.random() < 0.55
        const drift = (Math.random() - (isBuy ? 0.25 : 0.55)) * 0.05
        const next = Math.max(0.0001, last * (1 + drift))
        if (isBuy && Math.random() < 0.35) {
          setLastTrade({ side: "BUY", at: Date.now() })
        } else if (!isBuy && Math.random() < 0.18) {
          setLastTrade({ side: "SELL", at: Date.now() })
        }
        return [...s.slice(1), next]
      })
      const delay = 800 + Math.random() * 1000
      timer = window.setTimeout(tick, delay)
    }
    let timer = window.setTimeout(tick, 1200)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
  }, [])

  const last = series[series.length - 1]
  const first = series[0]
  const positive = last >= first
  const min = Math.min(...series)
  const max = Math.max(...series)
  const W = 800
  const H = 280
  const pad = 12
  const stepX = (W - pad * 2) / (series.length - 1)

  const path = useMemo(() => {
    return series
      .map((v, i) => {
        const x = pad + i * stepX
        const y = pad + (H - pad * 2) * (1 - (v - min) / Math.max(1e-9, max - min))
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
      })
      .join(" ")
  }, [series, max, min, stepX])

  const areaPath = `${path} L${(pad + (series.length - 1) * stepX).toFixed(1)},${H - pad} L${pad},${H - pad} Z`
  const lastX = pad + (series.length - 1) * stepX
  const lastY = pad + (H - pad * 2) * (1 - (last - min) / Math.max(1e-9, max - min))

  return (
    <div
      className="relative border-2 border-foreground bg-card"
      style={{ boxShadow: "6px 6px 0 0 hsl(var(--foreground))" }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 border-b-2 border-foreground bg-secondary/40 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="font-display text-base">${ticker}</div>
          <div className="font-mono text-[11px] text-muted-foreground">vs {underlying}</div>
          <div
            className={`font-mono text-xs font-bold ${positive ? "text-primary" : "text-destructive"}`}
          >
            ${last.toFixed(6)}{" "}
            <span>
              [{positive ? "+" : ""}
              {(((last - first) / first) * 100).toFixed(1)}%]
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
                  ? "px-2 py-0.5 border border-foreground bg-foreground text-background"
                  : "px-2 py-0.5 border border-transparent text-muted-foreground hover:text-foreground"
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-72 block">
          <defs>
            <linearGradient id="liveFill" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor={positive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
                stopOpacity={0.35}
              />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          {/* horizontal grid */}
          {[0.25, 0.5, 0.75].map((g) => (
            <line
              key={g}
              x1={pad}
              x2={W - pad}
              y1={pad + (H - pad * 2) * g}
              y2={pad + (H - pad * 2) * g}
              stroke="hsl(var(--border))"
              strokeDasharray="2 4"
            />
          ))}
          <motion.path
            d={areaPath}
            fill="url(#liveFill)"
            initial={false}
            animate={{ d: areaPath }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          <motion.path
            d={path}
            fill="none"
            stroke={positive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            initial={false}
            animate={{ d: path }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
          {/* live dot */}
          <motion.circle
            cx={lastX}
            cy={lastY}
            r={4}
            fill={positive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
            stroke="hsl(var(--background))"
            strokeWidth={2}
            animate={{ cx: lastX, cy: lastY }}
            transition={{ duration: 0.3 }}
          />
          <motion.circle
            cx={lastX}
            cy={lastY}
            r={4}
            fill="none"
            stroke={positive ? "hsl(var(--primary))" : "hsl(var(--destructive))"}
            initial={{ r: 4, opacity: 0.6 }}
            animate={{ r: 14, opacity: 0 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "easeOut" }}
          />
        </svg>

        {/* trade flash overlay */}
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
                    ? "border-2 border-foreground bg-primary px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-primary-foreground"
                    : "border-2 border-foreground bg-destructive px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-destructive-foreground"
                }
                style={{ boxShadow: "2px 2px 0 0 hsl(var(--foreground))" }}
              >
                {lastTrade.side === "BUY" ? "+ buy" : "- sell"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-4 border-t-2 border-foreground font-mono text-[11px]">
        <Cell label="open" value={`$${first.toFixed(6)}`} />
        <Cell label="high" value={`$${max.toFixed(6)}`} />
        <Cell label="low" value={`$${min.toFixed(6)}`} />
        <Cell label="last" value={`$${last.toFixed(6)}`} accent={positive ? "primary" : "destructive"} />
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
    <div className="px-3 py-2 border-r-2 border-foreground last:border-r-0">
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
