// IPFS upload utility using Pinata
// Get your free API key from: https://pinata.cloud

// TODO: Move these to environment variables before production!
const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY || "214bacdbb7f17fc13c49"
const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "2837791842fb8d506e9ceed282a354aaaef3802ef3a7313e13f88c7b2c895061"

export async function uploadToIPFS(
  file: File | Blob,
  name: string
): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API keys not configured")
  }

  const formData = new FormData()
  formData.append("file", file)
  formData.append("pinataMetadata", JSON.stringify({ name }))

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`IPFS upload failed: ${error}`)
  }

  const data = await response.json()
  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
}

export async function uploadMetadataToIPFS(
  metadata: object,
  name: string = "metadata.json"
): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("Pinata API keys not configured")
  }

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
    body: JSON.stringify({
      pinataContent: metadata,
      pinataMetadata: { name },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`IPFS upload failed: ${error}`)
  }

  const data = await response.json()
  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`
}

// Convert data URI to Blob
export function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(",")[1])
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0]
  const ab = new ArrayBuffer(byteString.length)
  const ia = new Uint8Array(ab)
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i)
  }
  return new Blob([ab], { type: mimeString })
}

// Alternative: Use Web3.Storage (new version of NFT.Storage)
export async function uploadToWeb3Storage(
  file: File | Blob,
  name: string
): Promise<string> {
  const WEB3_STORAGE_TOKEN = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN || ""
  
  if (!WEB3_STORAGE_TOKEN) {
    throw new Error("Web3.Storage token not configured")
  }

  const formData = new FormData()
  formData.append("file", file, name)

  const response = await fetch("https://api.web3.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WEB3_STORAGE_TOKEN}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Web3.Storage upload failed: ${response.statusText}`)
  }

  const data = await response.json()
  return `https://${data.cid}.ipfs.w3s.link`
}
