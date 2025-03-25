/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Categories` will be added. If there are existing duplicate values, this will fail.
  - Made the column `categoryName` on table `Items` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Items" DROP CONSTRAINT "Items_categoryName_fkey";

-- AlterTable
ALTER TABLE "Items" ADD COLUMN     "manufacturedYear" INTEGER,
ALTER COLUMN "categoryName" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Categories_name_key" ON "Categories"("name");

-- AddForeignKey
ALTER TABLE "Items" ADD CONSTRAINT "Items_categoryName_fkey" FOREIGN KEY ("categoryName") REFERENCES "Categories"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
