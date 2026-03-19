-- AlterTable: Make screenshot fields optional and add card payment fields
ALTER TABLE "Payment" ALTER COLUMN "screenshotData" DROP NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "screenshotType" DROP NOT NULL;
ALTER TABLE "Payment" ADD COLUMN "paymentMethod" TEXT NOT NULL DEFAULT 'FIB';
ALTER TABLE "Payment" ADD COLUMN "transactionId" TEXT;
