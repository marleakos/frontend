"use client"

import { useState } from "react"
import { useProgram } from "@/hooks/use-program"
import { getInitializeTokenAccounts, getDirectionEnum, getUnderlyingEnum } from "@/lib/program-utils"
import { getTotalFeeBps } from "@/lib/program-config"
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js"
import { createMint, getMinimumBalanceForRentExemptMint, MINT_SIZE, TOKEN_PROGRAM_ID } from "@solana/spl-token"
import { BN } from "@coral-xyz/anchor"

export function ProgramExample() {
  const { program, isReady, wallet, connection } = useProgram()
  const [loading, setLoading] = useState(false)
  const [txSignature, setTxSignature] = useState<string | null>(null)

  const createToken = async () => {
    if (!program || !wallet.publicKey || !wallet.signTransaction) {
      alert("Please connect your wallet first")
      return
    }

    setLoading(true)
    try {
      // Generate a new mint keypair
      const mintKeypair = Keypair.generate()

      // Get all the PDA accounts
      const accounts = getInitializeTokenAccounts(
        wallet.publicKey,
        mintKeypair.publicKey,
        null // no referrer
      )

      // Create the token
      const tx = await (program as any).methods
        .initializeToken(
          "Test Token", // name
          "TEST", // symbol
          "https://example.com/metadata.json", // uri
          5, // leverage (5x)
          getDirectionEnum("LONG"), // direction
          getUnderlyingEnum("SOL"), // underlying
          new BN(100000000), // oracle price at launch (in lamports)
          null // referrer (optional)
        )
        .accounts({
          creator: accounts.creator,
          tokenMint: accounts.tokenMint,
          tokenState: accounts.tokenState,
          feeVault: accounts.feeVault,
          userReferral: accounts.userReferral,
          curveTokenAccount: accounts.curveTokenAccount,
          lpTokenAccount: accounts.lpTokenAccount,
          systemProgram: accounts.systemProgram,
          tokenProgram: accounts.tokenProgram,
          rent: accounts.rent,
          clock: accounts.clock,
        })
        .signers([mintKeypair])
        .rpc()

      setTxSignature(tx)
      console.log("Token created! Transaction:", tx)
      alert(`Token created! Transaction: ${tx}`)
    } catch (error) {
      console.error("Error creating token:", error)
      alert(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  if (!isReady) {
    return (
      <div className="p-4 border rounded-lg bg-secondary/40">
        <p className="text-muted-foreground">Connect your wallet to interact with the program</p>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="font-display text-lg">Program Integration Example</h3>
      
      <div className="space-y-2 text-sm font-mono">
        <p>Program ID: <span className="text-primary">BYkMeRVSt8mvV2sxhd6eQhH5qp3JszfKimunZ7jDqpZA</span></p>
        <p>Network: <span className="text-primary">Devnet</span></p>
        <p>Wallet: <span className="text-primary">{wallet.publicKey?.toString().slice(0, 8)}...</span></p>
        <p>Status: <span className="text-green-500">Connected</span></p>
      </div>

      <div className="space-y-2">
        <h4 className="font-mono text-xs uppercase text-muted-foreground">Fee Structure</h4>
        <div className="grid grid-cols-2 gap-2 text-sm font-mono">
          <div>2x Leverage: {(getTotalFeeBps(2) / 100).toFixed(1)}%</div>
          <div>3x Leverage: {(getTotalFeeBps(3) / 100).toFixed(1)}%</div>
          <div>5x Leverage: {(getTotalFeeBps(5) / 100).toFixed(1)}%</div>
          <div>10x Leverage: {(getTotalFeeBps(10) / 100).toFixed(1)}%</div>
        </div>
      </div>

      <button
        onClick={createToken}
        disabled={loading}
        className="w-full bg-primary text-primary-foreground py-2 rounded-md font-display uppercase disabled:opacity-50"
      >
        {loading ? "Creating..." : "Create Test Token"}
      </button>

      {txSignature && (
        <div className="p-2 bg-green-500/10 border border-green-500/20 rounded text-sm">
          <p className="font-mono text-green-500">Success!</p>
          <a 
            href={`https://explorer.solana.com/tx/${txSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline break-all"
          >
            View on Explorer
          </a>
        </div>
      )}
    </div>
  )
}
