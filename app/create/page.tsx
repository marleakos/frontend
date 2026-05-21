"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { ImagePlus, Info, X, Loader2 } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey, Keypair, Transaction } from "@solana/web3.js"
import { toast } from "sonner"
import { RPC_URL } from "@/lib/program-config"
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
      
      // For now, just create token without dev buy (simpler approach)
      // Dev buy can be added later
      toast.loading("Creating token...", { id: "deploy" })
      console.log("Building create instruction...")
      
      // Manual instruction building since SDK has issues
      const PUMP_FUN_PROGRAM = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P")
      const TOKEN_2022_PROGRAM = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
      const ASSOCIATED_TOKEN_PROGRAM = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")
      const MINT_AUTHORITY = new PublicKey("TSLvdd1pWpHVjahSpsvCXUbgwsL3JAgvEaMB9HtFBmu")
      const MAYHEM_PROGRAM = new PublicKey("MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e")
      
      // Derive PDAs
      console.log("Deriving PDAs...")
      
      const [bondingCurve] = PublicKey.findProgramAddressSync(
        [Buffer.from("bonding-curve"), mint.publicKey.toBuffer()],
        PUMP_FUN_PROGRAM
      )
      console.log("Bonding curve:", bondingCurve.toString())
      
      const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
        [bondingCurve.toBuffer(), TOKEN_2022_PROGRAM.toBuffer(), mint.publicKey.toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM
      )
      console.log("Associated bonding curve:", associatedBondingCurve.toString())
      
      // Derive GLOBAL PDA
      const [globalPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("global")],
        PUMP_FUN_PROGRAM
      )
      console.log("Global PDA:", globalPda.toString())
      
      // Build instruction data for create using Borsh serialization
      // Anchor uses Borsh for instruction data
      const nameStr = name.trim()
      const symbolStr = ticker.trim().toUpperCase()
      
      // Calculate sizes
      const nameLen = Buffer.byteLength(nameStr, 'utf8')
      const symbolLen = Buffer.byteLength(symbolStr, 'utf8')
      const uriLen = Buffer.byteLength(uri, 'utf8')
      
      // Total size: 8 (discriminator) + 4 + nameLen + 4 + symbolLen + 4 + uriLen
      const data = Buffer.alloc(8 + 4 + nameLen + 4 + symbolLen + 4 + uriLen)
      let offset = 0
      
      // Discriminator for 'create' instruction
      // sha256("global:create")[0:8]
      const discriminator = Buffer.from([24, 30, 200, 40, 5, 28, 7, 119])
      discriminator.copy(data, offset)
      offset += 8
      
      // Name (Borsh string: 4-byte LE length + bytes)
      data.writeUInt32LE(nameLen, offset)
      offset += 4
      Buffer.from(nameStr, 'utf8').copy(data, offset)
      offset += nameLen
      
      // Symbol
      data.writeUInt32LE(symbolLen, offset)
      offset += 4
      Buffer.from(symbolStr, 'utf8').copy(data, offset)
      offset += symbolLen
      
      // URI
      data.writeUInt32LE(uriLen, offset)
      offset += 4
      Buffer.from(uri, 'utf8').copy(data, offset)
      
      const { TransactionInstruction, SystemProgram } = await import("@solana/web3.js")
      
      const createInstruction = new TransactionInstruction({
        keys: [
          { pubkey: mint.publicKey, isSigner: true, isWritable: true },
          { pubkey: MINT_AUTHORITY, isSigner: false, isWritable: false },
          { pubkey: bondingCurve, isSigner: false, isWritable: true },
          { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
          { pubkey: globalPda, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_2022_PROGRAM, isSigner: false, isWritable: false },
          { pubkey: ASSOCIATED_TOKEN_PROGRAM, isSigner: false, isWritable: false },
          { pubkey: MAYHEM_PROGRAM, isSigner: false, isWritable: false },
        ],
        programId: PUMP_FUN_PROGRAM,
        data: data.slice(0, offset),
      })
      
      const instructions = [createInstruction]
      
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
      const tokens = JSON.parse(localStorage.getItem('leverageTokens') || '[]')
      tokens.push({
        mintAddress: mint.publicKey.toString(),
        name: name.trim(),
        symbol: ticker.trim().toUpperCase(),
        leverage,
        direction,
        underlying: referenceAsset,
        createdAt: new Date().toISOString()
      })
      localStorage.setItem('leverageTokens', JSON.stringify(tokens))

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
                <div className="space-y-3">
                  <Field label="NAME">
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Mega Sol Bull"
                      maxLength={32}
                      className="input"
                    />
                    <p className="font-mono text-[9px] text-muted-foreground mt-1">{name.length}/32</p>
                  </Field>
                  <Field label="TICKER">
                    <input
                      value={ticker}
                      onChange={(e) => setTicker(e.target.value.toUpperCase().slice(0, 10))}
                      placeholder="MSOL5"
                      maxLength={10}
                      className="input"
                    />
                    <p className="font-mono text-[9px] text-muted-foreground mt-1">{ticker.length}/10</p>
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
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono text-xs text-primary">{step}.</span>
        <h2 className="font-mono text-xs uppercase tracking-wider text-foreground">{title}</h2>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}
// Force rebuild Thu May 21 05:23:20 PM UTC 2026
