'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Transaction } from '@solana/web3.js';
import CertificatePreview from '@/components/certificate-preview';
import { mintCertificateNFT } from '@/lib/solana-client';

function IssuePage() {
  const { connected, publicKey, signTransaction } = useWallet();
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState('manual');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    certTitle: '',
    description: '',
    issueDate: '',
    walletAddress: ''
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
  const [isMinting, setIsMinting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string;
    certificateId?: string;
    mintAddress?: string;
    txSignature?: string;
  }>({});

  // Get connection from wallet adapter
  const { connection } = useConnection();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({});
    try {
      // First save the certificate to the database
      // Format the date for the API and add the connected wallet address
      const formattedData = {
        ...formData,
        issueDate: formData.issueDate ? new Date(formData.issueDate).toISOString() : null,
        createdBy: publicKey ? publicKey.toBase58() : ''
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
        setSubmitStatus({
          success: true,
          message: 'Certificate saved to database. Ready to mint NFT.',
          certificateId: result.data.id
        });
        console.log('Certificate saved:', result.data);
      } else {
        throw new Error(result.message || 'Failed to issue certificate');
      }
    } catch (error) {
      console.error('Error submitting certificate data:', error);
      setSubmitStatus({
        success: false,
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle minting the NFT on the frontend
  const handleMintNFT = async () => {
    if (!publicKey || !signTransaction) {
      setSubmitStatus({
        success: false,
        message: 'Unable to mint NFT. Wallet not connected.'
      });
      return;
    }
    
    setIsMinting(true);
    try {
      // Create metadata for the NFT
      const nftMetadata = {
        name: formData.certTitle,
        description: formData.description || `Certificate for ${formData.name}`,
        recipient: formData.name,
        issueDate: formData.issueDate,
        // In a production environment, we would include an image URL here
      };
      
      // Mint the NFT using the connected wallet (issuer)
      const { mintAddress, txSignature } = await mintCertificateNFT(
        { publicKey, signTransaction },
        formData.walletAddress,
        nftMetadata
      );
      
      console.log('NFT minted successfully:', { mintAddress, txSignature });
      
      // Update the certificate in the database with blockchain details
      const updateResponse = await fetch('/api/update-certificate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateId: submitStatus.certificateId,
          mintAddress,
          txSignature
        }),
      });
      
      const updateResult = await updateResponse.json();
      
      if (updateResponse.ok) {
        setSubmitStatus({
          success: true,
          message: 'NFT minted successfully! Certificate is now on the blockchain.',
          certificateId: submitStatus.certificateId,
          mintAddress,
          txSignature
        });
        console.log('Certificate updated with blockchain details:', updateResult);
      } else {
        throw new Error(updateResult.message || 'Failed to update certificate with blockchain details');
      }
    } catch (error) {
      console.error('Error minting NFT:', error);
      setSubmitStatus({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to mint NFT',
        certificateId: submitStatus.certificateId
      });
    } finally {
      setIsMinting(false);
    }
  };


  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <h1 className="text-2xl font-bold text-center">Connect Your Wallet</h1>
        <p className="text-center max-w-md mb-4">Please connect your wallet to access the certificate issuance page.</p>
        <WalletMultiButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-6">Issue Certificate</h1>
      
      {/* Tab buttons */}
      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('manual')} 
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'manual' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
        >
          Enter Participant Details
        </button>
        <button 
          onClick={() => setActiveTab('csv')} 
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === 'csv' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
          disabled
        >
          Upload CSV <span className="text-xs ml-1 opacity-70">(Coming Soon)</span>
        </button>
      </div>
      
      {/* Content based on active tab */}
      {activeTab === 'manual' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="p-6 border rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Participant Details</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-1">Full Name</label>
                <input 
                  type="text" 
                  id="name" 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Enter participant's full name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Enter participant's email"
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
                  placeholder="e.g., Completion Certificate, Achievement Award"
                  value={formData.certTitle}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-1">Description</label>
                <textarea 
                  id="description" 
                  rows={3} 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Brief description of the achievement or certificate purpose"
                  value={formData.description}
                  onChange={handleInputChange}
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
                <label htmlFor="walletAddress" className="block text-sm font-medium mb-1">Recipient Wallet Address</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    id="walletAddress" 
                    className="w-full p-2 border rounded-md" 
                    placeholder="Enter participant's Solana wallet address"
                    value={formData.walletAddress}
                    onChange={handleInputChange}
                    required
                  />
                  <button 
                    type="button" 
                    className="px-3 py-2 bg-secondary rounded-md text-xs"
                    onClick={() => setFormData({...formData, walletAddress: publicKey ? publicKey.toBase58() : ''})}
                    title="Use your connected wallet address"
                  >
                    Use Mine
                  </button>
                </div>
                <p className="text-xs mt-1 opacity-70">NFT will be minted to this wallet address</p>
              </div>
              <button 
                type="submit" 
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : 'Generate Certificate'}
              </button>
              
              {/* Status message */}
              {submitStatus.message && (
                <div className={`mt-4 p-3 rounded-md ${submitStatus.success ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                  <p>{submitStatus.message}</p>
                  
                  {/* Show mint NFT button if certificate is saved but not yet minted */}
                  {submitStatus.success && submitStatus.certificateId && !submitStatus.txSignature && (
                    <button
                      type="button"
                      onClick={handleMintNFT}
                      className="mt-3 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors flex items-center justify-center w-full"
                      disabled={isMinting}
                    >
                      {isMinting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Minting NFT...
                        </>
                      ) : 'Mint NFT Certificate'}
                    </button>
                  )}
                  
                  {/* Show transaction details if NFT was minted */}
                  {submitStatus.txSignature && submitStatus.mintAddress && (
                    <div className="mt-3 text-xs">
                      <p className="font-semibold">NFT Details:</p>
                      <p className="truncate">Mint Address: {submitStatus.mintAddress}</p>
                      <p className="truncate">Transaction: {submitStatus.txSignature}</p>
                    </div>
                  )}
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