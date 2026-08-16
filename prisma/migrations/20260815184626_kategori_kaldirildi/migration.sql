-- Kategori kavramı sistemden kaldırıldı — Kurslar artık doğrudan (kategorisiz)
-- yönetiliyor. Mevcut kategori kayıtları (isimleri korunarak) admin panelinden
-- elle birer boş Kurs'a dönüştürüldükten SONRA bu migration uygulandı — bkz.
-- commit mesajı.

-- DropForeignKey
ALTER TABLE `Course` DROP FOREIGN KEY `Course_categoryId_fkey`;

-- AlterTable
ALTER TABLE `Course` DROP COLUMN `categoryId`;

-- DropTable
DROP TABLE `Category`;
