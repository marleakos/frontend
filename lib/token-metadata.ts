// Fetch token metadata from multiple sources
import { Connection, PublicKey } from '@solana/web3.js'

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'

export interface TokenMetadata {
  name: string
  symbol: string
  description?: string
  image?: string
  creator?: string
}

// Fetch metadata from Solana token account
export async function getTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  try {
    const connection = new Connection(RPC_URL, 'confirmed')
    const mint = new PublicKey(mintAddress)
    
    // Get the largest token account to find the creator
    const largestAccounts = await connection.getTokenLargestAccounts(mint)
    const creator = largestAccounts.value[0]?.address.toString() || ""
    
    // Try to fetch metadata from Metaplex
    try {
      const metadataAccount = PublicKey.findProgramAddressSync(
        [
          Buffer.from('metadata'),
          new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
          mint.toBuffer()
        ],
        new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
      )[0]
      
      const accountInfo = await connection.getAccountInfo(metadataAccount)
      if (accountInfo) {
        // Parse metadata (simplified - real parsing would need more work)
        const data = accountInfo.data
        // Skip discriminator and parse name/symbol
        // This is a simplified version - Metaplex metadata parsing is complex
        const nameLength = data.readUInt32LE(69)
        const name = data.slice(73, 73 + nameLength).toString('utf8').replace(/\x00/g, '')
        
        const symbolStart = 73 + nameLength
        const symbolLength = data.readUInt32LE(symbolStart)
        const symbol = data.slice(symbolStart + 4, symbolStart + 4 + symbolLength).toString('utf8').replace(/\x00/g, '')
        
        return { name, symbol, creator }
      }
    } catch (e) {
      console.log('Metaplex metadata not found')
    }
    
    return null
  } catch (e) {
    console.error('Error fetching token metadata:', e)
    return null
  }
}

// Try multiple sources to get token info
export async function getTokenInfo(mintAddress: string): Promise<TokenMetadata | null> {
  // Try Solana metadata first
  const solanaMetadata = await getTokenMetadata(mintAddress)
  if (solanaMetadata) return solanaMetadata
  
  // If all fails, return null
  return null
}
