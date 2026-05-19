"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { HeaderSearch } from "@/components/header-search"
import { Menu, X } from "lucide-react"

const NAV = [
  { href: "/", label: "board" },
  { href: "/liq-arena", label: "liq arena" },
  { href: "/leaderboard", label: "leaderboard" },
  { href: "/create", label: "create" },
  { href: "/docs", label: "support" },
]

export function Header() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-3 py-2 md:px-4 md:py-3">
        {/* Logo */}
        <Link href="/" className="font-display text-lg md:text-xl leading-none shrink-0" onClick={() => setMenuOpen(false)}>
          leverage<span className="text-primary">.fun</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-4 text-sm font-mono ml-4">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href))
            return (
              <Link
                key={n.href}
                href={n.href}
                className={active ? "text-primary font-bold" : "text-muted-foreground hover:text-foreground"}
              >
                [{n.label}]
              </Link>
            )
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <HeaderSearch />
          <button className="hidden sm:inline-flex h-8 items-center rounded border border-border bg-secondary px-3 font-mono text-xs hover:border-foreground">
            connect
          </button>
          {/* Hamburger — mobile only */}
          <button
            className="md:hidden flex h-8 w-8 items-center justify-center rounded border border-border bg-secondary"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <nav className="md:hidden border-t border-border bg-card px-3 py-3 flex flex-col gap-1">
          {NAV.map((n) => {
            const active = pathname === n.href || (n.href !== "/" && pathname.startsWith(n.href))
            return (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded font-mono text-sm ${
                  active
                    ? "bg-primary/15 text-primary font-bold"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                [{n.label}]
              </Link>
            )
          })}
          <div className="mt-2 pt-2 border-t border-border">
            <button className="w-full h-9 rounded border border-border bg-secondary font-mono text-xs hover:border-foreground">
              connect wallet
            </button>
          </div>
        </nav>
      )}
    </header>
  )
}
