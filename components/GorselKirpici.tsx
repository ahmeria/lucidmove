"use client";

import { useEffect, useMemo, useRef, useState } from "react";

// Yüklenen HER görsel için ortak yerleştirme adımı: kullanıcı dosyayı seçtikten
// sonra sunucuya gitmeden önce bu modal açılır, hedef orana göre yakınlaştırıp
// (zoom) sürükleyerek (pan) kadrajı ayarlar. Sonuç, sunucuya yollanmadan önce
// burada bir <canvas>'a çizilip JPEG'e dönüştürülür — yani sunucu her zaman
// zaten doğru orana kırpılmış bir dosya alır. Bağımlılıksız (harici kütüphane
// yok), Pointer Events ile fare/dokunmatik/kalem aynı kodla çalışır.
interface GorselKirpiciProps {
  dosya: File;
  oran: number; // genişlik / yükseklik — ör. kurs kapağı 4/3, galeri 1, hero 16/9
  daire?: boolean; // yalnızca önizleme maskesi — profil fotoğrafı gibi dairesel gösterilecek görseller için
  baslik?: string;
  onTamam: (sonuc: File) => void;
  onIptal: () => void;
}

const MAKS_CERCEVE_GENISLIK = 440;
const MAKS_CERCEVE_YUKSEKLIK = 420;
const MIN_OLCEK = 1;
const MAKS_OLCEK = 3;

