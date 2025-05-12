import { Connection, PublicKey, TransactionSignature } from '@solana/web3.js';

/**
 * Wait for a transaction to be confirmed using a more reliable approach
 * that doesn't depend solely on WebSocket subscriptions.
 * 
 * @param connection Solana connection
 * @param signature Transaction signature to wait for
 * @param timeout Timeout in milliseconds
 * @returns Promise that resolves when transaction is confirmed or rejects on timeout
 */
export async function waitForTransaction(
  connection: Connection,
  signature: TransactionSignature,
  timeout = 60000
): Promise<void> {
  const startTime = Date.now();
  
  // Define a function to check transaction status
  const checkStatus = async (): Promise<boolean> => {
    try {
      // Get the signature status
      const { value } = await connection.getSignatureStatus(signature);
      
      // If we have a status and it's confirmed or finalized, we're done
      if (value && (value.confirmationStatus === 'confirmed' || value.confirmationStatus === 'finalized')) {
        return true;
      }
      
      // If we have a status but it has an error, the transaction failed
      if (value && value.err) {
        throw new Error(`Transaction failed: ${JSON.stringify(value.err)}`);
      }
    } catch (error) {
      // If we get an error checking status (not a transaction failure), log and continue
      if (!(error instanceof Error) || !error.message.includes('Transaction failed')) {
        console.warn('Error checking transaction status:', error);
      } else {
        throw error; // Re-throw transaction failures
      }
    }
    
    // Check if we've timed out
    if (Date.now() - startTime > timeout) {
      throw new Error(`Transaction confirmation timeout after ${timeout}ms`);
    }
    
    return false;
  };
  
  // Poll for status until confirmed or timeout
  while (!(await checkStatus())) {
    // Wait a bit before checking again
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

/**
 * Get transaction details after confirmation
 * 
 * @param connection Solana connection
 * @param signature Transaction signature
 * @returns Transaction details
 */
export async function getTransactionDetails(connection: Connection, signature: TransactionSignature) {
  try {
    const transaction = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0,
    });
    return transaction;
  } catch (error) {
    console.error('Error getting transaction details:', error);
    return null;
  }
}
