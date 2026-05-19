"use client"

import { useState, useMemo } from "react"
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const ranges = ["1m", "5m", "1h", "1d", "all"] as const

export function TokenChart({ ticker, underlying }: { ticker: string; underlying: string }) {
  const [range, setRange] = useState<(typeof ranges)[number]>("1h")

  const data = useMemo(() => {
    const points = 80
    let p = 0.0034
    const out: { t: number; price: number; underlying: number }[] = []
    let u = 158
    for (let i = 0; i < points; i++) {
      p = Math.max(0.0001, p * (1 + (Math.random() - 0.45) * 0.06))
      u = u * (1 + (Math.random() - 0.5) * 0.012)
      out.push({ t: i, price: p, underlying: u })
    }
    return out
  }, [range])

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="font-mono font-bold text-sm">${ticker}</div>
          <div className="font-mono text-[11px] text-muted-foreground">vs {underlying}</div>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={
                r === range
                  ? "px-2 py-1 rounded bg-secondary text-foreground"
                  : "px-2 py-1 rounded text-muted-foreground hover:text-foreground"
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>
      <div className="p-2 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              width={60}
              tickFormatter={(v) => `$${Number(v).toFixed(5)}`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-popover)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontFamily: "var(--font-mono)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--color-muted-foreground)" }}
              formatter={(v: number, name: string) => [
                name === "price" ? `$${v.toFixed(6)}` : `$${v.toFixed(2)}`,
                name === "price" ? ticker : underlying,
              ]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fill="url(#priceFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
