// Panel'deki StatKart rozetlerinde kullanılan küçük ikon seti — admin-nav-data.tsx'teki
// sidebar ikonlarından ayrı tutuluyor çünkü anlamsal olarak farklı (istatistik konusu,
// nav hedefi değil) ve dışa aktarılmaları gerekiyor (StatKart çağıran sayfalar seçiyor).

type IkonProps = { className?: string };

export function UyeIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="9.5" cy="8.5" r="3.2" />
      <path d="M3.5 19c.6-3.3 3-5 6-5s5.4 1.7 6 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 5.3c1.4.3 2.5 1.6 2.5 3.2 0 1.6-1.1 2.9-2.5 3.2M18 14.3c1.6.5 2.7 1.9 3 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AbonelikIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M12 3.5 19 6v5.5c0 4-3 7-7 9-4-2-7-5-7-9V6Z" strokeLinejoin="round" />
      <path d="m9 12 2.2 2.2L15.5 10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GelirIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M3.5 15.5 9 10l3.5 3.5L20.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.5 5.5h6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MesajIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7 7.5 6 7.5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function KursIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" />
      <path d="M10.3 9.3v5.4l4.7-2.7Z" strokeLinejoin="round" />
    </svg>
  );
}

export function AnalitikIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M4.5 20V9.5M12 20V4.5M19.5 20v-7" strokeLinecap="round" />
      <path d="M3.5 20h17" strokeLinecap="round" />
    </svg>
  );
}

export function IzlenmeIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="2.8" />
    </svg>
  );
}
