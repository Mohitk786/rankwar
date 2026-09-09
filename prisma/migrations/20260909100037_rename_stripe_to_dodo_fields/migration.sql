-- Rename Stripe-specific Checkout columns to their Dodo Payments equivalents.
-- Uses RENAME COLUMN (not drop+add) to preserve the existing rows' values.
ALTER TABLE "Checkout" RENAME COLUMN "stripeSessionId" TO "dodoSessionId";
ALTER TABLE "Checkout" RENAME COLUMN "stripePaymentIntentId" TO "dodoPaymentId";

-- Keep the existing indexes/constraints, just renamed to match.
ALTER INDEX "Checkout_stripeSessionId_key" RENAME TO "Checkout_dodoSessionId_key";
ALTER INDEX "Checkout_stripePaymentIntentId_key" RENAME TO "Checkout_dodoPaymentId_key";
ALTER INDEX "Checkout_stripeSessionId_idx" RENAME TO "Checkout_dodoSessionId_idx";

-- New PaymentEvent rows default to "dodo"; historical "stripe" rows are left as-is.
ALTER TABLE "PaymentEvent" ALTER COLUMN "provider" SET DEFAULT 'dodo';
