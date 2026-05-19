"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import type { Token } from "@/lib/mock-data"

type Sort = "featured" | "trending" | "new" | "gainers" | "near liq"

const SORTS: Sort[] = ["featured", "trending", "new", "gainers", "near liq"]

function sortTokens(list: Token[], sort: Sort) {
  const arr = [...list]
  if (sort === "trending") arr.sort((a, b) => b.replies - a.replies)
  else if (sort === "new") arr.sort((a, b) => a.ageMinutes - b.ageMinutes)
  else if (sort === "gainers") arr.sort((a, b) => b.change24h - a.change24h)
  else if (sort === "near liq") arr.sort((a, b) => a.liqDistance - b.liqDistance)
  // featured: leave as-is (gets reordered by buy events)
  return arr
}

export function LiveBoard({ initial, koth }: { initial: Token[]; koth: Token }) {
  const [list, setList] = useState<Token[]>(initial)
  const [kothToken, setKothToken] = useState<Token>(koth)
  const [sort, setSort] = useState<Sort>("featured")
  const [search, setSearch] = useState("")
  const [pumped, setPumped] = useState<Record<string, number>>({}) // id -> timestamp
  const [bought, setBought] = useState<{ id: string; ticker: string; sol: number } | null>(null)

  // Simulate buys: every 900-1800ms a random token gets bought
  useEffect(() => {
    let alive = true
    function tick() {
      if (!alive) return
      const candidates = [kothToken, ...list]
      const winner = candidates[Math.floor(Math.random() * candidates.length)]
      const sol = +(Math.random() * 8 + 0.2).toFixed(2)
      const mcapBump = Math.floor(sol * 1200 + Math.random() * 800)

      // bump mcap + replies on buy
      setList((prev) =>
        prev.map((t) =>
          t.id === winner.id
            ? { ...t, marketCap: t.marketCap + mcapBump, replies: t.replies + (Math.random() < 0.3 ? 1 : 0) }
            : t,
        ),
      )

      // featured = reorder to top (the pumpfun pop-to-front effect)
      if (sort === "featured") {
        setList((prev) => {
          const idx = prev.findIndex((t) => t.id === winner.id)
          if (idx <= 0) return prev
          const copy = [...prev]
          const [it] = copy.splice(idx, 1)
          copy.unshift(it)
          return copy
        })
      }

      // possibly dethrone KOTH
      if (winner.id !== kothToken.id && Math.random() < 0.18) {
        setKothToken(winner)
      } else if (winner.id === kothToken.id) {
        setKothToken((k) => ({ ...k, marketCap: k.marketCap + mcapBump }))
      }

      // mark as pumped (animation trigger)
      setPumped((p) => ({ ...p, [winner.id]: Date.now() }))
      setBought({ id: winner.id, ticker: winner.ticker, sol })

      const next = 700 + Math.random() * 1300
      setTimeout(tick, next)
    }
    const t = setTimeout(tick, 800)
    return () => {
      alive = false
      clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort])

  const sorted = useMemo(() => {
    const filtered = search
      ? list.filter(
          (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.ticker.toLowerCase().includes(search.toLowerCase()),
        )
      : list
    return sortTokens(filtered, sort)
  }, [list, sort, search])

  return (
    <>
      <KOTH token={kothToken} pumped={pumped[kothToken.id]} />

      <div className="my-6 flex flex-wrap items-center gap-3 font-mono text-xs">
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground">sort:</span>
          {SORTS.map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={
                sort === s
                  ? "px-2 py-1 rounded bg-primary text-primary-foreground font-bold"
                  : "px-2 py-1 rounded text-muted-foreground hover:text-foreground"
              }
            >
              [{s}]
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="search for token"
            className="h-8 w-64 rounded border border-border bg-input px-3 text-xs outline-none focus:border-primary"
          />
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <span className="relative grid place-items-center h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-primary animate-ping" />
              <span className="relative h-2 w-2 rounded-full bg-primary" />
            </span>
            live
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        <AnimatePresence initial={false}>
          {sorted.map((t) => (
            <LiveCard key={t.id} token={t} pumpedAt={pumped[t.id]} />
          ))}
        </AnimatePresence>
      </div>

      {/* floating buy toast bottom-right */}
      <AnimatePresence>
        {bought && (
          <motion.div
            key={bought.id + bought.sol}
            initial={{ y: 40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 rounded-lg border border-primary bg-card px-4 py-2 font-mono text-xs shadow-lg"
            style={{ boxShadow: "0 0 30px hsl(var(--primary) / 0.4)" }}
          >
            <span className="text-primary font-bold">BUY</span>{" "}
            <span className="text-foreground">${bought.ticker}</span>{" "}
            <span className="text-muted-foreground">for</span>{" "}
            <span className="text-primary font-bold">{bought.sol} SOL</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function LiveCard({ token, pumpedAt }: { token: Token; pumpedAt?: number }) {
  const positive = token.change24h >= 0
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ type: "spring", stiffness: 380, damping: 28 }}
    >
      <motion.div
        key={pumpedAt ?? 0}
        animate={
          pumpedAt
            ? {
                scale: [1, 1.06, 1],
                boxShadow: [
                  "0 0 0px hsl(var(--primary) / 0)",
                  "0 0 28px hsl(var(--primary) / 0.7)",
                  "0 0 0px hsl(var(--primary) / 0)",
                ],
              }
            : {}
        }
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="rounded-lg"
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
              created by <span className="text-foreground">{token.creator}</span>{" "}
              <span className="text-primary">{ageLabel(token.ageMinutes)}</span>
            </div>
            <div className="font-mono text-[11px] text-primary">
              market cap: <span className="font-bold">${formatK(token.marketCap)}</span>{" "}
              <span className={positive ? "text-primary" : "text-destructive"}>
                [{positive ? "+" : ""}
                {token.change24h.toFixed(0)}%]
              </span>
            </div>
            <div className="font-mono text-[10px] text-muted-foreground">
              replies: <span className="text-foreground">{token.replies}</span>
            </div>
            <div className="mt-auto font-mono text-[11px] truncate">
              <span className="font-display text-sm">{token.name}</span>{" "}
              <span className="text-muted-foreground">(${token.ticker})</span>{" "}
              <span className="text-accent font-bold">
                {token.leverage}x {token.direction.toLowerCase()}
              </span>{" "}
              <span className="text-muted-foreground">{token.underlying}</span>
            </div>
          </div>
        </Link>
      </motion.div>
    </motion.div>
  )
}

function KOTH({ token, pumped }: { token: Token; pumped?: number }) {
  return (
    <section className="my-10 grid place-items-center">
      <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        — king of the hill —
      </div>

      {/* arcade scoreboard strip */}
      <div className="relative w-full max-w-[640px] overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={token.id}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
          >
            <Link
              href={`/token/${token.id}`}
              className="grid grid-cols-[auto_auto_1fr_auto] items-center gap-4 border-2 border-foreground bg-card px-4 py-3 hover:bg-secondary transition-colors"
              style={{ boxShadow: "6px 6px 0 0 hsl(var(--foreground))" }}
            >
              {/* #1 tag — solid black block, looks like a sticker */}
              <div className="grid h-14 w-14 place-items-center bg-foreground font-display text-3xl text-background">
                #1
              </div>

              <div className="grid h-14 w-14 place-items-center bg-secondary text-3xl">
                {token.emoji}
              </div>

              <div className="min-w-0">
                <div className="font-display text-xl leading-none truncate">
                  {token.name.toUpperCase()}{" "}
                  <span className="text-muted-foreground">${token.ticker}</span>
                </div>
                <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                  <span className="text-foreground font-bold">
                    {token.leverage}x {token.direction.toLowerCase()}
                  </span>{" "}
                  {token.underlying}
                </div>
              </div>

              {/* odometer-style mcap */}
              <div className="text-right font-mono">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">mcap</div>
                <Odometer value={token.marketCap} bump={pumped} />
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      <Link
        href="/create"
        className="brick mt-8 inline-flex items-center rounded-md bg-primary px-6 h-12 font-display text-lg uppercase text-primary-foreground"
      >
        [ start a new coin ]
      </Link>
    </section>
  )
}

function Odometer({ value, bump }: { value: number; bump?: number }) {
  return (
    <motion.div
      key={bump ?? 0}
      initial={{ y: -6, opacity: 0.6 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 24 }}
      className="font-display text-2xl text-foreground tabular-nums"
    >
      ${value.toLocaleString()}
    </motion.div>
  )
}

function ageLabel(min: number) {
  if (min < 1) return "now"
  if (min < 60) return `${min}m ago`
  return `${Math.floor(min / 60)}h ago`
}
function formatK(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}
