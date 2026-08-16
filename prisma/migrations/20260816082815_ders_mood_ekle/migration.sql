-- Dersler için opsiyonel "mood" (ruh hali) etiketi — bkz. lib/moods.ts ve
-- app/(site)/courses sayfasındaki "Moodlar" bölümü.

-- AlterTable
ALTER TABLE `Lesson` ADD COLUMN `mood` VARCHAR(50) NULL;
