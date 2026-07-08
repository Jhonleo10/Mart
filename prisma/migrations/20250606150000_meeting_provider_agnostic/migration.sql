-- CreateEnum
CREATE TYPE "MeetingProvider" AS ENUM ('GOOGLE', 'TEAMS', 'ZOOM', 'CUSTOM');

-- AlterEnum
ALTER TYPE "MeetingStatus" ADD VALUE IF NOT EXISTS 'NO_SHOW';

-- AlterTable
ALTER TABLE "DemoMeeting" ADD COLUMN IF NOT EXISTS "meetingProvider" "MeetingProvider";
ALTER TABLE "DemoMeeting" ADD COLUMN IF NOT EXISTS "meetingLink" TEXT;

-- Backfill from legacy googleMeetLink
UPDATE "DemoMeeting"
SET
  "meetingLink" = COALESCE("meetingLink", "googleMeetLink"),
  "meetingProvider" = COALESCE("meetingProvider", 'GOOGLE'::"MeetingProvider")
WHERE "googleMeetLink" IS NOT NULL;

-- Backfill booking-level manual links without demo meeting rows
UPDATE "Booking" b
SET "meetingLink" = b."meetingLink"
WHERE b."meetingLink" IS NOT NULL;
