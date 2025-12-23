-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "analysisCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPro" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "StockAnalysis" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "status" "AnalysisStatus" NOT NULL DEFAULT 'PENDING',
    "currentPrice" DOUBLE PRECISION,
    "marketCap" DOUBLE PRECISION,
    "peRatio" DOUBLE PRECISION,
    "valuationResult" TEXT,
    "sentimentResult" TEXT,
    "fundamentalResult" TEXT,
    "riskResult" TEXT,
    "finalReport" TEXT,
    "recommendation" TEXT,
    "confidenceScore" DOUBLE PRECISION,
    "targetPrice" DOUBLE PRECISION,
    "agentResults" JSONB,
    "processingTime" INTEGER,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StockAnalysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockAnalysis_userId_idx" ON "StockAnalysis"("userId");

-- CreateIndex
CREATE INDEX "StockAnalysis_userId_ticker_idx" ON "StockAnalysis"("userId", "ticker");

-- CreateIndex
CREATE INDEX "StockAnalysis_ticker_idx" ON "StockAnalysis"("ticker");

-- CreateIndex
CREATE INDEX "StockAnalysis_createdAt_idx" ON "StockAnalysis"("createdAt");

-- AddForeignKey
ALTER TABLE "StockAnalysis" ADD CONSTRAINT "StockAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
