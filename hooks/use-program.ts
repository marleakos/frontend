"use client"

import { useMemo } from "react"
import { Connection, PublicKey } from "@solana/web3.js"
import { AnchorProvider, Program } from "@coral-xyz/anchor"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"
import { IDL, LeveragedMemeIDL } from "@/lib/idl"
import { PROGRAM_ID, RPC_URL } from "@/lib/program-config"

export function useProgram() {
  const { connection } = useConnection()
  const wallet = useWallet()

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction) return null
    return new AnchorProvider(
      connection,
      {
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction,
        signAllTransactions: wallet.signAllTransactions || (async (txs) => txs),
      },
      { commitment: "confirmed" }
    )
  }, [connection, wallet.publicKey, wallet.signTransaction, wallet.signAllTransactions])

  const program = useMemo(() => {
    if (!provider) return null
    return new Program(IDL as any, provider)
  }, [provider])

  return {
    program,
    provider,
    connection,
    wallet,
    programId: PROGRAM_ID,
    isReady: !!program && wallet.connected,
  }
}

export function useConnectionOnly() {
  const connection = useMemo(() => {
    return new Connection(RPC_URL, "confirmed")
  }, [])

  return { connection }
}
