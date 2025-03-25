/*
  Warnings:

  - Added the required column `Info` to the `AuditLogs` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AuditLogs" ADD COLUMN     "Info" JSONB NOT NULL;
