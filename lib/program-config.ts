import { PublicKey } from "@solana/web3.js"

// Deployed program ID (latest deployment)
export const PROGRAM_ID = new PublicKey("2KxkyfrvqfwRZfst9cJ4jJWdKFB9gtmiUWJGTVMrcgkR")

// Network configuration
export const NETWORK = "mainnet"
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com"

// Fee configuration (matches program constants)
export const FEE_CONFIG = {
  BASE_TRADING_FEE_BPS: 50, // 0.5%
  LEVERAGE_FEE_2X_BPS: 10,  // 0.1% additional
  LEVERAGE_FEE_3X_BPS: 20,  // 0.2% additional
  LEVERAGE_FEE_5X_BPS: 30,  // 0.3% additional
  LEVERAGE_FEE_10X_BPS: 50, // 0.5% additional
  REFERRAL_SHARE_BPS: 1000, // 10% of creator fees
  GRADUATION_THRESHOLD: 85, // 85 SOL (pump.fun standard)
}

// Get total fee for a given leverage tier
export function getTotalFeeBps(leverage: number): number {
  const baseFee = FEE_CONFIG.BASE_TRADING_FEE_BPS
  switch (leverage) {
    case 2:
      return baseFee + FEE_CONFIG.LEVERAGE_FEE_2X_BPS
    case 3:
      return baseFee + FEE_CONFIG.LEVERAGE_FEE_3X_BPS
    case 5:
      return baseFee + FEE_CONFIG.LEVERAGE_FEE_5X_BPS
    case 10:
      return baseFee + FEE_CONFIG.LEVERAGE_FEE_10X_BPS
    default:
      return baseFee
  }
}

// Program seeds
export const SEEDS = {
  TOKEN_STATE: "token_state",
  FEE_VAULT: "fee_vault",
  USER_REFERRAL: "user_referral",
  CURVE_TOKEN_ACCOUNT: "curve_token_account",
  LP_TOKEN_ACCOUNT: "lp_token_account",
}
