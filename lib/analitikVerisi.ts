import crypto from "node:crypto";
import { db } from "@/lib/db";
import { sirriSifrele, sirriCoz } from "@/lib/crypto";

/**
 * Google Analytics 4 — ölçüm kodu + Data API ile panele veri.
 *
 * İki ayrı şey var, karıştırılmamalı:
 *   Measurement ID (G-XXXX) → ziyaretçi sayfalarına gömülen gtag.js. Veriyi TOPLAR.
 *   Property ID + servis hesabı → Data API. Toplanan veriyi geri OKUR.
 * Sadece ilki girilirse istatistik toplanır ama panelde görünmez; sadece ikincisi girilirse
 * okunacak veri olmaz.
 *
 * Kimlik doğrulama için resmi google-auth-library YERİNE elle JWT imzalanıyor: tek ihtiyaç
 * RS256 imzası ve onu Node'un crypto modülü zaten veriyor — bu projede zaten (iyzipay dışında)
 * ağır bağımlılık eklemekten kaçınılıyor.
 */

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const DATA_API = "https://analyticsdata.googleapis.com/v1beta";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";

interface ServisHesabi {
  client_email: string;
  private_key: string;
}

export interface AnalitikAyarlari {
  measurementId: string;
  propertyId: string;
  servisHesabiVarMi: boolean;
  servisHesabiEmail: string | null;
}

// --- Ayarlar ---

export async function analitikAyarlariniAl(): Promise<AnalitikAyarlari> {
  const ayarlar = await db.siteSettings.findUnique({ where: { id: "ana" } });

  let servisHesabiEmail: string | null = null;
  if (ayarlar?.gaServiceAccount) {
    try {
      servisHesabiEmail = servisHesabiniAyristir(sirriCoz(ayarlar.gaServiceAccount)).client_email;
    } catch {
      // Bozuk ya da çözülemeyen kayıt: e-posta gösterilmez, kaydın kendisi silinmez.
    }
  }

  return {
    measurementId: ayarlar?.gaMeasurementId ?? "",
    propertyId: ayarlar?.gaPropertyId ?? "",
    servisHesabiVarMi: !!ayarlar?.gaServiceAccount,
    servisHesabiEmail,
  };
}

export async function analitikAyarlariniKaydet(girdi: {
  measurementId: string;
  propertyId: string;
  // Boş: değiştirme. "-": kayıtlı hesabı sil. Aksi hâlde JSON anahtar dosyasının içeriği.
  servisHesabi?: string;
}): Promise<void> {
  const veri: Record<string, unknown> = {
    gaMeasurementId: girdi.measurementId || null,
    gaPropertyId: girdi.propertyId || null,
  };

  if (girdi.servisHesabi === "-") {
    veri.gaServiceAccount = null;
  } else if (girdi.servisHesabi) {
    veri.gaServiceAccount = sirriSifrele(girdi.servisHesabi);
  }

  await db.siteSettings.update({ where: { id: "ana" }, data: veri });
  cachedToken = null;
  raporCache.clear();
}

/** JSON anahtar dosyasının gerçekten servis hesabı olduğunu doğrular. */
export function servisHesabiniAyristir(raw: string): ServisHesabi {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Servis hesabı JSON olarak okunamadı.");
  }

  const obj = parsed as Partial<ServisHesabi> & { type?: string };
  if (!obj.client_email || !obj.private_key) {
    throw new Error("JSON içinde client_email veya private_key yok. Google Cloud'dan indirdiğiniz anahtar dosyasını yapıştırın.");
  }
  return { client_email: obj.client_email, private_key: obj.private_key };
}

// --- OAuth (servis hesabı JWT akışı) ---

