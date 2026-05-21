// Pump.fun SDK integration
import { Connection, PublicKey, Keypair, Transaction } from "@solana/web3.js"

// Pump.fun program constants
const PUMP_FUN_PROGRAM = new PublicKey("6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P")
const PUMP_FUN_FEE = new PublicKey("CebN5WGQ4dEiSrkJScpDaNhvgu46XzVL9KZSdM2q4nE")
const GLOBAL_ACCOUNT = new PublicKey("4wTV1YmiEkRvAtNtsSGPtUrqRYQMe5SKy2uB4Jjaxnjf")
const MINT_AUTHORITY = new PublicKey("TSLvdd1pWpHVjahSpsvCXUbgwsL3JAgvEaMB9HtFBmu")
const MAYHEM_PROGRAM = new PublicKey("MAyhSmzXzV1pTf7LsNkrNwkWKTo4ougAJ1PPg47MD4e")

// Token-2022 program
const TOKEN_2022_PROGRAM = new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb")
const ASSOCIATED_TOKEN_PROGRAM = new PublicKey("ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL")

// Discriminator for create instruction (need to verify this)
const CREATE_DISCRIMINATOR = new Uint8Array([24, 30, 200, 40, 5, 28, 7, 119])

export interface TokenParams {
  name: string
  symbol: string
  uri: string
  leverage: number
  direction: "LONG" | "SHORT"
  underlying: string
}

export async function createPumpFunToken(
  connection: Connection,
  payer: PublicKey,
  params: TokenParams
): Promise<{ transaction: Transaction; mint: Keypair }> {
  
  const mint = Keypair.generate()
  
  // Derive PDAs
  const [bondingCurve] = PublicKey.findProgramAddressSync(
    [Buffer.from("bonding-curve"), mint.publicKey.toBuffer()],
    PUMP_FUN_PROGRAM
  )
  
  const [mintAuthority] = PublicKey.findProgramAddressSync(
    [Buffer.from("mint-authority")],
    PUMP_FUN_PROGRAM
  )
  
  const [associatedBondingCurve] = PublicKey.findProgramAddressSync(
    [
      bondingCurve.toBuffer(),
      TOKEN_2022_PROGRAM.toBuffer(),
      mint.publicKey.toBuffer()
    ],
    ASSOCIATED_TOKEN_PROGRAM
  )
  
  const [associatedUser] = PublicKey.findProgramAddressSync(
    [
      payer.toBuffer(),
      TOKEN_2022_PROGRAM.toBuffer(),
      mint.publicKey.toBuffer()
    ],
    ASSOCIATED_TOKEN_PROGRAM
  )
  
  // Build instruction data
  // Format: discriminator (8) + name (4 + len) + symbol (4 + len) + uri (4 + len)
  const nameBytes = Buffer.from(params.name)
  const symbolBytes = Buffer.from(params.symbol)
  const uriBytes = Buffer.from(params.uri)
  
  const data = Buffer.alloc(8 + 4 + nameBytes.length + 4 + symbolBytes.length + 4 + uriBytes.length)
  let offset = 0
  
  // Discriminator
  data.set(CREATE_DISCRIMINATOR, offset)
  offset += 8
  
  // Name
  data.writeUInt32LE(nameBytes.length, offset)
  offset += 4
  nameBytes.copy(data, offset)
  offset += nameBytes.length
  
  // Symbol
  data.writeUInt32LE(symbolBytes.length, offset)
  offset += 4
  symbolBytes.copy(data, offset)
  offset += symbolBytes.length
  
  // URI
  data.writeUInt32LE(uriBytes.length, offset)
  offset += 4
  uriBytes.copy(data, offset)
  offset += uriBytes.length
  
  const instructionData = data.slice(0, offset)
  
  // Build accounts list (matching pump.fun IDL)
  const keys = [
    { pubkey: mint.publicKey, isSigner: true, isWritable: true },
    { pubkey: mintAuthority, isSigner: false, isWritable: false },
    { pubkey: bondingCurve, isSigner: false, isWritable: true },
    { pubkey: associatedBondingCurve, isSigner: false, isWritable: true },
    { pubkey: GLOBAL_ACCOUNT, isSigner: false, isWritable: true },
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: new PublicKey("11111111111111111111111111111111"), isSigner: false, isWritable: false }, // System program
    { pubkey: TOKEN_2022_PROGRAM, isSigner: false, isWritable: false },
    { pubkey: ASSOCIATED_TOKEN_PROGRAM, isSigner: false, isWritable: false },
    { pubkey: MAYHEM_PROGRAM, isSigner: false, isWritable: false },
  ]
  
  const { TransactionInstruction } = await import("@solana/web3.js")
  
  const createInstruction = new TransactionInstruction({
    keys,
    programId: PUMP_FUN_PROGRAM,
    data: instructionData,
  })
  
  const transaction = new Transaction()
  transaction.add(createInstruction)
  
  return { transaction, mint }
}

// Store leverage metadata in our backend
export async function storeTokenMetadata(
  mintAddress: string,
  params: TokenParams
): Promise<void> {
  // For now, store in localStorage as a simple solution
  // In production, this should call your backend API
  const tokens = JSON.parse(localStorage.getItem('leverageTokens') || '[]')
  tokens.push({
    mintAddress,
    ...params,
    createdAt: new Date().toISOString()
  })
  localStorage.setItem('leverageTokens', JSON.stringify(tokens))
}

// Get stored tokens
export function getStoredTokens(): Array<TokenParams & { mintAddress: string; createdAt: string }> {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('leverageTokens') || '[]')
}
