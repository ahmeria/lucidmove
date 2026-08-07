// Admin sidebar + header'ın paylaştığı tek kaynak: nav yapısı + ikonlar. İki client
// bileşen (AdminNav, AdminHeader) burada tanımlı grupları kullanır — liste tek yerde
// güncellenir, sidebar ve header'daki "şu an neredeyim" etiketi birbirinden sapmaz.

type IkonProps = { className?: string };

function PanelIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="3.5" width="7.5" height="7.5" rx="1.5" />
      <rect x="3.5" y="13" width="7.5" height="7.5" rx="1.5" />
      <rect x="13" y="13" width="7.5" height="7.5" rx="1.5" />
    </svg>
  );
}

function KategorilerIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M3.5 6.5a2 2 0 0 1 2-2h4l2 2.2h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" strokeLinejoin="round" />
    </svg>
  );
}

function KurslarIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H15l5 5v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5Z" strokeLinejoin="round" />
      <path d="M10.5 10.5v6l5-3Z" strokeLinejoin="round" />
    </svg>
  );
}

function FiyatlandirmaIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v10M14.5 9.3c0-.9-1.1-1.6-2.5-1.6s-2.5.8-2.5 1.8c0 2.4 5 1.2 5 3.6 0 1-1.1 1.8-2.5 1.8s-2.5-.7-2.5-1.6" strokeLinecap="round" />
    </svg>
  );
}

function UyeliklerIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <path d="M3.5 10h17" />
    </svg>
  );
}

function UyelerIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3 19c.6-3.3 3-5 6-5s5.4 1.7 6 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15.5 5.3c1.4.3 2.5 1.6 2.5 3.2 0 1.6-1.1 2.9-2.5 3.2M18 14.3c1.6.5 2.7 1.9 3 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function YorumlarIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4H5.5A1.5 1.5 0 0 1 4 14.5Z" strokeLinejoin="round" />
      <path d="M8 9.5c0-1 .8-1.5 1.5-1.5S11 8.5 11 9.5c0 1.3-1.5 1.6-1.5 2.7M14.5 9.5c0-1 .8-1.5 1.5-1.5s1.5.5 1.5 1.5c0 1.3-1.5 1.6-1.5 2.7" strokeLinecap="round" />
    </svg>
  );
}

function MesajlarIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7 7.5 6 7.5-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GenelAyarlarIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M4 6.5h9M17 6.5h3M4 12h13M20 12h-3M4 17.5h9M17 17.5h3" strokeLinecap="round" />
      <circle cx="15" cy="6.5" r="2" />
      <circle cx="9" cy="12" r="2" />
      <circle cx="15" cy="17.5" r="2" />
    </svg>
  );
}

function KullanicilarIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 19c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" strokeLinecap="round" />
      <path d="M15.5 5.3a3.2 3.2 0 0 1 0 6M20 19c0-2.6-1.7-4.5-4-5.2" strokeLinecap="round" />
    </svg>
  );
}

function RollerIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M12 3.5 19 6v5.5c0 4.2-3 7.3-7 9-4-1.7-7-4.8-7-9V6Z" strokeLinejoin="round" />
      <path d="m9 12 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CacheIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M20 11a8 8 0 1 0-2.6 6.4" strokeLinecap="round" />
      <path d="M20 5v6h-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function YedeklemeIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <ellipse cx="12" cy="6" rx="7.5" ry="2.5" />
      <path d="M4.5 6v6c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5V6" />
      <path d="M4.5 12v6c0 1.4 3.4 2.5 7.5 2.5s7.5-1.1 7.5-2.5v-6" />
    </svg>
  );
}

function LoglarIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M5.5 3.5h9L19 8v12.5a1 1 0 0 1-1 1h-12.5a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M8 12h8M8 15.5h8M8 8.5h4" strokeLinecap="round" />
    </svg>
  );
}

function EntegrasyonIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M9 3.5v3M15 3.5v3" strokeLinecap="round" />
      <path d="M6.5 6.5h11v4a5.5 5.5 0 0 1-11 0Z" strokeLinejoin="round" />
      <path d="M12 15.5v3M8.5 20.5h7" strokeLinecap="round" />
    </svg>
  );
}

