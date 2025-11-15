-- AlterTable
ALTER TABLE "users" ALTER COLUMN "categories" SET DEFAULT ARRAY['WORLD']::"Category"[];
