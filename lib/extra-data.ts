export type Trader = {
  rank: number
  user: string
  pnl: number
  volume: number
  trades: number
  winRate: number
}

export const traders: Trader[] = [
  { rank: 1, user: "9xQe...4Rk", pnl: 482400, volume: 2840000, trades: 412, winRate: 71 },
  { rank: 2, user: "Hk2p...9Lm", pnl: 312800, volume: 1920000, trades: 298, winRate: 64 },
  { rank: 3, user: "Zx81...2Ap", pnl: 244100, volume: 1640000, trades: 244, winRate: 68 },
  { rank: 4, user: "Mn4q...7Vc", pnl: 189200, volume: 1410000, trades: 188, winRate: 59 },
  { rank: 5, user: "Pl9k...3Nb", pnl: 142500, volume: 988000, trades: 156, winRate: 62 },
  { rank: 6, user: "Ty3w...8Df", pnl: 118400, volume: 812000, trades: 122, winRate: 55 },
  { rank: 7, user: "Qa8r...1Ws", pnl: 98200, volume: 740000, trades: 102, winRate: 60 },
  { rank: 8, user: "Vb2x...5Hg", pnl: 76300, volume: 612000, trades: 88, winRate: 57 },
  { rank: 9, user: "Cx7n...4Jk", pnl: 54200, volume: 488000, trades: 71, winRate: 53 },
  { rank: 10, user: "Re5t...8Yu", pnl: 41100, volume: 392000, trades: 64, winRate: 51 },
]

export type FeeRow = { label: string; value: string; note: string }
export const fees: FeeRow[] = [
  { label: "Deploy token", value: "~0.02 SOL", note: "network fee only" },
  { label: "Trading fee", value: "1%", note: "goes to token creator" },
]

export const faqs = [
  {
    q: "what is a leveraged meme token?",
    a: "tokens that track reference assets (SOL, BTC, ETH) with 2x-10x leverage. price moves with the underlying asset multiplied by leverage.",
  },
  {
    q: "how does graduation work?",
    a: "tokens trade on a bonding curve until 85 SOL market cap. at graduation the bonding curve completes and the token trades on the open market.",
  },
  {
    q: "what is liquidation risk?",
    a: "there is no liquidation risk. you hold actual SPL tokens. the price can go down but you cannot be liquidated.",
  },
  {
    q: "long vs short tokens?",
    a: "LONG tokens go up when the underlying goes up, SHORT tokens go up when it goes down. both are leveraged.",
  },
  {
    q: "where does the price come from?",
    a: "pyth network oracles provide real-time price data for all reference assets.",
  },
]
