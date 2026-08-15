// Seçilen video dosyasının süresini, sunucuya yüklemeden ÖNCE tarayıcının
// kendi <video> elemanı üzerinden okur. Bunun için ffmpeg vb. bir sunucu
// eklentisi/kütüphanesi gerekmiyor — modern tarayıcıların hepsi video
// metadata'sını (süre dahil) yerelde çözebiliyor.
//
// Bazı tarayıcılarda (özellikle ekran kaydı gibi MediaRecorder çıktısı olan,
// moov atom'unda süre bilgisi eksik webm/mp4 dosyalarında) `duration` ilk
// okumada `Infinity` dönebiliyor — bilinen bir tarayıcı tuhaflığı. Bu durumda
// dosyanın sonuna "sanal" bir atlama yaptırıp gerçek süreyi zorla hesaplatan
// standart geçici çözüm uygulanıyor.
export function videoSuresiniOku(dosya: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(dosya);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;

    let tamamlandi = false;
    function temizle() {
      URL.revokeObjectURL(url);
      video.src = "";
    }
    function basarisiz() {
      if (tamamlandi) return;
      tamamlandi = true;
      temizle();
      reject(new Error("Video süresi okunamadı"));
    }
    function basarili(saniye: number) {
      if (tamamlandi) return;
      tamamlandi = true;
      temizle();
      resolve(saniye);
    }

    video.onloadedmetadata = () => {
      if (isFinite(video.duration) && video.duration > 0) {
        basarili(video.duration);
        return;
      }
      // Infinity/NaN durumu — sona atlayıp gerçek süreyi zorla hesaplat.
      video.currentTime = 1e10;
      video.ontimeupdate = () => {
        video.ontimeupdate = null;
        if (isFinite(video.duration) && video.duration > 0) {
          basarili(video.duration);
        } else {
          basarisiz();
        }
      };
    };
    video.onerror = basarisiz;

    video.src = url;
  });
}

// Saniyeyi, "Süre (dk)" alanına yazılacak tam dakikaya çevirir (en az 1 dk).
export function saniyeyiDakikayaYuvarla(saniye: number): number {
  return Math.max(1, Math.round(saniye / 60));
}
