/*
  Warnings:

  - The primary key for the `QRCodes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `guid` on the `QRCodes` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `QRCodes` table. All the data in the column will be lost.
  - The `id` column on the `QRCodes` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "QRCodes_guid_key";

-- AlterTable
ALTER TABLE "QRCodes" DROP CONSTRAINT "QRCodes_pkey",
DROP COLUMN "guid",
DROP COLUMN "name",
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "QRCodes_pkey" PRIMARY KEY ("id");
