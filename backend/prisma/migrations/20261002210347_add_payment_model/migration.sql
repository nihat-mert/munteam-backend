/*
  Warnings:

  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `Enum(EnumId(0))`.
  - A unique constraint covering the columns `[tcKimlik]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[vergiNo]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `user` ADD COLUMN `adSoyad` VARCHAR(191) NULL,
    ADD COLUMN `faturaAdresi` TEXT NULL,
    ADD COLUMN `iletisimAdresi` TEXT NULL,
    ADD COLUMN `kurumTipi` ENUM('BIREYSEL', 'KURUMSAL') NOT NULL DEFAULT 'BIREYSEL',
    ADD COLUMN `tcKimlik` VARCHAR(191) NULL,
    ADD COLUMN `telefon` VARCHAR(191) NULL,
    ADD COLUMN `unvan` VARCHAR(191) NULL,
    ADD COLUMN `vergiNo` VARCHAR(191) NULL,
    MODIFY `role` ENUM('ADMIN', 'CUSTOMER', 'PERSONNEL') NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable
CREATE TABLE `AnalysisCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AnalysisCategory_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalysisType` (
    `id` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AnalysisType_categoryId_idx`(`categoryId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AnalysisRequest` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `requestType` ENUM('FIYAT_TEKLIFI', 'ANALIZ_BASVURUSU') NOT NULL,
    `status` ENUM('TASLAK', 'ONAY_BEKLIYOR', 'ONAYLANDI') NOT NULL DEFAULT 'TASLAK',
    `odemeKaynaki` VARCHAR(191) NULL,
    `kullanimAmaci` TEXT NULL,
    `projeNo` VARCHAR(191) NULL,
    `destekAlanKurulus` VARCHAR(191) NULL,
    `teslimYontemi` VARCHAR(191) NULL,
    `toplamTutar` DECIMAL(10, 2) NULL,
    `ekDosyaUrl` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AnalysisRequest_userId_idx`(`userId`),
    INDEX `AnalysisRequest_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sample` (
    `id` VARCHAR(191) NOT NULL,
    `requestId` VARCHAR(191) NOT NULL,
    `numuneAdi` VARCHAR(191) NOT NULL,
    `ambalajSekli` ENUM('CAM', 'PLASTIK', 'KARTON') NOT NULL,
    `kartonBoyutu` VARCHAR(191) NULL,
    `numuneHazirlik` VARCHAR(191) NULL,
    `baskaSoru` VARCHAR(191) NULL,
    `iadeEdilecekMi` BOOLEAN NOT NULL DEFAULT false,
    `tehlikeliMi` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Sample_requestId_idx`(`requestId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SampleAnalysis` (
    `id` VARCHAR(191) NOT NULL,
    `sampleId` VARCHAR(191) NOT NULL,
    `analysisTypeId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SampleAnalysis_sampleId_idx`(`sampleId`),
    INDEX `SampleAnalysis_analysisTypeId_idx`(`analysisTypeId`),
    UNIQUE INDEX `SampleAnalysis_sampleId_analysisTypeId_key`(`sampleId`, `analysisTypeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `cihazAdi` VARCHAR(191) NOT NULL,
    `baslangicTarihi` DATETIME(3) NOT NULL,
    `bitisTarihi` DATETIME(3) NOT NULL,
    `aciklama` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Appointment_userId_idx`(`userId`),
    INDEX `Appointment_cihazAdi_baslangicTarihi_idx`(`cihazAdi`, `baslangicTarihi`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BudgetProject` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `limitAmount` DECIMAL(12, 2) NOT NULL,
    `spentAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BudgetProject_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `projectId` VARCHAR(191) NOT NULL,
    `dekontNo` VARCHAR(191) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Payment_projectId_idx`(`projectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_tcKimlik_key` ON `User`(`tcKimlik`);

-- CreateIndex
CREATE UNIQUE INDEX `User_vergiNo_key` ON `User`(`vergiNo`);

-- AddForeignKey
ALTER TABLE `AnalysisType` ADD CONSTRAINT `AnalysisType_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `AnalysisCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AnalysisRequest` ADD CONSTRAINT `AnalysisRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sample` ADD CONSTRAINT `Sample_requestId_fkey` FOREIGN KEY (`requestId`) REFERENCES `AnalysisRequest`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleAnalysis` ADD CONSTRAINT `SampleAnalysis_sampleId_fkey` FOREIGN KEY (`sampleId`) REFERENCES `Sample`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SampleAnalysis` ADD CONSTRAINT `SampleAnalysis_analysisTypeId_fkey` FOREIGN KEY (`analysisTypeId`) REFERENCES `AnalysisType`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BudgetProject` ADD CONSTRAINT `BudgetProject_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `BudgetProject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
