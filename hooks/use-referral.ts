"use client"

import { useState, useCallback } from "react"
import { useProgram } from "./use-program"
import { PublicKey } from "@solana/web3.js"
import { toast } from "sonner"
import { PROGRAM_ID } from "@/lib/program-config"

export function useReferral() {
  const { program, wallet } = useProgram()
  const publicKey = wallet.publicKey
  const [isClaiming, setIsClaiming] = useState(false)

  // Claim referral rewards for a specific token
  const claimReferralRewards = useCallback(async (
    tokenMint: PublicKey
  ) => {
    if (!program || !publicKey) {
      toast.error("Please connect your wallet")
      return null
    }

    setIsClaiming(true)
    toast.loading("Claiming referral rewards...", { id: "claim-referral" })

    try {
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
          systemProgram: PublicKey.default,
        })
        .rpc()

      toast.success("Referral rewards claimed!", { id: "claim-referral" })
      return tx
    } catch (error: any) {
      console.error("Claim referral error:", error)
      toast.error(error.message || "Failed to claim rewards", { id: "claim-referral" })
      return null
    } finally {
      setIsClaiming(false)
    }
  }, [program, publicKey])

  return {
    claimReferralRewards,
    isClaiming,
  }
}
