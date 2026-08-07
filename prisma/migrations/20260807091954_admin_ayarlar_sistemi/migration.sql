-- AlterTable
ALTER TABLE `SiteSettings` ADD COLUMN `paraBirimi` VARCHAR(3) NOT NULL DEFAULT 'TRY',
    ADD COLUMN `paraBirimiGosterimi` VARCHAR(20) NOT NULL DEFAULT 'ONCE_SEMBOL';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `sistemYoneticisiMi` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `SystemLog` (
    `id` VARCHAR(191) NOT NULL,
    `seviye` VARCHAR(191) NOT NULL,
    `kategori` VARCHAR(191) NOT NULL,
    `aksiyon` VARCHAR(191) NOT NULL,
    `kaynakEtiketi` VARCHAR(191) NULL,
    `mesaj` TEXT NULL,
    `userId` VARCHAR(191) NULL,
    `kullaniciEtiketi` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SystemLog_kategori_createdAt_idx`(`kategori`, `createdAt`),
    INDEX `SystemLog_seviye_createdAt_idx`(`seviye`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Backup` (
    `id` VARCHAR(191) NOT NULL,
    `dosyaAdi` VARCHAR(255) NOT NULL,
    `dosyaBoyutu` INTEGER NOT NULL,
    `tur` VARCHAR(191) NOT NULL,
    `durum` VARCHAR(191) NOT NULL,
    `hataMesaji` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SystemLog` ADD CONSTRAINT `SystemLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Backup` ADD CONSTRAINT `Backup_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
