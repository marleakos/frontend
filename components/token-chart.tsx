"use client"

import { useEffect, useState } from "react"
import { TrendingUp, TrendingDown, ExternalLink } from "lucide-react"

interface TokenChartProps {
  tokenMint: string
  ticker: string
  underlying: string
  price: number
}

interface TokenInfo {
  name: string
  symbol: string
  priceUsd: number
  priceChange24h: number
  marketCap: number
  volume24h: number
  pairAddress: string
}

export function TokenChart({ tokenMint, ticker, price }: TokenChartProps) {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchTokenInfo() {
      try {
        setLoading(true)
        const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${tokenMint}`)
        const data = await response.json()
        
        if (data.pairs && data.pairs.length > 0) {
          const pair = data.pairs[0]
          setTokenInfo({
            name: pair.baseToken.name,
            symbol: pair.baseToken.symbol,
            priceUsd: parseFloat(pair.priceUsd) || price,
            priceChange24h: pair.priceChange?.h24 || 0,
            marketCap: pair.marketCap || 0,
            volume24h: pair.volume?.h24 || 0,
            pairAddress: pair.pairAddress
          })
        }
      } catch (e) {
        console.error('Error fetching token info:', e)
      } finally {
        setLoading(false)
      }
    }
    
    if (tokenMint) {
      fetchTokenInfo()
    }
  }, [tokenMint, price])

  const info = tokenInfo || {
    name: ticker,
    symbol: ticker,
    priceUsd: price,
    priceChange24h: 0,
    marketCap: 0,
    volume24h: 0,
    pairAddress: ''
  }

  const isPositive = info.priceChange24h >= 0
  const chartColor = isPositive ? "#39ff14" : "#ff3939"

  const formatPrice = (value: number) => {
    if (value < 0.0001) return `$${value.toExponential(4)}`
    if (value < 1) return `$${value.toFixed(10)}`
    return `$${value.toFixed(2)}`
  }

  const formatNumber = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
    return `$${value.toFixed(2)}`
  }

  // DexScreener embed URL
  const dexScreenerUrl = `https://dexscreener.com/solana/${tokenMint}`
  const embedUrl = info.pairAddress 
    ? `https://dexscreener.com/solana/${info.pairAddress}?embed=1&theme=dark&trades=0&info=0`
    : null

  if (loading) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] text-muted-foreground uppercase">Price</div>
            <div className="font-display text-2xl text-muted-foreground animate-pulse">
              Loading...
            </div>
          </div>
        </div>
        <div className="h-[400px] flex items-center justify-center bg-secondary/20 rounded-lg">
          <div className="font-mono text-xs text-muted-foreground">Loading chart...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase">Price</div>
          <div className="flex items-center gap-3">
            <div className="font-display text-2xl" style={{ color: chartColor }}>
              {formatPrice(info.priceUsd)}
            </div>
            <div className={`flex items-center gap-1 font-mono text-sm ${isPositive ? 'text-primary' : 'text-destructive'}`}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isPositive ? '+' : ''}{info.priceChange24h.toFixed(2)}%
            </div>
          </div>
          <div className="font-mono text-[10px] text-muted-foreground mt-1">
            24h change • Data from DexScreener
          </div>
        </div>
        <div className="text-right">
          <div className="font-display text-lg">${info.symbol}</div>
          <div className="font-mono text-xs text-muted-foreground">{info.name}</div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-secondary/30 rounded-lg">
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase">Market Cap</div>
          <div className="font-mono text-sm font-bold">{formatNumber(info.marketCap)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase">Volume 24h</div>
          <div className="font-mono text-sm font-bold">{formatNumber(info.volume24h)}</div>
        </div>
        <div>
          <div className="font-mono text-[10px] text-muted-foreground uppercase">Token</div>
          <div className="font-mono text-sm font-bold truncate">{tokenMint.slice(0, 6)}...{tokenMint.slice(-4)}</div>
        </div>
      </div>

      {/* Embedded Chart */}
      <div className="relative h-[400px] bg-black rounded-lg overflow-hidden">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            width="100%"
            height="100%"
            frameBorder="0"
            allowFullScreen
            className="absolute inset-0"
          />
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <p className="font-mono text-xs text-muted-foreground mb-2">Chart not available</p>
            <a 
              href={dexScreenerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              View on DexScreener <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4">
        <div className="font-mono text-[10px] text-muted-foreground">
          Live chart from DexScreener
        </div>
        <a 
          href={dexScreenerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1 font-mono"
        >
          View full chart <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
