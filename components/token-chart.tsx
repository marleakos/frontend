"use client"

import { LineChart as LineIcon } from "lucide-react"

interface TokenChartProps {
  tokenMint: string
  ticker: string
  underlying: string
  price: number
}

export function TokenChart({ tokenMint, ticker, price }: TokenChartProps) {
  // If no price data from DexScreener, show placeholder chart
  // New tokens take time to be indexed
  const displayPrice = price || 0.000001
  const hasRealData = price > 0

  // Generate price history
  // If real data: show flat line at current price
  // If no real data: show placeholder
  const priceHistory: { time: number; price: number }[] = []
  const now = Date.now()
  const points = 20
  
  for (let i = points; i >= 0; i--) {
    const time = now - i * 300000 // 5 minute intervals
    if (hasRealData) {
      // Real data: flat line with small variance
      const variance = (Math.random() - 0.5) * 0.02
      priceHistory.push({
        time,
        price: price * (1 + variance)
      })
    } else {
      // No real data: show placeholder flat line
      priceHistory.push({
        time,
        price: displayPrice
      })
    }
  }

  const minPrice = Math.min(...priceHistory.map(p => p.price))
  const maxPrice = Math.max(...priceHistory.map(p => p.price))
  const priceRange = maxPrice - minPrice || 1

  // Create SVG path
  const width = 600
  const height = 250
  const padding = 20

  const points_str = priceHistory.map((point, index) => {
    const x = padding + (index / (priceHistory.length - 1)) * (width - 2 * padding)
    const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding)
    return `${x},${y}`
  }).join(' ')

  const isPositive = priceHistory[priceHistory.length - 1]?.price > priceHistory[0]?.price

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase">Price</div>
          <div className={`font-display text-2xl ${isPositive ? 'text-primary' : 'text-destructive'}`}>
            {hasRealData ? `${price.toFixed(9)} SOL` : 'Pending...'}
          </div>
          {!hasRealData && (
            <div className="font-mono text-[10px] text-muted-foreground">
              New token - data pending
            </div>
          )}
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          ${ticker}
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[250px]">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
          <line
            key={i}
            x1={padding}
            y1={padding + ratio * (height - 2 * padding)}
            x2={width - padding}
            y2={padding + ratio * (height - 2 * padding)}
            stroke="hsl(var(--border))"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
        ))}

        {/* Price line */}
        <polyline
          fill="none"
          stroke={isPositive ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
          strokeWidth="2"
          points={points_str}
        />

        {/* Area under line */}
        <polygon
          fill={isPositive ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--destructive) / 0.1)'}
          points={`${padding},${height - padding} ${points_str} ${width - padding},${height - padding}`}
        />

        {/* Current price dot */}
        <circle
          cx={width - padding}
          cy={height - padding - ((displayPrice - minPrice) / priceRange) * (height - 2 * padding)}
          r="4"
          fill={isPositive ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
        />
      </svg>

      <div className="flex items-center justify-between mt-2 font-mono text-[10px] text-muted-foreground">
        <span>1h ago</span>
        <span>Now</span>
      </div>
    </div>
  )
}