function GuncellemeIkonu({ className }: IkonProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className}>
      <path d="M7 8.5a5 5 0 0 1 9-3" strokeLinecap="round" />
      <path d="M17 15.5a5 5 0 0 1-9 3" strokeLinecap="round" />
      <path d="m12 3.5 1.5 2-2.3 1M12 20.5 10.5 18.5l2.3-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface AdminNavOge {
  href: string;
  label: string;
  exact?: boolean;
  ikon: (props: IkonProps) => React.JSX.Element;
}

export interface AdminNavGrubu {
  baslik?: string;
  ogeler: AdminNavOge[];
}

// Sidebar'da yalnızca günlük içerik/ticaret yönetimi kalır — Ayarlar artık
// sidebar'da değil, header'daki usermenu'de (bkz. AYARLAR_OGELERI + AdminHeader).
export function adminNavGruplariniAl(): AdminNavGrubu[] {
  return [
    { ogeler: [{ href: "/admin", label: "Panel", exact: true, ikon: PanelIkonu }] },
    {
      baslik: "İçerik",
      ogeler: [
        { href: "/admin/kategoriler", label: "Kategoriler", ikon: KategorilerIkonu },
        { href: "/admin/kurslar", label: "Kurslar", ikon: KurslarIkonu },
        { href: "/admin/yorumlar", label: "Yorumlar", ikon: YorumlarIkonu },
      ],
    },
    {
      baslik: "Ticaret",
      ogeler: [
        { href: "/admin/fiyatlandirma", label: "Fiyatlandırma", ikon: FiyatlandirmaIkonu },
        { href: "/admin/uyeler", label: "Üyeler", ikon: UyelerIkonu },
        { href: "/admin/uyelikler", label: "Üyelikler", ikon: UyeliklerIkonu },
      ],
    },
    {
      baslik: "İletişim",
      ogeler: [{ href: "/admin/mesajlar", label: "Mesajlar", ikon: MesajlarIkonu }],
    },
  ];
}

// Ayarlar bölümü — yalnızca sistem yöneticisi işaretli hesaba gösterilir (bkz.
// lib/admin-auth.ts > getAdminSession). AdminHeader'daki usermenu dropdown'ında
// VE her /admin/ayarlar/** sayfasının üstündeki sekme şeridinde (AyarlarSekmeleri)
// aynı bu listeden besleniyor — tek kaynak.
export const AYARLAR_OGELERI: AdminNavOge[] = [
  { href: "/admin/ayarlar", label: "Genel Ayarlar", exact: true, ikon: GenelAyarlarIkonu },
  { href: "/admin/ayarlar/kullanicilar", label: "Kullanıcılar", ikon: KullanicilarIkonu },
  { href: "/admin/ayarlar/roller", label: "Roller", ikon: RollerIkonu },
  { href: "/admin/ayarlar/entegrasyon", label: "Entegrasyon", ikon: EntegrasyonIkonu },
  { href: "/admin/ayarlar/guncelleme", label: "Güncelleme", ikon: GuncellemeIkonu },
  { href: "/admin/ayarlar/cache", label: "Cache", ikon: CacheIkonu },
  { href: "/admin/ayarlar/yedekleme", label: "Yedekleme", ikon: YedeklemeIkonu },
  { href: "/admin/ayarlar/loglar", label: "Sistem Logları", ikon: LoglarIkonu },
];

// Header'daki "şu an neredeyim" başlığı — en uzun eşleşen href kazanır (ör.
// "/admin/ayarlar/kullanicilar" hem "/admin/ayarlar" hem kendi tam yoluyla eşleşir,
// en spesifik olan seçilir).
export function aktifSayfaBasligi(pathname: string, sistemYoneticisiMi: boolean): string {
  const tumOgeler = [
    ...adminNavGruplariniAl().flatMap((g) => g.ogeler),
    ...(sistemYoneticisiMi ? AYARLAR_OGELERI : []),
  ];
  const eslesenler = tumOgeler.filter((o) => (o.exact ? pathname === o.href : pathname.startsWith(o.href)));
  const enSpesifik = eslesenler.sort((a, b) => b.href.length - a.href.length)[0];
  return enSpesifik?.label ?? "Yönetim";
}
