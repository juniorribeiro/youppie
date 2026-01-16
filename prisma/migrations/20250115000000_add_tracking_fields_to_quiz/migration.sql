-- AlterTable
ALTER TABLE "quizzes" ADD COLUMN "google_analytics_id" TEXT,
ADD COLUMN "google_tag_manager_id" TEXT,
ADD COLUMN "facebook_pixel_id" TEXT,
ADD COLUMN "tracking_head" TEXT,
ADD COLUMN "tracking_body" TEXT,
ADD COLUMN "tracking_footer" TEXT;
