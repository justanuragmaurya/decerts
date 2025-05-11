import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const data = await request.json();
    
    // Log update request
    console.log('Certificate Update Request:', JSON.stringify(data, null, 2));
    
    // Validate required fields
    const requiredFields = ['certificateId', 'mintAddress', 'txSignature'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Update the certificate with blockchain details
    const updatedCertificate = await prisma.certificate.update({
      where: { id: data.certificateId },
      data: {
        mintAddress: data.mintAddress,
        txSignature: data.txSignature,
        updatedAt: new Date()
      }
    });
    
    console.log('Certificate updated with blockchain details:', updatedCertificate);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Certificate updated with blockchain details',
      data: updatedCertificate 
    });
  } catch (error) {
    console.error('Error updating certificate:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update certificate' },
      { status: 500 }
    );
  }
}
