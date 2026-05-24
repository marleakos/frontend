import type { Metadata } from "next"
import { Space_Grotesk, JetBrains_Mono, Bungee } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { WalletProvider } from "@/components/wallet-provider"
import "./globals.css"

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})
const bungee = Bungee({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})

export const metadata: Metadata = {
  title: "leverage.fun — leveraged meme launchpad",
  description: "launch leveraged meme coins with 2x-10x leverage. fair launch on a bonding curve. powered by pyth oracles.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${bungee.variable} bg-background`}
    >
      <body className="font-sans antialiased">
        <WalletProvider>
          {children}
        </WalletProvider>
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
