import { Connection, PublicKey } from "@solana/web3.js"
import { Program, AnchorProvider } from "@coral-xyz/anchor"
import { IDL } from "./lib/idl"

const PROGRAM_ID = new PublicKey("BYkMeRVSt8mvV2sxhd6eQhH5qp3JszfKimunZ7jDqpZA")
const RPC_URL = "https://api.devnet.solana.com"

async function testProgram() {
  console.log("Testing program connection...")
  console.log("Program ID:", PROGRAM_ID.toString())
  
  const connection = new Connection(RPC_URL, "confirmed")
  
  // Create a dummy provider (read-only)
  const provider = new AnchorProvider(
    connection,
    {} as any,
    { commitment: "confirmed" }
  )
  
  const program = new Program(IDL as any, provider)
  
  try {
    console.log("\nFetching all token states...")
    const accounts = await (program as any).account.tokenState.all()
    console.log(`Found ${accounts.length} tokens`)
    
    if (accounts.length > 0) {
      console.log("\nFirst token:")
      const first = accounts[0].account
      console.log("  Name:", first.name)
      console.log("  Symbol:", first.symbol)
      console.log("  Creator:", first.creator?.toString())
      console.log("  Leverage:", first.leverage)
      console.log("  Graduated:", first.graduated)
    } else {
      console.log("\nNo tokens found yet. Ready to create one!")
    }
    
    console.log("\n✅ Program connection successful!")
  } catch (error) {
    console.error("\n❌ Error:", error)
  }
}

testProgram()
