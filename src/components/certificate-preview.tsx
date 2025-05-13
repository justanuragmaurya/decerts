'use client';

import React from 'react';

interface CertificatePreviewProps {
  name: string;
  certTitle: string;
  description: string;
  issueDate: string;
  mintAddress?: string | null;
  certificateId?: string;
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  name,
  certTitle,
  description,
  issueDate,
  mintAddress,
  certificateId
}) => {
  // Format the date for display
  const formattedDate = issueDate ? new Date(issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl aspect-[4/3] bg-white rounded-lg shadow-2xl p-8 flex flex-col items-center justify-between text-center relative overflow-hidden">
        {/* Geometric Patterns - Left Side */}
        <div className="absolute left-0 top-0 bottom-0 w-24 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div key={`left-line-${i}`} className="absolute" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 150 + 50}px`,
              height: '1px',
              background: 'rgba(20, 184, 166, 0.5)',
              transform: `rotate(${Math.random() * 180}deg)`
            }}></div>
          ))}
          {[...Array(5)].map((_, i) => (
            <div key={`left-dot-${i}`} className="absolute rounded-full" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: 'rgba(20, 184, 166, 0.8)'
            }}></div>
          ))}
        </div>
        
        {/* Geometric Patterns - Right Side */}
        <div className="absolute right-0 top-0 bottom-0 w-24 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div key={`right-line-${i}`} className="absolute" style={{
              right: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 150 + 50}px`,
              height: '1px',
              background: 'rgba(20, 184, 166, 0.5)',
              transform: `rotate(${Math.random() * 180}deg)`
            }}></div>
          ))}
          {[...Array(5)].map((_, i) => (
            <div key={`right-dot-${i}`} className="absolute rounded-full" style={{
              right: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${Math.random() * 6 + 2}px`,
              height: `${Math.random() * 6 + 2}px`,
              background: 'rgba(20, 184, 166, 0.8)'
            }}></div>
          ))}
        </div>
        
        {/* Certificate Header */}
        <div className="mt-6 z-10 w-full">
          <h3 className="text-3xl font-bold tracking-wider text-gray-900">CERTIFICATE</h3>
          <p className="text-lg uppercase tracking-widest text-gray-600">OF APPRECIATION</p>
          <div className="w-48 h-0.5 bg-teal-500 mx-auto my-3"></div>
        </div>
        
        {/* Certificate Content */}
        <div className="flex-1 flex flex-col items-center justify-center z-10 px-6 py-4 w-full">
          <div className="w-full bg-teal-500 py-2 mb-6">
            <p className="text-white font-medium tracking-wider">PROUDLY PRESENTED TO</p>
          </div>
          
          <h2 className="text-4xl font-bold text-teal-600 mb-4 font-serif">{name || 'Recipient Name'}</h2>
          
          <p className="text-sm uppercase text-gray-600 mb-2 tracking-wider">{certTitle || 'Certificate Title'}</p>
          
          <p className="text-sm max-w-md text-gray-500 mb-6">{description || 'Certificate description will appear here.'}</p>
          
          <div className="flex justify-between w-full max-w-md mt-8">
            <div className="text-center">
              <div className="w-32 border-b border-gray-400 mb-1"></div>
              <p className="text-sm text-gray-600">DATE</p>
              <p className="text-sm text-gray-800">{formattedDate || 'Issue Date'}</p>
            </div>
            
            <div className="text-center">
              <div className="w-32 border-b border-gray-400 mb-1"></div>
              <p className="text-sm text-gray-600">SIGNATURE</p>
              <p className="text-sm text-teal-600 font-medium">DECERTS</p>
            </div>
          </div>
        </div>
        
        {/* Certificate ID - Bottom Left Corner */}
        {certificateId && (
          <div className="absolute bottom-4 left-4 text-left z-20 max-w-[30%]">
            <p className="text-xs text-teal-600 font-medium">Certificate ID</p>
            <p className="text-[8px] font-mono text-gray-600 break-all">{certificateId}</p>
          </div>
        )}
        
        {/* NFT Address - Bottom Right Corner */}
        {mintAddress && (
          <div className="absolute bottom-4 right-4 text-right z-20 max-w-[30%]">
            <p className="text-xs text-teal-600 font-medium">NFT Address</p>
            <p className="text-[8px] font-mono text-gray-600 break-all">{mintAddress}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificatePreview;
