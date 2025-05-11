'use client';

import React, { useEffect, useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

function Dashboard() {
  const { connected } = useWallet();
  const [isClient, setIsClient] = useState(false);

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
    </div>
  )
}

export default Dashboard;