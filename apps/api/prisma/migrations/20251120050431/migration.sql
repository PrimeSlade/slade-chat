/*
  Warnings:

  - The values [SPORT] on the enum `Category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Category_new" AS ENUM ('BUSINESS', 'CRIME', 'DOMESTIC', 'EDUCATION', 'ENTERTAINMENT', 'ENVIRONMENT', 'FOOD', 'HEALTH', 'LIFESTYLE', 'OTHER', 'POLITICS', 'SCIENCE', 'SPORTS', 'TECHNOLOGY', 'TOURISM', 'TOP', 'WORLD');
ALTER TABLE "users" ALTER COLUMN "categories" TYPE "Category_new"[] USING ("categories"::text::"Category_new"[]);
ALTER TABLE "news" ALTER COLUMN "category" TYPE "Category_new"[] USING ("category"::text::"Category_new"[]);
ALTER TYPE "Category" RENAME TO "Category_old";
ALTER TYPE "Category_new" RENAME TO "Category";
DROP TYPE "public"."Category_old";
COMMIT;
