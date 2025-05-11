'use client';

import React from 'react';

interface CertificatePreviewProps {
  name: string;
  certTitle: string;
  description: string;
  issueDate: string;
}

const CertificatePreview: React.FC<CertificatePreviewProps> = ({
  name,
  certTitle,
  description,
  issueDate
}) => {
  // Format the date for display
  const formattedDate = issueDate ? new Date(issueDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  return (
    <div className="h-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl aspect-[4/3] bg-gradient-to-br from-gray-900 to-gray-800 border-8 border-gray-700 rounded-lg shadow-2xl p-8 flex flex-col items-center justify-between text-center relative overflow-hidden">
        {/* Certificate Border */}
        <div className="absolute inset-0 border-[12px] border-double border-amber-500/30 m-4 pointer-events-none"></div>
        
        {/* Certificate Header */}
        <div className="mt-6 z-10 w-full">
          <h3 className="text-2xl font-serif text-amber-400 tracking-wider">CERTIFICATE OF ACHIEVEMENT</h3>
          <div className="w-48 h-1 bg-amber-500 mx-auto my-3"></div>
        </div>
        
        {/* Certificate Content */}
        <div className="flex-1 flex flex-col items-center justify-center z-10 px-6 py-4 w-full">
          <p className="text-base text-gray-300 mb-3">This certifies that</p>
          <h2 className="text-3xl font-bold font-serif mb-3 text-white">{name || 'Recipient Name'}</h2>
          <p className="text-base text-gray-300 mb-4">has successfully completed</p>
          <h3 className="text-2xl font-semibold mb-3 text-amber-400">{certTitle || 'Certificate Title'}</h3>
          <p className="text-sm italic max-w-md text-gray-300">{description || 'Certificate description will appear here.'}</p>
        </div>
        
        {/* Certificate Footer */}
        <div className="mt-auto mb-6 z-10 w-full">
          <p className="text-base text-gray-300 mb-2">{formattedDate || 'Issue Date'}</p>
          <div className="w-48 h-px bg-amber-500/70 mx-auto my-3"></div>
          <div className="flex items-center justify-center gap-2">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-400">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
            </svg>
            <p className="text-lg font-semibold tracking-widest text-amber-400">DECERTS</p>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-amber-400">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="currentColor" />
            </svg>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-40 h-40 border-t-4 border-l-4 border-amber-500/30 rounded-tl-lg"></div>
        <div className="absolute bottom-0 right-0 w-40 h-40 border-b-4 border-r-4 border-amber-500/30 rounded-br-lg"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500 opacity-5 rounded-full"></div>
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -mr-12 -mt-12"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/10 rounded-full -ml-12 -mb-12"></div>
      </div>
    </div>
  );
};

export default CertificatePreview;
