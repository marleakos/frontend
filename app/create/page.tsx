"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { ImagePlus, Info, X, Loader2 } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey, Keypair, Transaction } from "@solana/web3.js"
import { toast } from "sonner"
import { RPC_URL, NETWORK } from "@/lib/program-config"
import { getBuyTokenAmountFromSolAmount } from "@pump-fun/pump-sdk"
import { Program } from "@coral-xyz/anchor"
import BN from "bn.js"
import { uploadToIPFS, uploadMetadataToIPFS, dataURItoBlob } from "@/lib/ipfs"

const REFERENCE_ASSETS = ["SOL", "BTC", "ETH", "APT", "ARB", "DOGE", "BNB", "SUI", "BONK", "MATIC"] as const
const LEVERAGE_OPTIONS = [2, 3, 5, 10] as const

export default function CreatePage() {
  const { connected, publicKey, signTransaction } = useWallet()
  const [name, setName] = useState("")
  const [ticker, setTicker] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [desc, setDesc] = useState("")
  const [website, setWebsite] = useState("")
  const [twitter, setTwitter] = useState("")
  const [telegram, setTelegram] = useState("")
  const [referenceAsset, setReferenceAsset] = useState<(typeof REFERENCE_ASSETS)[number]>("SOL")
  const [leverage, setLeverage] = useState<number>(3)
  const [direction, setDirection] = useState<"LONG" | "SHORT">("LONG")
  const [initialBuy, setInitialBuy] = useState("0.5")
  const [isDeploying, setIsDeploying] = useState(false)
  const [txSignature, setTxSignature] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFeePercentage = () => {
    if (leverage === 2) return '0.6%'
    if (leverage === 3) return '0.7%'
    if (leverage === 5) return '0.8%'
    if (leverage === 10) return '1.0%'
    return '0.6%'
  }

  const uploadImage = async (imageData: string): Promise<string> => {
    try {
      // Convert data URI to blob
      const blob = dataURItoBlob(imageData)
      const file = new File([blob], "token-image.png", { type: "image/png" })
      
      // Upload to IPFS via Pinata
      const imageUrl = await uploadToIPFS(file, "token-image")
      console.log("Image uploaded to IPFS:", imageUrl)
      return imageUrl
    } catch (error) {
      console.error("IPFS upload failed:", error)
      toast.error("Image upload failed. Please check Pinata API keys.")
      throw error
    }
  }

  const createMetadataUri = async (
    name: string,
    symbol: string,
    description: string,
    imageUri: string,
    website: string,
    twitter: string,
    telegram: string
  ): Promise<string> => {
    // Build simple metadata JSON
    // Pump.fun uses a simple format
    const metadata = {
      name,
      symbol,
      description,
      image: imageUri,
      showName: true,
      createdOn: "https://pump.fun",
      twitter,
      telegram,
      website
    }
    
    // Upload to IPFS or use data URI
    try {
      const metadataUrl = await uploadMetadataToIPFS(metadata)
      return metadataUrl
    } catch (error) {
      // Fallback: pump.fun might accept data URIs for small metadata
      const metadataStr = JSON.stringify(metadata)
      return `data:application/json;base64,${btoa(metadataStr)}`
    }
  }

  const handleDeploy = async () => {
    console.log("=== DEPLOY STARTED ===")
    console.log("Connected:", connected)
    console.log("PublicKey:", publicKey?.toString())
    console.log("SignTransaction:", !!signTransaction)
    console.log("Name:", name)
    console.log("Ticker:", ticker)
    console.log("Image:", !!image)
    console.log("RPC_URL:", RPC_URL)
    console.log("Network:", NETWORK)
    
    if (!connected || !publicKey || !signTransaction) {
      console.error("Wallet not connected")
      toast.error("Please connect your wallet first")
      return
    }

    if (!name.trim() || !ticker.trim() || !image) {
      console.error("Missing fields")
      toast.error("Please fill in all required fields (name, ticker, and image)")
      return
    }

    setIsDeploying(true)
    toast.loading("Creating token on Pump.fun...", { id: "deploy" })
    
    try {
      console.log("Creating connection...")
      const connection = new Connection(RPC_URL, "confirmed")
      console.log("Connection created, RPC:", RPC_URL)
      
      const mint = Keypair.generate()
      console.log("Mint generated:", mint.publicKey.toString())
      
      // Upload image and create metadata
      toast.loading("Uploading metadata...", { id: "deploy" })
      console.log("Uploading image...")
      const imageUri = await uploadImage(image)
      console.log("Image uploaded:", imageUri)
      
      console.log("Creating metadata URI...")
      const uri = await createMetadataUri(
        name.trim(),
        ticker.trim().toUpperCase(),
        desc,
        imageUri,
        website,
        twitter,
        telegram
      )
      
      // Use SDK to create instruction
      toast.loading("Creating token...", { id: "deploy" })
      console.log("Using Pump SDK to create instruction...")
      
      const { PumpSdk } = await import("@pump-fun/pump-sdk")
      const sdk = new PumpSdk(connection)
      
      console.log("SDK created, building instruction...")
      const createInstruction = await sdk.createInstruction({
        mint: mint.publicKey,
        name: name.trim(),
        symbol: ticker.trim().toUpperCase(),
        uri: uri,
        creator: publicKey,
        user: publicKey,
      })
      
      console.log("Instruction created successfully")
      const instructions = [createInstruction]
      
      // Add buy instruction if initial buy amount > 0
      const initialBuyAmount = parseFloat(initialBuy)
      if (initialBuyAmount > 0) {
        console.log(`Adding initial buy of ${initialBuyAmount} SOL...`)
        toast.loading(`Adding initial buy of ${initialBuyAmount} SOL...`, { id: "deploy" })
        
        try {
          const buyInstruction = await sdk.buyInstruction({
            mint: mint.publicKey,
            user: publicKey,
            solAmount: initialBuyAmount,
          })
          instructions.push(buyInstruction)
          console.log("Buy instruction added")
        } catch (e) {
          console.error("Could not add buy instruction:", e)
          toast.error("Could not add initial buy, creating token without it", { id: "deploy" })
        }
      }
      
      const transaction = new Transaction()
      instructions.forEach(ix => transaction.add(ix))
      transaction.feePayer = publicKey
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
      
      // Sign with mint keypair first
      transaction.partialSign(mint)
      
      // Then sign with wallet
      const signed = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signed.serialize())
      
      await connection.confirmTransaction(signature, "confirmed")

      // Store leverage metadata
      const tokenData = {
        mintAddress: mint.publicKey.toString(),
        name: name.trim(),
        symbol: ticker.trim().toUpperCase(),
        leverage,
        direction,
        underlying: referenceAsset,
        createdAt: new Date().toISOString(),
        creator: publicKey.toString()
      }
      
      // Save to localStorage for immediate display
      const tokens = JSON.parse(localStorage.getItem('leverageTokens') || '[]')
      tokens.push(tokenData)
      localStorage.setItem('leverageTokens', JSON.stringify(tokens))
      
      // Save to shared API
      try {
        await fetch('/api/tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tokenData)
        })
      } catch (e) {
        console.log('Could not save to shared API:', e)
      }

      setTxSignature(signature)
      toast.success(`Token created on Pump.fun!`, { id: "deploy" })
      
      // Reset form
      setName("")
      setTicker("")
      setDesc("")
      setImage(null)
      setImageFile(null)
      setWebsite("")
      setTwitter("")
      setTelegram("")
      
    } catch (error: any) {
      console.error("=== DEPLOYMENT ERROR ===")
      console.error("Error:", error)
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
      toast.error(error.message || "Failed to create token", { id: "deploy" })
    } finally {
      console.log("=== DEPLOY ENDED ===")
      setIsDeploying(false)
    }
  }

  const canDeploy = connected && name.trim() && ticker.trim() && image && !isDeploying

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <Header />
      <TradesTicker />

      <main className="mx-auto max-w-[1100px] px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="font-display text-4xl md:text-6xl uppercase leading-none">
            LAUNCH A <span className="rainbow-text">LEVERAGED</span> COIN
          </h1>
          <p className="mt-3 text-sm text-muted-foreground font-mono max-w-xl mx-auto">
            deploy a meme token with leveraged price action. graduates to raydium at 69 sol.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <Section step="01" title="IDENTITY">
              <div className="grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-4">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5">IMAGE</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative grid h-32 w-32 place-items-center rounded-xl border-2 border-dashed border-border bg-secondary/40 hover:border-primary overflow-hidden"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setImageFile(file)
                          const reader = new FileReader()
                          reader.onloadend = () => setImage(reader.result as string)
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="hidden"
                    />
                    {image ? (
                      <>
                        <img src={image} alt="Token" className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setImage(null)
                            setImageFile(null)
                          }}
                          className="absolute top-1 right-1 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </>
                    ) : (
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    )}
                  </button>
                  <p className="font-mono text-[9px] text-muted-foreground mt-1.5 text-center">
                    JPG, PNG, GIF, WebP
                  </p>
                </div>
                <div className="space-y-4">
                  <Field label="NAME" required>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mega Sol Bull"
                      maxLength={32}
                      className="input"
                    />
                    <p className="font-mono text-[9px] text-muted-foreground mt-1 text-right">{name.length}/32</p>
                  </Field>
                  <Field label="TICKER" required>
                    <input
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 10))}
                      placeholder="MSOL5"
                      maxLength={10}
                      className="input"
                    />
                    <p className="font-mono text-[9px] text-muted-foreground mt-1 text-right">{ticker.length}/10</p>
                  </Field>
                  <Field label="DESCRIPTION">
                    <textarea
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder="sol to 1000. wagmi or rekt."
                      rows={3}
                      className="input resize-none"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section step="02" title="SOCIAL LINKS">
              <div className="space-y-3">
                <Field label="WEBSITE (OPTIONAL)">
                  <input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://yourtoken.com"
                    className="input"
                  />
                </Field>
                <Field label="X / TWITTER (OPTIONAL)">
                  <input
                    value={twitter}
                    onChange={(e) => setTwitter(e.target.value)}
                    placeholder="https://x.com/yourtoken"
                    className="input"
                  />
                </Field>
                <Field label="TELEGRAM (OPTIONAL)">
                  <input
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="https://t.me/yourtoken"
                    className="input"
                  />
                </Field>
              </div>
            </Section>

            <Section step="03" title="LEVERAGE CONFIG">
              <div className="space-y-4">
                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">REFERENCE ASSET</label>
                  <div className="flex flex-wrap gap-2">
                    {REFERENCE_ASSETS.map((asset) => (
                      <button
                        key={asset}
                        type="button"
                        onClick={() => setReferenceAsset(asset)}
                        className={`px-4 py-2 rounded-lg font-mono text-xs transition-colors ${
                          referenceAsset === asset
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {asset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">DIRECTION</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDirection("LONG")}
                      className={`flex-1 py-3 rounded-lg font-mono text-sm transition-colors ${
                        direction === "LONG"
                          ? "bg-green-500 text-white"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      LONG ↗
                    </button>
                    <button
                      type="button"
                      onClick={() => setDirection("SHORT")}
                      className={`flex-1 py-3 rounded-lg font-mono text-sm transition-colors ${
                        direction === "SHORT"
                          ? "bg-red-500 text-white"
                          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                    >
                      SHORT ↘
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">LEVERAGE</label>
                  <div className="flex gap-2">
                    {LEVERAGE_OPTIONS.map((lev) => (
                      <button
                        key={lev}
                        type="button"
                        onClick={() => setLeverage(lev)}
                        className={`flex-1 py-3 rounded-lg font-mono text-sm transition-colors ${
                          leverage === lev
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                        }`}
                      >
                        {lev}x
                      </button>
                    ))}
                  </div>
                  <p className="font-mono text-[9px] text-muted-foreground mt-2">
                    Fee: {getFeePercentage()} total
                  </p>
                </div>
              </div>
            </Section>

            <Section step="04" title="DEV BUY (OPTIONAL)">
              <Field label="INITIAL BUY IN SOL">
                <input
                  type="number"
                  value={initialBuy}
                  onChange={(e) => setInitialBuy(e.target.value)}
                  placeholder="0.5"
                  step="0.1"
                  min="0"
                  className="input"
                />
              </Field>
            </Section>

            <button
              type="button"
              onClick={handleDeploy}
              disabled={!canDeploy}
              className="w-full py-4 bg-primary text-primary-foreground font-display text-xl uppercase rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {isDeploying ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  DEPLOYING...
                </span>
              ) : (
                "LAUNCH TOKEN"
              )}
            </button>

            {txSignature && (
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                <p className="font-mono text-xs text-green-500">Token created successfully!</p>
                <a
                  href={`https://solscan.io/tx/${txSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-xs text-primary hover:underline mt-1 block"
                >
                  View on Solscan →
                </a>
              </div>
            )}
          </form>

          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h3 className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-4">LIVE PREVIEW</h3>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-xl bg-secondary overflow-hidden">
                  {image ? (
                    <img src={image} alt="Token" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center">
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-display text-lg uppercase truncate">
                    {name || "YOUR TOKEN"}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="font-mono text-xs text-muted-foreground">
                      {ticker || "$TICKER"}
                    </span>
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                      direction === "LONG" ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
                    }`}>
                      {leverage}x {direction}
                    </span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {referenceAsset}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!connected && (
              <div className="rounded-2xl border border-border bg-card p-5 text-center">
                <p className="text-muted-foreground mb-4">Connect your wallet to launch a token</p>
                <div className="wallet-adapter-button-trigger w-full">
                  {/* Wallet connect button will be rendered here by the wallet adapter */}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

function Section({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-5 pb-3 border-b border-border">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground font-mono text-[10px] font-bold">
          {step}
        </span>
        <h2 className="font-display text-sm uppercase tracking-wider text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="space-y-1.5">
      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block">
        {label}
        {required && <span className="text-primary ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
// Force rebuild Thu May 21 05:23:20 PM UTC 2026
// Redeploy with Helius RPC Thu May 21 06:01:44 PM UTC 2026
// Test which Vercel project Thu May 21 06:13:36 PM UTC 2026
