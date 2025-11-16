/*
  Warnings:

  - A unique constraint covering the columns `[article_id]` on the table `news` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `article_id` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `creator` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `link` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pub_date` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pub_date_tz` to the `news` table without a default value. This is not possible if the table is not empty.
  - Added the required column `source_url` to the `news` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "news" ADD COLUMN     "article_id" TEXT NOT NULL,
ADD COLUMN     "category" "Category"[],
ADD COLUMN     "creator" TEXT NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "image_url" TEXT,
ADD COLUMN     "link" TEXT NOT NULL,
ADD COLUMN     "pub_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "pub_date_tz" TEXT NOT NULL,
ADD COLUMN     "source_url" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "news_article_id_key" ON "news"("article_id");
