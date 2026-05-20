import { PublicKey, SystemProgram, SYSVAR_CLOCK_PUBKEY, SYSVAR_RENT_PUBKEY } from "@solana/web3.js"
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { PROGRAM_ID, SEEDS } from "./program-config"

// Derive PDA for TokenState account
export function getTokenStatePDA(tokenMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.TOKEN_STATE), tokenMint.toBuffer()],
    PROGRAM_ID
  )
}

// Derive PDA for FeeVault account
export function getFeeVaultPDA(tokenMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.FEE_VAULT), tokenMint.toBuffer()],
    PROGRAM_ID
  )
}

// Derive PDA for UserReferral account
export function getUserReferralPDA(user: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.USER_REFERRAL), user.toBuffer()],
    PROGRAM_ID
  )
}

// Derive PDA for CurveTokenAccount
export function getCurveTokenAccountPDA(tokenMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.CURVE_TOKEN_ACCOUNT), tokenMint.toBuffer()],
    PROGRAM_ID
  )
}

// Derive PDA for LPTokenAccount
export function getLpTokenAccountPDA(tokenMint: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from(SEEDS.LP_TOKEN_ACCOUNT), tokenMint.toBuffer()],
    PROGRAM_ID
  )
}

// Get associated token account address
export function getAssociatedTokenAccount(owner: PublicKey, mint: PublicKey): PublicKey {
  return PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  )[0]
}

// Convert leverage number to enum variant
export function getLeverageTier(leverage: number): string {
  switch (leverage) {
    case 2:
      return "2x"
    case 3:
      return "3x"
    case 5:
      return "5x"
    case 10:
      return "10x"
    default:
      return "2x"
  }
}

// Convert direction string to enum
export function getDirectionEnum(direction: "LONG" | "SHORT"): object {
  return direction === "LONG" ? { long: {} } : { short: {} }
}

// Convert underlying asset string to enum
export function getUnderlyingEnum(asset: string): object {
  switch (asset) {
    case "SOL":
    case "SOL-PERP":
      return { solPerp: {} }
    case "BTC":
    case "BTC-PERP":
      return { btcPerp: {} }
    case "ETH":
    case "ETH-PERP":
      return { ethPerp: {} }
    case "DOGE":
    case "DOGE-PERP":
      return { dogePerp: {} }
    default:
      return { solPerp: {} }
  }
}

// Format underlying for display
export function formatUnderlying(underlying: string): string {
  if (underlying.includes("PERP")) return underlying
  return `${underlying}-PERP`
}

// Get all required accounts for initializeToken instruction
export function getInitializeTokenAccounts(
  creator: PublicKey,
  tokenMint: PublicKey,
  referrer: PublicKey | null = null
) {
  const [tokenState] = getTokenStatePDA(tokenMint)
  const [feeVault] = getFeeVaultPDA(tokenMint)
  const [userReferral] = getUserReferralPDA(creator)
  const [curveTokenAccount] = getCurveTokenAccountPDA(tokenMint)
  const [lpTokenAccount] = getLpTokenAccountPDA(tokenMint)

  return {
    creator,
    tokenMint,
    tokenState,
    feeVault,
    userReferral,
    curveTokenAccount,
    lpTokenAccount,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    rent: SYSVAR_RENT_PUBKEY,
    clock: SYSVAR_CLOCK_PUBKEY,
  }
}

// Get all required accounts for buy instruction
export function getBuyAccounts(
  buyer: PublicKey,
  tokenMint: PublicKey,
  protocolFeeAccount: PublicKey,
  creatorFeeAccount: PublicKey
) {
  const [tokenState] = getTokenStatePDA(tokenMint)
  const [feeVault] = getFeeVaultPDA(tokenMint)
  const [curveTokenAccount] = getCurveTokenAccountPDA(tokenMint)
  const buyerTokenAccount = getAssociatedTokenAccount(buyer, tokenMint)

  return {
    buyer,
    tokenState,
    tokenMint,
    buyerTokenAccount,
    curveTokenAccount,
    feeVault,
    protocolFeeAccount,
    creatorFeeAccount,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    clock: SYSVAR_CLOCK_PUBKEY,
  }
}

// Get all required accounts for sell instruction
export function getSellAccounts(
  seller: PublicKey,
  tokenMint: PublicKey,
  protocolFeeAccount: PublicKey,
  creatorFeeAccount: PublicKey
) {
  const [tokenState] = getTokenStatePDA(tokenMint)
  const [feeVault] = getFeeVaultPDA(tokenMint)
  const [curveTokenAccount] = getCurveTokenAccountPDA(tokenMint)
  const sellerTokenAccount = getAssociatedTokenAccount(seller, tokenMint)

  return {
    seller,
    tokenState,
    tokenMint,
    sellerTokenAccount,
    curveTokenAccount,
    feeVault,
    protocolFeeAccount,
    creatorFeeAccount,
    systemProgram: SystemProgram.programId,
    tokenProgram: TOKEN_PROGRAM_ID,
    clock: SYSVAR_CLOCK_PUBKEY,
  }
}

// Calculate bonding curve price
export function calculateCurvePrice(
  virtualSolReserve: bigint,
  virtualTokenReserve: bigint,
  amount: bigint
): bigint {
  // Price = (virtualSolReserve / virtualTokenReserve) * amount
  return (virtualSolReserve * amount) / virtualTokenReserve
}

// Calculate tokens received for SOL amount
export function calculateTokensForSol(
  virtualSolReserve: bigint,
  virtualTokenReserve: bigint,
  solAmount: bigint
): bigint {
  // tokens = (solAmount * virtualTokenReserve) / virtualSolReserve
  return (solAmount * virtualTokenReserve) / virtualSolReserve
}

// Calculate SOL received for token amount
export function calculateSolForTokens(
  virtualSolReserve: bigint,
  virtualTokenReserve: bigint,
  tokenAmount: bigint
): bigint {
  // sol = (tokenAmount * virtualSolReserve) / virtualTokenReserve
  return (tokenAmount * virtualSolReserve) / virtualTokenReserve
}
