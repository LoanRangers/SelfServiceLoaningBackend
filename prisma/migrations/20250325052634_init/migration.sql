-- CreateEnum
CREATE TYPE "CRUD" AS ENUM ('CREATE', 'READ', 'UPDATE', 'DELETE');

-- CreateEnum
CREATE TYPE "Table" AS ENUM ('Items', 'LoanedItem', 'LoanedItemsHistory', 'Locations', 'Categories', 'FlagsOnItems', 'Flags');

-- CreateTable
CREATE TABLE "AuditLogs" (
    "LogId" TEXT NOT NULL,
    "ssoId" TEXT NOT NULL,
    "Action" "CRUD" NOT NULL,
    "Table" "Table" NOT NULL,

    CONSTRAINT "AuditLogs_pkey" PRIMARY KEY ("LogId")
);

-- AddForeignKey
ALTER TABLE "AuditLogs" ADD CONSTRAINT "AuditLogs_ssoId_fkey" FOREIGN KEY ("ssoId") REFERENCES "Users"("ssoId") ON DELETE RESTRICT ON UPDATE CASCADE;
