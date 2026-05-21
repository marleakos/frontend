"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { ArrowLeft, Copy, ExternalLink, Gift, Share2 } from "lucide-react"
import { toast } from "sonner"
import type { TokenData } from "@/hooks/use-tokens"

// Get emoji based on symbol/name
function getEmoji(name: string, symbol: string): string {
  const lower = (name + symbol).toLowerCase()
  if (lower.includes("doge") || lower.includes("dog")) return "🐕"
  if (lower.includes("pepe") || lower.includes("frog")) return "🐸"
  if (lower.includes("cat") || lower.includes("kitty")) return "🐱"
  if (lower.includes("moon")) return "🌙"
  if (lower.includes("rocket")) return "🚀"
  if (lower.includes("btc") || lower.includes("bitcoin")) return "₿"
  if (lower.includes("eth") || lower.includes("ethereum")) return "Ξ"
  if (lower.includes("sol")) return "◎"
  return "🪙"
}

interface UserProfileData {
  address: string
  tokensCreated: TokenData[]
  referralEarnings: number
  referredBy: string | null
}

export default function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { connected, publicKey } = useWallet()
  const [userData, setUserData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  
  // Check if this is the current user's own profile
  const isOwnProfile = connected && publicKey?.toString().startsWith(id)
  
  useEffect(() => {
    async function fetchUserData() {
      try {
        // Fetch all tokens from API
        let allTokens: any[] = []
        try {
          const response = await fetch('/api/tokens')
          const data = await response.json()
          allTokens = data.tokens || []
        } catch (e) {
          console.log('Could not fetch from API')
        }
        
        // Also get localStorage tokens
        const storedTokensRaw = localStorage.getItem('leverageTokens')
        const storedTokens = JSON.parse(storedTokensRaw || '[]')
        
        // Merge both lists
        const allTokensMerged = [...allTokens]
        storedTokens.forEach((token: any) => {
          if (!allTokensMerged.find((t: any) => t.mintAddress === token.mintAddress)) {
            allTokensMerged.push(token)
          }
        })

        let userAddress: string
        if (isOwnProfile && publicKey) {
          userAddress = publicKey.toString()
        } else {
          userAddress = id
        }

        // Filter tokens created by this user
        const userTokens: TokenData[] = allTokensMerged
          .filter((token: any) => {
            const creator = token.creator || ""
            return isOwnProfile ? creator === userAddress : creator.startsWith(id)
          })
          .map((token: any) => {
            const createdAt = new Date(token.createdAt).getTime()
            const ageMinutes = Math.floor((Date.now() - createdAt) / 60000)
            
            return {
              id: token.mintAddress,
              name: token.name,
              ticker: token.symbol,
              emoji: getEmoji(token.name, token.symbol),
              creator: token.creator || "",
              underlying: `${token.underlying || 'SOL'}-PERP`,
              leverage: token.leverage as 2 | 3 | 5 | 10,
              direction: token.direction as "LONG" | "SHORT",
              marketCap: 0,
              progress: 0,
              replies: 0,
              ageMinutes: Math.max(0, ageMinutes),
              change24h: 0,
              liqDistance: 100,
              description: "",
              mint: new PublicKey(token.mintAddress),
              graduated: false,
            }
          })

        setUserData({
          address: userAddress,
          tokensCreated: userTokens,
          referralEarnings: 0,
          referredBy: null,
        })
      } catch (err) {
        console.error("Error fetching user data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [id, isOwnProfile, publicKey])

  const copyAddress = () => {
    const address = isOwnProfile && publicKey ? publicKey.toString() : id
    navigator.clipboard.writeText(address)
    setCopied(true)
    toast.success("Address copied!")
    setTimeout(() => setCopied(false), 2000)
  }

  const shareProfile = () => {
    const url = window.location.href
    navigator.clipboard.writeText(url)
    toast.success("Profile link copied!")
  }

  if (loading) {
    return (
      <main className="min-h-screen text-foreground">
        <Header />
        <TradesTicker />
        <div className="mx-auto max-w-[1400px] px-4 py-20 flex flex-col items-center justify-center">
          <div className="font-mono text-sm text-muted-foreground">Loading profile...</div>
        </div>
      </main>
    )
  }

  if (!userData) {
    return (
      <main className="min-h-screen text-foreground">
        <Header />
        <TradesTicker />
        <div className="mx-auto max-w-[1400px] px-4 py-20 flex flex-col items-center justify-center">
          <div className="font-mono text-sm text-destructive">Failed to load profile</div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen text-foreground">
      <Header />
      <TradesTicker />

      <div className="mx-auto max-w-[1400px] px-4 py-6">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="h-3 w-3" /> back to feed
        </Link>

        {/* Profile Header */}
        <div className="rounded-lg border border-border bg-card p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider mb-1">
                {isOwnProfile ? "Your Profile" : "User Profile"}
              </div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-2xl uppercase">
                  {userData.address.slice(0, 6)}...{userData.address.slice(-4)}
                </h1>
                <button
                  onClick={copyAddress}
                  className="p-1.5 rounded hover:bg-secondary"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <button
              onClick={shareProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border font-mono text-xs hover:bg-secondary"
            >
              <Share2 className="h-3.5 w-3.5" />
              Share
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase">Tokens Created</div>
              <div className="font-display text-xl">{userData.tokensCreated.length}</div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase">Referral Earnings</div>
              <div className="font-display text-xl">{userData.referralEarnings.toFixed(2)} SOL</div>
            </div>
            <div>
              <div className="font-mono text-[10px] text-muted-foreground uppercase">Referred By</div>
              <div className="font-display text-xl">
                {userData.referredBy ? `${userData.referredBy.slice(0, 6)}...` : "—"}
              </div>
            </div>
          </div>
        </div>

        {/* Tokens Created */}
        <div className="space-y-4">
          <h2 className="font-display text-lg uppercase">Tokens Created</h2>
          
          {userData.tokensCreated.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-8 text-center">
              <p className="font-mono text-sm text-muted-foreground">
                {isOwnProfile ? "You haven't created any tokens yet" : "This user hasn't created any tokens"}
              </p>
              {isOwnProfile && (
                <Link
                  href="/create"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded bg-primary text-primary-foreground font-mono text-sm"
                >
                  Create Your First Token
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {userData.tokensCreated.map((token) => (
                <Link
                  key={token.id}
                  href={`/token/${token.id}`}
                  className="flex gap-3 rounded-lg border border-border bg-card p-3 hover:border-primary transition-colors"
                >
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-secondary text-3xl">
                    {token.emoji}
                  </div>
                  <div className="min-w-0">
                    <div className="font-display text-lg leading-none">{token.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">${token.ticker}</div>
                    <div className="mt-1 font-mono text-[10px]">
                      <span className="text-primary font-bold">{token.leverage}x {token.direction}</span>
                      {" "}
                      <span className="text-muted-foreground">{token.underlying}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

// Need to import PublicKey
import { PublicKey } from "@solana/web3.js"
