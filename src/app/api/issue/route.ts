import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createPartiallySignedMintTransaction, completeMintTransaction } from '@/lib/solana-server';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Log all certificate details
    console.log('Certificate Issuance Request:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'certTitle', 'issueDate', 'walletAddress', 'createdBy'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Create a certificate object that matches our Prisma schema
    const certificate = {
      name: data.name,
      email: data.email,
      certTitle: data.certTitle,
      description: data.description || null,
      issueDate: new Date(data.issueDate),
      walletAddress: data.walletAddress,
      createdBy: data.createdBy,
      // These fields will be populated after minting the NFT
      mintAddress: null,
      txSignature: null,
      imageUrl: null
      // createdAt and updatedAt are handled automatically by Prisma
    };
    
    // Store the certificate in the database using Prisma
    let savedCertificate = await prisma.certificate.create({
      data: certificate
    });
    
    console.log('Certificate saved to database:', savedCertificate);
    
    try {
      // Create metadata for the NFT
      const nftMetadata = {
        name: certificate.certTitle,
        description: certificate.description || `Certificate for ${certificate.name}`,
        recipient: certificate.name,
        issueDate: certificate.issueDate,
        issuer: certificate.createdBy,
        // In a production environment, we would include an image URL here
      };
      
      // Check if we have a serialized transaction from the frontend
      if (data.signedTransaction) {
        // Complete the transaction with the signature from the frontend
        const { txSignature } = await completeMintTransaction(data.signedTransaction);
        
        // Update the certificate with blockchain details
        savedCertificate = await prisma.certificate.update({
          where: { id: savedCertificate.id },
          data: {
            txSignature,
            // The mint address should have been saved in the initial certificate creation
          }
        });
        
        console.log('NFT minting transaction completed:', {
          txSignature,
          certificateId: savedCertificate.id
        });
      } else {
        // Create a partially signed transaction for the frontend to complete
        const { serializedTransaction, mintAddress } = await createPartiallySignedMintTransaction(
          certificate.createdBy, // Issuer wallet address (will pay gas)
          certificate.walletAddress, // Recipient wallet address
          nftMetadata
        );
        
        // Update the certificate with the mint address
        // The transaction signature will be added after the frontend completes the transaction
        savedCertificate = await prisma.certificate.update({
          where: { id: savedCertificate.id },
          data: {
            mintAddress
          }
        });
        
        // Include the serialized transaction in the response
        // The frontend will need to sign and submit this transaction
        return NextResponse.json({ 
          success: true, 
          message: 'Certificate created. Please sign the transaction to mint the NFT.',
          data: {
            certificate: savedCertificate,
            serializedTransaction
          }
        });
      }
    } catch (error) {
      console.error('Error preparing NFT transaction:', error);
      // We'll continue even if NFT transaction preparation fails, but log the error
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Certificate successfully saved to database',
      data: savedCertificate 
    });
  } catch (error) {
    console.error('Error processing certificate issuance:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process certificate issuance request' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve all certificates (for testing purposes)
export async function GET() {
  const certificates = await prisma.certificate.findMany();
  return NextResponse.json({ 
    success: true, 
    data: certificates 
  });
}
