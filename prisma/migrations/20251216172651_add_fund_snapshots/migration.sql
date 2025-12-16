-- CreateTable
CREATE TABLE "FundSnapshot" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "equity" DOUBLE PRECISION NOT NULL,
    "benchmark" DOUBLE PRECISION,
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FundHoldingsSnapshot" (
    "id" TEXT NOT NULL,
    "fundId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "holdings" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FundHoldingsSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FundSnapshot_fundId_date_idx" ON "FundSnapshot"("fundId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FundSnapshot_fundId_date_key" ON "FundSnapshot"("fundId", "date");

-- CreateIndex
CREATE INDEX "FundHoldingsSnapshot_fundId_date_idx" ON "FundHoldingsSnapshot"("fundId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "FundHoldingsSnapshot_fundId_date_key" ON "FundHoldingsSnapshot"("fundId", "date");

-- AddForeignKey
ALTER TABLE "FundSnapshot" ADD CONSTRAINT "FundSnapshot_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FundHoldingsSnapshot" ADD CONSTRAINT "FundHoldingsSnapshot_fundId_fkey" FOREIGN KEY ("fundId") REFERENCES "Fund"("id") ON DELETE CASCADE ON UPDATE CASCADE;
