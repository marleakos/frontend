"use client"

import { useState } from "react"
import { MessageSquare, ThumbsUp, Send } from "lucide-react"

type Reply = { id: string; user: string; ago: string; text: string; likes: number }

const seed: Reply[] = [
  { id: "r1", user: "9xQe", ago: "12s", text: "this is the one. aping with conviction.", likes: 24 },
  { id: "r2", user: "Hk2p", ago: "48s", text: "liq looks tight, careful out there", likes: 11 },
  { id: "r3", user: "Zx81", ago: "2m", text: "creator has a clean track record. trusted.", likes: 33 },
  { id: "r4", user: "Mn4q", ago: "6m", text: "5x long sol — nothing more bullish than that.", likes: 18 },
  { id: "r5", user: "Pl9k", ago: "12m", text: "if this graduates we eating", likes: 41 },
]

export function ThreadSection({ ticker, replies }: { ticker: string; replies: number }) {
  const [text, setText] = useState("")
  const [list] = useState<Reply[]>(seed)
  return (
    <div className="rounded-xl border-2 border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b-2 border-border bg-secondary/40">
        <div className="flex items-center gap-2 font-display uppercase text-sm">
          <MessageSquare className="h-4 w-4 text-primary" />
          thread <span className="text-muted-foreground font-mono normal-case text-xs">/ ${ticker}</span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground">{replies} replies</span>
      </div>

      <div className="p-3 border-b-2 border-border">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="post a reply"
            className="flex-1 h-10 rounded-md border-2 border-border bg-input px-3 font-mono text-sm outline-none focus:border-primary"
          />
          <button className="brick h-10 px-4 rounded-md bg-primary text-primary-foreground font-display uppercase tracking-wide text-sm hover:-translate-y-0.5 transition-transform inline-flex items-center gap-1.5">
            <Send className="h-3.5 w-3.5" strokeWidth={3} />
            post
          </button>
        </div>
      </div>

      <ul className="divide-y divide-border">
        {list.map((r) => (
          <li key={r.id} className="px-4 py-3 hover:bg-secondary/30">
            <div className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
              <span className="grid h-5 w-5 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-[9px] text-primary-foreground font-bold">
                {r.user[0]}
              </span>
              <span className="text-foreground font-bold">{r.user}</span>
              <span>·</span>
              <span>{r.ago} ago</span>
            </div>
            <p className="mt-1.5 text-sm text-foreground">{r.text}</p>
            <button className="mt-1.5 inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-primary">
              <ThumbsUp className="h-3 w-3" /> {r.likes}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
