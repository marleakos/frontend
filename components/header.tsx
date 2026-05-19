"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HeaderSearch } from "@/components/header-search"

const NAV = [
  { href: "/", label: "board" },
  { href: "/liq-arena", label: "liq arena" },
  { href: "/leaderboard", label: "leaderboard" },
  { href: "/docs", label: "support" },
]

export function Header() {
  const pathname = usePathname()
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 md:gap-5 px-2 md:px-4 py-2 md:py-3">
        <Link href="/" className="font-display text-lg md:text-xl leading-none">
          <span className="hidden md:inline">leverage</span><span className="md:hidden">lev</span><span className="text-primary">.fun</span>
        </Link>

        <nav className="hidden md:flex items-center gap-4 text-sm font-mono">
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

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <HeaderSearch />
          <button className="hidden sm:inline-flex h-8 items-center rounded border border-border bg-secondary px-2 md:px-3 font-mono text-[11px] md:text-xs hover:border-foreground">
            connect
          </button>
        </div>
      </div>
    </header>
  )
}
