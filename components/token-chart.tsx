"use client"

import { LineChart as LineIcon } from "lucide-react"

interface TokenChartProps {
  tokenMint: string
  ticker: string
  underlying: string
  price: number
}

export function TokenChart({ tokenMint, ticker, price }: TokenChartProps) {
  const hasRealData = price > 0
  const displayPrice = price || 0

  // For now, show a simple visualization without fake history
  // Real historical data would require a paid API (Birdeye/Helius) or backend indexer
  
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase">Price</div>
          <div className={`font-display text-2xl ${hasRealData ? 'text-primary' : 'text-muted-foreground'}`}>
            {hasRealData ? `${price.toFixed(9)} SOL` : 'Loading...'}
          </div>
          {hasRealData && (
            <div className="font-mono text-[10px] text-muted-foreground">
              Real-time from pump.fun
            </div>
          )}
        </div>
        <div className="font-mono text-xs text-muted-foreground">
          ${ticker}
        </div>
      </div>

      {hasRealData ? (
        <div className="h-[250px] flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-secondary/20">
          <LineIcon className="h-12 w-12 text-muted-foreground mb-3" />
          <div className="font-mono text-xs text-muted-foreground text-center">
            Historical chart coming soon
          </div>
          <div className="font-mono text-[10px] text-muted-foreground mt-1">
            Current price: {price.toFixed(9)} SOL
          </div>
          <a 
            href={`https://pump.fun/coin/${tokenMint}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 text-xs text-primary hover:underline"
          >
            View on pump.fun →
          </a>
        </div>
      ) : (
        <div className="h-[250px] flex flex-col items-center justify-center border border-dashed border-border rounded-lg bg-secondary/20">
          <LineIcon className="h-12 w-12 text-muted-foreground mb-3" />
          <div className="font-mono text-xs text-muted-foreground">
            Price data loading...
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-4 font-mono text-[10px] text-muted-foreground">
        <span>Real-time price from Solana blockchain</span>
        <span>Updated now</span>
      </div>
    </div>
  )
}
