import { PublicKey } from '@solana/web3.js';

const PUMP_FUN_PROGRAM = new PublicKey('6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P');
const mint = new PublicKey('q9KaeK9y1TjficEjUjwEFsHLgt32LGqrqF2gpXvLJz1');

const [bondingCurve] = PublicKey.findProgramAddressSync(
  [Buffer.from('bonding-curve'), mint.toBuffer()],
  PUMP_FUN_PROGRAM
);

console.log('Token mint:', mint.toString());
console.log('Bonding curve PDA:', bondingCurve.toString());
