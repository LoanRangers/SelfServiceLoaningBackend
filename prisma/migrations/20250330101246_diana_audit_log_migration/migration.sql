/*
  Warnings:

  - You are about to drop the column `Info` on the `AuditLogs` table. All the data in the column will be lost.
  - Added the required column `Details` to the `AuditLogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CRUD" ADD VALUE 'LOGIN';
ALTER TYPE "CRUD" ADD VALUE 'LOGOUT';
ALTER TYPE "CRUD" ADD VALUE 'LOAN_DEVICE';
ALTER TYPE "CRUD" ADD VALUE 'RETURN_DEVICE';
ALTER TYPE "CRUD" ADD VALUE 'FLAG_DEVICE';
ALTER TYPE "CRUD" ADD VALUE 'SCAN_QR';
ALTER TYPE "CRUD" ADD VALUE 'FAILED_LOGIN';

-- AlterTable
ALTER TABLE "AuditLogs" DROP COLUMN "Info",
ADD COLUMN     "Details" JSONB NOT NULL,
ADD COLUMN     "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
