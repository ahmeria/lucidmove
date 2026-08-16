import Image from "next/image";

export interface TemaOgesi {
  deger: string;
  etiket: string;
  kapakUrl: string | null;
}

// Hem "Seviyeler" hem "Mood" satırında kullanılan tek kart deseni — bir
// temsilci kapak üzerine büyük, ortalı bir etiket. Görsel yoksa (ör. henüz
// hiçbir derse o mood verilmemişse) düz sıcak bir zemine düşer.
// KursKatalogu.tsx içinde kullanılıyor — hem /courses hem /account bu
// bileşeni doğrudan kullandığı için ayrıca içe aktarmaya gerek kalmıyor.
export default function TemaKarti({
  oge,
  aktif,
  onClick,
}: {
  oge: TemaOgesi;
  aktif: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={aktif}
      className={`group relative block w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden text-left cursor-pointer transition-shadow ${
        aktif ? "ring-2 ring-toprak ring-offset-2 ring-offset-zemin" : ""
      }`}
    >
      {oge.kapakUrl ? (
        <Image
          src={oge.kapakUrl}
          alt=""
          fill
          sizes="(min-width: 1024px) 25vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="absolute inset-0 bg-toprak/20" />
      )}
      <div className="absolute inset-0 bg-koyu/40 group-hover:bg-koyu/50 transition-colors" />
      <span className="absolute inset-0 flex items-center justify-center px-2 text-center font-display text-lg sm:text-xl font-bold uppercase tracking-wide text-white">
        {oge.etiket}
      </span>
    </button>
  );
}
