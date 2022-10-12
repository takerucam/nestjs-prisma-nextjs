/*
  Warnings:

  - You are about to drop the column `nickNmae` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "nickNmae",
ADD COLUMN     "nickName" TEXT;
