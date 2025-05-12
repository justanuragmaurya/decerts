// Script to check and fix database connection
require('dotenv').config({ path: '.env.local' });
const { exec } = require('child_process');
const fs = require('fs');

// Function to execute shell commands
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return reject(error);
      }
      if (stderr) {
        console.error(`Command stderr: ${stderr}`);
      }
      resolve(stdout);
    });
  });
}

async function fixDatabase() {
  console.log('Checking Docker container...');
  
  try {
    // Check if Docker container is running
    const dockerPs = await execCommand('docker ps');
    const containerRunning = dockerPs.includes('DeCertDB');
    
    if (!containerRunning) {
      console.log('PostgreSQL container not running. Starting it...');
      await execCommand('docker run --name DeCertDB -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres');
      console.log('PostgreSQL container started.');
    } else {
      console.log('PostgreSQL container is already running.');
    }
    
    // Create a new .env.local file with the correct connection string
    const envContent = `# Database connection\nDATABASE_URL="postgresql://postgres:postgres@localhost:5432/decerts"\n\n# Solana RPC URL (using Devnet for testing)\nNEXT_PUBLIC_SOLANA_RPC_URL="https://solana-devnet.g.alchemy.com/v2/xA-0RDCgTabMWJ-50AyFqCNLVMiU1jcH"\nSOLANA_RPC_URL="https://solana-devnet.g.alchemy.com/v2/xA-0RDCgTabMWJ-50AyFqCNLVMiU1jcH"\n`;
    
    fs.writeFileSync('.env.local', envContent);
    console.log('Created .env.local with correct database connection string.');
    
    // Create the database if it doesn't exist
    console.log('Creating database if it doesn\'t exist...');
    await execCommand('docker exec DeCertDB psql -U postgres -c "CREATE DATABASE decerts;" || true');
    
    // Run Prisma migration
    console.log('Running Prisma migration...');
    await execCommand('npx prisma db push');
    
    console.log('\nDatabase setup completed successfully!');
    console.log('You can now restart your Next.js application with: pnpm dev');
  } catch (error) {
    console.error('Error fixing database:', error);
  }
}

fixDatabase();