export default function GorselKirpici({ dosya, oran, daire, baslik, onTamam, onIptal }: GorselKirpiciProps) {
  const [resimUrl, setResimUrl] = useState<string | null>(null);
  const [dogalBoyut, setDogalBoyut] = useState<{ genislik: number; yukseklik: number } | null>(null);
  const [olcek, setOlcek] = useState(MIN_OLCEK);
  const [konum, setKonum] = useState({ x: 0, y: 0 });
  const [islemDevamEdiyor, setIslemDevamEdiyor] = useState(false);
  const surukleme = useRef<{ baslangicX: number; baslangicY: number; konumX: number; konumY: number } | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(dosya);
    setResimUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [dosya]);

  // Çerçeve boyutu: hedef orana uyan, modal içine sığan sabit bir kutu.
  const cerceve = useMemo(() => {
    let genislik = MAKS_CERCEVE_GENISLIK;
    let yukseklik = genislik / oran;
    if (yukseklik > MAKS_CERCEVE_YUKSEKLIK) {
      yukseklik = MAKS_CERCEVE_YUKSEKLIK;
      genislik = yukseklik * oran;
    }
    return { genislik, yukseklik };
  }, [oran]);

  // Taban ölçek: görsel çerçeveyi TAM kaplayacak minimum büyüklük (CSS object-fit:
  // cover ile aynı mantık) — olcek (kullanıcının seçtiği yakınlaştırma) bunun üstüne eklenir.
  const tabanOlcek = dogalBoyut
    ? Math.max(cerceve.genislik / dogalBoyut.genislik, cerceve.yukseklik / dogalBoyut.yukseklik)
    : 1;
  const renderOlcek = tabanOlcek * olcek;

  function konumuSinirla(x: number, y: number, guncelRenderOlcek: number) {
    if (!dogalBoyut) return { x: 0, y: 0 };
    const maksX = Math.max(0, (dogalBoyut.genislik * guncelRenderOlcek - cerceve.genislik) / 2);
    const maksY = Math.max(0, (dogalBoyut.yukseklik * guncelRenderOlcek - cerceve.yukseklik) / 2);
    return { x: Math.min(maksX, Math.max(-maksX, x)), y: Math.min(maksY, Math.max(-maksY, y)) };
  }

  function olcekDegisti(yeniOlcek: number) {
    setOlcek(yeniOlcek);
    if (dogalBoyut) setKonum((k) => konumuSinirla(k.x, k.y, tabanOlcek * yeniOlcek));
  }

  function surureBasladi(e: React.PointerEvent) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    surukleme.current = { baslangicX: e.clientX, baslangicY: e.clientY, konumX: konum.x, konumY: konum.y };
  }
  function surureDevamEdiyor(e: React.PointerEvent) {
    if (!surukleme.current) return;
    const dx = e.clientX - surukleme.current.baslangicX;
    const dy = e.clientY - surukleme.current.baslangicY;
    setKonum(konumuSinirla(surukleme.current.konumX + dx, surukleme.current.konumY + dy, renderOlcek));
  }
  function surukleBitti() {
    surukleme.current = null;
  }

  async function yerlestir() {
    if (!dogalBoyut || !resimUrl) return;
    setIslemDevamEdiyor(true);
    try {
      const img = new Image();
      img.src = resimUrl;
      await img.decode();

      // Çerçevenin kapladığı bölgeyi görselin DOĞAL piksel uzayına çeviriyoruz —
      // ekrandaki transform'un tersi.
      const solUst = {
        x: cerceve.genislik / 2 - (dogalBoyut.genislik * renderOlcek) / 2 + konum.x,
        y: cerceve.yukseklik / 2 - (dogalBoyut.yukseklik * renderOlcek) / 2 + konum.y,
      };
      const sx = (0 - solUst.x) / renderOlcek;
      const sy = (0 - solUst.y) / renderOlcek;
      const sGenislik = cerceve.genislik / renderOlcek;
      const sYukseklik = cerceve.yukseklik / renderOlcek;

      const cikisGenislik = oran >= 1 ? 1600 : Math.round(1600 * oran);
      const cikisYukseklik = oran >= 1 ? Math.round(1600 / oran) : 1600;

      const canvas = document.createElement("canvas");
      canvas.width = cikisGenislik;
      canvas.height = cikisYukseklik;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas desteklenmiyor");
      ctx.drawImage(img, sx, sy, sGenislik, sYukseklik, 0, 0, cikisGenislik, cikisYukseklik);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
      if (!blob) throw new Error("Görsel oluşturulamadı");
      onTamam(new File([blob], "kirpilmis.jpg", { type: "image/jpeg" }));
    } finally {
      setIslemDevamEdiyor(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-koyu/70 backdrop-blur-sm p-6">
      <div className="bg-kart rounded-2xl shadow-organik-hover p-6 w-full max-w-lg font-body">
        <p className="font-display text-lg font-bold text-metin mb-1">{baslik ?? "Görseli yerleştirin"}</p>
        <p className="text-xs text-metin/50 mb-4">Sürükleyerek konumlandırın, kaydırıcıyla yakınlaştırın.</p>

        <div
          onPointerDown={surureBasladi}
          onPointerMove={surureDevamEdiyor}
          onPointerUp={surukleBitti}
          onPointerCancel={surukleBitti}
          className={`relative mx-auto overflow-hidden bg-koyu touch-none select-none cursor-grab active:cursor-grabbing ${
            daire ? "rounded-full" : "rounded-xl"
          }`}
          style={{ width: cerceve.genislik, height: cerceve.yukseklik }}
        >
          {resimUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- serbest transform ile piksel-bazlı konumlandırma; next/image burada uygun değil
            <img
              src={resimUrl}
              alt=""
              draggable={false}
              onLoad={(e) => {
                const el = e.currentTarget;
                setDogalBoyut({ genislik: el.naturalWidth, yukseklik: el.naturalHeight });
              }}
              style={
                dogalBoyut
                  ? {
                      position: "absolute",
                      width: dogalBoyut.genislik * renderOlcek,
                      height: dogalBoyut.yukseklik * renderOlcek,
                      left: cerceve.genislik / 2 - (dogalBoyut.genislik * renderOlcek) / 2 + konum.x,
                      top: cerceve.yukseklik / 2 - (dogalBoyut.yukseklik * renderOlcek) / 2 + konum.y,
                      maxWidth: "none",
                    }
                  : { opacity: 0 }
              }
            />
          )}
          {!dogalBoyut && (
            <div className="absolute inset-0 flex items-center justify-center text-zemin/50 text-xs">Yükleniyor…</div>
          )}
        </div>

        <div className="flex items-center gap-3 mt-5">
          <span className="text-metin/40 text-xs shrink-0">−</span>
          <input
            type="range"
            min={MIN_OLCEK}
            max={MAKS_OLCEK}
            step={0.01}
            value={olcek}
            onChange={(e) => olcekDegisti(Number(e.target.value))}
            disabled={!dogalBoyut}
            aria-label="Yakınlaştırma"
            className="w-full accent-vurgu cursor-pointer"
          />
          <span className="text-metin/40 text-sm shrink-0">+</span>
        </div>

        <div className="flex items-center justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onIptal}
            className="text-metin/50 text-sm hover:text-metin transition-colors cursor-pointer"
          >
            Vazgeç
          </button>
          <button
            type="button"
            onClick={yerlestir}
            disabled={!dogalBoyut || islemDevamEdiyor}
            className="bg-metin text-zemin px-5 py-2.5 rounded-lg text-sm hover:bg-koyu transition-colors disabled:opacity-60 cursor-pointer"
          >
            {islemDevamEdiyor ? "Hazırlanıyor…" : "Yerleştir"}
          </button>
        </div>
      </div>
    </div>
  );
}
