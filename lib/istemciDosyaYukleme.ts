// Admin panelindeki dosya (görsel/video) yükleme alanlarının ortak istemci
// yardımcısı. fetch() ile yükleme ilerlemesi (progress) güvenilir biçimde
// alınamıyor — bu yüzden burada bilinçli olarak XMLHttpRequest kullanılıyor,
// yalnızca o `xhr.upload.onprogress` olayını sağlıyor.
export function dosyaYukle(
  dosya: File,
  ilerlemeCallback?: (yuzde: number) => void
): Promise<{ url: string }> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("dosya", dosya);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && ilerlemeCallback) {
        ilerlemeCallback(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let veri: { url?: string; hata?: string } = {};
      try {
        veri = JSON.parse(xhr.responseText);
      } catch {
        // yanıt JSON değilse aşağıdaki genel hata mesajına düşülür
      }
      if (xhr.status >= 200 && xhr.status < 300 && veri.url) {
        resolve({ url: veri.url });
      } else {
        reject(new Error(veri.hata || "Yükleme başarısız"));
      }
    };

    xhr.onerror = () => reject(new Error("Yükleme başarısız — bağlantınızı kontrol edin"));

    xhr.send(form);
  });
}

async function parcayiGonder(uploadId: string, index: number, parca: Blob, deneme = 0): Promise<void> {
  const form = new FormData();
  form.append("uploadId", uploadId);
  form.append("index", String(index));
  form.append("parca", parca);

  let res: Response;
  try {
    res = await fetch("/api/admin/upload/video/chunk", { method: "POST", body: form });
  } catch {
    res = new Response(null, { status: 0 });
  }

  if (res.ok) return;

  // Ağ kesintisi/geçici hata — aynı parça 3 kez, artan aralıklarla tekrar denenir
  // (aynı konuma yazıldığı için tekrar göndermek güvenli, bkz. lib/parcaliYukleme.ts).
  if (deneme < 3) {
    await new Promise((r) => setTimeout(r, 1000 * (deneme + 1)));
    return parcayiGonder(uploadId, index, parca, deneme + 1);
  }

  const veri = await res.json().catch(() => ({}));
  throw new Error(veri.hata || "Parça yüklenemedi — bağlantınızı kontrol edip tekrar deneyin");
}

// Büyük video dosyaları için: dosyayı sabit boyutlu parçalara bölüp sırayla
// yükler, sunucu diskte "doldurur" (bkz. lib/parcaliYukleme.ts). Tek bir dev
// istek yerine çok sayıda küçük istek olduğu için bellek şişmez, bağlantı
// kesintisinde de sadece o parça yeniden denenir — baştan başlamaz.
export async function dosyaYukleParcali(
  dosya: File,
  ilerlemeCallback?: (yuzde: number) => void
): Promise<{ url: string }> {
  const baslatRes = await fetch("/api/admin/upload/video/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ boyut: dosya.size, tip: dosya.type }),
  });
  const baslatVeri = await baslatRes.json();
  if (!baslatRes.ok) throw new Error(baslatVeri.hata || "Yükleme başlatılamadı");

  const { uploadId, parcaBoyutu, toplamParca } = baslatVeri as {
    uploadId: string;
    parcaBoyutu: number;
    toplamParca: number;
  };

  for (let i = 0; i < toplamParca; i++) {
    const parca = dosya.slice(i * parcaBoyutu, (i + 1) * parcaBoyutu);
    await parcayiGonder(uploadId, i, parca);
    ilerlemeCallback?.(Math.round(((i + 1) / toplamParca) * 100));
  }

  const bitirRes = await fetch("/api/admin/upload/video/finish", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uploadId }),
  });
  const bitirVeri = await bitirRes.json();
  if (!bitirRes.ok) throw new Error(bitirVeri.hata || "Yükleme tamamlanamadı");

  return { url: bitirVeri.url };
}