let cachedToken: { token: string; expiresAt: number } | null = null;

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function erisimJetonuAl(hesap: ServisHesabi): Promise<string> {
  // 60 sn'lik pay: token tam sınırda kullanılıp yolda süresi dolmasın.
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.token;

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64url(
    JSON.stringify({ iss: hesap.client_email, scope: SCOPE, aud: TOKEN_URL, exp: now + 3600, iat: now })
  );

  // JSON içindeki anahtar "\n" dizileriyle kaçırılmış geliyor; PEM'in gerçek satır sonuna
  // ihtiyacı var, aksi hâlde crypto anahtarı okuyamaz.
  const privateKey = hesap.private_key.replace(/\\n/g, "\n");
  const signature = base64url(crypto.sign("RSA-SHA256", Buffer.from(`${header}.${claim}`), privateKey));

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${signature}`,
    }),
  });

  const data = (await res.json()) as { access_token?: string; expires_in?: number; error_description?: string; error?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? "Google erişim jetonu alınamadı.");
  }

  cachedToken = { token: data.access_token, expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000 };
  return cachedToken.token;
}

// --- Data API ---

interface GaSatiri {
  dimensionValues?: { value: string }[];
  metricValues?: { value: string }[];
}
interface GaRapor {
  rows?: GaSatiri[];
}

async function raporlariCalistir(propertyId: string, token: string, requests: unknown[]): Promise<GaRapor[]> {
  const res = await fetch(`${DATA_API}/properties/${encodeURIComponent(propertyId)}:batchRunReports`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requests }),
  });

  const data = (await res.json()) as { reports?: GaRapor[]; error?: { message?: string } };
  if (!res.ok) throw new Error(data.error?.message ?? `Google Analytics isteği başarısız (HTTP ${res.status}).`);
  return data.reports ?? [];
}

async function anlikKullaniciSayisiniAl(propertyId: string, token: string): Promise<number> {
  const res = await fetch(`${DATA_API}/properties/${encodeURIComponent(propertyId)}:runRealtimeReport`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ metrics: [{ name: "activeUsers" }] }),
  });
  if (!res.ok) return 0;
  const data = (await res.json()) as GaRapor;
  return sayi(data.rows?.[0]?.metricValues?.[0]?.value);
}

function kisaHata(err: unknown): string {
  if (err instanceof Error) return err.message;
  return "Bilinmeyen hata";
}

function sayi(value: string | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** GA4'ün YYYYMMDD biçimini ISO tarihe çevirir. */
function gaTarihi(value: string): string {
  return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
}

// --- Panelin okuduğu özet ---

export interface AnalitikToplamlari {
  activeUsers: number;
  newUsers: number;
  sessions: number;
  screenPageViews: number;
  averageSessionDuration: number;
  bounceRate: number;
}

export interface AnalitikOzeti {
  yapilandirildiMi: boolean;
  hata: string | null;
  gun: number;
  toplamlar: AnalitikToplamlari;
  // Bir önceki eşit uzunluktaki dönem — yüzde değişim bundan hesaplanıyor.
  oncekiDonem: AnalitikToplamlari;
  gunlukSeri: { tarih: string; kullanici: number; goruntulenme: number }[];
  enCokGorulenSayfalar: { yol: string; baslik: string; goruntulenme: number }[];
  kanallar: { ad: string; oturum: number }[];
  cihazlar: { ad: string; oturum: number }[];
  ulkeler: { ad: string; oturum: number }[];
  anlikKullanici: number;
}

const BOS_TOPLAMLAR: AnalitikToplamlari = {
  activeUsers: 0,
  newUsers: 0,
  sessions: 0,
  screenPageViews: 0,
  averageSessionDuration: 0,
  bounceRate: 0,
};

function bosOzet(gun: number, yapilandirildiMi: boolean, hata: string | null): AnalitikOzeti {
  return {
    yapilandirildiMi,
    hata,
    gun,
    toplamlar: BOS_TOPLAMLAR,
    oncekiDonem: BOS_TOPLAMLAR,
    gunlukSeri: [],
    enCokGorulenSayfalar: [],
    kanallar: [],
    cihazlar: [],
    ulkeler: [],
    anlikKullanici: 0,
  };
}

// Sonuçlar bellekte tutuluyor: panel her açılışta birden fazla HTTP çağrısı yapmasın ve
// Google'ın günlük istek kotası panelde gezinirken tükenmesin.
const raporCache = new Map<string, { at: number; veri: AnalitikOzeti }>();
const CACHE_MS = 5 * 60 * 1000;

const METRIK_ADLARI = ["activeUsers", "newUsers", "sessions", "screenPageViews", "averageSessionDuration", "bounceRate"];

function toplamlariOku(rapor: GaRapor | undefined, aralikIndex: number): AnalitikToplamlari {
  // İki tarih aralıklı raporda satırlar dateRange boyutuyla ayrışıyor.
  const satir = rapor?.rows?.find((r) => r.dimensionValues?.[0]?.value === `date_range_${aralikIndex}`);
  const v = satir?.metricValues ?? [];
  return {
    activeUsers: sayi(v[0]?.value),
    newUsers: sayi(v[1]?.value),
    sessions: sayi(v[2]?.value),
    screenPageViews: sayi(v[3]?.value),
    averageSessionDuration: sayi(v[4]?.value),
    bounceRate: sayi(v[5]?.value),
  };
}

export async function analitikOzetiniGetir(gun = 28, zorla = false): Promise<AnalitikOzeti> {
  const cacheAnahtari = `ozet:${gun}`;
  const cached = raporCache.get(cacheAnahtari);
  if (!zorla && cached && Date.now() - cached.at < CACHE_MS) return cached.veri;

  const ayarlar = await db.siteSettings.findUnique({ where: { id: "ana" } });
  const propertyId = ayarlar?.gaPropertyId?.trim();

  if (!propertyId || !ayarlar?.gaServiceAccount) {
    return bosOzet(gun, false, null);
  }

  try {
    const hesap = servisHesabiniAyristir(sirriCoz(ayarlar.gaServiceAccount));
    const token = await erisimJetonuAl(hesap);

    const guncel = { startDate: `${gun - 1}daysAgo`, endDate: "today" };
    const onceki = { startDate: `${gun * 2 - 1}daysAgo`, endDate: `${gun}daysAgo` };
    const metrikler = METRIK_ADLARI.map((name) => ({ name }));

    const [batchA, batchB, anlikKullanici] = await Promise.all([
      raporlariCalistir(propertyId, token, [
        // 0 — iki dönemin toplamları
        { dateRanges: [guncel, onceki], metrics: metrikler },
        // 1 — günlük seri
        {
          dateRanges: [guncel],
          dimensions: [{ name: "date" }],
          metrics: [{ name: "activeUsers" }, { name: "screenPageViews" }],
          orderBys: [{ dimension: { dimensionName: "date" } }],
          limit: 400,
        },
        // 2 — en çok görüntülenen sayfalar
        {
          dateRanges: [guncel],
          dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
          metrics: [{ name: "screenPageViews" }],
          orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
          limit: 10,
        },
        // 3 — trafik kanalları
        {
          dateRanges: [guncel],
          dimensions: [{ name: "sessionDefaultChannelGroup" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 8,
        },
        // 4 — cihaz kırılımı
        {
          dateRanges: [guncel],
          dimensions: [{ name: "deviceCategory" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 5,
        },
      ]),
      raporlariCalistir(propertyId, token, [
        {
          dateRanges: [guncel],
          dimensions: [{ name: "country" }],
          metrics: [{ name: "sessions" }],
          orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
          limit: 8,
        },
      ]),
      anlikKullaniciSayisiniAl(propertyId, token),
    ]);

    const ozet: AnalitikOzeti = {
      yapilandirildiMi: true,
      hata: null,
      gun,
      toplamlar: toplamlariOku(batchA[0], 0),
      oncekiDonem: toplamlariOku(batchA[0], 1),
      gunlukSeri: (batchA[1]?.rows ?? []).map((r) => ({
        tarih: gaTarihi(r.dimensionValues?.[0]?.value ?? ""),
        kullanici: sayi(r.metricValues?.[0]?.value),
        goruntulenme: sayi(r.metricValues?.[1]?.value),
      })),
      enCokGorulenSayfalar: (batchA[2]?.rows ?? []).map((r) => ({
        yol: r.dimensionValues?.[0]?.value ?? "",
        baslik: r.dimensionValues?.[1]?.value ?? "",
        goruntulenme: sayi(r.metricValues?.[0]?.value),
      })),
      kanallar: (batchA[3]?.rows ?? []).map((r) => ({
        ad: r.dimensionValues?.[0]?.value ?? "",
        oturum: sayi(r.metricValues?.[0]?.value),
      })),
      cihazlar: (batchA[4]?.rows ?? []).map((r) => ({
        ad: r.dimensionValues?.[0]?.value ?? "",
        oturum: sayi(r.metricValues?.[0]?.value),
      })),
      ulkeler: (batchB[0]?.rows ?? []).map((r) => ({
        ad: r.dimensionValues?.[0]?.value ?? "",
        oturum: sayi(r.metricValues?.[0]?.value),
      })),
      anlikKullanici,
    };

    raporCache.set(cacheAnahtari, { at: Date.now(), veri: ozet });
    return ozet;
  } catch (err) {
    // Panel yine de açılmalı: hata kart içinde gösteriliyor, sayfa çökmüyor.
    return bosOzet(gun, true, kisaHata(err));
  }
}

/** Ayarlar ekranındaki "Bağlantıyı Test Et" düğmesi. */
export async function analitikBaglantisiniTestEt(): Promise<{ basarili: boolean; mesaj: string }> {
  const ayarlar = await db.siteSettings.findUnique({ where: { id: "ana" } });
  const propertyId = ayarlar?.gaPropertyId?.trim();

  if (!propertyId) return { basarili: false, mesaj: "Property ID girilmemiş." };
  if (!ayarlar?.gaServiceAccount) return { basarili: false, mesaj: "Servis hesabı anahtarı yüklenmemiş." };

  try {
    const hesap = servisHesabiniAyristir(sirriCoz(ayarlar.gaServiceAccount));
    const token = await erisimJetonuAl(hesap);
    const raporlar = await raporlariCalistir(propertyId, token, [
      { dateRanges: [{ startDate: "7daysAgo", endDate: "today" }], metrics: [{ name: "activeUsers" }] },
    ]);
    const kullanici = sayi(raporlar[0]?.rows?.[0]?.metricValues?.[0]?.value);
    return { basarili: true, mesaj: `Bağlantı başarılı. Son 7 günde ${kullanici.toLocaleString("tr-TR")} kullanıcı.` };
  } catch (err) {
    return { basarili: false, mesaj: kisaHata(err) };
  }
}

/** Ayarlar kaydedildiğinde ya da elle tazelendiğinde çağrılır. */
export function analitikCacheTemizle(): void {
  raporCache.clear();
}
