// Yüklenen dosyanın GERÇEK içeriğini (ilk baytları / "magic number") doğrular —
// yalnızca istemcinin bildirdiği Content-Type'a (dosya.type) güvenmek yeterli
// değil, bu değer kolayca sahtelenebilir. Aynı şekilde diske yazılacak dosya
// uzantısı da kullanıcının gönderdiği dosya adından DEĞİL, burada doğrulanan
// gerçek tipten türetilir — aksi halde ".html" gibi bir dosya sahte
// "image/jpeg" Content-Type'ıyla yüklenip sitenin kendi alan adından servis
// edilen bir stored-XSS/oltalama dosyasına dönüşebilir.

interface DosyaTipiTanimi {
  mime: string;
  uzanti: string;
  // Dosyanın başlangıcında (offset 0'dan) beklenen bayt imzası.
  imza: number[];
}

const IMAJ_TIPLERI: DosyaTipiTanimi[] = [
  { mime: "image/jpeg", uzanti: ".jpg", imza: [0xff, 0xd8, 0xff] },
  { mime: "image/png", uzanti: ".png", imza: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  // WEBP: "RIFF"....."WEBP" — ilk 4 bayt RIFF, 8-11. baytlar WEBP (aradaki 4 bayt dosya boyutu).
  { mime: "image/webp", uzanti: ".webp", imza: [0x52, 0x49, 0x46, 0x46] },
];

const VIDEO_TIPLERI: DosyaTipiTanimi[] = [
  // MP4/MOV (ISO Base Media): offset 4-7 "ftyp" — imza kontrolünde offset'i ayrıca ele alıyoruz.
  { mime: "video/mp4", uzanti: ".mp4", imza: [0x66, 0x74, 0x79, 0x70] },
  { mime: "video/quicktime", uzanti: ".mov", imza: [0x66, 0x74, 0x79, 0x70] },
  { mime: "video/webm", uzanti: ".webm", imza: [0x1a, 0x45, 0xdf, 0xa3] },
  { mime: "video/ogg", uzanti: ".ogg", imza: [0x4f, 0x67, 0x67, 0x53] },
];

function baytlarEslesiyorMu(buffer: Buffer, imza: number[], offset: number): boolean {
  if (buffer.length < offset + imza.length) return false;
  for (let i = 0; i < imza.length; i++) {
    if (buffer[offset + i] !== imza[i]) return false;
  }
  return true;
}

function gercekTipiBul(buffer: Buffer, adaylar: DosyaTipiTanimi[]): DosyaTipiTanimi | null {
  for (const tip of adaylar) {
    // ftyp imzalı MP4/MOV dosyalarında kutu boyutu ilk 4 bayt, "ftyp" 4-7 aralığında.
    const offset = tip.imza[0] === 0x66 && tip.imza[1] === 0x74 ? 4 : 0;
    if (baytlarEslesiyorMu(buffer, tip.imza, offset)) return tip;
  }
  return null;
}

// İstemcinin bildirdiği MIME tipi izin verilenler arasındaysa VE dosyanın ilk
// baytları o tiple uyuşuyorsa gerçek tipi (ve güvenli uzantıyı) döndürür;
// aksi halde null (dosya reddedilmeli).
export function gorseldenGuvenliTipCikar(buffer: Buffer, bildirilenTip: string): { uzanti: string } | null {
  if (!IMAJ_TIPLERI.some((t) => t.mime === bildirilenTip)) return null;
  const gercek = gercekTipiBul(buffer, IMAJ_TIPLERI);
  return gercek ? { uzanti: gercek.uzanti } : null;
}

export function videodanGuvenliTipCikar(buffer: Buffer, bildirilenTip: string): { uzanti: string } | null {
  if (!VIDEO_TIPLERI.some((t) => t.mime === bildirilenTip)) return null;
  const gercek = gercekTipiBul(buffer, VIDEO_TIPLERI);
  return gercek ? { uzanti: gercek.uzanti } : null;
}
