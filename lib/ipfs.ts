// IPFS upload utility using NFT.Storage
// Get your free API key from: https://nft.storage

const NFT_STORAGE_API_KEY = process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY || ""

export async function uploadToIPFS(
  file: File | Blob,
  name: string
): Promise<string> {
  if (!NFT_STORAGE_API_KEY) {
    throw new Error("NFT_STORAGE_API_KEY not configured")
  }

  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("https://api.nft.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`IPFS upload failed: ${response.statusText}`)
  }

  const data = await response.json()
  return `https://ipfs.io/ipfs/${data.value.cid}`
}

export async function uploadMetadataToIPFS(
  metadata: object
): Promise<string> {
  if (!NFT_STORAGE_API_KEY) {
    throw new Error("NFT_STORAGE_API_KEY not configured")
  }

  const blob = new Blob([JSON.stringify(metadata)], {
    type: "application/json",
  })

  const formData = new FormData()
  formData.append("file", blob, "metadata.json")

  const response = await fetch("https://api.nft.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${NFT_STORAGE_API_KEY}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`IPFS upload failed: ${response.statusText}`)
  }

  const data = await response.json()
  return `https://ipfs.io/ipfs/${data.value.cid}`
}

// Alternative: Use data URI for small images (fallback)
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
