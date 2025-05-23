import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Log certificate details
    console.log('Certificate Issuance Request:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'certTitle', 'issueDate'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Create a certificate object that matches our Prisma schema
    // Use the wallet address from the request if available
    const certificate = {
      name: data.name,
      email: data.email,
      certTitle: data.certTitle,
      description: data.description || null,
      issueDate: new Date(data.issueDate),
      // Use recipient wallet address if provided, otherwise use the connected wallet address
      walletAddress: data.recipientWallet || data.walletAddress || 'N/A',
      // Use the connected wallet address as the creator
      createdBy: data.walletAddress || 'system',
      // Optional blockchain fields
      mintAddress: null,
      txSignature: null,
      imageUrl: null
      // createdAt and updatedAt are handled automatically by Prisma
    };
    
    try {
      // Store the certificate in the database using Prisma
      const savedCertificate = await prisma.certificate.create({
        data: certificate
      });
      
      console.log('Certificate saved to database:', savedCertificate);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Certificate successfully saved',
        data: savedCertificate 
      });
    } catch (error) {
      console.error('Error processing certificate issuance:', error);
      return NextResponse.json(
        { success: false, message: 'Database error: ' + (error instanceof Error ? error.message : 'Unknown error') },
        { status: 500 }
      );
    }
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
