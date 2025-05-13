'use client';

import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import CertificateDetails from '@/components/certificate-details';

function VerifyPage() {
  const wallet = useWallet();
  const [certificateId, setCertificateId] = useState('');
  const [verificationResult, setVerificationResult] = useState<{
    success?: boolean;
    message?: string;
    data?: any;
  }>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState('id'); // 'id' or 'wallet'

  // Verify certificate by ID
  const verifyCertificateById = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!certificateId.trim()) return;
    
    setIsVerifying(true);
    setVerificationResult({});
    
    try {
      const response = await fetch(`/api/verify?id=${encodeURIComponent(certificateId)}`);
      const result = await response.json();
      
      setVerificationResult(result);
    } catch (error) {
      console.error('Error verifying certificate:', error);
      setVerificationResult({
        success: false,
        message: 'Failed to verify certificate. Please try again.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // Verify certificates by wallet address
  const verifyCertificatesByWallet = async () => {
    if (!wallet.publicKey) return;
    
    setIsVerifying(true);
    setVerificationResult({});
    
    try {
      const walletAddress = wallet.publicKey.toString();
      const response = await fetch(`/api/verify?wallet=${encodeURIComponent(walletAddress)}`);
      const result = await response.json();
      
      setVerificationResult(result);
    } catch (error) {
      console.error('Error verifying certificates by wallet:', error);
      setVerificationResult({
        success: false,
        message: 'Failed to verify certificates. Please try again.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8 text-foreground">Verify Certificate</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b mb-6 border-border">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'id' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('id')}
        >
          Verify by Certificate ID
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'wallet' ? 'text-primary border-b-2 border-primary' : 'text-muted-foreground'}`}
          onClick={() => setActiveTab('wallet')}
        >
          Verify by Wallet
        </button>
      </div>
      
      {/* Verify by ID */}
      {activeTab === 'id' && (
        <div className="bg-card rounded-lg shadow-md p-6 mb-8 border border-border">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">Enter Certificate ID</h2>
          <form onSubmit={verifyCertificateById} className="space-y-4">
            <div>
              <label htmlFor="certificateId" className="block text-sm font-medium text-muted-foreground mb-1">
                Certificate ID
              </label>
              <input
                type="text"
                id="certificateId"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                placeholder="Enter the certificate ID to verify"
                className="w-full px-4 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isVerifying || !certificateId.trim()}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify Certificate'}
            </button>
          </form>
        </div>
      )}
      
      {/* Verify by Wallet */}
      {activeTab === 'wallet' && (
        <div className="bg-card rounded-lg shadow-md p-6 mb-8 border border-border">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">Connect Your Wallet</h2>
          <p className="text-muted-foreground mb-4">
            Connect your Solana wallet to verify certificates associated with your address.
          </p>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="w-full flex justify-center mb-2">
              <WalletMultiButton />
            </div>
            
            {wallet.connected && (
              <button
                onClick={verifyCertificatesByWallet}
                disabled={isVerifying}
                className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isVerifying ? 'Verifying...' : 'Find My Certificates'}
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Verification Results */}
      {verificationResult.success === false && (
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded relative mb-6" role="alert">
          <strong className="font-bold">Verification Failed: </strong>
          <span className="block sm:inline">{verificationResult.message}</span>
        </div>
      )}
      
      {verificationResult.success === true && verificationResult.data && !Array.isArray(verificationResult.data) && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-center text-foreground">Certificate Details</h2>
          <CertificateDetails certificate={verificationResult.data} />
        </div>
      )}
      
      {verificationResult.success === true && verificationResult.data && Array.isArray(verificationResult.data) && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Your Certificates</h2>
          {verificationResult.data.length === 0 ? (
            <div className="bg-warning/10 border border-warning text-warning-foreground px-4 py-3 rounded relative" role="alert">
              No certificates found for this wallet address.
            </div>
          ) : (
            <div className="space-y-8">
              {verificationResult.data.map((cert) => (
                <CertificateDetails key={cert.id} certificate={cert} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default VerifyPage;