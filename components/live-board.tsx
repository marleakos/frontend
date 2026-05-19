"use client"

import { useEffect, useMemo, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import Link from "next/link"
import type { Token } from "@/lib/mock-data"
import { ruggedStore, useRugged } from "@/lib/rugged-store"

type Sort = "featured" | "trending" | "new" | "gainers" | "near liq"

const SORTS: Sort[] = ["featured", "trending", "new", "gainers", "near liq"]

function sortTokens(list: Token[], sort: Sort) {
  const arr = [...list]
  if (sort === "trending") arr.sort((a, b) => b.replies - a.replies)
  else if (sort === "new") arr.sort((a, b) => a.ageMinutes - b.ageMinutes)
  else if (sort === "gainers") arr.sort((a, b) => b.change24h - a.change24h)
  else if (sort === "near liq") arr.sort((a, b) => a.liqDistance - b.liqDistance)
  return arr
}

export function LiveBoard({ initial, koth }: { initial: Token[]; koth: Token }) {
  const [list, setList] = useState<Token[]>(initial)
  const [kothToken, setKothToken] = useState<Token>(koth)
  const [prevKing, setPrevKing] = useState<{ ticker: string; at: number } | null>(null)
  const [sort, setSort] = useState<Sort>("featured")
  const [search, setSearch] = useState("")
  const [pumped, setPumped] = useState<Record<string, number>>({})
  const [bought, setBought] = useState<{ id: string; ticker: string; sol: number } | null>(null)
  const [rektFlash, setRektFlash] = useState<{ id: string; ticker: string } | null>(null)
  const rugged = useRugged()

  // Visible tokens = not rugged
  const visible = useMemo(() => list.filter((t) => !rugged[t.id]), [list, rugged])

  // If KOTH gets rugged, promote next-best by mcap
  useEffect(() => {
    if (rugged[kothToken.id]) {
      const next = visible.sort((a, b) => b.marketCap - a.marketCap)[0]
      if (next) setKothToken(next)
    }
  }, [rugged, kothToken.id, visible])

  // Simulate buys + occasional liquidations
  useEffect(() => {
    let alive = true
    function tick() {
      if (!alive) return
      const live = list.filter((t) => !ruggedStore.isRugged(t.id))
      if (live.length === 0) {
        setTimeout(tick, 1200)
        return
      }
      const candidates = ruggedStore.isRugged(kothToken.id) ? live : [kothToken, ...live]
      const winner = candidates[Math.floor(Math.random() * candidates.length)]
      const sol = +(Math.random() * 8 + 0.2).toFixed(2)
      const mcapBump = Math.floor(sol * 1200 + Math.random() * 800)

      setList((prev) =>
        prev.map((t) =>
          t.id === winner.id
            ? { ...t, marketCap: t.marketCap + mcapBump, replies: t.replies + (Math.random() < 0.3 ? 1 : 0) }
            : t,
        ),
      )

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

      if (winner.id !== kothToken.id && Math.random() < 0.18) {
        setPrevKing({ ticker: kothToken.ticker, at: Date.now() })
        setKothToken(winner)
      } else if (winner.id === kothToken.id) {
        setKothToken((k) => ({ ...k, marketCap: k.marketCap + mcapBump }))
      }

      setPumped((p) => ({ ...p, [winner.id]: Date.now() }))
      setBought({ id: winner.id, ticker: winner.ticker, sol })

      // ~22% chance: a near-liq position gets liquidated
      if (Math.random() < 0.22) {
        const victim = live
          .filter((t) => t.liqDistance < 35 && !ruggedStore.isRugged(t.id))
          .sort((a, b) => a.liqDistance - b.liqDistance)[0]
        if (victim) {
          // brief flash before removal
          setRektFlash({ id: victim.id, ticker: victim.ticker })
          setTimeout(() => ruggedStore.rug(victim.id), 600)
        }
      }

      setTimeout(tick, 700 + Math.random() * 1300)
    }
    const t = setTimeout(tick, 800)
    return () => { alive = false; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort])

  // clear rekt flash after 1.4s
  useEffect(() => {
    if (!rektFlash) return
    const t = setTimeout(() => setRektFlash(null), 1400)
    return () => clearTimeout(t)
  }, [rektFlash])

  const sorted = useMemo(() => {
    const filtered = search
      ? visible.filter(
          (t) =>
            t.name.toLowerCase().includes(search.toLowerCase()) ||
            t.ticker.toLowerCase().includes(search.toLowerCase()),
        )
      : visible
    return sortTokens(filtered, sort)
  }, [visible, sort, search])

  return (
    <>
      <KOTH token={kothToken} pumped={pumped[kothToken.id]} prev={prevKing} />

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

      {/* buy toast */}
      <AnimatePresence>
        {bought && !rektFlash && (
          <motion.div
            key={bought.id + bought.sol}
            initial={{ y: 40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="fixed bottom-6 right-6 z-40 rounded-lg border border-primary bg-card px-4 py-2 font-mono text-xs shadow-lg"
            style={{ boxShadow: "0 0 30px hsl(var(--primary) / 0.4)" }}
          >
            <span className="text-primary font-bold">BUY</span>{" "}
            <span className="text-foreground">${bought.ticker}</span>{" "}
            <span className="text-muted-foreground">for</span>{" "}
            <span className="text-primary font-bold">{bought.sol} SOL</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* liquidation toast — different style, red, sits ABOVE buy toast */}
      <AnimatePresence>
        {rektFlash && (
          <motion.div
            key={rektFlash.id}
            initial={{ y: 40, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -10, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="fixed bottom-6 right-6 z-50 rounded-lg border-2 border-destructive bg-card px-4 py-2 font-mono text-xs"
            style={{ boxShadow: "6px 6px 0 0 hsl(var(--destructive))" }}
          >
            <span className="font-display text-destructive italic text-base mr-1">Rugged!</span>
            <span className="text-foreground">${rektFlash.ticker}</span>{" "}
            <span className="text-muted-foreground">liquidated</span>
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
      exit={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
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
              created by{" "}
              <Link
                href={`/user/${token.creator.split("...")[0]}`}
                className="text-foreground hover:text-primary"
                onClick={(e) => e.stopPropagation()}
              >
                {token.creator}
              </Link>{" "}
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

function KOTH({
  token,
  pumped,
  prev,
}: {
  token: Token
  pumped?: number
  prev: { ticker: string; at: number } | null
}) {
  const GRAD = 69000
  const progress = Math.min(100, (token.marketCap / GRAD) * 100)

  return (
    <section className="my-10 grid place-items-center">
      <div className="mb-4 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.3em] text-muted-foreground">
        <span className="h-px w-12 bg-border" />
        king of the hill
        <span className="h-px w-12 bg-border" />
      </div>

      <div className="relative w-full max-w-[560px]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={token.id}
            initial={{ y: 20, opacity: 0, rotate: -1 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
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

              <div className="grid grid-cols-[140px_1fr] gap-0">
                {/* big lime emoji panel */}
                <motion.div
                  key={"emoji-" + (pumped ?? 0)}
                  initial={pumped ? { scale: 0.94 } : false}
                  animate={pumped ? { scale: [0.94, 1.04, 1] } : {}}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative grid place-items-center bg-primary border-r-2 border-foreground"
                >
                  <div className="text-[78px] leading-none drop-shadow-[2px_2px_0_rgba(0,0,0,0.25)]">
                    {token.emoji}
                  </div>
                  <div className="absolute bottom-1.5 left-1.5 font-mono text-[9px] font-bold uppercase tracking-wider text-primary-foreground/80">
                    {token.underlying}
                  </div>
                  <div className="absolute top-1.5 right-1.5 border border-primary-foreground/40 bg-primary-foreground/10 px-1 py-0.5 font-mono text-[9px] font-bold text-primary-foreground">
                    {token.leverage}x {token.direction.toLowerCase()}
                  </div>
                </motion.div>

                {/* stats stack */}
                <div className="flex flex-col justify-between gap-2 p-3.5">
                  <div>
                    <div className="font-display text-lg leading-none truncate">
                      {token.name.toUpperCase()}
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                      ${token.ticker} · by{" "}
                      <Link
                        href={`/user/${token.creator.split("...")[0]}`}
                        className="text-foreground hover:text-primary"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {token.creator}
                      </Link>
                    </div>
                  </div>

                  <div>
                    <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
                      market cap
                    </div>
                    <Odometer value={token.marketCap} bump={pumped} />
                  </div>

                  {/* bonding curve to graduation */}
                  <div>
                    <div className="mb-1 flex items-center justify-between font-mono text-[9px] uppercase tracking-wider">
                      <span className="text-muted-foreground">bonding curve</span>
                      <span className="text-primary font-bold">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="relative h-1.5 w-full border border-foreground bg-secondary">
                      <motion.div
                        animate={{ width: `${progress}%` }}
                        transition={{ type: "spring", stiffness: 220, damping: 28 }}
                        className="absolute left-0 top-0 h-full bg-primary"
                      />
                    </div>
                    <div className="mt-1 font-mono text-[9px] text-muted-foreground">
                      graduates to raydium at $69k
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>

        {/* dethroned line */}
        <div className="mt-3 grid h-5 place-items-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <AnimatePresence mode="wait">
            {prev && (
              <motion.div
                key={prev.at}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
              >
                previously: <span className="text-foreground">${prev.ticker}</span> dethroned
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Link
        href="/create"
        className="brick mt-6 inline-flex items-center rounded-md bg-primary px-6 h-12 font-display text-lg uppercase text-primary-foreground"
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
