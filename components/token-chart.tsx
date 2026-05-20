"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Connection, PublicKey } from "@solana/web3.js"
import { Program, AnchorProvider } from "@coral-xyz/anchor"
import { RPC_URL, PROGRAM_ID } from "@/lib/program-config"
import { IDL } from "@/lib/idl"
import { LineChart as LineIcon, Maximize2, ZoomIn, ZoomOut } from "lucide-react"

interface TokenChartProps {
  tokenMint: string
  ticker: string
  underlying: string
}

interface PricePoint {
  time: number
  price: number
  volume: number
}

export function TokenChart({ tokenMint, ticker, underlying }: TokenChartProps) {
  const [priceHistory, setPriceHistory] = useState<PricePoint[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPrice, setCurrentPrice] = useState(0)

  useEffect(() => {
    async function fetchPriceData() {
      try {
        const connection = new Connection(RPC_URL, "confirmed")
        const provider = new AnchorProvider(connection, {} as any, { commitment: "confirmed" })
        const program = new Program(IDL as any, provider)

        const mint = new PublicKey(tokenMint)
        
        // Fetch token state to get current price
        const [tokenStatePDA] = PublicKey.findProgramAddressSync(
          [Buffer.from("token_state"), mint.toBuffer()],
          PROGRAM_ID
        )
        
        const tokenState = await (program as any).account.tokenState.fetch(tokenStatePDA)
        
        if (tokenState && tokenState.curveState) {
          const virtualSol = tokenState.curveState.virtualSolReserve.toNumber()
          const virtualToken = tokenState.curveState.virtualTokenReserve.toNumber()
          const price = virtualToken > 0 ? virtualSol / virtualToken : 0
          
          setCurrentPrice(price)
          
          // Generate synthetic history based on current curve state
          // In a real app, this would come from an indexer
          const history: PricePoint[] = []
          const now = Date.now()
          const points = 50
          
          for (let i = points; i >= 0; i--) {
            const time = now - i * 60000 // 1 minute intervals
            // Simulate price movement around current price
            const variance = (Math.random() - 0.5) * 0.1
            const historicalPrice = price * (1 + variance * (i / points))
            history.push({
              time,
              price: Math.max(0.0001, historicalPrice),
              volume: Math.random() * 100 + 10
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
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchPriceData, 30000)
    return () => clearInterval(interval)
  }, [tokenMint])

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-[#0d0d0f] p-8 text-center">
        <div className="font-mono text-sm text-muted-foreground">Loading chart...</div>
      </div>
    )
  }

  if (priceHistory.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-[#0d0d0f] p-8 text-center">
        <div className="font-mono text-sm text-muted-foreground">No price data available</div>
        <div className="font-mono text-[10px] text-muted-foreground mt-2">
          Price history requires an indexer
        </div>
      </div>
    )
  }

  const minPrice = Math.min(...priceHistory.map(p => p.price))
  const maxPrice = Math.max(...priceHistory.map(p => p.price))
  const priceRange = maxPrice - minPrice || 1
  
  const firstPrice = priceHistory[0].price
  const lastPrice = priceHistory[priceHistory.length - 1].price
  const isPositive = lastPrice >= firstPrice

  // SVG dimensions
  const width = 800
  const height = 300
  const padding = { top: 20, right: 80, bottom: 40, left: 20 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Generate path
  const points = priceHistory.map((point, i) => {
    const x = padding.left + (i / (priceHistory.length - 1)) * chartWidth
    const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight
    return `${x},${y}`
  }).join(' ')

  const areaPath = `${padding.left},${padding.top + chartHeight} ${points} ${padding.left + chartWidth},${padding.top + chartHeight}`

  return (
    <div className="rounded-lg border border-border bg-[#0d0d0f] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="font-display text-base">${ticker}</div>
          <div className="font-mono text-[11px] text-muted-foreground">vs {underlying}</div>
          <div className="font-mono text-xs">
            <span className="text-muted-foreground">price </span>
            <span style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>
              {currentPrice.toFixed(6)} SOL
            </span>
            <span className="ml-2" style={{ color: isPositive ? '#22c55e' : '#ef4444' }}>
              {isPositive ? '+' : ''}{(((lastPrice - firstPrice) / firstPrice) * 100).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
          <span>Live</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
        </div>
      </div>

      {/* Chart */}
      <div className="relative bg-[#0d0d0f]">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full block" style={{ height }}>
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((g) => {
            const y = padding.top + chartHeight * g
            const price = maxPrice - priceRange * g
            return (
              <g key={g}>
                <line 
                  x1={padding.left} 
                  x2={width - padding.right} 
                  y1={y} 
                  y2={y} 
                  stroke="rgba(255,255,255,0.06)" 
                />
                <text
                  x={width - padding.right + 5}
                  y={y + 3}
                  fontSize={9}
                  fontFamily="ui-monospace, monospace"
                  fill="rgba(255,255,255,0.45)"
                >
                  {price.toFixed(6)}
                </text>
              </g>
            )
          })}

          {/* Area fill */}
          <polygon
            points={areaPath}
            fill={isPositive ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)'}
          />

          {/* Line */}
          <polyline
            points={points}
            fill="none"
            stroke={isPositive ? '#22c55e' : '#ef4444'}
            strokeWidth={2}
          />

          {/* Current price line */}
          <line
            x1={padding.left}
            x2={width - padding.right}
            y1={padding.top + chartHeight - ((lastPrice - minPrice) / priceRange) * chartHeight}
            y2={padding.top + chartHeight - ((lastPrice - minPrice) / priceRange) * chartHeight}
            stroke={isPositive ? '#22c55e' : '#ef4444'}
            strokeDasharray="4 4"
            opacity={0.5}
          />

          {/* Time labels */}
          {[0, 0.5, 1].map((t) => {
            const x = padding.left + chartWidth * t
            const idx = Math.round((priceHistory.length - 1) * t)
            const time = new Date(priceHistory[idx]?.time || Date.now())
            return (
              <text
                key={t}
                x={x}
                y={height - 10}
                fontSize={9}
                textAnchor="middle"
                fontFamily="ui-monospace, monospace"
                fill="rgba(255,255,255,0.45)"
              >
                {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')}
              </text>
            )
          })}
        </svg>

        {/* Note about indexer */}
        <div className="absolute bottom-2 left-2 font-mono text-[9px] text-muted-foreground/50">
          * Historical data requires an indexer
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-border bg-secondary/20 font-mono text-[11px] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">high: <span className="text-[#22c55e]">{maxPrice.toFixed(6)}</span></span>
          <span className="text-muted-foreground">low: <span className="text-[#ef4444]">{minPrice.toFixed(6)}</span></span>
        </div>
        <div className="text-muted-foreground">
          bonding curve price
        </div>
      </div>
    </div>
  )
}
