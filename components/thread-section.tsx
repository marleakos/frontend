"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"

type Reply = { id: string; user: string; ago: string; text: string; likes: number; pnl?: number }

const seed: Reply[] = [
  { id: "r1", user: "9xQe", ago: "12s", text: "this is the one. aping with conviction.", likes: 24, pnl: 1820 },
  { id: "r2", user: "Hk2p", ago: "48s", text: "liq looks tight, careful out there", likes: 11, pnl: -240 },
  { id: "r3", user: "Zx81", ago: "2m", text: "creator has a clean track record. trusted.", likes: 33, pnl: 4200 },
  { id: "r4", user: "Mn4q", ago: "6m", text: "5x long sol nothing more bullish than that", likes: 18, pnl: 612 },
  { id: "r5", user: "Pl9k", ago: "12m", text: "if this graduates we eating", likes: 41, pnl: -88 },
]

const colors = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "#ff66c4",
  "#ffd400",
  "#62d4ff",
]

function avatarColor(user: string) {
  let h = 0
  for (let i = 0; i < user.length; i++) h = (h * 31 + user.charCodeAt(i)) >>> 0
  return colors[h % colors.length]
}

export function ThreadSection({ ticker, replies }: { ticker: string; replies: number }) {
  const [text, setText] = useState("")
  const [list, setList] = useState<Reply[]>(seed)
  const [liked, setLiked] = useState<Record<string, boolean>>({})

  function post() {
    if (!text.trim()) return
    setList((l) => [
      { id: "r" + Date.now(), user: "you", ago: "now", text, likes: 0 },
      ...l,
    ])
    setText("")
  }

  function like(id: string) {
    setLiked((s) => ({ ...s, [id]: !s[id] }))
    setList((l) => l.map((r) => (r.id === id ? { ...r, likes: r.likes + (liked[id] ? -1 : 1) } : r)))
  }

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-secondary/20">
        <div className="font-display uppercase text-sm">
          thread <span className="text-muted-foreground font-mono normal-case text-xs">/ ${ticker}</span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">{replies} replies</span>
      </div>

      <div className="p-3 border-b border-border">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && post()}
            placeholder="post a reply"
            className="flex-1 h-10 rounded-md border border-border bg-input px-3 font-mono text-sm outline-none focus:border-foreground"
          />
          <button
            onClick={post}
            className="h-10 px-4 rounded-md bg-primary text-primary-foreground font-display uppercase tracking-wide text-sm hover:brightness-110"
          >
            post
          </button>
        </div>
      </div>

      <ul>
        <AnimatePresence initial={false}>
          {list.map((r) => (
            <motion.li
              key={r.id}
              layout
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="px-4 py-3 border-t border-border first:border-t-0 hover:bg-secondary/20"
            >
              <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                <span
                  className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold text-background"
                  style={{ background: avatarColor(r.user) }}
                >
                  {r.user[0].toUpperCase()}
                </span>
                <span className="text-foreground font-bold">{r.user}</span>
                {typeof r.pnl === "number" && (
                  <span
                    className={
                      r.pnl >= 0
                        ? "border border-primary/40 bg-primary/10 px-1 text-primary text-[10px] font-bold"
                        : "border border-destructive/40 bg-destructive/10 px-1 text-destructive text-[10px] font-bold"
                    }
                  >
                    {r.pnl >= 0 ? "+" : ""}
                    {r.pnl}$ pnl
                  </span>
                )}
                <span>·</span>
                <span>{r.ago}</span>
              </div>
              <p className="mt-1.5 text-sm text-foreground">{r.text}</p>
              <button
                onClick={() => like(r.id)}
                className={
                  liked[r.id]
                    ? "mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] text-primary font-bold"
                    : "mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-foreground"
                }
              >
                {liked[r.id] ? "<3" : "♡"} {r.likes}
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}
