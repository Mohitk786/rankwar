-- CreateEnum
CREATE TYPE "RankEventScope" AS ENUM ('OVERALL', 'CATEGORY');

-- CreateTable
CREATE TABLE "RankEvent" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "scope" "RankEventScope" NOT NULL,
    "categoryName" TEXT,
    "overtakenByDisplayName" TEXT NOT NULL,
    "overtakenBySlug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RankEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RankEvent_listingId_createdAt_idx" ON "RankEvent"("listingId", "createdAt");

-- AddForeignKey
ALTER TABLE "RankEvent" ADD CONSTRAINT "RankEvent_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
