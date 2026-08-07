import { execFile, spawn } from "child_process";
import { promisify } from "util";
import { readFileSync } from "fs";
import path from "path";

// social projesindeki src/lib/gitUpdate.ts'ten uyarlanmış, sadeleştirilmiş hâli
// (ayrı bir changelog sistemi yok — sürüm package.json'dan okunur).
const execFileAsync = promisify(execFile);
const REPO_KOKU = process.cwd();
const ALAN_AYIRICI = "\x1f";

export interface CommitBilgisi {
  hash: string;
  kisaHash: string;
  yazar: string;
  tarih: string;
  konu: string;
}

async function gitCalistir(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args, {
    cwd: REPO_KOKU,
    maxBuffer: 10 * 1024 * 1024,
    windowsHide: true,
  });
  return stdout.trim();
}

export async function gitDeposuMu(): Promise<boolean> {
  try {
    const out = await gitCalistir(["rev-parse", "--is-inside-work-tree"]);
    return out === "true";
  } catch {
    return false;
  }
}

export async function mevcutDaliAl(): Promise<string> {
  return gitCalistir(["rev-parse", "--abbrev-ref", "HEAD"]);
}

export function uygulamaSurumunuAl(): string {
  try {
    const pkg = JSON.parse(readFileSync(path.join(REPO_KOKU, "package.json"), "utf-8"));
    return pkg.version ? `v${pkg.version}` : "v1.0.0";
  } catch {
    return "v1.0.0";
  }
}

function commitSatiriniAyristir(satir: string): CommitBilgisi {
  const [hash, kisaHash, yazar, tarih, konu] = satir.split(ALAN_AYIRICI);
  return { hash, kisaHash, yazar, tarih, konu };
}

export async function commitBilgisiniAl(ref: string): Promise<CommitBilgisi> {
  const out = await gitCalistir([
    "log",
    "-1",
    `--pretty=format:%H${ALAN_AYIRICI}%h${ALAN_AYIRICI}%an${ALAN_AYIRICI}%ad${ALAN_AYIRICI}%s`,
    "--date=iso-strict",
    ref,
  ]);
  return commitSatiriniAyristir(out);
}

async function origindenCek(dal: string): Promise<void> {
  await gitCalistir(["fetch", "origin", dal]);
}

async function ileriGeriSayisiniAl(temelRef: string, karsilastirRef: string): Promise<{ ileri: number; geri: number }> {
  const out = await gitCalistir(["rev-list", "--left-right", "--count", `${temelRef}...${karsilastirRef}`]);
  const [ileri, geri] = out.split(/\s+/).map((n) => Number(n) || 0);
  return { ileri, geri };
}

async function gelenCommitleriAl(temelRef: string, karsilastirRef: string, limit: number): Promise<CommitBilgisi[]> {
  if (limit <= 0) return [];
  const out = await gitCalistir([
    "log",
    `${temelRef}..${karsilastirRef}`,
    `--pretty=format:%H${ALAN_AYIRICI}%h${ALAN_AYIRICI}%an${ALAN_AYIRICI}%ad${ALAN_AYIRICI}%s`,
    "--date=iso-strict",
    "-n",
    String(limit),
  ]);
  if (!out) return [];
  return out.split("\n").map(commitSatiriniAyristir);
}

// package-lock.json hariç: bu dosya platforma göre (Windows'ta geliştirilip
// Linux sunucuda çalışan opsiyonel native paketler) npm install sonrası doğal
// olarak değişebilir — gerçek bir "kaybolacak değişiklik" değil.
async function yerelDegisiklikVarMi(): Promise<boolean> {
  const out = await gitCalistir(["status", "--porcelain", "--", ".", ":!package-lock.json"]);
  return out.length > 0;
}

async function paketKilidiDegisikliginiAt(): Promise<void> {
  try {
    await gitCalistir(["checkout", "--", "package-lock.json"]);
  } catch {
    // Dosya yoksa/zaten temizse checkout başarısız olabilir — zararsız, yoksay.
  }
}

export interface GuncellemeKontrolSonucu {
  dal: string;
  mevcut: CommitBilgisi;
  guncel: CommitBilgisi;
  ileri: number;
  geri: number;
  guncellemeVar: boolean;
  commitler: CommitBilgisi[];
  kirli: boolean;
  otomatikYenidenBaslatilabilir: boolean;
  uygulamaSurumu: string;
}

// pm2 yönetimindeki her process'e pm2'nin kendisi enjekte eder — bu değerin
// varlığı "bu process pm2 altında çalışıyor" sinyali olarak güvenilir kabul edilir.
export function otomatikYenidenBaslatilabilirMi(): boolean {
  return !!process.env.pm_id;
}

export async function guncellemeKontrolEt(): Promise<GuncellemeKontrolSonucu> {
  if (!(await gitDeposuMu())) {
    throw new Error("Bu kurulum bir git deposu değil, güncelleme kontrolü kullanılamıyor.");
  }
  const dal = await mevcutDaliAl();
  await origindenCek(dal);
  const uzakRef = `origin/${dal}`;

  const [mevcut, guncel, { ileri, geri }, kirli] = await Promise.all([
    commitBilgisiniAl("HEAD"),
    commitBilgisiniAl(uzakRef),
    ileriGeriSayisiniAl("HEAD", uzakRef),
    yerelDegisiklikVarMi(),
  ]);
  const commitler = geri > 0 ? await gelenCommitleriAl("HEAD", uzakRef, geri) : [];

  return {
    dal,
    mevcut,
    guncel,
    ileri,
    geri,
    guncellemeVar: geri > 0,
    commitler,
    kirli,
    otomatikYenidenBaslatilabilir: otomatikYenidenBaslatilabilirMi(),
    uygulamaSurumu: uygulamaSurumunuAl(),
  };
}

