// Fetch token metadata from Solana blockchain (Metaplex)
import { Connection, PublicKey } from '@solana/web3.js'

const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
const METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')

export interface TokenMetadata {
  name: string
  symbol: string
  description?: string
  image?: string
  creator?: string
}

// Helper to decode UTF-8 string from buffer
function decodeString(buffer: Buffer, offset: number): { value: string; newOffset: number } {
  const length = buffer.readUInt32LE(offset)
  const value = buffer.slice(offset + 4, offset + 4 + length).toString('utf8').replace(/\x00/g, '')
  return { value, newOffset: offset + 4 + length }
}

// Fetch metadata from Metaplex on-chain
export async function getTokenMetadata(mintAddress: string): Promise<TokenMetadata | null> {
  try {
    const connection = new Connection(RPC_URL, 'confirmed')
    const mint = new PublicKey(mintAddress)
    
    // Derive metadata account address
    const [metadataAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer()],
      METAPLEX_PROGRAM_ID
    )
    
    const accountInfo = await connection.getAccountInfo(metadataAccount)
    if (!accountInfo) {
      console.log('No metadata account found for', mintAddress)
      return null
    }
    
    const data = accountInfo.data
    
    // Parse Metaplex metadata v1
    // Format: key (1) + update_authority (32) + mint (32) + name_len + name + symbol_len + symbol + uri_len + uri
    let offset = 1 // Skip key
    offset += 32 // Skip update_authority
    offset += 32 // Skip mint
    
    // Parse name
    const nameResult = decodeString(data, offset)
    const name = nameResult.value
    offset = nameResult.newOffset
    
    // Parse symbol
    const symbolResult = decodeString(data, offset)
    const symbol = symbolResult.value
    offset = symbolResult.newOffset
    
    // Parse URI (this contains the metadata JSON with image URL)
    const uriResult = decodeString(data, offset)
    const uri = uriResult.value
    
    console.log('Metaplex metadata:', { name, symbol, uri })
    
    // Fetch the metadata JSON to get the image
    let image: string | undefined = undefined
    let description: string | undefined = undefined
    
    // ALWAYS try to construct image URL from URI first (faster, no fetch needed)
    if (uri) {
      console.log('Metadata URI:', uri)
      
      // Extract IPFS hash from URI
      let ipfsHash: string | null = null
      
      if (uri.startsWith('ipfs://')) {
        ipfsHash = uri.replace('ipfs://', '').split('/')[0]
      } else if (uri.includes('/ipfs/')) {
        ipfsHash = uri.split('/ipfs/')[1]?.split('/')[0]
      }
      
      console.log('Extracted IPFS hash:', ipfsHash)
      
      // For pump.fun tokens, the image is usually at the same IPFS hash with /image or similar
      // Try common patterns
      if (ipfsHash) {
        // Fetch metadata through our API route (bypasses CORS)
        try {
          const apiUrl = `/api/metadata?uri=${encodeURIComponent(uri)}`
          console.log('Fetching metadata via API:', apiUrl)
          
          const response = await fetch(apiUrl)
          
          if (response.ok) {
            const metadata = await response.json()
            console.log('Got metadata from API:', metadata)
            
            if (metadata.image) {
              image = metadata.image
              // Convert IPFS URLs to HTTP
              if (image.startsWith('ipfs://')) {
                image = image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
              }
              console.log('Got image from metadata:', image)
            }
          } else {
            console.log('API returned error:', response.status)
          }
        } catch (e) {
          console.log('Metadata API fetch failed:', e)
        }
      }
    }
    
    return { name, symbol, image }
  } catch (e) {
    console.error('Error fetching token metadata:', e)
    return null
  }
}

// Get token info with metadata
export async function getTokenInfo(mintAddress: string): Promise<TokenMetadata | null> {
  return getTokenMetadata(mintAddress)
}
