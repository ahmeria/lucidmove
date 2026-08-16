-- Ders "mood" (ruh hali) etiketlerini admin panelinden yönetilebilir hale
-- getiren yeni tablo — bkz. app/admin/moods.

-- CreateTable
CREATE TABLE `Mood` (
    `id` VARCHAR(191) NOT NULL,
    `ad` VARCHAR(100) NOT NULL,
    `slug` VARCHAR(50) NOT NULL,
    `gorselUrl` VARCHAR(512) NULL,
    `sira` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Mood_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