export type GuncellemeOlayi =
  | { tur: "adim"; adim: string; etiket: string }
  | { tur: "log"; satir: string }
  | { tur: "adim-tamam"; adim: string }
  | { tur: "adim-hata"; adim: string; mesaj: string }
  | { tur: "tamam"; basarili: boolean; mesaj: string };

function npmYolu(): string {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}
function npxYolu(): string {
  return process.platform === "win32" ? "npx.cmd" : "npx";
}

function adimCalistir(komut: string, args: string[], satirGeldi: (satir: string) => void): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(komut, args, { cwd: REPO_KOKU, shell: false, windowsHide: true });
    let arabellek = "";

    const isle = (veri: Buffer) => {
      arabellek += veri.toString("utf8");
      let idx: number;
      while ((idx = arabellek.indexOf("\n")) >= 0) {
        const satir = arabellek.slice(0, idx).replace(/\r$/, "");
        arabellek = arabellek.slice(idx + 1);
        if (satir) satirGeldi(satir);
      }
    };

    child.stdout.on("data", isle);
    child.stderr.on("data", isle);
    child.on("error", (err) => reject(err));
    child.on("close", (kod) => {
      const kalan = arabellek.replace(/\r$/, "");
      if (kalan) satirGeldi(kalan);
      resolve(kod ?? 1);
    });
  });
}

// Sunucudaki çalışan process'i otomatik yeniden başlatmıyor (pm2 dışında);
// bu yüksek riskli/geri dönüşü zor bir işlem olduğu için yalnızca bilgilendirici
// bir mesajla bırakılıyor — bkz. yenidenBaslat.
export async function guncellemeUygula(yayinla: (olay: GuncellemeOlayi) => void): Promise<void> {
  if (!(await gitDeposuMu())) {
    yayinla({ tur: "tamam", basarili: false, mesaj: "Bu kurulum bir git deposu değil, güncelleme uygulanamıyor." });
    return;
  }

  if (await yerelDegisiklikVarMi()) {
    yayinla({
      tur: "tamam",
      basarili: false,
      mesaj: "Sunucuda commit edilmemiş yerel değişiklikler var. Güncellemeden önce bunları temizleyin.",
    });
    return;
  }

  const dal = await mevcutDaliAl();
  const uzakRef = `origin/${dal}`;

  const { geri } = await ileriGeriSayisiniAl("HEAD", uzakRef);
  if (geri === 0) {
    yayinla({ tur: "tamam", basarili: true, mesaj: "Sistem zaten güncel." });
    return;
  }

  const adimlar: { anahtar: string; etiket: string; komut: string; args: string[] }[] = [
    { anahtar: "fetch", etiket: "GitHub'dan değişiklikler alınıyor", komut: "git", args: ["fetch", "origin", dal] },
    { anahtar: "merge", etiket: "Değişiklikler uygulanıyor", komut: "git", args: ["merge", "--ff-only", uzakRef] },
    {
      anahtar: "install",
      etiket: "Bağımlılıklar güncelleniyor (npm install)",
      komut: npmYolu(),
      args: ["install", "--no-audit", "--no-fund", "--include=dev"],
    },
    { anahtar: "prisma-generate", etiket: "Prisma Client oluşturuluyor", komut: npxYolu(), args: ["prisma", "generate"] },
    {
      anahtar: "prisma-migrate",
      etiket: "Veritabanı migration'ları uygulanıyor",
      komut: npxYolu(),
      args: ["prisma", "migrate", "deploy"],
    },
    { anahtar: "build", etiket: "Uygulama derleniyor (npm run build)", komut: npmYolu(), args: ["run", "build"] },
  ];

  for (const adim of adimlar) {
    if (adim.anahtar === "merge") {
      await paketKilidiDegisikliginiAt();
    }
    yayinla({ tur: "adim", adim: adim.anahtar, etiket: adim.etiket });
    try {
      const kod = await adimCalistir(adim.komut, adim.args, (satir) => yayinla({ tur: "log", satir }));
      if (kod !== 0) {
        yayinla({ tur: "adim-hata", adim: adim.anahtar, mesaj: `Adım ${kod} kodu ile başarısız oldu.` });
        yayinla({
          tur: "tamam",
          basarili: false,
          mesaj: `Güncelleme "${adim.etiket}" adımında durdu. Yukarıdaki günlüğü inceleyin.`,
        });
        return;
      }
      yayinla({ tur: "adim-tamam", adim: adim.anahtar });
    } catch (err) {
      const mesaj = err instanceof Error ? err.message : "Bilinmeyen hata";
      yayinla({ tur: "adim-hata", adim: adim.anahtar, mesaj });
      yayinla({ tur: "tamam", basarili: false, mesaj: `Güncelleme "${adim.etiket}" adımında durdu: ${mesaj}` });
      return;
    }
  }

  yayinla({
    tur: "tamam",
    basarili: true,
    mesaj: "Güncelleme tamamlandı. Değişikliklerin etkili olması için uygulamayı yeniden başlatın.",
  });
}

// pm2 üzerinden kendi process'imizi yeniden başlatır. Çağıran, HTTP yanıtını
// tamamen istemciye gönderip bir süre bekledikten sonra bunu tetiklemeli; pm2
// bu process'i kısa sürede sonlandıracağından yanıt akışının tam yazılmadan
// kesilme riski böylece önlenir.
export function yenidenBaslat(): void {
  if (!otomatikYenidenBaslatilabilirMi()) {
    throw new Error("pm2 algılanmadı; bu ortamda otomatik yeniden başlatma desteklenmiyor.");
  }
  const child = spawn(npxYolu(), ["pm2", "restart", process.env.pm_id!], {
    cwd: REPO_KOKU,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
}
