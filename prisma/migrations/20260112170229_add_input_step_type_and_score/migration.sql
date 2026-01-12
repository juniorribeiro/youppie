-- AlterEnum
ALTER TYPE "StepType" ADD VALUE 'INPUT';

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN "score" INTEGER NOT NULL DEFAULT 0;
