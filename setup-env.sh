#!/bin/bash

# Create .env.local file with database connection string
cat > .env.local << EOL
# Database connection
DATABASE_URL="postgresql://postgres:1234@localhost:5432/decerts?schema=public"

# Solana RPC URL (using Devnet for testing)
NEXT_PUBLIC_SOLANA_RPC_URL="https://api.devnet.solana.com"
SOLANA_RPC_URL="https://api.devnet.solana.com"
EOL

echo "Environment variables set up successfully!"
echo "Run 'pnpm prisma db push' to create the database schema"
echo "Then run 'pnpm dev' to start the application"
