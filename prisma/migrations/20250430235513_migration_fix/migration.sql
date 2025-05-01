-- AlterTable
ALTER TABLE "AuditLogs" ALTER COLUMN "Details" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Locations" ADD COLUMN     "description" TEXT;

-- CreateTable
CREATE TABLE "QRCodes" (
    "id" TEXT NOT NULL,
    "guid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QRCodes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QRCodes_guid_key" ON "QRCodes"("guid");
