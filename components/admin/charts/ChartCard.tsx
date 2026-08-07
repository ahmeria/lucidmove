import type { ReactNode } from "react";

// Panel'deki grafik/liste kartlarının ortak kabuğu — components/admin/Kart.tsx'ten
// farklı olarak başlığın altında bir açıklama satırı ve sağda bir aksiyon slotu
// taşıyabiliyor, bu grafik panelinin kendine özgü ihtiyacı.
export function ChartCard({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`w-full bg-kart border border-cizgi rounded-2xl shadow-organik p-6 ${className}`}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="font-display text-base font-bold text-metin">{title}</h3>
          {description && <p className="font-body mt-0.5 text-xs text-metin/45">{description}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

// Grafik yerine gösterilecek "veri yok" durumu; kart yüksekliğini korur.
export function ChartBos({ mesaj, height = 280 }: { mesaj: string; height?: number }) {
  return (
    <div className="flex items-center justify-center text-center" style={{ height }}>
      <p className="font-body max-w-xs text-sm text-metin/40">{mesaj}</p>
    </div>
  );
}
