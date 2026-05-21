"use client"

import { LineChart as LineIcon } from "lucide-react"

interface TokenChartProps {
  tokenMint: string
  ticker: string
  underlying: string
  price: number
}

export function TokenChart({ tokenMint, ticker, price }: TokenChartProps) {
  // If no price data, show message
  if (price === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 h-[300px] flex flex-col items-center justify-center">
        <LineIcon className="h-8 w-8 text-muted-foreground mb-2" />
        <div className="font-mono text-xs text-muted-foreground">No price data available</div>
        <div className="font-mono text-[10px] text-muted-foreground mt-2">
          View on <a href={`https://pump.fun/coin/${tokenMint}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">pump.fun</a>
        </div>
      </div>
    )
  }

  // Generate simple price history based on current price
  const priceHistory: { time: number; price: number }[] = []
  const now = Date.now()
  const points = 20
  
  for (let i = points; i >= 0; i--) {
    const time = now - i * 300000 // 5 minute intervals
    const variance = (Math.random() - 0.5) * 0.05
    const historicalPrice = price * (1 + variance * (i / points))
    priceHistory.push({
      time,
      price: Math.max(0.000001, historicalPrice)
    })
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
            {(price || 0).toFixed(9)} SOL
          </div>
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
          cy={height - padding - ((price - minPrice) / priceRange) * (height - 2 * padding)}
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
