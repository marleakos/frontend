import { Connection, PublicKey } from '@solana/web3.js';

const METAPLEX_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');
const mint = new PublicKey('q9KaeK9y1TjficEjUjwEFsHLgt32LGqrqF2gpXvLJz1');

const [metadataAccount] = PublicKey.findProgramAddressSync(
  [Buffer.from('metadata'), METAPLEX_PROGRAM_ID.toBuffer(), mint.toBuffer()],
  METAPLEX_PROGRAM_ID
);

console.log('Metadata PDA:', metadataAccount.toString());
