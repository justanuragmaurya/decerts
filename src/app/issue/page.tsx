'use client';

import React, { useState } from 'react';
import CertificatePreview from '@/components/certificate-preview';
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, Connection } from "@solana/web3.js";
import { SOLANA_RPC_URL, SOLANA_EXPLORER_URL, SOLANA_NETWORK, CONNECTION_CONFIG } from "@/lib/solana-config";
import { waitForTransaction, getTransactionDetails } from "@/lib/solana-utils";
import { mintNFTCertificate as mintNFTWithTokenProgram } from "@/lib/token-program";

function IssuePage() {
  const [activeTab, setActiveTab] = useState('manual');
  // Create a connection using the Alchemy RPC URL with WebSockets disabled
  const connection = new Connection(SOLANA_RPC_URL, CONNECTION_CONFIG);
  const wallet = useWallet();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    certTitle: '',
    description: '',
    issueDate: '',
    recipientWallet: ''
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };
  
  // State for tracking submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
    certificateId?: string;
    nftMint?: string;
    txId?: string;
  }>({});

  // Mint NFT certificate
  const mintNFTCertificate = async (certificateId: string) => {
    if (!wallet.publicKey || !wallet.connected) {
      return { success: false, message: "Please connect your wallet first" };
    }
    
    // Validate recipient wallet address if provided
    let recipientAddress = wallet.publicKey;
    if (formData.recipientWallet) {
      try {
        recipientAddress = new PublicKey(formData.recipientWallet);
      } catch (error) {
        return { success: false, message: "Invalid recipient wallet address" };
      }
    }
    
    try {
      // Use the Token Program to mint an NFT
      const { mint, txId } = await mintNFTWithTokenProgram(
        connection,
        wallet,
        formData.name,
        "CERT", // symbol
        formData.description,
        'https://via.placeholder.com/500?text=Certificate', // imageUrl
        recipientAddress // optional recipient address
      );

      // Wait for transaction confirmation using our reliable approach
      console.log('Waiting for transaction confirmation...');
      await waitForTransaction(connection, txId);
      
      // Get transaction details to verify success
      const txDetails = await getTransactionDetails(connection, txId);
      
      // Log success information
      console.log('NFT minted successfully:', {
        mint: mint,
        owner: recipientAddress.toString(),
        txId: txId,
        txDetails: txDetails ? 'Transaction confirmed' : 'Transaction details not available'
      });
      
      // Save the NFT mint to your database with better error handling
      try {
        const response = await fetch('/api/update-certificate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            certificateId,
            mintAddress: mint,
            txSignature: txId,
          }),
        });
        
        const result = await response.json();
        if (!response.ok) {
          console.error("Failed to update certificate in database", result);
          // Continue even if DB update fails
        }
      } catch (dbError) {
        console.error("Failed to update certificate in database", dbError);
        // Continue even if DB update fails
      }
      
      return { 
        success: true, 
        message: "Certificate minted as NFT successfully!", 
        nftMint: mint, 
        txId 
      };
    } catch (error) {
      console.error("Error minting NFT:", error);
      return { success: false, message: error instanceof Error ? error.message : "Failed to mint NFT certificate" };
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({});
    
    try {
      // Format the data for submission
      const formattedData = {
        ...formData,
        issueDate: formData.issueDate ? new Date(formData.issueDate).toISOString() : null
      };
      
      console.log('Submitting certificate data:', formattedData);
      
      // Send data to the API endpoint to create the certificate
      const response = await fetch('/api/issue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Certificate saved to database successfully
        console.log('Certificate saved:', result.data);
        
        // If wallet is connected, mint NFT
        if (wallet.connected && wallet.publicKey) {
          setSubmitStatus({
            success: true,
            message: 'Certificate generated. Minting NFT...',
            certificateId: result.data.id
          });
          
          // Mint NFT
          const nftResult = await mintNFTCertificate(result.data.id);
          
          if (nftResult.success) {
            setSubmitStatus({
              success: true,
              message: 'Certificate generated and NFT minted successfully!',
              certificateId: result.data.id,
              nftMint: nftResult.nftMint,
              txId: nftResult.txId
            });
          } else {
            setSubmitStatus({
              success: true,
              message: `Certificate generated but NFT minting failed: ${nftResult.message}`,
              certificateId: result.data.id
            });
          }
        } else {
          // No wallet connected, just show certificate success
          setSubmitStatus({
            success: true,
            message: 'Certificate generated successfully! Connect wallet to mint as NFT.',
            certificateId: result.data.id
          });
        }
      } else {
        throw new Error(result.message || 'Failed to save certificate');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      setSubmitStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Issue New Certificate</h1>
      
      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 ${activeTab === 'manual' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('manual')}
        >
          Manual Entry
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'csv' ? 'border-b-2 border-amber-500 text-amber-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('csv')}
        >
          CSV Upload
        </button>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'manual' ? (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Certificate Details</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Recipient Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Enter recipient's full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Recipient Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Enter recipient's email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="certTitle" className="block text-sm font-medium mb-1">Certificate Title</label>
                <input 
                  type="text" 
                  id="certTitle" 
                  className="w-full p-2 border rounded-md" 
                  placeholder="e.g., Certificate of Completion"
                  value={formData.certTitle}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  id="description" 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Enter certificate description or achievement details"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                ></textarea>
              </div>
              
              <div>
                <label htmlFor="issueDate" className="block text-sm font-medium mb-1">Issue Date</label>
                <input 
                  type="date" 
                  id="issueDate" 
                  className="w-full p-2 border rounded-md" 
                  value={formData.issueDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="recipientWallet" className="block text-sm font-medium mb-1">
                  Recipient Wallet Address
                  <span className="ml-1 text-xs text-gray-500">(optional)</span>
                </label>
                <input 
                  type="text" 
                  id="recipientWallet" 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Solana wallet address to receive the NFT"
                  value={formData.recipientWallet}
                  onChange={handleInputChange}
                />
                <p className="text-xs text-gray-500 mt-1">
                  If left empty, the NFT will be minted to your connected wallet
                </p>
              </div>
              
              <button 
                type="submit" 
                className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : 'Generate Certificate'}
              </button>
              
              {/* Status message */}
              {submitStatus.message && (
                <div className={`mt-4 p-3 rounded-md ${submitStatus.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                  <p>{submitStatus.message}</p>
                  {submitStatus.certificateId && (
                    <div className="mt-3 text-xs">
                      <p className="font-semibold">Certificate Details:</p>
                      <p className="truncate">Certificate ID: {submitStatus.certificateId}</p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Wallet Connection Section */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Connect Wallet to Mint NFT Certificate</label>
                <div className="flex items-center gap-2">
                  <WalletMultiButton className="!bg-amber-600 hover:!bg-amber-700" />
                  <span className="text-xs opacity-70">{wallet.connected ? "Wallet Connected" : "Connect wallet to mint NFT"}</span>
                </div>
              </div>
              
              {/* NFT Details (only shown after NFT is minted) */}
              {submitStatus.success && submitStatus.nftMint && (
                <div className="mt-4 p-3 rounded-md bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  <p className="font-semibold mb-1">NFT Minted Successfully!</p>
                  <div className="text-xs space-y-1">
                    <p className="truncate">NFT Mint: {submitStatus.nftMint}</p>
                    {submitStatus.txId && <p className="truncate">Transaction ID: {submitStatus.txId}</p>}
                    <a 
                      href={`${SOLANA_EXPLORER_URL}/address/${submitStatus.nftMint}?cluster=${SOLANA_NETWORK}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-amber-600 hover:underline block mt-2"
                    >
                      View on Solana Explorer
                    </a>
                  </div>
                </div>
              )}
            </form>
          </div>
          
          {/* Certificate Preview Section */}
          <div className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Certificate Preview</h2>
            <CertificatePreview 
              name={formData.name}
              certTitle={formData.certTitle}
              description={formData.description}
              issueDate={formData.issueDate}
            />
          </div>
        </div>
      ) : (
        <div className="p-6 border rounded-lg shadow-sm flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-4xl mb-4 opacity-50">📄</div>
          <h2 className="text-xl font-semibold mb-2">CSV Upload Coming Soon</h2>
          <p className="text-center max-w-md opacity-70">
            Soon you'll be able to upload a CSV file with multiple participants to generate certificates in bulk.
          </p>
        </div>
      )}
    </div>
  )
}

export default IssuePage;