'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CertificateDetails from '@/components/certificate-details';
import CertificatePreview from '@/components/certificate-preview';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import Link from 'next/link';

type Certificate = {
  id: string;
  name: string;
  email: string;
  certTitle: string;
  description?: string | null;
  issueDate: string;
  imageUrl?: string | null;
  walletAddress?: string | null;
  mintAddress?: string | null;
  txSignature?: string | null;
  createdAt: string;
};

export default function CertificatePage() {
  const params = useParams();
  const certificateId = params.certificateId as string;
  const wallet = useWallet();
  
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCertificate() {
      if (!certificateId) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/verify?id=${encodeURIComponent(certificateId)}`);
        const result = await response.json();
        
        if (result.success && result.data) {
          setCertificate(result.data);
        } else {
          setError(result.message || 'Certificate not found');
        }
      } catch (err) {
        console.error('Error fetching certificate:', err);
        setError('Failed to load certificate. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchCertificate();
  }, [certificateId]);

  // Function to handle minting the certificate as NFT
  const handleMintCertificate = async () => {
    if (!certificate || !wallet.connected) return;
    
    // Redirect to the issue page with the certificate ID
    window.location.href = `/issue?mint=${certificate.id}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading certificate...</p>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-destructive/10 border border-destructive text-destructive px-6 py-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Certificate Not Found</h2>
          <p>{error || 'The requested certificate could not be found.'}</p>
          <div className="mt-4">
            <Link 
              href="/verify" 
              className="text-primary hover:underline"
            >
              Go to Verification Page
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link 
          href="/verify" 
          className="text-primary hover:underline flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Verification
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-center mb-8 text-foreground">Certificate</h1>
      
      {/* Certificate Preview */}
      <div className="mb-12">
        <CertificatePreview
          name={certificate.name}
          certTitle={certificate.certTitle}
          description={certificate.description || ''}
          issueDate={certificate.issueDate}
          mintAddress={certificate.mintAddress}
          certificateId={certificate.id}
        />
      </div>
      
      {/* Certificate Details Section */}
      <h2 className="text-2xl font-semibold mb-6 text-foreground">Certificate Details</h2>
      <CertificateDetails certificate={certificate} />
      
      {/* NFT Minting Section */}
      {!certificate.mintAddress && (
        <div className="mt-8 bg-card rounded-lg shadow-md p-6 border border-border">
          <h2 className="text-xl font-semibold mb-4 text-card-foreground">Mint as NFT</h2>
          <p className="text-muted-foreground mb-4">
            This certificate hasn't been minted as an NFT yet. Connect your wallet to mint it to the blockchain.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {!wallet.connected ? (
              <div className="w-full sm:w-auto">
                <WalletMultiButton />
              </div>
            ) : (
              <button
                onClick={handleMintCertificate}
                className="w-full sm:w-auto bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                Mint Certificate as NFT
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Share Section */}
      <div className="mt-8 bg-card rounded-lg shadow-md p-6 border border-border">
        <h2 className="text-xl font-semibold mb-4 text-card-foreground">Share Certificate</h2>
        <p className="text-muted-foreground mb-4">
          Share this certificate with others using the link below:
        </p>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            readOnly
            value={typeof window !== 'undefined' ? window.location.href : ''}
            className="flex-grow px-4 py-2 border border-input bg-background rounded-md text-foreground"
          />
          <button
            onClick={() => {
              if (typeof navigator !== 'undefined') {
                navigator.clipboard.writeText(window.location.href);
                alert('Certificate link copied to clipboard!');
              }
            }}
            className="bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            Copy Link
          </button>
        </div>
      </div>
    </div>
  );
}
