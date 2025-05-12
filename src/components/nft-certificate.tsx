'use client';

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL, Connection } from "@solana/web3.js";
import { Metaplex, keypairIdentity, walletAdapterIdentity } from "@metaplex-foundation/js";
import { SOLANA_RPC_URL, SOLANA_EXPLORER_URL, SOLANA_NETWORK, CONNECTION_CONFIG } from "@/lib/solana-config";
import { waitForTransaction, getTransactionDetails } from "@/lib/solana-utils";

interface NFTCertificateProps {
  certificateId: string;
  name: string;
  description: string;
  imageUrl?: string;
  issueDate: string;
}

export default function NFTCertificate({
  certificateId,
  name,
  description,
  imageUrl = 'https://via.placeholder.com/500?text=Certificate',
  issueDate,
}: NFTCertificateProps) {
  // Create a connection using the Alchemy RPC URL with HTTP-only mode (no WebSockets)
  const connection = new Connection(SOLANA_RPC_URL, CONNECTION_CONFIG);
  const wallet = useWallet();
  
  const [connected, setConnected] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [txId, setTxId] = useState<string>("");
  const [nftMint, setNftMint] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    setConnected(wallet.connected);
  }, [wallet.connected]);

  const mintNFTCertificate = async () => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      setError("Please connect your wallet");
      return;
    }

    setLoading(true);
    setError("");
    
    try {
      // Initialize Metaplex with wallet adapter identity
      const metaplex = Metaplex.make(connection).use(walletAdapterIdentity(wallet));
      
      // Create the NFT with metadata
      const { nft, response } = await metaplex
        .nfts()
        .create({
          uri: imageUrl,
          name: `Certificate: ${name}`,
          sellerFeeBasisPoints: 0, // No royalties
          symbol: "CERT",
          creators: [
            {
              address: wallet.publicKey,
              share: 100,
            },
          ],
          isMutable: true,
        });

      // Get the transaction signature
      const txSignature = response.signature;
      
      // Wait for transaction confirmation using our reliable approach
      console.log('Waiting for transaction confirmation...');
      await waitForTransaction(connection, txSignature);
      
      // Get transaction details to verify success
      const txDetails = await getTransactionDetails(connection, txSignature);
      console.log('Transaction confirmed:', txDetails ? 'Success' : 'Details not available');
      
      setNftMint(nft.address.toString());
      setTxId(txSignature);
      
      // Update the NFT with additional metadata
      await metaplex.nfts().update({
        nftOrSft: nft,
        name: `Certificate: ${name}`,
        symbol: "CERT",
        uri: imageUrl,
        sellerFeeBasisPoints: 0,
      });

      setNftMint(nft.address.toString());
      setTxId(nft.address.toString()); // Use address instead of mintAddress
      
      // Save the NFT mint to your database
      try {
        const response = await fetch('/api/update-certificate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            certificateId,
            mintAddress: nft.address.toString(),
            txSignature: txId, // Using the transaction ID as the signature
          }),
        });
        
        const result = await response.json();
        if (!response.ok) {
          console.error("Failed to update certificate in database", result);
        }
      } catch (dbError) {
        console.error("Failed to update certificate in database", dbError);
        // Continue even if DB update fails
      }
      
    } catch (err) {
      console.error("Error minting NFT:", err);
      setError(err instanceof Error ? err.message : "Failed to mint NFT certificate");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">NFT Certificate</h2>
      
      <div className="mb-4">
        <p className="text-sm mb-2">Connect your wallet to mint this certificate as an NFT on Solana</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <WalletMultiButton className="!bg-amber-600 hover:!bg-amber-700" />
          {connected && <WalletDisconnectButton className="!bg-gray-600 hover:!bg-gray-700" />}
        </div>
      </div>
      
      {connected && (
        <button
          onClick={mintNFTCertificate}
          disabled={loading}
          className="w-full px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Minting NFT...
            </>
          ) : "Mint as NFT"}
        </button>
      )}
      
      {error && (
        <div className="mt-4 p-3 rounded-md bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <p>{error}</p>
        </div>
      )}
      
      {txId && (
        <div className="mt-4 p-3 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <p className="font-semibold mb-1">NFT Minted Successfully!</p>
          <div className="text-xs space-y-1">
            <p className="truncate">NFT Mint: {nftMint}</p>
            <p className="truncate">Transaction ID: {txId}</p>
            <a 
              href={`${SOLANA_EXPLORER_URL}/address/${nftMint}?cluster=${SOLANA_NETWORK}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-600 hover:underline block mt-2"
            >
              View on Solana Explorer
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
