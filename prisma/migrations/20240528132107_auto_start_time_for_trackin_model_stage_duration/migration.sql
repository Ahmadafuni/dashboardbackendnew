/*
  Warnings:

  - Made the column `StartTime` on table `TrackingModelStageDurations` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TrackingModelStageDurations" ALTER COLUMN "StartTime" SET NOT NULL,
ALTER COLUMN "StartTime" SET DEFAULT CURRENT_TIMESTAMP;
