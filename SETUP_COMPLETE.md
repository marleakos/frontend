# leverage.fun Frontend Setup - COMPLETE ✅

## Program Configuration

**Program ID**: `BYkMeRVSt8mvV2sxhd6eQhH5qp3JszfKimunZ7jDqpZA`  
**Network**: Devnet  
**Status**: ✅ Ready to use

## Files Created

### 1. Core Configuration
- **`lib/program-config.ts`** - Program ID, network config, fee structure
- **`lib/idl.ts`** - Complete TypeScript IDL with all instructions
- **`lib/idl.json`** - JSON version of IDL

### 2. Utilities
- **`lib/program-utils.ts`** - PDA derivation, account helpers, calculations
  - `getTokenStatePDA()`
  - `getFeeVaultPDA()`
  - `getUserReferralPDA()`
  - `getInitializeTokenAccounts()`
  - `getBuyAccounts()`
  - `getSellAccounts()`
  - And more...

### 3. React Hooks
- **`hooks/use-program.ts`** - Program interaction hook
  - Returns: `program`, `provider`, `connection`, `wallet`, `isReady`

### 4. Example Component
- **`components/program-example.tsx`** - Working example of token creation

### 5. Dependencies Added
- `@coral-xyz/anchor` ^0.30.1
- `@solana/spl-token` ^0.4.9

## Fee Structure

| Leverage | Trading Fee | Leverage Fee | Total |
|----------|-------------|--------------|-------|
| 2x       | 0.5%        | 0.1%         | 0.6%  |
| 3x       | 0.5%        | 0.2%         | 0.7%  |
| 5x       | 0.5%        | 0.3%         | 0.8%  |
| 10x      | 0.5%        | 0.5%         | 1.0%  |

## Quick Start

### 1. Use the hook in your component:
```tsx
import { useProgram } from "@/hooks/use-program"

function MyComponent() {
  const { program, isReady, wallet } = useProgram()
  
  if (!isReady) return <div>Connect wallet</div>
  
  // Use program here
}
```

### 2. Create a token:
```tsx
import { getInitializeTokenAccounts, getDirectionEnum, getUnderlyingEnum } from "@/lib/program-utils"
import { BN } from "@coral-xyz/anchor"
import { Keypair } from "@solana/web3.js"

const mintKeypair = Keypair.generate()
const accounts = getInitializeTokenAccounts(wallet.publicKey, mintKeypair.publicKey)

const tx = await (program as any).methods
  .initializeToken(
    "Token Name",
    "SYMBOL",
    "https://metadata.json",
    5, // leverage
    getDirectionEnum("LONG"),
    getUnderlyingEnum("SOL"),
    new BN(100000000), // oracle price
    null // referrer
  )
  .accounts({ ...accounts })
  .signers([mintKeypair])
  .rpc()
```

### 3. Buy tokens:
```tsx
import { getBuyAccounts } from "@/lib/program-utils"

const accounts = getBuyAccounts(
  buyer.publicKey,
  tokenMint,
  protocolFeeAccount,
  creatorFeeAccount
)

const tx = await (program as any).methods
  .buy(new BN(amount))
  .accounts({ ...accounts })
  .rpc()
```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure program ID and IDL
3. ✅ Set up hooks and utilities
4. 🔄 Implement actual UI interactions
5. 🔄 Add error handling and loading states
6. 🔄 Set up event listeners for real-time updates

## Testing

Run the development server:
```bash
npm run dev
```

The program is deployed on devnet. Make sure your wallet is set to devnet and has some SOL (you can get devnet SOL from the faucet).

## Important Notes

- All program interactions use `as any` type casting due to IDL type complexity
- The program is on devnet - switch your wallet to devnet before testing
- Fee structure matches the program constants exactly
- PDA derivation uses the correct seeds from the program
