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
