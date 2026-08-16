"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, DragEvent } from "react";
import { useToast } from "@/components/Toast";
import KursSilButonu from "./KursSilButonu";

interface Kurs {
  id: string;
  baslik: string;
  seviye: string;
  kapakUrl: string | null;
  dersSayisi: number;
}

function BosResimIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path
        d="m4.5 16 4.5-4.5a1.5 1.5 0 0 1 2.1 0l2.4 2.4M13.5 13.2 15 11.7a1.5 1.5 0 0 1 2.1 0l1.9 1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Sürükleme tutamacı — 6 noktalı klasik "grip" simgesi (bkz.
// app/admin/moods/MoodYonetimi.tsx, aynı desen).
function TutamacIkonu({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <circle cx="9" cy="6" r="1.4" />
      <circle cx="9" cy="12" r="1.4" />
      <circle cx="9" cy="18" r="1.4" />
      <circle cx="15" cy="6" r="1.4" />
      <circle cx="15" cy="12" r="1.4" />
      <circle cx="15" cy="18" r="1.4" />
    </svg>
  );
}

// Kurslar listesi de artık Moodlar'la aynı görsel dile (satır: tutamaç +
// küçük kare kapak + bilgiler + aksiyonlar) taşındı ve sürükle-bırakla
// sıralanıyor — eskiden kart grid'i + elle "Sıra" alanıydı.
function KursSatiri({
  kurs,
  suruklenebilir,
  suruklenen,
  suruklemeOlaylari,
}: {
  kurs: Kurs;
  suruklenebilir: boolean;
  suruklenen: boolean;
  suruklemeOlaylari: {
    onDragStart: (e: DragEvent<HTMLDivElement>) => void;
    onDragEnter: () => void;
    onDragOver: (e: DragEvent<HTMLDivElement>) => void;
    onDragEnd: () => void;
  };
}) {
  return (
    <div
      onDragEnter={suruklemeOlaylari.onDragEnter}
      onDragOver={suruklemeOlaylari.onDragOver}
      className={`flex flex-wrap items-center gap-4 border rounded-lg p-4 bg-kart transition-opacity ${
        suruklenen ? "opacity-40 border-vurgu" : "border-cizgi"
      }`}
    >
      {suruklenebilir && (
        <div
          draggable
          onDragStart={suruklemeOlaylari.onDragStart}
          onDragEnd={suruklemeOlaylari.onDragEnd}
          title="Sürükleyip sırala"
          className="shrink-0 flex items-center justify-center size-9 rounded-lg text-metin/25 hover:text-metin/50 cursor-grab active:cursor-grabbing"
        >
          <TutamacIkonu className="size-4" />
        </div>
      )}

      <Link href={`/admin/courses/${kurs.id}/edit`} className="relative shrink-0 size-20 rounded-xl overflow-hidden border border-cizgi bg-zemin">
        {kurs.kapakUrl ? (
          <Image src={kurs.kapakUrl} alt="" fill sizes="80px" draggable={false} className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-metin/20">
            <BosResimIkonu className="size-6" />
          </span>
        )}
      </Link>

      <Link href={`/admin/courses/${kurs.id}/edit`} className="flex-1 min-w-[10rem]">
        <span className="font-mono text-[11px] text-ikincil-dark uppercase tracking-wide">{kurs.seviye}</span>
        <h3 className="font-display text-base font-bold text-metin mt-0.5 line-clamp-1">{kurs.baslik}</h3>
        <p className="font-mono text-xs text-metin/45 mt-1">{kurs.dersSayisi} ders</p>
      </Link>

      <div className="flex items-center gap-4 shrink-0">
        <Link href={`/admin/courses/${kurs.id}/edit`} className="font-body text-sm text-vurgu hover:text-vurgu-dark">
          Düzenle
        </Link>
        <KursSilButonu kursId={kurs.id} kursBaslik={kurs.baslik} />
      </div>
    </div>
  );
}

export default function KursListesi({ kurslar }: { kurslar: Kurs[] }) {
  const router = useRouter();
  const toast = useToast();
  const [liste, setListe] = useState(kurslar);
  const [suruklenenId, setSuruklenenId] = useState<string | null>(null);

  // Sunucudan taze veri geldiğinde (router.refresh() sonrası) yerel listeyi
  // eşitle — bkz. DersYonetimi.tsx/MoodYonetimi.tsx'teki aynı desen.
  useEffect(() => {
    setListe(kurslar);
  }, [kurslar]);

  async function siralamayiKaydet(yeniListe: Kurs[]) {
    const res = await fetch("/api/admin/courses/sirala", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siraliIdler: yeniListe.map((k) => k.id) }),
    });
    if (!res.ok) {
      toast.error("Sıralama kaydedilemedi");
      setListe(kurslar); // sunucudaki son bilinen sıraya geri dön
      return;
    }
    router.refresh();
  }

  function uzerineGelindi(hedefId: string) {
    if (!suruklenenId || suruklenenId === hedefId) return;
    setListe((mevcut) => {
      const kaynakIndex = mevcut.findIndex((k) => k.id === suruklenenId);
      const hedefIndex = mevcut.findIndex((k) => k.id === hedefId);
      if (kaynakIndex === -1 || hedefIndex === -1) return mevcut;
      const yeni = [...mevcut];
      const [tasinan] = yeni.splice(kaynakIndex, 1);
      yeni.splice(hedefIndex, 0, tasinan);
      return yeni;
    });
  }

  function suruklemeBitti() {
    if (suruklenenId) {
      setListe((mevcut) => {
        siralamayiKaydet(mevcut);
        return mevcut;
      });
    }
    setSuruklenenId(null);
  }

  if (liste.length === 0) {
    return <p className="font-body text-metin/60">Henüz kurs yok.</p>;
  }

  return (
    <div className="space-y-3">
      {liste.length > 1 && (
        <p className="text-xs text-metin/40 flex items-center gap-1.5">
          <TutamacIkonu className="size-3.5" />
          Sırasını değiştirmek için soldaki tutamaçtan sürükleyip bırakın
        </p>
      )}
      {liste.map((k) => (
        <KursSatiri
          key={k.id}
          kurs={k}
          suruklenebilir={liste.length > 1}
          suruklenen={suruklenenId === k.id}
          suruklemeOlaylari={{
            onDragStart: (e) => {
              e.dataTransfer.effectAllowed = "move";
              setSuruklenenId(k.id);
            },
            onDragEnter: () => uzerineGelindi(k.id),
            onDragOver: (e) => e.preventDefault(),
            onDragEnd: suruklemeBitti,
          }}
        />
      ))}
    </div>
  );
}
