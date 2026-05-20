# leverage.fun Program Integration

## Program Details

- **Program ID**: `BYkMeRVSt8mvV2sxhd6eQhH5qp3JszfKimunZ7jDqpZA`
- **Network**: Devnet
- **Version**: 0.1.0

## Files Created

1. **`lib/program-config.ts`** - Program configuration and constants
2. **`lib/idl.ts`** - TypeScript IDL for type-safe interactions
3. **`hooks/use-program.ts`** - React hook for program interaction

## Setup

1. Install dependencies:
```bash
npm install
```

2. The program is configured for devnet. Make sure your wallet is set to devnet.

## Usage

### Using the Program Hook

```tsx
import { useProgram } from "@/hooks/use-program"

function MyComponent() {
  const { program, isReady, wallet } = useProgram()

  if (!isReady) {
    return <div>Connect wallet to continue</div>
  }

  // Now you can use program to call instructions
  // program.methods.initializeToken(...)
}
```

### Creating a Token

```tsx
const createToken = async () => {
  if (!program || !wallet.publicKey) return

  const tx = await program.methods
    .initializeToken(
      "My Token",
      "MTK",
      "https://example.com/metadata.json",
      5, // leverage
      { long: {} }, // direction
      { solPerp: {} }, // underlying
      new BN(100000000), // oracle price at launch
      null // referrer (optional)
    )
    .accounts({
      creator: wallet.publicKey,
      tokenMint: mintKeypair.publicKey,
      // ... other accounts
    })
    .rpc()
}
```

### Buying Tokens

```tsx
const buyTokens = async (amount: BN) => {
  if (!program || !wallet.publicKey) return

  const tx = await program.methods
    .buy(amount)
    .accounts({
      buyer: wallet.publicKey,
      tokenState: tokenStatePDA,
      tokenMint: mintPublicKey,
      // ... other accounts
    })
    .rpc()
}
```

## Fee Structure

| Leverage | Trading Fee | Leverage Fee | Total |
|----------|-------------|--------------|-------|
| 2x       | 0.5%        | 0.1%         | 0.6%  |
| 3x       | 0.5%        | 0.2%         | 0.7%  |
| 5x       | 0.5%        | 0.3%         | 0.8%  |
| 10x      | 0.5%        | 0.5%         | 1.0%  |

## Account Structures

### TokenState
- creator: PublicKey
- tokenMint: PublicKey
- name: string
- symbol: string
- uri: string
- curveState: CurveState
- feeVault: PublicKey
- graduated: bool
- ammPool: Option<PublicKey>
- createdAt: i64
- paused: bool
- totalFeesCollected: u64
- leverage: u8
- direction: Direction
- underlying: Underlying
- oraclePriceAtLaunch: u64

### FeeVault
- tokenMint: PublicKey
- totalCollected: u64
- creatorClaimed: u64
- protocolClaimed: u64
- creatorShareBps: u64
- referrer: Option<PublicKey>
- referralRewardsTotal: u64
- referralRewardsClaimed: u64

## Next Steps

1. Implement actual transaction handlers in the UI
2. Add error handling for program errors
3. Set up event listeners for real-time updates
4. Implement PDA derivation for account addresses
5. Add loading states and transaction confirmation
