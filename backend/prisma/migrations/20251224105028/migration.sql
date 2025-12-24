-- AlterEnum
ALTER TYPE "FriendStatus" ADD VALUE 'UNFRIENDED';

-- AlterTable
ALTER TABLE "friend_ships" ADD COLUMN     "deletedAt" TIMESTAMP(3);
