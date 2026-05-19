"use client"

import { useState } from "react"
import { Flame, Clock, TrendingUp, Skull } from "lucide-react"

const SORTS = [
  { id: "trending", label: "trending", icon: Flame },
  { id: "new", label: "new", icon: Clock },
  { id: "gainers", label: "gainers", icon: TrendingUp },
  { id: "near-liq", label: "near liq", icon: Skull },
] as const

const LEVERAGES = ["all", "2x", "3x", "5x", "10x"] as const
const DIRECTIONS = ["all", "long", "short"] as const

export function FiltersBar() {
  const [sort, setSort] = useState<string>("trending")
  const [lev, setLev] = useState<string>("all")
  const [dir, setDir] = useState<string>("all")

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4 font-mono text-xs">
      <div className="flex items-center gap-1 rounded-md bg-card border border-border p-1">
        {SORTS.map((s) => {
          const Icon = s.icon
          const active = sort === s.id
          return (
            <button
              key={s.id}
              onClick={() => setSort(s.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-3 w-3" />
              {s.label}
            </button>
          )
        })}
      </div>

      <Pills label="lev" options={LEVERAGES} value={lev} onChange={setLev} />
      <Pills label="dir" options={DIRECTIONS} value={dir} onChange={setDir} />

      <div className="ml-auto text-muted-foreground hidden sm:block">
        showing <span className="text-foreground">12</span> coins · live
      </div>
    </div>
  )
}

function Pills({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly string[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1 rounded-md bg-card border border-border p-1">
      <span className="px-1.5 text-muted-foreground">{label}:</span>
      {options.map((o) => {
        const active = value === o
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-2 py-1 rounded ${
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o}
          </button>
        )
      })}
    </div>
  )
}
