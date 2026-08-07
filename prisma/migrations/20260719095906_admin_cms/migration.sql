-- AlterTable
ALTER TABLE `User` ADD COLUMN `role` ENUM('UYE', 'ADMIN') NOT NULL DEFAULT 'UYE';

-- CreateTable
CREATE TABLE `SiteSettings` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'ana',
    `siteBasligi` VARCHAR(255) NOT NULL,
    `siteAciklamasi` TEXT NOT NULL,
    `heroEyebrow` VARCHAR(255) NOT NULL,
    `heroBaslik` TEXT NOT NULL,
    `heroAltBaslik` TEXT NOT NULL,
    `heroCtaBirincil` VARCHAR(100) NOT NULL,
    `heroCtaIkincil` VARCHAR(100) NOT NULL,
    `uyelikEyebrow` VARCHAR(255) NOT NULL,
    `uyelikBaslik` TEXT NOT NULL,
    `uyelikAltBaslik` TEXT NOT NULL,
    `iletisimEmail` VARCHAR(255) NOT NULL,
    `calismaSaatleri` VARCHAR(255) NOT NULL,
    `instagramUrl` VARCHAR(512) NOT NULL,
    `footerTagline` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstructorProfile` (
    `id` VARCHAR(191) NOT NULL DEFAULT 'ana',
    `ad` VARCHAR(255) NOT NULL,
    `bio` TEXT NOT NULL,
    `sertifikalar` TEXT NOT NULL,
    `yaklasim` TEXT NOT NULL,
    `portreUrl` VARCHAR(512) NOT NULL,
    `hakkimdaTeaserOzet` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PricingPlan` (
    `id` VARCHAR(191) NOT NULL,
    `plan` ENUM('AYLIK', 'YILLIK') NOT NULL,
    `baslik` VARCHAR(100) NOT NULL,
    `fiyat` DECIMAL(10, 2) NOT NULL,
    `periyot` VARCHAR(50) NOT NULL,
    `aciklama` TEXT NOT NULL,
    `ozellikler` TEXT NOT NULL,
    `rozet` VARCHAR(100) NULL,
    `vurgulu` BOOLEAN NOT NULL DEFAULT false,
    `sira` INTEGER NOT NULL DEFAULT 0,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PricingPlan_plan_key`(`plan`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactMessage` (
    `id` VARCHAR(191) NOT NULL,
    `ad` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `mesaj` TEXT NOT NULL,
    `okunduMu` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
