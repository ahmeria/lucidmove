import { spawn } from "child_process";
import fs from "fs";
import { createWriteStream } from "fs";
import { mkdir } from "fs/promises";
import path from "path";
import { pipeline } from "stream/promises";
import { createGzip } from "zlib";
import { db } from "@/lib/db";

// Yedek dosyaları (.sql.gz) sunucunun çalışma dizinine göre sabit bir yerde,
// public/ dışında diskte tutulur — repoya girmez (bkz. .gitignore).
export const BACKUP_DIR = path.join(process.cwd(), "storage", "backups");

async function yedekKlasoruHazirla(): Promise<void> {
  await mkdir(BACKUP_DIR, { recursive: true });
}

// fileName veritabanından gelse de, diske yol ayracı taşıyan bir değer
// yazılamayacağı için (path traversal) burada daima yalnızca dosya adı kısmını
// BACKUP_DIR içine çözüyoruz.
export function yedekDosyaYolunuAl(dosyaAdi: string): string {
  return path.join(BACKUP_DIR, path.basename(dosyaAdi));
}

interface DbBaglantiBilgisi {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

function dbBaglantiBilgisiniAl(): DbBaglantiBilgisi {
  const raw = process.env.DATABASE_URL;
  if (!raw) throw new Error("DATABASE_URL tanımlı değil.");
  const url = new URL(raw);
  return {
    host: url.hostname,
    port: url.port ? Number(url.port) : 3306,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, ""),
  };
}

// mysqldump'ı PATH'ten değil, opsiyonel MYSQLDUMP_PATH env değişkeninden
// (verilmişse) çözüyoruz — aynı desen lib/filigran.ts > FFMPEG_PATH'te de var.
// Windows'ta XAMPP kurulumunda mysqldump PATH'e eklenmez.
function mysqldumpYoluAl(): string {
  return process.env.MYSQLDUMP_PATH || "mysqldump";
}

function bulunamadiMesaji(err: NodeJS.ErrnoException): string {
  if (err.code === "ENOENT") {
    return `"mysqldump" çalıştırılabilir dosyası bulunamadı. Sunucuda MySQL istemci araçlarının kurulu ve PATH'te olduğundan emin olun (gerekirse MYSQLDUMP_PATH ortam değişkeniyle konumu belirtin).`;
  }
  return err.message;
}

// Aynı anda birden fazla yedekleme çalışmasın diye process içinde basit bir kilit.
const globalForYedek = globalThis as unknown as { yedeklemeSurmekte?: boolean };

export interface YedekSonucu {
  basarili: boolean;
  dosyaAdi?: string;
  dosyaBoyutu?: number;
  hataMesaji?: string;
}

// Veritabanının tamamını mysqldump ile alır, gzip'ler, storage/backups/ altına
// yazar ve sonucu Backup tablosuna kaydeder. Dönüş değeri API route'unun
// kullanıcıya göstereceği anlık sonuç — kayıt her koşulda (başarı/hata) DB'ye
// yazılır ki Yedekleme sayfasında geçmiş görünsün.
export async function yedekAl(userId: string | undefined): Promise<YedekSonucu> {
  if (globalForYedek.yedeklemeSurmekte) {
    return { basarili: false, hataMesaji: "Zaten devam eden bir yedekleme var, lütfen bekleyin." };
  }
  globalForYedek.yedeklemeSurmekte = true;

  const zamanDamgasi = new Date().toISOString().replace(/[:.]/g, "-");
  const dosyaAdi = `lucidmove-${zamanDamgasi}.sql.gz`;

  try {
    await yedekKlasoruHazirla();
    const baglanti = dbBaglantiBilgisiniAl();
    const hedefYol = yedekDosyaYolunuAl(dosyaAdi);

    await new Promise<void>((resolve, reject) => {
      const mysqldump = spawn(mysqldumpYoluAl(), [
        `--host=${baglanti.host}`,
        `--port=${baglanti.port}`,
        `--user=${baglanti.user}`,
        `--password=${baglanti.password}`,
        "--single-transaction",
        "--routines",
        "--skip-lock-tables",
        baglanti.database,
      ]);

      let hataMetni = "";
      mysqldump.stderr.on("data", (veri) => {
        hataMetni += veri.toString();
      });
      mysqldump.on("error", (err) => reject(new Error(bulunamadiMesaji(err as NodeJS.ErrnoException))));

      const gzip = createGzip();
      const yazici = createWriteStream(hedefYol);

      pipeline(mysqldump.stdout, gzip, yazici).catch(reject);

      mysqldump.on("close", (kod) => {
        if (kod === 0) resolve();
        else reject(new Error(`mysqldump çıkış kodu ${kod}: ${hataMetni.slice(-500)}`));
      });
    });

    const { size } = fs.statSync(yedekDosyaYolunuAl(dosyaAdi));
    await db.backup.create({
      data: { dosyaAdi, dosyaBoyutu: size, tur: "manuel", durum: "basarili", createdById: userId ?? null },
    });
    return { basarili: true, dosyaAdi, dosyaBoyutu: size };
  } catch (err) {
    const mesaj = err instanceof Error ? err.message : "Bilinmeyen hata";
    await db.backup.create({
      data: { dosyaAdi, dosyaBoyutu: 0, tur: "manuel", durum: "basarisiz", hataMesaji: mesaj, createdById: userId ?? null },
    });
    return { basarili: false, hataMesaji: mesaj };
  } finally {
    globalForYedek.yedeklemeSurmekte = false;
  }
}
