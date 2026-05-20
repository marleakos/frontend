"use client"

import { useState, useCallback } from "react"
import { useProgram } from "./use-program"
import { getBuyAccounts, getSellAccounts } from "@/lib/program-utils"
import { PublicKey } from "@solana/web3.js"
import { BN } from "@coral-xyz/anchor"
import { toast } from "sonner"

export function useTrade() {
  const { program, wallet } = useProgram()
  const publicKey = wallet.publicKey
  const [isTrading, setIsTrading] = useState(false)

  const buy = useCallback(async (
    tokenMint: PublicKey,
    amount: number, // in lamports
    protocolFeeAccount: PublicKey,
    creatorFeeAccount: PublicKey
  ) => {
    if (!program || !publicKey) {
      toast.error("Please connect your wallet")
      return null
    }

    setIsTrading(true)
    toast.loading("Processing buy...", { id: "buy" })

    try {
      const accounts = getBuyAccounts(
        publicKey,
        tokenMint,
        protocolFeeAccount,
        creatorFeeAccount
      )

      const tx = await (program as any).methods
        .buy(new BN(amount))
        .accounts({
          buyer: accounts.buyer,
          tokenState: accounts.tokenState,
          tokenMint: accounts.tokenMint,
          buyerTokenAccount: accounts.buyerTokenAccount,
          curveTokenAccount: accounts.curveTokenAccount,
          feeVault: accounts.feeVault,
          protocolFeeAccount: accounts.protocolFeeAccount,
          creatorFeeAccount: accounts.creatorFeeAccount,
          systemProgram: accounts.systemProgram,
          tokenProgram: accounts.tokenProgram,
          clock: accounts.clock,
        })
        .rpc()

      toast.success("Buy successful!", { id: "buy" })
      return tx
    } catch (error: any) {
      console.error("Buy error:", error)
      toast.error(error.message || "Buy failed", { id: "buy" })
      return null
    } finally {
      setIsTrading(false)
    }
  }, [program, publicKey])

  const sell = useCallback(async (
    tokenMint: PublicKey,
    amount: number, // token amount
    protocolFeeAccount: PublicKey,
    creatorFeeAccount: PublicKey
  ) => {
    if (!program || !publicKey) {
      toast.error("Please connect your wallet")
      return null
    }

    setIsTrading(true)
    toast.loading("Processing sell...", { id: "sell" })

    try {
      const accounts = getSellAccounts(
        publicKey,
        tokenMint,
        protocolFeeAccount,
        creatorFeeAccount
      )

      const tx = await (program as any).methods
        .sell(new BN(amount))
        .accounts({
          seller: accounts.seller,
          tokenState: accounts.tokenState,
          tokenMint: accounts.tokenMint,
          sellerTokenAccount: accounts.sellerTokenAccount,
          curveTokenAccount: accounts.curveTokenAccount,
          feeVault: accounts.feeVault,
          protocolFeeAccount: accounts.protocolFeeAccount,
          creatorFeeAccount: accounts.creatorFeeAccount,
          systemProgram: accounts.systemProgram,
          tokenProgram: accounts.tokenProgram,
          clock: accounts.clock,
        })
        .rpc()

      toast.success("Sell successful!", { id: "sell" })
      return tx
    } catch (error: any) {
      console.error("Sell error:", error)
      toast.error(error.message || "Sell failed", { id: "sell" })
      return null
    } finally {
      setIsTrading(false)
    }
  }, [program, publicKey])

  return {
    buy,
    sell,
    isTrading,
  }
}
