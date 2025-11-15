/*
  Warnings:

  - You are about to drop the column `fetchedAt` on the `news` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `news` table. All the data in the column will be lost.
  - Added the required column `fetched_at` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `published_at` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "news_publishedAt_idx";

-- AlterTable
ALTER TABLE "news" DROP COLUMN "fetchedAt",
DROP COLUMN "publishedAt",
ADD COLUMN     "fetched_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "published_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "news_published_at_idx" ON "news"("published_at");
