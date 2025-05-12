// Solana configuration

// RPC URL for Solana devnet
export const SOLANA_RPC_URL = 'https://solana-devnet.g.alchemy.com/v2/xA-0RDCgTabMWJ-50AyFqCNLVMiU1jcH';

// Network to use
export const SOLANA_NETWORK = 'devnet';

// Explorer URL base
export const SOLANA_EXPLORER_URL = 'https://explorer.solana.com';

// Import the Commitment type from web3.js
import { Commitment } from '@solana/web3.js';

// Connection config with HTTP-only mode (no WebSockets)
export const CONNECTION_CONFIG = {
  commitment: 'confirmed' as Commitment,
  disableRetryOnRateLimit: false,
  confirmTransactionInitialTimeout: 60000, // 60 seconds
};
