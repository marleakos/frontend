"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import type { TokenData } from "@/hooks/use-tokens"
import { ChevronDown, RotateCcw, Search } from "lucide-react"

type Sort = "featured" | "trending" | "new" | "gainers" | "near liq"
const SORTS: Sort[] = ["featured", "trending", "new", "gainers", "near liq"]

const LEV_OPTIONS = ["All", "2x", "3x", "5x", "10x"] as const
const DIR_OPTIONS = ["All", "Long", "Short"] as const
const STATUS_OPTIONS = ["All", "Bonding", "Graduated"] as const
const ASSET_OPTIONS = ["All", "SOL", "BTC", "ETH", "DOGE"] as const

function sortTokens(list: TokenData[], sort: Sort) {
  const arr = [...list]
  if (sort === "trending") arr.sort((a, b) => b.replies - a.replies)
  else if (sort === "new") arr.sort((a, b) => a.ageMinutes - b.ageMinutes)
  else if (sort === "gainers") arr.sort((a, b) => b.change24h - a.change24h)
  else if (sort === "near liq") arr.sort((a, b) => a.liqDistance - b.liqDistance)
  // featured = by market cap
  else arr.sort((a, b) => b.marketCap - a.marketCap)
  return arr
}

export function LiveBoard({ initial, koth }: { initial: TokenData[]; koth: TokenData }) {
  const [sort, setSort] = useState<Sort>("featured")
  const [search, setSearch] = useState("")
  const [levFilter, setLevFilter] = useState<string>("All")
  const [dirFilter, setDirFilter] = useState<string>("All")
  const [statusFilter, setStatusFilter] = useState<string>("All")
  const [assetFilter, setAssetFilter] = useState<string>("All")
  const [showSortDropdown, setShowSortDropdown] = useState(false)

  const sorted = useMemo(() => {
    let filtered = [...initial]
    
    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.ticker.toLowerCase().includes(search.toLowerCase()),
      )
    }
    
    if (levFilter !== "All") {
      const lev = parseInt(levFilter)
      filtered = filtered.filter((t) => t.leverage === lev)
    }
    
    if (dirFilter !== "All") {
      filtered = filtered.filter((t) => t.direction.toLowerCase() === dirFilter.toLowerCase())
    }
    
    if (statusFilter !== "All") {
      const graduated = statusFilter === "Graduated"
      filtered = filtered.filter((t) => t.graduated === graduated)
    }
    
    if (assetFilter !== "All") {
      filtered = filtered.filter((t) => t.underlying.includes(assetFilter))
    }
    
    return sortTokens(filtered, sort)
  }, [initial, sort, search, levFilter, dirFilter, statusFilter, assetFilter])

  const resetFilters = () => {
    setLevFilter("All")
    setDirFilter("All")
    setStatusFilter("All")
    setAssetFilter("All")
    setSearch("")
  }

  const hasActiveFilters = levFilter !== "All" || dirFilter !== "All" || statusFilter !== "All" || assetFilter !== "All" || search !== ""

  return (
    <>
      <KOTH token={koth} />

      {/* START A NEW COIN Button */}
      <div className="my-6 flex justify-center">
        <Link
          href="/create"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-md bg-primary text-primary-foreground font-display uppercase tracking-wide text-lg hover:opacity-90 transition-opacity"
        >
          [START A NEW COIN]
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="my-6 space-y-3">
        {/* Top row: Sort, Search, Live */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border font-mono text-xs text-foreground hover:border-primary transition-colors"
            >
              <span className="text-muted-foreground">Sort:</span>
              <span className="capitalize font-bold">{sort}</span>
              <ChevronDown className="h-3 w-3" />
            </button>
            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-1 z-20 rounded-md border border-border bg-card shadow-lg min-w-[140px]">
                {SORTS.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSort(s); setShowSortDropdown(false) }}
                    className={`w-full text-left px-3 py-2 font-mono text-xs capitalize hover:bg-secondary ${sort === s ? 'text-primary font-bold' : 'text-foreground'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-secondary border border-border">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tokens..."
                className="flex-1 bg-transparent text-xs font-mono outline-none text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live
          </div>
        </div>

        {/* Filter rows */}
        <div className="space-y-2">
          {/* LEV, DIR, STATUS row */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="text-muted-foreground mr-1">LEV:</span>
            {LEV_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setLevFilter(opt)}
                className={`px-2 py-1 rounded font-mono text-[11px] ${levFilter === opt ? 'bg-[#39ff14] text-black font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {opt}
              </button>
            ))}
            
            <span className="text-muted-foreground ml-3 mr-1">DIR:</span>
            {DIR_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setDirFilter(opt)}
                className={`px-2 py-1 rounded font-mono text-[11px] ${dirFilter === opt ? 'bg-[#39ff14] text-black font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {opt}
              </button>
            ))}
            
            <span className="text-muted-foreground ml-3 mr-1">STATUS:</span>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setStatusFilter(opt)}
                className={`px-2 py-1 rounded font-mono text-[11px] ${statusFilter === opt ? 'bg-[#39ff14] text-black font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {opt}
              </button>
            ))}
            
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="ml-3 flex items-center gap-1 text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </button>
            )}
          </div>

          {/* ASSET row */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="text-muted-foreground mr-1">ASSET:</span>
            {ASSET_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setAssetFilter(opt)}
                className={`px-2 py-1 rounded font-mono text-[11px] ${assetFilter === opt ? 'bg-[#39ff14] text-black font-bold' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Showing count */}
      <div className="mb-3 font-mono text-xs text-muted-foreground">
        Showing {sorted.length} tokens
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <AnimatePresence initial={false}>
          {sorted.map((t) => (
            <LiveCard key={t.id} token={t} />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

function LiveCard({ token }: { token: TokenData }) {
  const positive = token.change24h >= 0
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <Link
        href={`/token/${token.id}`}
        className="group flex gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary transition-colors"
      >
        <div className="grid h-20 w-20 shrink-0 place-items-center rounded-md bg-secondary text-4xl">
          {token.emoji}
        </div>
        <div className="min-w-0 flex flex-col gap-1">
          <div className="font-mono text-[10px] text-muted-foreground">
            created by{" "}
            <span className="text-foreground">
              {token.creator.slice(0, 6)}...{token.creator.slice(-4)}
            </span>{" "}
            <span className="text-primary">{ageLabel(token.ageMinutes)}</span>
          </div>
          <div className="font-mono text-[11px] text-primary">
            market cap: <span className="font-bold">${formatK(token.marketCap)}</span>{" "}
            {token.change24h !== 0 && (
              <span className={positive ? "text-primary" : "text-destructive"}>
                [{positive ? "+" : ""}
                {token.change24h.toFixed(0)}%]
              </span>
            )}
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">
            progress: <span className="text-foreground">{token.progress}%</span> to grad
          </div>
          <div className="mt-auto font-mono text-[11px] truncate">
            <span className="font-display text-sm">{token.name}</span>{" "}
            <span className="text-muted-foreground">(${token.ticker})</span>{" "}
            <span className="text-accent font-bold">
              {token.leverage}x {token.direction.toLowerCase()}
            </span>{" "}
            <span className="text-muted-foreground">{token.underlying}</span>
            {token.graduated && (
              <span className="ml-1 px-1.5 py-0.5 rounded bg-primary text-primary-foreground text-[9px]">
                GRAD
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

function KOTH({ token }: { token: TokenData }) {
  const GRAD = 69000
  const progress = Math.min(100, (token.marketCap / GRAD) * 100)

  return (
    <section className="my-10 grid place-items-center">
      <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        <span className="h-px w-12 bg-border" />
        king of the hill
        <span className="h-px w-12 bg-border" />
      </div>

      <div className="relative w-full max-w-[560px] px-2 md:px-0">
        <Link
          href={`/token/${token.id}`}
          className="relative block border-2 border-foreground bg-card transition-transform hover:-translate-y-0.5"
          style={{ boxShadow: "6px 6px 0 0 hsl(var(--foreground))" }}
        >
          {/* corner sticker badge */}
          <div
            className="absolute -top-2.5 -right-2.5 z-10 select-none border-2 border-foreground bg-primary px-2.5 py-0.5 font-display text-[11px] uppercase tracking-wider text-primary-foreground"
            style={{ transform: "rotate(6deg)", boxShadow: "2px 2px 0 0 hsl(var(--foreground))" }}
          >
            #1 · king
          </div>

          <div className="grid grid-cols-[100px_1fr] gap-0 md:grid-cols-[140px_1fr]">
            {/* big lime emoji panel */}
            <div className="relative grid place-items-center bg-primary border-r-2 border-foreground">
              <div className="text-[56px] md:text-[78px] leading-none drop-shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
                {token.emoji}
              </div>
              <div className="absolute bottom-1 left-1 md:bottom-1.5 md:left-1.5 font-mono text-[7px] md:text-[9px] font-bold uppercase tracking-wider text-primary-foreground/80">
                {token.underlying}
              </div>
            </div>

            {/* content */}
            <div className="p-3 md:p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-display text-lg md:text-2xl uppercase leading-none">
                    {token.name}
                  </div>
                  <div className="mt-1 font-mono text-[11px] md:text-xs text-muted-foreground">
                    ${token.ticker} · {token.leverage}x {token.direction.toLowerCase()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[11px] md:text-xs text-muted-foreground">
                    market cap
                  </div>
                  <div className="font-display text-xl md:text-2xl text-primary">
                    ${formatK(token.marketCap)}
                  </div>
                </div>
              </div>

              {/* progress bar */}
              <div className="mt-3 md:mt-4">
                <div className="flex items-center justify-between font-mono text-[10px] md:text-[11px] text-muted-foreground mb-1">
                  <span>bonding curve progress</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden border border-border">
                  <motion.div
                    className="h-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <div className="mt-1 flex items-center justify-between font-mono text-[9px] md:text-[10px] text-muted-foreground">
                  <span>{formatK(token.marketCap)} / 69k</span>
                  <span>{progress >= 100 ? "ready to graduate" : "until graduation"}</span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </section>
  )
}

function ageLabel(min: number) {
  if (min < 1) return "now"
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min / 60)}h ago`
}

function formatK(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}
