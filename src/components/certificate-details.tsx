import React from 'react';
import { formatDate } from '@/lib/utils';

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

interface CertificateDetailsProps {
  certificate: Certificate;
}

const CertificateDetails: React.FC<CertificateDetailsProps> = ({ certificate }) => {
  return (
    <div className="bg-card rounded-lg shadow-md p-6 max-w-3xl mx-auto border border-border">
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-2xl font-bold text-card-foreground">{certificate.certTitle}</h2>
        <div className="bg-success/20 text-success text-xs font-medium px-2.5 py-0.5 rounded-full">
          Verified
        </div>
      </div>

      {certificate.imageUrl && (
        <div className="mb-6 flex justify-center">
          <img 
            src={certificate.imageUrl} 
            alt="Certificate" 
            className="max-w-full h-auto rounded-md shadow-sm" 
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Recipient</h3>
          <p className="text-lg font-semibold text-foreground">{certificate.name}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
          <p className="text-lg text-foreground">{certificate.email}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Issue Date</h3>
          <p className="text-lg text-foreground">{formatDate(new Date(certificate.issueDate))}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Certificate ID</h3>
          <p className="text-sm font-mono bg-muted p-1 rounded overflow-x-auto text-foreground">
            {certificate.id}
          </p>
        </div>
      </div>

      {certificate.description && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-1">Description</h3>
          <p className="text-foreground">{certificate.description}</p>
        </div>
      )}

      {certificate.mintAddress && (
        <div className="border-t border-border pt-4 mt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Blockchain Verification</h3>
          <div className="space-y-2">
            <div>
              <span className="text-xs font-medium text-muted-foreground">NFT Address:</span>
              <p className="text-sm font-mono bg-muted p-1 rounded overflow-x-auto text-foreground">
                {certificate.mintAddress}
              </p>
            </div>
            {certificate.txSignature && (
              <div>
                <span className="text-xs font-medium text-muted-foreground">Transaction:</span>
                <p className="text-sm font-mono bg-muted p-1 rounded overflow-x-auto text-foreground">
                  {certificate.txSignature}
                </p>
                <a 
                  href={`https://explorer.solana.com/tx/${certificate.txSignature}?cluster=devnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-xs mt-1 inline-block"
                >
                  View on Solana Explorer
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-muted-foreground mt-6 text-center">
        This certificate was issued on {formatDate(new Date(certificate.createdAt))} and is cryptographically secured.
      </div>
    </div>
  );
};

export default CertificateDetails;
