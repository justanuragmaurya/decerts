"use client"
import React, { useEffect, useState } from 'react';
import { ThemeToggle } from './ui/theme-toggle';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import wallet buttons with SSR disabled to prevent hydration errors
const WalletMultiButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletMultiButton),
  { ssr: false }
);

const WalletDisconnectButton = dynamic(
  () => import('@solana/wallet-adapter-react-ui').then(mod => mod.WalletDisconnectButton),
  { ssr: false }
);

const Header = () => {
  // State to track if we're on the client side
  const [mounted, setMounted] = useState(false);
  
  // Set mounted to true on client-side hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-transparent text-foreground border-b">
      <div className="flex items-center space-x-2">
        <Link href={"/"}>
        <img
          src={"logo.png"}
          alt="DeCerts Logo"
          className='h-10'
        /></Link>
      </div>

      <nav className="hidden md:flex items-center space-x-6 text-lg font-medium">
        <Link href={"/"}><h1>Home</h1></Link>
        <Link href={"/issue"}><h1>Issue</h1></Link>
        <Link href={"/verify"}><h1>Verify</h1></Link>
        <ThemeToggle />
        {/* Only render wallet buttons on the client side */}
        {mounted && (
          <>
            <WalletMultiButton />
            <WalletDisconnectButton />
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;