/*
  Warnings:

  - The `creator` column on the `news` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "news" ALTER COLUMN "content" DROP NOT NULL,
DROP COLUMN "creator",
ADD COLUMN     "creator" TEXT[];
