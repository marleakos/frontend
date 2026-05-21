"use client"

import { useState } from "react"
import { useWallet } from "@solana/wallet-adapter-react"
import { Connection } from "@solana/web3.js"
import { toast } from "sonner"
import { createPumpFunToken, storeTokenMetadata } from "../pump-deploy"
import { RPC_URL } from "@/lib/program-config"

export default function TestPumpDeploy() {
  const { connected, publicKey, signTransaction } = useWallet()
  const [isDeploying, setIsDeploying] = useState(false)
  const [name, setName] = useState("Test Token")
  const [symbol, setSymbol] = useState("TEST")
  
  const handleDeploy = async () => {
    if (!connected || !publicKey || !signTransaction) {
      toast.error("Please connect wallet")
      return
    }
    
    setIsDeploying(true)
    toast.loading("Creating token on Pump.fun...", { id: "deploy" })
    
    try {
      const connection = new Connection(RPC_URL, "confirmed")
      
      const { transaction, mint } = await createPumpFunToken(
        connection,
        publicKey,
        {
          name,
          symbol,
          uri: "https://pump.fun/token/test",
          leverage: 3,
          direction: "LONG",
          underlying: "SOL"
        }
      )
      
      // Set blockhash and fee payer
      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
      transaction.feePayer = publicKey
      
      // Sign
      const signed = await signTransaction(transaction)
      
      // Send
      const signature = await connection.sendRawTransaction(signed.serialize())
      await connection.confirmTransaction(signature, "confirmed")
      
      // Store metadata
      await storeTokenMetadata(mint.publicKey.toString(), {
        name,
        symbol,
        uri: "https://pump.fun/token/test",
        leverage: 3,
        direction: "LONG",
        underlying: "SOL"
      })
      
      toast.success(`Token created! Mint: ${mint.publicKey.toString().slice(0, 8)}...`, { id: "deploy" })
      console.log("Transaction:", signature)
      console.log("Mint:", mint.publicKey.toString())
      
    } catch (error: any) {
      console.error("Deploy error:", error)
      toast.error(error.message || "Failed to create token", { id: "deploy" })
    } finally {
      setIsDeploying(false)
    }
  }
  
  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Test Pump.fun Deploy</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Token Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button
          onClick={handleDeploy}
          disabled={isDeploying || !connected}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          {isDeploying ? "Creating..." : "Create Token on Pump.fun"}
        </button>
      </div>
    </div>
  )
}
