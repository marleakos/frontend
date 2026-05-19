"use client"

import { useState } from "react"
import { Flame, Clock, TrendingUp, Skull, Filter } from "lucide-react"

const SORTS = [
  { id: "trending", label: "trending", icon: Flame },
  { id: "new",      label: "new",      icon: Clock },
  { id: "gainers",  label: "gainers",  icon: TrendingUp },
  { id: "near-liq", label: "near liq", icon: Skull },
] as const

const LEVERAGES = ["all", "2x", "3x", "5x", "10x"] as const
const DIRECTIONS = ["all", "long", "short"] as const
const PERPS = ["all", "SOL", "BTC", "ETH", "DOGE"] as const

export function FiltersBar() {
  const [sort, setSort] = useState<string>("trending")
  const [lev, setLev] = useState<string>("all")
  const [dir, setDir] = useState<string>("all")
  const [perp, setPerp] = useState<string>("all")

  return (
    <div className="mb-4 flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <div className="flex items-center gap-1 rounded-md bg-card border-2 border-border p-1">
          {SORTS.map((s) => {
            const Icon = s.icon
            const active = sort === s.id
            return (
              <button
                key={s.id}
                onClick={() => setSort(s.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-display uppercase tracking-wide ${
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

        <Pills label="lev"   options={LEVERAGES}  value={lev}  onChange={setLev} />
        <Pills label="dir"   options={DIRECTIONS} value={dir}  onChange={setDir} />
        <Pills label="perp"  options={PERPS}      value={perp} onChange={setPerp} />

        <div className="ml-auto flex items-center gap-2 text-muted-foreground">
          <Filter className="h-3 w-3" />
          <span>showing <span className="text-foreground font-bold">12</span> coins · live</span>
          <span className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/40">
            <span className="relative grid place-items-center h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-primary animate-ping" />
              <span className="relative h-2 w-2 rounded-full bg-primary" />
            </span>
            live
          </span>
        </div>
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
    <div className="flex items-center gap-1 rounded-md bg-card border-2 border-border p-1">
      <span className="px-1.5 text-muted-foreground uppercase tracking-wider">{label}:</span>
      {options.map((o) => {
        const active = value === o
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-2 py-1 rounded font-bold ${
              active
                ? "bg-foreground text-background"
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
