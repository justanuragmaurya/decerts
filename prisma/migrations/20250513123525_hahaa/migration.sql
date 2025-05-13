/*
  Warnings:

  - You are about to drop the column `createdBy` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `mintAddress` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `txSignature` on the `Certificate` table. All the data in the column will be lost.
  - You are about to drop the column `walletAddress` on the `Certificate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Certificate" DROP COLUMN "createdBy",
DROP COLUMN "mintAddress",
DROP COLUMN "txSignature",
DROP COLUMN "walletAddress";
