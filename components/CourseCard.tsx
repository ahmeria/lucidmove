import Link from "next/link";

interface CourseCardProps {
  slug: string;
  baslik: string;
  aciklama: string;
  seviye: string;
  dersSayisi: number;
}

export default function CourseCard({ slug, baslik, aciklama, seviye, dersSayisi }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${slug}`}
      className="group block bg-kart border border-cizgi rounded-[1.5rem] p-7 shadow-organik hover:shadow-organik-hover hover:border-ikincil transition-all"
    >
      <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-ikincil-dark">
        {seviye}
      </span>
      <h3 className="font-display text-2xl font-bold text-metin mt-3 group-hover:text-vurgu-dark transition-colors">
        {baslik}
      </h3>
      <p className="font-body text-sm text-metin/65 mt-2.5 leading-relaxed line-clamp-2">{aciklama}</p>
      <p className="font-body text-xs text-metin/45 mt-5">{dersSayisi} ders</p>
    </Link>
  );
}
