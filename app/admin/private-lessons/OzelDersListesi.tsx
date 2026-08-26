"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, DragEvent } from "react";
import { useToast } from "@/components/Toast";
import OzelDersSilButonu from "./OzelDersSilButonu";

interface OzelDers {
  id: string;
  baslik: string;
  fiyat: string;
  kapakUrl: string | null;
  yayindaMi: boolean;
  videoSayisi: number;
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

// Sürükleme tutamacı — bkz. app/admin/courses/KursListesi.tsx, aynı desen.
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

// KursListesi.tsx ile birebir aynı görsel/etkileşim deseni — sürükle-bırakla
// sıralanan satır listesi.
function OzelDersSatiri({
  ders,
  suruklenebilir,
  suruklenen,
  suruklemeOlaylari,
}: {
  ders: OzelDers;
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

      <Link
        href={`/admin/private-lessons/${ders.id}/edit`}
        className="relative shrink-0 size-20 rounded-xl overflow-hidden border border-cizgi bg-zemin"
      >
        {ders.kapakUrl ? (
          <Image src={ders.kapakUrl} alt="" fill sizes="80px" draggable={false} className="object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-metin/20">
            <BosResimIkonu className="size-6" />
          </span>
        )}
      </Link>

      <Link href={`/admin/private-lessons/${ders.id}/edit`} className="flex-1 min-w-[10rem]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px] text-ikincil-dark uppercase tracking-wide">₺{ders.fiyat}</span>
          {!ders.yayindaMi && (
            <span className="font-mono text-[10px] uppercase tracking-wide bg-metin/10 text-metin/60 px-2 py-0.5 rounded-full">
              Taslak
            </span>
          )}
        </div>
        <h3 className="font-display text-base font-bold text-metin mt-0.5 line-clamp-1">{ders.baslik}</h3>
        <p className="font-mono text-xs text-metin/45 mt-1">{ders.videoSayisi} video</p>
      </Link>

      <div className="flex items-center gap-4 shrink-0">
        <Link
          href={`/admin/private-lessons/${ders.id}/purchases`}
          className="font-body text-sm text-vurgu hover:text-vurgu-dark"
        >
          Satın alanlar
        </Link>
        <Link
          href={`/admin/private-lessons/${ders.id}/edit`}
          className="font-body text-sm text-vurgu hover:text-vurgu-dark"
        >
          Düzenle
        </Link>
        <OzelDersSilButonu dersId={ders.id} dersBaslik={ders.baslik} />
      </div>
    </div>
  );
}

export default function OzelDersListesi({ dersler }: { dersler: OzelDers[] }) {
  const router = useRouter();
  const toast = useToast();
  const [liste, setListe] = useState(dersler);
  const [suruklenenId, setSuruklenenId] = useState<string | null>(null);

  useEffect(() => {
    setListe(dersler);
  }, [dersler]);

  async function siralamayiKaydet(yeniListe: OzelDers[]) {
    const res = await fetch("/api/admin/private-lessons/sirala", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siraliIdler: yeniListe.map((d) => d.id) }),
    });
    if (!res.ok) {
      toast.error("Sıralama kaydedilemedi");
      setListe(dersler);
      return;
    }
    router.refresh();
  }

  function uzerineGelindi(hedefId: string) {
    if (!suruklenenId || suruklenenId === hedefId) return;
    setListe((mevcut) => {
      const kaynakIndex = mevcut.findIndex((d) => d.id === suruklenenId);
      const hedefIndex = mevcut.findIndex((d) => d.id === hedefId);
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
    return <p className="font-body text-metin/60">Henüz özel ders yok.</p>;
  }

  return (
    <div className="space-y-3">
      {liste.length > 1 && (
        <p className="text-xs text-metin/40 flex items-center gap-1.5">
          <TutamacIkonu className="size-3.5" />
          Sırasını değiştirmek için soldaki tutamaçtan sürükleyip bırakın
        </p>
      )}
      {liste.map((d) => (
        <OzelDersSatiri
          key={d.id}
          ders={d}
          suruklenebilir={liste.length > 1}
          suruklenen={suruklenenId === d.id}
          suruklemeOlaylari={{
            onDragStart: (e) => {
              e.dataTransfer.effectAllowed = "move";
              setSuruklenenId(d.id);
            },
            onDragEnter: () => uzerineGelindi(d.id),
            onDragOver: (e) => e.preventDefault(),
            onDragEnd: suruklemeBitti,
          }}
        />
      ))}
    </div>
  );
}
