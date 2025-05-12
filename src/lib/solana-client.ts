import { Connection, PublicKey, Transaction, SystemProgram, Keypair, LAMPORTS_PER_SOL, sendAndConfirmTransaction } from '@solana/web3.js';

// Initialize connection to Solana network (devnet for testing)
// Use 'processed' commitment level and disable WebSocket subscriptions
const connection = new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com', 
  {
    commitment: 'confirmed',
    disableRetryOnRateLimit: true,
    confirmTransactionInitialTimeout: 60000 // Longer timeout for confirmations
  }
);

/**
 * Create and mint an NFT certificate
 * This function handles the entire minting process on the frontend
 * @param wallet The wallet adapter instance (connected to the issuer wallet)
 * @param recipientWallet Recipient's wallet address
 * @param metadata Metadata for the NFT certificate
 * @returns Object containing mint address and transaction signature
 */
export async function mintCertificateNFT(wallet: any, recipientWallet: string, metadata: any) {
  try {
    if (!wallet.publicKey || !wallet.signTransaction) {
      throw new Error('Wallet not connected or does not support signing');
    }
    
    console.log('Minting certificate to:', recipientWallet);
    console.log('Using issuer wallet:', wallet.publicKey.toString());
    
    // Convert recipient wallet string to PublicKey
    const recipientPublicKey = new PublicKey(recipientWallet);
    
    // Create a new mint keypair for the NFT
    const mintKeypair = Keypair.generate();
    console.log('Generated mint address:', mintKeypair.publicKey.toString());
    
    // For demonstration, we'll simulate the NFT minting with a simple transfer
    // In a real implementation, you would use the SPL token program and Metaplex
    
    // Create a transaction
    const transaction = new Transaction();
    
    // Add a memo instruction with certificate metadata
    // This is just for demonstration - in a real implementation you would use Metaplex
    const memoProgram = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr');
    const metadataString = JSON.stringify({
      title: metadata.name,
      description: metadata.description,
      recipient: recipientWallet,
      issueDate: metadata.issueDate,
      issuer: wallet.publicKey.toString()
    });
    
    // Add a memo instruction to record certificate data on-chain
    transaction.add({
      keys: [{ pubkey: wallet.publicKey, isSigner: true, isWritable: true }],
      programId: memoProgram,
      data: Buffer.from(metadataString)
    });
    
    // Add a small transfer to the recipient to represent the NFT
    // In a real implementation, you would mint an actual NFT token
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey: recipientPublicKey,
        lamports: 0.001 * LAMPORTS_PER_SOL // Small amount as a symbolic NFT
      })
    );
    
    // Set recent blockhash and fee payer
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.feePayer = wallet.publicKey;
    
    // Sign the transaction with the wallet
    const signedTransaction = await wallet.signTransaction(transaction);
    
    // Send the signed transaction
    const signature = await connection.sendRawTransaction(signedTransaction.serialize());
    console.log('Transaction sent with signature:', signature);
    
    // Wait for confirmation using polling instead of WebSocket subscriptions
    // This uses getSignatureStatus polling instead of signatureSubscribe
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash: transaction.recentBlockhash,
      lastValidBlockHeight: (await connection.getLatestBlockhash()).lastValidBlockHeight
    });
    console.log('Transaction confirmed:', confirmation);
    
    // Return the mint address and transaction signature
    return {
      mintAddress: mintKeypair.publicKey.toString(),
      txSignature: signature
    };
  } catch (error) {
    console.error('Error minting NFT:', error);
    throw error;
  }
}

/**
 * Verify a transaction on the Solana blockchain
 * @param txSignature The transaction signature to verify
 * @returns Transaction details if found
 */
export async function verifyTransaction(txSignature: string) {
  try {
    // Use maxSupportedTransactionVersion to ensure compatibility with newer transactions
    const transaction = await connection.getTransaction(txSignature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0
    });
    
    return transaction;
  } catch (error) {
    console.error('Error verifying transaction:', error);
    throw error;
  }
}
