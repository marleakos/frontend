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
      <div className="mx-auto flex max-w-[1400px] items-center gap-5 px-4 py-3">
        <Link href="/" className="font-display text-xl leading-none">
          leverage<span className="text-primary">.fun</span>
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

        <div className="ml-auto flex items-center gap-2">
          <HeaderSearch />
          <button className="hidden sm:inline-flex h-8 items-center rounded border border-border bg-secondary px-3 font-mono text-xs hover:border-foreground">
            connect wallet
          </button>
        </div>
      </div>
    </header>
  )
}
