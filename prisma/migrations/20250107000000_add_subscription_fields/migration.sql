-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'BASIC', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN "subscription_plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE';
ALTER TABLE "users" ADD COLUMN "stripe_customer_id" TEXT;
ALTER TABLE "users" ADD COLUMN "stripe_subscription_id" TEXT;
ALTER TABLE "users" ADD COLUMN "subscription_status" TEXT;
ALTER TABLE "users" ADD COLUMN "subscription_current_period_end" TIMESTAMP(3);

