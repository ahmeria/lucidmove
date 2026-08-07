/*
  Warnings:

  - Added the required column `kaynakVideoUrl` to the `Lesson` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Course` ADD COLUMN `categoryId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Lesson` ADD COLUMN `aciklama` TEXT NULL,
    ADD COLUMN `filigranDurumu` ENUM('BEKLIYOR', 'ISLENIYOR', 'HAZIR', 'HATA') NOT NULL DEFAULT 'HAZIR',
    ADD COLUMN `kaynakVideoUrl` VARCHAR(512) NULL,
    MODIFY `videoUrl` VARCHAR(512) NULL;

-- Mevcut derslerin (seed placeholder) videoUrl'unu kaynakVideoUrl'a kopyala,
-- zaten "hazır" sayılıyorlar (filigran işine sokulmuyorlar).
UPDATE `Lesson` SET `kaynakVideoUrl` = `videoUrl` WHERE `kaynakVideoUrl` IS NULL;

ALTER TABLE `Lesson` MODIFY `kaynakVideoUrl` VARCHAR(512) NOT NULL;
ALTER TABLE `Lesson` ALTER COLUMN `filigranDurumu` SET DEFAULT 'BEKLIYOR';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `profilFotoUrl` VARCHAR(512) NULL;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `ad` VARCHAR(255) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `aciklama` TEXT NULL,
    `sira` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Course_categoryId_idx` ON `Course`(`categoryId`);

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
