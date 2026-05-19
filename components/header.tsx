"use client"

import { Search, Wallet, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3">
        <a href="#" className="flex items-center gap-2 font-mono font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" strokeWidth={3} />
          </span>
          <span className="text-lg">
            leverage<span className="text-primary">.fun</span>
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-1 ml-4 text-sm font-mono">
          <a className="px-3 py-1.5 rounded-md bg-secondary text-foreground" href="#">
            board
          </a>
          <a className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground" href="#">
            advanced
          </a>
          <a className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground" href="#">
            liq arena
          </a>
          <a className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground" href="#">
            leaderboard
          </a>
          <a className="px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground" href="#">
            docs
          </a>
        </nav>

        <div className="hidden lg:flex items-center gap-2 ml-auto">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="search ticker / contract"
              className="h-9 w-72 rounded-md border border-border bg-input pl-8 pr-3 text-sm font-mono outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto lg:ml-0">
          <Button
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-bold glow-primary"
          >
            [ launch a coin ]
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-border bg-secondary hover:bg-accent hover:text-accent-foreground font-mono"
          >
            <Wallet className="h-4 w-4 mr-1.5" />
            connect
          </Button>
        </div>
      </div>
    </header>
  )
}
