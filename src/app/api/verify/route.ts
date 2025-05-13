import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const certificateId = searchParams.get('id');
    const walletAddress = searchParams.get('wallet');

    if (certificateId) {
      // Verify by certificate ID
      const certificate = await prisma.certificate.findUnique({
        where: { id: certificateId }
      });

      if (!certificate) {
        return NextResponse.json(
          { success: false, message: 'Certificate not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Certificate verified successfully',
        data: certificate
      });
    } else if (walletAddress) {
      // Verify by wallet address
      const certificates = await prisma.certificate.findMany({
        where: { walletAddress }
      });

      return NextResponse.json({
        success: true,
        message: `Found ${certificates.length} certificates for this wallet`,
        data: certificates
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Missing certificate ID or wallet address' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error verifying certificate:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify certificate' },
      { status: 500 }
    );
  }
}
