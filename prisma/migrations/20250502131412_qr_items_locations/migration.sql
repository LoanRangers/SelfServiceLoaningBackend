-- AlterTable
ALTER TABLE "Items" ADD COLUMN     "qr" INTEGER;

-- AlterTable
ALTER TABLE "Locations" ADD COLUMN     "qr" INTEGER;

-- AddForeignKey
ALTER TABLE "Items" ADD CONSTRAINT "Items_qr_fkey" FOREIGN KEY ("qr") REFERENCES "QRCodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locations" ADD CONSTRAINT "Locations_qr_fkey" FOREIGN KEY ("qr") REFERENCES "QRCodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
