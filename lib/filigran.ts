import { spawn } from "child_process";
import { mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";

// Windows'ta sistem fontu — metin filigranı için (Python kurulumunda da
// kullandığımız, sistemde her zaman bulunan bir TrueType font).
const FONT_YOLU = "C\\:/Windows/Fonts/arialbd.ttf";

// ffmpeg'i PATH'ten değil, opsiyonel FFMPEG_PATH env değişkeninden (verilmişse)
// çözüyoruz. Windows'ta winget ile kurulan araçlar PATH'e yeni açılan
// process'lerde yansıyor ama bu ortamda halihazırda çalışan Node process'i
// eski PATH'i taşıyabiliyor — bu yüzden yerel geliştirmede .env'de
// FFMPEG_PATH ile mutlak yol veriyoruz. Üretimde (paket yöneticisiyle kurulu
// Linux sunucu) FFMPEG_PATH boş bırakılırsa PATH'teki "ffmpeg" kullanılır.
const FFMPEG_YOLU = process.env.FFMPEG_PATH || "ffmpeg";

// Videonun sağ-alt köşesine yarı saydam site adı filigranı basar.
export function filigranEkle(kaynakYol: string, hedefYol: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const drawtext =
      "drawtext=fontfile='" +
      FONT_YOLU +
      "':text='lucidmove.net':fontcolor=white@0.55:fontsize=h/22:x=w-tw-24:y=h-th-24:box=1:boxcolor=black@0.25:boxborderw=8";

    const ffmpeg = spawn(FFMPEG_YOLU, [
      "-y",
      "-i",
      kaynakYol,
      "-vf",
      drawtext,
      "-codec:a",
      "copy",
      "-codec:v",
      "libx264",
      "-preset",
      "veryfast",
      "-crf",
      "23",
      hedefYol,
    ]);

    let hataMetni = "";
    ffmpeg.stderr.on("data", (veri) => {
      hataMetni += veri.toString();
    });

    ffmpeg.on("error", (err) => reject(err));
    ffmpeg.on("close", (kod) => {
      if (kod === 0) resolve();
      else reject(new Error(`ffmpeg çıkış kodu ${kod}: ${hataMetni.slice(-500)}`));
    });
  });
}

// Bir dersin yüklenen ham videosunu filigranlayıp sonucu DB'ye yazar.
// Fire-and-forget çağrılır (await edilmez) — HTTP isteğini bloklamaz;
// admin panelde "İşleniyor" rozeti sayfa yenilenince "Hazır"/"Hata" olur.
// İş kuyruğu (Redis/BullMQ) yok — tek sunuculu küçük ölçek için Node
// process'i içinde arka planda çalışır.
export async function dersVideosunuFiligranla(dersId: string, kaynakGoreliYol: string) {
  const kamuKlasor = path.join(process.cwd(), "public");
  const kaynakMutlakYol = path.join(kamuKlasor, kaynakGoreliYol);
  const hedefGoreliYol = `/uploads/videos/filigranli/${randomUUID()}.mp4`;
  const hedefMutlakYol = path.join(kamuKlasor, hedefGoreliYol);

  try {
    await mkdir(path.dirname(hedefMutlakYol), { recursive: true });
    await filigranEkle(kaynakMutlakYol, hedefMutlakYol);
    await db.lesson.update({
      where: { id: dersId },
      data: { videoUrl: hedefGoreliYol, filigranDurumu: "HAZIR" },
    });
  } catch (err) {
    console.error(`Filigranlama başarısız (ders ${dersId}):`, err);
    await db.lesson.update({
      where: { id: dersId },
      data: { filigranDurumu: "HATA" },
    });
  }
}
