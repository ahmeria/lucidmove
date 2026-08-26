-- Özel Dersler (private, önceden kaydedilmiş, üyelik dışı ayrı satılan video
-- içerik) özelliği: PrivateLesson + PrivateLessonVideo + PrivateLessonPurchase
-- tabloları, ve mevcut Payment tablosuna opsiyonel privateLessonPurchaseId
-- bağlantısı — bkz. app/admin/private-lessons, app/[locale]/(site)/private-lessons,
-- lib/ozelDersler.ts.

-- CreateTable
CREATE TABLE `PrivateLesson` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `baslik` VARCHAR(191) NOT NULL,
    `baslikEn` VARCHAR(191) NULL,
    `baslikAz` VARCHAR(191) NULL,
    `aciklama` TEXT NOT NULL,
    `aciklamaEn` TEXT NULL,
    `aciklamaAz` TEXT NULL,
    `kapakUrl` VARCHAR(512) NULL,
    `tanitimVideoUrl` VARCHAR(512) NULL,
    `fiyat` DECIMAL(10, 2) NOT NULL,
    `yayindaMi` BOOLEAN NOT NULL DEFAULT true,
    `sira` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PrivateLesson_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PrivateLessonVideo` (
    `id` VARCHAR(191) NOT NULL,
    `privateLessonId` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `baslik` VARCHAR(191) NOT NULL,
    `baslikEn` VARCHAR(191) NULL,
    `baslikAz` VARCHAR(191) NULL,
    `aciklama` TEXT NULL,
    `aciklamaEn` TEXT NULL,
    `aciklamaAz` TEXT NULL,
    `kapakUrl` VARCHAR(512) NULL,
    `sureDakika` INTEGER NOT NULL,
    `videoUrl` VARCHAR(512) NOT NULL,
    `sira` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PrivateLessonVideo_privateLessonId_slug_key`(`privateLessonId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PrivateLessonPurchase` (
    `id` VARCHAR(191) NOT NULL,
    `privateLessonId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('BEKLEMEDE', 'ODENDI') NOT NULL DEFAULT 'BEKLEMEDE',
    `odendiTarihi` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PrivateLessonPurchase_privateLessonId_userId_key`(`privateLessonId`, `userId`),
    INDEX `PrivateLessonPurchase_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `privateLessonPurchaseId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `PrivateLessonVideo` ADD CONSTRAINT `PrivateLessonVideo_privateLessonId_fkey` FOREIGN KEY (`privateLessonId`) REFERENCES `PrivateLesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrivateLessonPurchase` ADD CONSTRAINT `PrivateLessonPurchase_privateLessonId_fkey` FOREIGN KEY (`privateLessonId`) REFERENCES `PrivateLesson`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrivateLessonPurchase` ADD CONSTRAINT `PrivateLessonPurchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_privateLessonPurchaseId_fkey` FOREIGN KEY (`privateLessonPurchaseId`) REFERENCES `PrivateLessonPurchase`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
