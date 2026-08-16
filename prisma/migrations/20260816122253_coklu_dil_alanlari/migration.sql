-- AlterTable
ALTER TABLE `Course` ADD COLUMN `aciklamaAz` TEXT NULL,
    ADD COLUMN `aciklamaEn` TEXT NULL,
    ADD COLUMN `baslikAz` VARCHAR(191) NULL,
    ADD COLUMN `baslikEn` VARCHAR(191) NULL,
    ADD COLUMN `seviyeAz` VARCHAR(191) NULL,
    ADD COLUMN `seviyeEn` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `InstructorProfile` ADD COLUMN `bioAz` TEXT NULL,
    ADD COLUMN `bioEn` TEXT NULL,
    ADD COLUMN `hakkimdaTeaserOzetAz` TEXT NULL,
    ADD COLUMN `hakkimdaTeaserOzetEn` TEXT NULL,
    ADD COLUMN `sertifikalarAz` TEXT NULL,
    ADD COLUMN `sertifikalarEn` TEXT NULL,
    ADD COLUMN `yaklasimAz` TEXT NULL,
    ADD COLUMN `yaklasimEn` TEXT NULL;

-- AlterTable
ALTER TABLE `Lesson` ADD COLUMN `aciklamaAz` TEXT NULL,
    ADD COLUMN `aciklamaEn` TEXT NULL,
    ADD COLUMN `baslikAz` VARCHAR(191) NULL,
    ADD COLUMN `baslikEn` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Mood` ADD COLUMN `adAz` VARCHAR(100) NULL,
    ADD COLUMN `adEn` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `PricingPlan` ADD COLUMN `aciklamaAz` TEXT NULL,
    ADD COLUMN `aciklamaEn` TEXT NULL,
    ADD COLUMN `baslikAz` VARCHAR(100) NULL,
    ADD COLUMN `baslikEn` VARCHAR(100) NULL,
    ADD COLUMN `ozelliklerAz` TEXT NULL,
    ADD COLUMN `ozelliklerEn` TEXT NULL,
    ADD COLUMN `periyotAz` VARCHAR(50) NULL,
    ADD COLUMN `periyotEn` VARCHAR(50) NULL,
    ADD COLUMN `rozetAz` VARCHAR(100) NULL,
    ADD COLUMN `rozetEn` VARCHAR(100) NULL;

-- AlterTable
ALTER TABLE `SiteSettings` ADD COLUMN `calismaSaatleriAz` VARCHAR(255) NULL,
    ADD COLUMN `calismaSaatleriEn` VARCHAR(255) NULL,
    ADD COLUMN `footerTaglineAz` TEXT NULL,
    ADD COLUMN `footerTaglineEn` TEXT NULL,
    ADD COLUMN `heroAltBaslikAz` TEXT NULL,
    ADD COLUMN `heroAltBaslikEn` TEXT NULL,
    ADD COLUMN `heroBaslikAz` TEXT NULL,
    ADD COLUMN `heroBaslikEn` TEXT NULL,
    ADD COLUMN `heroCtaBirincilAz` VARCHAR(100) NULL,
    ADD COLUMN `heroCtaBirincilEn` VARCHAR(100) NULL,
    ADD COLUMN `heroCtaIkincilAz` VARCHAR(100) NULL,
    ADD COLUMN `heroCtaIkincilEn` VARCHAR(100) NULL,
    ADD COLUMN `heroEyebrowAz` VARCHAR(255) NULL,
    ADD COLUMN `heroEyebrowEn` VARCHAR(255) NULL,
    ADD COLUMN `siteAciklamasiAz` TEXT NULL,
    ADD COLUMN `siteAciklamasiEn` TEXT NULL,
    ADD COLUMN `siteBasligiAz` VARCHAR(255) NULL,
    ADD COLUMN `siteBasligiEn` VARCHAR(255) NULL,
    ADD COLUMN `uyelikAltBaslikAz` TEXT NULL,
    ADD COLUMN `uyelikAltBaslikEn` TEXT NULL,
    ADD COLUMN `uyelikBaslikAz` TEXT NULL,
    ADD COLUMN `uyelikBaslikEn` TEXT NULL,
    ADD COLUMN `uyelikEyebrowAz` VARCHAR(255) NULL,
    ADD COLUMN `uyelikEyebrowEn` VARCHAR(255) NULL;
