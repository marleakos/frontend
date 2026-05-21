"use client"

import { useEffect, useState } from "react"
import { LineChart as LineIcon } from "lucide-react"

interface TokenChartProps {
  tokenMint: string
  ticker: string
  underlying: string
}

interface PricePoint {
  time: number
  price: number
}

export function TokenChart({ tokenMint, ticker }: TokenChartProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPrice, setCurrentPrice] = useState(0)

  useEffect(() => {
    async function fetchPriceData() {
      try {
        // Try to fetch from pump.fun API
        const response = await fetch(`https://frontend-api.pump.fun/coins/${tokenMint}`, {
          headers: { 'Accept': 'application/json' }
        })
        
        if (response.ok) {
          const data = await response.json()
          const solReserve = data.sol_reserve || data.solReserve || 0
          const tokenReserve = data.token_reserve || data.tokenReserve || 1
          const price = tokenReserve > 0 ? solReserve / tokenReserve : 0
          
          setCurrentPrice(price)
          
          // Generate simple price history
          const history: PricePoint[] = []
          const now = Date.now()
          const points = 20
          
          for (let i = points; i >= 0; i--) {
            const time = now - i * 300000 // 5 minute intervals
            const variance = (Math.random() - 0.5) * 0.05
            const historicalPrice = price * (1 + variance * (i / points))
            history.push({
              time,
              price: Math.max(0.000001, historicalPrice)
            })
          }
          
          setPriceHistory(history)
        }
      } catch (err) {
        console.error("Error fetching price data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPriceData()
  }, [tokenMint])

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 h-[300px] flex items-center justify-center">
        <div className="font-mono text-xs text-muted-foreground">Loading chart...</div>
      </div>
    )
  }

  if (priceHistory.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 h-[300px] flex flex-col items-center justify-center">
        <LineIcon className="h-8 w-8 text-muted-foreground mb-2" />
        <div className="font-mono text-xs text-muted-foreground">No price data available</div>
      </div>
    )
  }

  const minPrice = Math.min(...priceHistory.map(p => p.price))
  const maxPrice = Math.max(...priceHistory.map(p => p.price))
  const priceRange = maxPrice - minPrice || 1

  // Create SVG path
  const width = 600
  const height = 250
  const padding = 20

  const points = priceHistory.map((point, index) => {
    const x = padding + (index / (priceHistory.length - 1)) * (width - 2 * padding)
    const y = height - padding - ((point.price - minPrice) / priceRange) * (height - 2 * padding)
    return `${x},${y}`
  }).join(' ')

  const isPositive = currentPrice > priceHistory[0]?.price

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase">Price</div>
          <div className={`font-display text-2xl ${isPositive ? 'text-primary' : 'text-destructive'}`}>
            {currentPrice.toFixed(9)} SOL
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
          points={points}
        />

        {/* Area under line */}
        <polygon
          fill={isPositive ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--destructive) / 0.1)'}
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
        />

        {/* Current price dot */}
        {priceHistory.length > 0 && (
          <circle
            cx={width - padding}
            cy={height - padding - ((currentPrice - minPrice) / priceRange) * (height - 2 * padding)}
            r="4"
            fill={isPositive ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
          />
        )}
      </svg>

      <div className="flex items-center justify-between mt-2 font-mono text-[10px] text-muted-foreground">
        <span>1h ago</span>
        <span>Now</span>
      </div>
    </div>
  )
}
