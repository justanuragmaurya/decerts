"use client"
import {
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';
import React from 'react';
import { ThemeToggle } from './ui/theme-toggle';
import Link from 'next/link';

const Header = () => {
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
        <WalletMultiButton />
        <WalletDisconnectButton />
      </nav>
    </header>
  );
};

export default Header;