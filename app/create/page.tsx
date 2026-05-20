"use client"

import { useState, useRef } from "react"
import { Header } from "@/components/header"
import { TradesTicker } from "@/components/trades-ticker"
import { ImagePlus, Info, X, Loader2 } from "lucide-react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection, PublicKey, Keypair, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY, Transaction, TransactionInstruction } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress } from "@solana/spl-token"
import { toast } from "sonner"
import { PROGRAM_ID, RPC_URL } from "@/lib/program-config"
import { BN } from "@coral-xyz/anchor"

const REFERENCE_ASSETS = ["SOL", "BTC", "ETH", "APT", "ARB", "DOGE", "BNB", "SUI", "BONK", "MATIC"] as const
const LEVERAGE_OPTIONS = [2, 3, 5, 10] as const

// Instruction discriminators
const INITIALIZE_TOKEN_DISCRIMINATOR = new Uint8Array([69, 116, 107, 228, 81, 178, 49, 65])

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

  const handleDeploy = async () => {
    if (!connected || !publicKey || !signTransaction) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!name.trim() || !ticker.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsDeploying(true)
    toast.loading("Creating token...", { id: "deploy" })

    try {
      const connection = new Connection(RPC_URL, "confirmed")
      const mintKeypair = Keypair.generate()

      // Get PDAs
      const [tokenStatePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("token_state"), mintKeypair.publicKey.toBuffer()],
        PROGRAM_ID
      )
      const [feeVaultPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("fee_vault"), mintKeypair.publicKey.toBuffer()],
        PROGRAM_ID
      )
      const [userReferralPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("user_referral"), publicKey.toBuffer()],
        PROGRAM_ID
      )
      const [curveTokenAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("curve_token_account"), mintKeypair.publicKey.toBuffer()],
        PROGRAM_ID
      )
      const [lpTokenAccountPDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("lp_token_account"), mintKeypair.publicKey.toBuffer()],
        PROGRAM_ID
      )

      // Build instruction data
      const data = Buffer.alloc(1000)
      let offset = 0
      
      // Discriminator
      data.set(INITIALIZE_TOKEN_DISCRIMINATOR, offset)
      offset += 8
      
      // Name (string)
      const nameBytes = Buffer.from(name)
      data.writeUInt32LE(nameBytes.length, offset)
      offset += 4
      nameBytes.copy(data, offset)
      offset += nameBytes.length
      
      // Symbol (string)
      const symbolBytes = Buffer.from(ticker)
      data.writeUInt32LE(symbolBytes.length, offset)
      offset += 4
      symbolBytes.copy(data, offset)
      offset += symbolBytes.length
      
      // URI (string)
      const uriBytes = Buffer.from("https://example.com/metadata.json")
      data.writeUInt32LE(uriBytes.length, offset)
      offset += 4
      uriBytes.copy(data, offset)
      offset += uriBytes.length
      
      // Leverage (u8)
      data.writeUInt8(leverage, offset)
      offset += 1
      
      // Direction enum (u8: 0 = Long, 1 = Short)
      data.writeUInt8(direction === "LONG" ? 0 : 1, offset)
      offset += 1
      
      // Underlying enum (u8: 0 = SolPerp, 1 = BtcPerp, 2 = EthPerp, 3 = DogePerp)
      let underlyingValue = 0
      if (referenceAsset === "BTC") underlyingValue = 1
      else if (referenceAsset === "ETH") underlyingValue = 2
      else if (referenceAsset === "DOGE") underlyingValue = 3
      data.writeUInt8(underlyingValue, offset)
      offset += 1
      
      // Oracle price (u64) - 1 SOL = 1 billion lamports
      const oraclePrice = BigInt(1000000000)
      data.writeBigUInt64LE(oraclePrice, offset)
      offset += 8
      
      // Referrer (Option<Pubkey>) - 0 = None
      data.writeUInt8(0, offset)
      offset += 1

      const instructionData = data.slice(0, offset)

      // Create instruction
      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: mintKeypair.publicKey, isSigner: true, isWritable: true },
          { pubkey: tokenStatePDA, isSigner: false, isWritable: true },
          { pubkey: feeVaultPDA, isSigner: false, isWritable: true },
          { pubkey: userReferralPDA, isSigner: false, isWritable: true },
          { pubkey: curveTokenAccountPDA, isSigner: true, isWritable: true },
          { pubkey: lpTokenAccountPDA, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
          { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
          { pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: PROGRAM_ID,
        data: instructionData,
      })

      // Create and sign transaction
      const transaction = new Transaction().add(instruction)
      transaction.feePayer = publicKey
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
      transaction.sign(mintKeypair)

      const signed = await signTransaction(transaction)
      const signature = await connection.sendRawTransaction(signed.serialize())
      
      await connection.confirmTransaction(signature, "confirmed")

      setTxSignature(signature)
      toast.success("Token created successfully!", { id: "deploy" })
      
      // Reset form
      setName("")
      setTicker("")
      setDesc("")
      setImage(null)
      setImageFile(null)
      
    } catch (error: any) {
      console.error("Deployment error:", error)
      toast.error(error.message || "Failed to create token", { id: "deploy" })
    } finally {
      setIsDeploying(false)
    }
  }

  const canDeploy = connected && name.trim() && ticker.trim() && !isDeploying

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
                      rows={3}
                      placeholder="sol to 1000. wagmi or rekt."
                      className="input resize-none"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Section step="02" title="SOCIAL LINKS">
              <div className="space-y-3">
                <Field label="WEBSITE (OPTIONAL)">
                  <input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://yourtoken.com" className="input" />
                </Field>
                <Field label="X / TWITTER (OPTIONAL)">
                  <input value={twitter} onChange={(e) => setTwitter(e.target.value)} placeholder="https://x.com/yourtoken" className="input" />
                </Field>
                <Field label="TELEGRAM (OPTIONAL)">
                  <input value={telegram} onChange={(e) => setTelegram(e.target.value)} placeholder="https://t.me/yourtoken" className="input" />
                </Field>
              </div>
            </Section>

            <Section step="03" title="LEVERAGE CONFIG">
              <Field label="REFERENCE ASSET">
                <div className="grid grid-cols-5 gap-2">
                  {REFERENCE_ASSETS.map((asset) => (
                    <button
                      type="button"
                      key={asset}
                      onClick={() => setReferenceAsset(asset)}
                      className={asset === referenceAsset ? "py-3 rounded-md border-2 border-primary bg-primary/10 text-primary font-display text-xs uppercase" : "py-3 rounded-md border-2 border-border bg-secondary/40 hover:border-primary/50 font-mono text-xs"}
                    >
                      {asset}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="DIRECTION">
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setDirection("LONG")} className={direction === "LONG" ? "py-4 rounded-md border-2 border-primary bg-primary/10 text-primary font-display uppercase text-base" : "py-4 rounded-md border-2 border-border bg-secondary/40 hover:border-primary/50 font-mono"}>
                    LONG ↗
                  </button>
                  <button type="button" onClick={() => setDirection("SHORT")} className={direction === "SHORT" ? "py-4 rounded-md border-2 border-destructive bg-destructive/10 text-destructive font-display uppercase text-base" : "py-4 rounded-md border-2 border-border bg-secondary/40 hover:border-destructive/50 font-mono"}>
                    short ↘
                  </button>
                </div>
              </Field>

              <Field label="LEVERAGE">
                <div className="grid grid-cols-4 gap-2">
                  {LEVERAGE_OPTIONS.map((lev) => (
                    <button type="button" key={lev} onClick={() => setLeverage(lev)} className={leverage === lev ? "py-3 rounded-md border-2 border-primary bg-primary/10 text-primary font-display text-sm uppercase" : "py-3 rounded-md border-2 border-border bg-secondary/40 hover:border-primary/50 font-mono text-sm"}>
                      {lev}x
                    </button>
                  ))}
                </div>
                <p className="font-mono text-[10px] text-primary mt-2">
                  Fee: {getFeePercentage()} total
                </p>
              </Field>
            </Section>

            <Section step="04" title="DEV BUY (OPTIONAL)">
              <Field label="INITIAL BUY IN SOL">
                <input value={initialBuy} onChange={(e) => setInitialBuy(e.target.value)} placeholder="0.5" className="input" />
              </Field>
            </Section>
          </form>

          <aside className="lg:sticky lg:top-24 self-start space-y-4">
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-3 py-2 border-b border-border font-display text-xs uppercase tracking-wider bg-secondary/40">LIVE PREVIEW</div>
              <div className="p-4 flex gap-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md bg-gradient-to-br from-primary/30 to-accent/30 text-3xl border-2 border-foreground/10 overflow-hidden">
                  {image ? <img src={image} alt="Token" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-muted-foreground" />}
                </div>
                <div className="min-w-0">
                  <div className="font-display text-base truncate uppercase">{name || "YOUR TOKEN"}</div>
                  <div className="font-mono text-[11px] text-muted-foreground">${ticker || "TICKER"}</div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-primary text-primary-foreground">{leverage}x {direction}</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{referenceAsset}</span>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleDeploy} disabled={!canDeploy} className="w-full bg-primary text-primary-foreground py-4 rounded-md font-display uppercase tracking-wide text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {isDeploying ? <><Loader2 className="h-5 w-5 animate-spin" /> DEPLOYING...</> : !connected ? "CONNECT WALLET" : "DEPLOY TOKEN"}
            </button>

            {txSignature && (
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="font-mono text-xs text-green-500 mb-1">✓ Token deployed!</p>
                <a href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] text-primary hover:underline break-all">View on Explorer →</a>
              </div>
            )}
          </aside>
        </div>
      </main>

      <style>{`.input{width:100%;height:44px;border-radius:.5rem;border:2px solid var(--color-border);background:var(--color-input);padding:0 .75rem;font-family:var(--font-mono);font-size:.875rem;outline:none;transition:border-color .15s}.input:focus{border-color:var(--color-primary)}textarea.input{height:auto;padding:.5rem .75rem}`}</style>
    </div>
  )
}

function Section({ step, title, children }: { step: string; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border-2 border-border bg-card p-5 relative overflow-hidden">
      <div className="absolute top-0 right-0 font-display text-7xl text-foreground/[0.04] leading-none pr-3 pt-1 select-none pointer-events-none">{step}</div>
      <h2 className="font-display uppercase text-base text-primary mb-4 flex items-baseline gap-2"><span className="text-primary">{step}.</span> {title}</h2>
      <div className="space-y-3 relative">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground block mb-1.5">{label}</label>
      {children}
    </div>
  )
}
