-- AlterTable
ALTER TABLE "Certificate" ADD COLUMN     "createdBy" TEXT,
ADD COLUMN     "mintAddress" TEXT,
ADD COLUMN     "txSignature" TEXT,
ADD COLUMN     "walletAddress" TEXT;
