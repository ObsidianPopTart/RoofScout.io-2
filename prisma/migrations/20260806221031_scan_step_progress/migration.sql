-- AlterTable
ALTER TABLE "ScanRecord" ADD COLUMN     "buildingsFetched" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pendingBuildings" TEXT,
ADD COLUMN     "totalBuildings" INTEGER NOT NULL DEFAULT 0;
