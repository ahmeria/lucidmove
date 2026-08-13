-- AlterTable
ALTER TABLE `SiteSettings` ADD COLUMN `heroGorselUrl` VARCHAR(512) NOT NULL DEFAULT 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=1800&auto=format&fit=crop';

-- CreateTable
CREATE TABLE `GaleriGorseli` (
    `id` VARCHAR(191) NOT NULL,
    `url` VARCHAR(512) NOT NULL,
    `alt` VARCHAR(255) NULL,
    `sira` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
