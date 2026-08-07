-- AlterTable
ALTER TABLE `User` ADD COLUMN `adminRoleId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `AdminRole` (
    `id` VARCHAR(191) NOT NULL,
    `ad` VARCHAR(100) NOT NULL,
    `sayfalar` JSON NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminRole_ad_key`(`ad`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_adminRoleId_fkey` FOREIGN KEY (`adminRoleId`) REFERENCES `AdminRole`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
