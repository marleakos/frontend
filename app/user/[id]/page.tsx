"use client"

"use client"

import { use, useState, useEffect } from "react"
import Link from "next/link"
import { useWallet } from "@solana/wallet-adapter-react"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { ArrowLeft, Copy, ExternalLink, Gift, Share2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { Connection, PublicKey, SystemProgram } from "@solana/web3.js"
import { Program, AnchorProvider } from "@coral-xyz/anchor"
import { RPC_URL, PROGRAM_ID } from "@/lib/program-config"
import { IDL } from "@/lib/idl"
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

// Map on-chain underlying enum to display format
function formatUnderlying(underlying: any): "SOL-PERP" | "BTC-PERP" | "ETH-PERP" | "DOGE-PERP" {
  if (underlying?.solPerp !== undefined) return "SOL-PERP"
  if (underlying?.btcPerp !== undefined) return "BTC-PERP"
  if (underlying?.ethPerp !== undefined) return "ETH-PERP"
  if (underlying?.dogePerp !== undefined) return "DOGE-PERP"
  return "SOL-PERP"
}

// Map on-chain direction enum to display format
function formatDirection(direction: any): "LONG" | "SHORT" {
  return direction?.long !== undefined ? "LONG" : "SHORT"
}

interface ReferralToken {
  token: TokenData
  claimableAmount: number
}

interface UserProfileData {
  address: string
  tokensCreated: TokenData[]
  referralTokens: ReferralToken[]
  referralEarnings: number
  totalReferralClaimed: number
  referredBy: string | null
}

export default function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { connected, publicKey } = useWallet()
  const [userData, setUserData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [showError, setShowError] = useState(false)
  const [claiming, setClaiming] = useState(false)
  
  // Check if this is the current user's own profile
  const isOwnProfile = connected && publicKey?.toString().slice(0, 6) === id
  const userPubkey = isOwnProfile && publicKey ? publicKey.toString() : `${id}...`
  
  useEffect(() => {
    async function fetchUserData() {
      try {
        const connection = new Connection(RPC_URL, "confirmed")
        const provider = new AnchorProvider(connection, {} as any, { commitment: "confirmed" })
        const program = new Program(IDL as any, provider)

        // Fetch all token states to find ones created by this user
        const allTokens = await (program as any).account.tokenState.all()
        
        let userAddress: string
        if (isOwnProfile && publicKey) {
          userAddress = publicKey.toString()
        } else {
          // For other users, we can't know their full address from just 6 chars
          // This is a limitation - we'd need an indexer
          userAddress = id
        }

        // Filter tokens created by this user
        const userTokens: TokenData[] = allTokens
          .filter((acc: any) => {
            const creator = acc.account.creator.toString()
            return isOwnProfile ? creator === userAddress : creator.startsWith(id)
          })
          .map((acc: any) => {
            const account = acc.account
            const mint = account.tokenMint
            const createdAt = account.createdAt?.toNumber?.() || 0
            const ageMinutes = Math.floor((Date.now() / 1000 - createdAt) / 60)
            
            const virtualSol = account.curveState?.virtualSolReserve?.toNumber?.() || 0
            const virtualToken = account.curveState?.virtualTokenReserve?.toNumber?.() || 1
            const price = virtualSol / virtualToken
            const supply = account.curveState?.realTokenReserve?.toNumber?.() || 0
            const marketCap = Math.floor(price * supply)
            const progress = Math.min(100, Math.floor((marketCap / 69000) * 100))

            return {
              id: mint.toString(),
              name: account.name,
              ticker: account.symbol,
              emoji: getEmoji(account.name, account.symbol),
              creator: account.creator.toString(),
              underlying: formatUnderlying(account.underlying),
              leverage: account.leverage as 2 | 3 | 5 | 10,
              direction: formatDirection(account.direction),
              marketCap,
              progress,
              replies: 0,
              ageMinutes: Math.max(0, ageMinutes),
              change24h: 0,
              liqDistance: 100,
              description: "",
              mint,
              graduated: account.graduated,
            }
          })

        // Fetch UserReferral account if this is the user's own profile
        let referralEarnings = 0
        let totalReferralClaimed = 0
        let referredBy: string | null = null

        if (isOwnProfile && publicKey) {
          try {
            const [userReferralPDA] = PublicKey.findProgramAddressSync(
              [Buffer.from("user_referral"), publicKey.toBuffer()],
              PROGRAM_ID
            )
            const referralAccount = await (program as any).account.userReferral.fetch(userReferralPDA)
            
            if (referralAccount) {
              referralEarnings = (referralAccount.totalReferralEarnings?.toNumber?.() || 0) / 1e9
              totalReferralClaimed = (referralAccount.totalRewardsClaimed?.toNumber?.() || 0) / 1e9
              referredBy = referralAccount.referredBy?.toString?.() || null
            }
          } catch (e) {
            // UserReferral account doesn't exist yet
            console.log("No referral account found")
          }
        }

        setUserData({
          address: userAddress,
          tokensCreated: userTokens,
          referralEarnings,
          totalReferralClaimed,
          referredBy,
        })
      } catch (err) {
        console.error("Error fetching user data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [id, isOwnProfile, publicKey])

  const copyReferral = () => {
    const refUrl = `${window.location.origin}/?ref=${id}`
    navigator.clipboard.writeText(refUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const claimReferralRewards = async () => {
    if (!publicKey || !userData || userData.referralTokens.length === 0) return
    
    setClaiming(true)
    toast.loading("Claiming referral rewards...", { id: "claim-referral" })
    
    try {
      const connection = new Connection(RPC_URL, "confirmed")
      const provider = new AnchorProvider(connection, { publicKey, signTransaction: async (tx) => tx } as any, { commitment: "confirmed" })
      const program = new Program(IDL as any, provider)
      
      // Claim from the first token that has rewards
      // In a real app, you might want to claim from all tokens or let user pick
      const tokenWithRewards = userData.referralTokens.find(t => t.claimableAmount > 0)
      
      if (!tokenWithRewards) {
        toast.error("No claimable rewards found", { id: "claim-referral" })
        return
      }
      
      const tokenMint = new PublicKey(tokenWithRewards.token.id)
      
      // Get PDAs
      const [tokenStatePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_state"), tokenMint.toBuffer()],
        PROGRAM_ID
      )
      const [feeVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("fee_vault"), tokenMint.toBuffer()],
        PROGRAM_ID
      )

      const tx = await (program as any).methods
        .claimReferralRewards()
        .accounts({
          referrer: publicKey,
          tokenState: tokenStatePDA,
          tokenMint: tokenMint,
          feeVault: feeVaultPDA,
          referrerWallet: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc()

      toast.success(`Claimed ${tokenWithRewards.claimableAmount.toFixed(4)} SOL!`, { id: "claim-referral" })
      
      // Refresh data
      window.location.reload()
    } catch (error: any) {
      console.error("Claim error:", error)
      toast.error(error.message || "Failed to claim rewards", { id: "claim-referral" })
    } finally {
      setClaiming(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-dvh bg-background text-foreground">
        <Header />
        <TradesTicker />
        <div className="mx-auto max-w-[900px] px-4 py-20 text-center">
          <div className="font-mono text-sm text-muted-foreground">Loading profile...</div>
        </div>
      </div>
    )
  }

  if (!userData) return null

  const claimableRewards = userData.referralEarnings - userData.totalReferralClaimed

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />
      
      <main className="mx-auto max-w-[900px] px-4 py-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-3 w-3" /> back to board
        </Link>
        
        {/* Profile header */}
        <div className="rounded-lg border border-border bg-card overflow-hidden mb-4">
          <div className="p-5">
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl uppercase">{id}...</h1>
              {isOwnProfile && (
                <span className="px-2 py-0.5 rounded bg-[#39ff14] text-black font-mono text-[10px] font-bold">
                  YOU
                </span>
              )}
            </div>
            <div className="font-mono text-xs text-muted-foreground mt-1">
              {isOwnProfile && publicKey ? publicKey.toString() : `${id}...`}
            </div>
            <div className="flex items-center gap-2 mt-2 font-mono text-[11px] text-muted-foreground">
              <a
                href={`https://solscan.io/account/${isOwnProfile && publicKey ? publicKey.toString() : id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                <ExternalLink className="h-3 w-3" /> solscan
              </a>
              {userData.referredBy && (
                <>
                  <span>·</span>
                  <span>referred by {userData.referredBy.slice(0, 6)}...{userData.referredBy.slice(-4)}</span>
                </>
              )}
            </div>
          </div>
          
          {/* Stats strip */}
          <div className="grid grid-cols-4 border-t border-border">
            <StatBox label="COINS CREATED" value={userData.tokensCreated.length.toString()} />
            <StatBox label="REFERRAL EARNINGS" value={`${userData.referralEarnings.toFixed(2)} SOL`} />
            <StatBox label="CLAIMED" value={`${userData.totalReferralClaimed.toFixed(2)} SOL`} />
            <StatBox label="CLAIMABLE" value={`${claimableRewards.toFixed(2)} SOL`} accent={claimableRewards > 0 ? "primary" : undefined} />
          </div>
        </div>
        
        {/* Private sections - only for own profile */}
        {isOwnProfile && (
          <>
            {/* Rewards & Referral Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
              {/* Rewards */}
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <span className="font-display text-xs uppercase tracking-wider">REFERRAL REWARDS</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-muted-foreground">total earned</span>
                    <span className="text-foreground font-bold">{userData.referralEarnings.toFixed(2)} SOL</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-muted-foreground">claimed</span>
                    <span className="text-muted-foreground">{userData.totalReferralClaimed.toFixed(2)} SOL</span>
                  </div>
                  <div className="flex items-center justify-between font-mono text-sm">
                    <span className="text-muted-foreground">claimable</span>
                    <span className="text-primary font-bold">{claimableRewards.toFixed(2)} SOL</span>
                  </div>
                  <button 
                    onClick={claimReferralRewards}
                    disabled={claimableRewards <= 0 || claiming}
                    className="w-full py-2.5 rounded border border-primary bg-primary/10 text-primary font-mono text-xs uppercase hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Gift className="h-3.5 w-3.5" />
                    {claiming ? "claiming..." : "claim rewards"}
                  </button>
                </div>
              </div>
              
              {/* Referral Link */}
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-border flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-pink-500" />
                  <span className="font-display text-xs uppercase tracking-wider">REFERRAL LINK</span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="font-mono text-[10px] text-muted-foreground break-all">
                    {window.location.origin}/?ref={id}
                  </div>
                  <button 
                    onClick={copyReferral}
                    className="w-full py-2.5 rounded border border-border bg-secondary text-foreground font-mono text-xs uppercase hover:border-foreground transition-colors flex items-center justify-center gap-2"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copied ? "copied!" : "copy referral link"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Public sections - visible to all */}
        <div className="grid grid-cols-1 gap-4">
          {/* Tokens created - visible to all */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-4 py-2.5 border-b border-border font-display text-xs uppercase tracking-wider">
              TOKENS CREATED ({userData.tokensCreated.length})
            </div>
            {userData.tokensCreated.length === 0 ? (
              <div className="p-6 text-center font-mono text-xs text-muted-foreground">no tokens created</div>
            ) : (
              <ul>
                {userData.tokensCreated.map((t) => (
                  <li key={t.id} className="px-4 py-3 border-t border-border first:border-t-0 hover:bg-secondary/20">
                    <Link href={`/token/${t.id}`} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{t.emoji}</span>
                        <div>
                          <div className="font-display text-sm uppercase">{t.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">${t.ticker} · {t.leverage}x {t.direction}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-xs text-foreground">${formatK(t.marketCap)}</div>
                        <div className={`font-mono text-[10px] ${t.graduated ? "text-primary" : ""}`}>
                          {t.graduated ? "graduated" : `${t.progress}% to grad`}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
      
      {/* Error Toast */}
      {showError && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="rounded-lg border border-destructive bg-card px-4 py-3 shadow-lg" style={{ boxShadow: "0 0 20px hsl(var(--destructive) / 0.3)" }}>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div>
                <div className="font-display text-sm text-destructive">FAILED</div>
                <div className="font-mono text-xs text-muted-foreground">transaction failed — try again</div>
              </div>
              <button 
                onClick={() => setShowError(false)}
                className="ml-2 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: "primary" | "destructive"
}) {
  return (
    <div className="px-3 py-3 border-r border-border last:border-r-0 text-center">
      <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={
          accent === "primary"
            ? "font-display text-lg text-primary"
            : accent === "destructive"
              ? "font-display text-lg text-destructive"
              : "font-display text-lg text-foreground"
        }
      >
        {value}
      </div>
    </div>
  )
}

function formatK(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}
