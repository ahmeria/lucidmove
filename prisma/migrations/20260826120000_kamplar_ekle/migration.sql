-- Kamplar (retreat) özelliği: Camp + CampReservation tabloları, ve mevcut
-- Payment tablosuna opsiyonel campReservationId bağlantısı — bkz.
-- app/admin/camps, app/[locale]/(site)/camps, lib/kamplar.ts.

-- CreateTable
CREATE TABLE `Camp` (
    `id` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `ad` VARCHAR(191) NOT NULL,
    `adEn` VARCHAR(191) NULL,
    `adAz` VARCHAR(191) NULL,
    `yer` VARCHAR(191) NOT NULL,
    `yerEn` VARCHAR(191) NULL,
    `yerAz` VARCHAR(191) NULL,
    `detaylar` TEXT NOT NULL,
    `detaylarEn` TEXT NULL,
    `detaylarAz` TEXT NULL,
    `baslangicTarihi` DATETIME(3) NOT NULL,
    `bitisTarihi` DATETIME(3) NOT NULL,
    `kapasite` INTEGER NOT NULL,
    `fiyat` DECIMAL(10, 2) NOT NULL,
    `kapakUrl` VARCHAR(512) NULL,
    `rezervasyonSuresiGun` INTEGER NOT NULL DEFAULT 3,
    `yayindaMi` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Camp_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CampReservation` (
    `id` VARCHAR(191) NOT NULL,
    `campId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `status` ENUM('REZERVE_EDILDI', 'ODENDI', 'SURESI_DOLDU', 'IPTAL_EDILDI') NOT NULL DEFAULT 'REZERVE_EDILDI',
    `sonOdemeTarihi` DATETIME(3) NOT NULL,
    `odendiTarihi` DATETIME(3) NULL,
    `iptalTarihi` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CampReservation_campId_status_idx`(`campId`, `status`),
    INDEX `CampReservation_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `campReservationId` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `CampReservation` ADD CONSTRAINT `CampReservation_campId_fkey` FOREIGN KEY (`campId`) REFERENCES `Camp`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CampReservation` ADD CONSTRAINT `CampReservation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_campReservationId_fkey` FOREIGN KEY (`campReservationId`) REFERENCES `CampReservation`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
