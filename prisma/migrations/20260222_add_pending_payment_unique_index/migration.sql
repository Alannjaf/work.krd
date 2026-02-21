-- Prevent duplicate PENDING payments per user.
-- Prisma doesn't support partial unique indexes natively, so this is a raw migration.
CREATE UNIQUE INDEX "Payment_userId_status_pending_unique"
  ON "Payment" ("userId")
  WHERE status = 'PENDING';
