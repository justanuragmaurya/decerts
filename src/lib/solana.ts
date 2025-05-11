import { Connection, Keypair, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction } from '@solana/web3.js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { Buffer } from 'buffer';

// Initialize connection to Solana network (devnet for testing)
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com', 'confirmed');

// Load issuer wallet from environment variable
const getIssuerKeypair = (): Keypair => {
  if (!process.env.ISSUER_PRIVATE_KEY) {
    throw new Error('ISSUER_PRIVATE_KEY environment variable is not set');
  }
  
  const secretKey = Buffer.from(process.env.ISSUER_PRIVATE_KEY, 'base64');
  return Keypair.fromSecretKey(secretKey);
};

/**
 * Mint an NFT certificate to a recipient's wallet
 * @param recipientWallet Recipient's wallet address
 * @param metadata Metadata for the NFT certificate
 * @returns Object containing mint address and transaction signature
 */
export async function mintCertificateNFT(recipientWallet: string, metadata: any) {
  try {
    // Get issuer keypair from environment variable
    const issuerKeypair = getIssuerKeypair();
    
    // Convert recipient wallet string to PublicKey
    const recipientPublicKey = new PublicKey(recipientWallet);
    
    console.log(`Minting certificate NFT to ${recipientWallet}`);
    console.log('Using issuer wallet:', issuerKeypair.publicKey.toString());
    
    // Create a new mint (token)
    const mint = await createMint(
      connection,
      issuerKeypair,  // Payer (pays for transaction fees)
      issuerKeypair.publicKey,  // Mint authority
      null,  // Freeze authority (null = no freeze authority)
      0  // Decimals (0 for NFT)
    );
    
    console.log('Created mint:', mint.toString());
    
    // Get or create associated token account for recipient
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      issuerKeypair,  // Payer
      mint,  // Mint
      recipientPublicKey  // Owner
    );
    
    console.log('Recipient token account:', recipientTokenAccount.address.toString());
    
    // Mint 1 token to recipient (for NFT, we mint exactly 1)
    const signature = await mintTo(
      connection,
      issuerKeypair,  // Payer
      mint,  // Mint
      recipientTokenAccount.address,  // Destination
      issuerKeypair.publicKey,  // Authority
      1  // Amount (1 for NFT)
    );
    
    console.log('Minted NFT with signature:', signature);
    
    // TODO: In a production environment, we would also:
    // 1. Upload metadata to Arweave or IPFS
    // 2. Use Metaplex to attach metadata to the token
    
    return {
      mintAddress: mint.toString(),
      txSignature: signature
    };
  } catch (error) {
    console.error('Error minting certificate NFT:', error);
    throw error;
  }
}
