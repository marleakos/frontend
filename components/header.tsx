"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Wallet, Zap } from "lucide-react"

const NAV = [
  { href: "/", label: "board" },
  { href: "/advanced", label: "advanced" },
  { href: "/liq-arena", label: "liq arena" },
  { href: "/leaderboard", label: "leaderboard" },
  { href: "/docs", label: "docs" },
]

export function Header() {
  const pathname = usePathname()
  return (
    <>
      {/* top notice marquee — rainbow scrolling text */}
      <div className="border-b border-border bg-background overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap py-1.5 text-[11px] font-mono uppercase tracking-widest">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="flex items-center gap-3 mx-3">
              <span className="rainbow-text font-bold">leverage.fun</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-primary">2x · 3x · 5x · 10x</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-accent">fair launch</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-foreground">bonding curve</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-destructive">you will get rekt</span>
              <span className="text-muted-foreground">/</span>
            </span>
          ))}
        </div>
      </div>

      <header className="sticky top-0 z-30 border-b-2 border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-[1400px] items-center gap-4 px-4 py-3">
          {/* logo */}
          <Link href="/" className="group flex items-center gap-2">
            <span className="relative grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground border-2 border-primary-foreground/20 group-hover:animate-wobble">
              <Zap className="h-5 w-5" strokeWidth={3} />
              <span className="absolute -top-1 -right-1 grid h-3 w-3 place-items-center rounded-full bg-accent" />
            </span>
            <span className="font-display text-xl leading-none tracking-tight">
              leverage<span className="text-primary">.fun</span>
            </span>
          </Link>

          {/* nav */}
          <nav className="hidden md:flex items-center gap-1 ml-2 text-sm font-mono">
            {NAV.map((n) => {
              const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href))
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={
                    active
                      ? "px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-bold"
                      : "px-3 py-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }
                >
                  [{n.label}]
                </Link>
              )
            })}
          </nav>

          {/* search */}
          <div className="hidden lg:flex items-center gap-2 ml-auto">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                placeholder="search ticker / contract"
                className="h-9 w-72 rounded-md border-2 border-border bg-input pl-8 pr-3 text-sm font-mono outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-2 ml-auto lg:ml-0">
            <Link
              href="/create"
              className="brick relative inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground px-3 h-9 font-display text-sm uppercase tracking-wide hover:-translate-y-0.5 transition-transform"
            >
              <span className="text-base leading-none">+</span>
              start a coin
            </Link>
            <button className="hidden sm:inline-flex items-center gap-1.5 rounded-md border-2 border-border bg-secondary hover:bg-accent hover:text-accent-foreground hover:border-accent px-3 h-9 font-mono text-sm">
              <Wallet className="h-4 w-4" />
              connect
            </button>
          </div>
        </div>
      </header>
    </>
  )
}
