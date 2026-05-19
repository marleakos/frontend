"use client"

import { useState } from "react"

const SORTS = ["featured", "trending", "new", "gainers", "near liq"] as const

export function FiltersBar() {
  const [sort, setSort] = useState<string>("featured")
  const [search, setSearch] = useState("")
  return (
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
  )
}
