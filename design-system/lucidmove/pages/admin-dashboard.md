# Page Override: Admin Dashboard (`/admin/**`)

> Overrides `../MASTER.md` for admin-panel pages only. Public site pages ignore this file.
> Generated via `search.py --design-system --density 8 --motion 3 --variance 4 -p "LucidMove" --page admin-dashboard` (2026-08-07), then **ground-truthed**: the tool's raw color/font suggestion (blue/amber "Sales Intelligence Dashboard", Fira Code/Fira Sans) is a generic dashboard archetype match — not what shipped. Colors/fonts below are MASTER.md's real tokens; only the **density, motion, and structural** parts of the raw suggestion are adopted, re-themed.

## What carries over from the raw suggestion

- **Density tier: 8/10 (Dense/Dashboard)** — tighter spacing than the marketing site. Use this scale for admin-only surfaces (tables, forms, settings panels), not `container-nefes`/`space-y-24` marketing rhythm:

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | `4px` | icon gaps, badge padding |
| `space-sm` | `8px` | inline control gaps |
| `space-md` | `12px` | table cell padding, form field gaps |
| `space-lg` | `20px` | card padding |
| `space-xl` | `32px` | section gaps within a settings page |

- **Motion tier: 3/10 (Subtle)** — admin UI is a work surface, not a marketing page. Only: 150–250ms color/shadow transitions on hover, no scroll-triggered reveals, no `animate-breathe`/`riseIn` (those are marketing-only). Respect the project's existing global `prefers-reduced-motion` rule (already in `globals.css`, nothing extra needed here).
- **Structural pattern** ("Sales Intelligence Dashboard" → reinterpreted as **Ops/Settings Dashboard**): stat cards at the top of list pages, dense data tables with sortable-feeling headers, status badges as pills, sidebar-grouped navigation, sticky header for orientation in a long admin session — same bones as the raw suggestion, none of its blue/amber palette.

## Colors, typography — use MASTER.md verbatim

No admin-specific override. Same `vurgu`/`ikincil`/`zemin`/`kart`/`metin`/`koyu`/`cizgi`/`hata` tokens, same Bricolage Grotesque/Archivo/JetBrains Mono. The admin panel is the same product, not a different brand — consistency between marketing site and admin matters more than matching a generic dashboard archetype. Admin-only additions: `zemin-acik` (white admin canvas, distinct from the marketing site's warm-cream `zemin`) and a dark `koyu`-toned sidebar (matches the public site's footer treatment) with an inverted logo.

## Admin-specific component notes

- **Sticky header** (`AdminHeader.tsx`, new): `bg-kart border-b border-cizgi`, `h-14`, sticky top-0 — mirrors the existing marketing navbar's sticky treatment but shorter (dense tier) and without the transparent/hero-overlay variant.
- **Grouped sidebar nav**: section labels in `font-mono text-[11px] uppercase tracking-[0.2em] text-metin/40` (matches the existing `Yönetim` eyebrow already used in every admin page heading), items `rounded-xl px-3 py-2`, active state `bg-vurgu text-white` (already established in `AdminNav.tsx` — kept as-is).
- **Stat cards**: keep the existing top-accent-stripe card pattern from `app/admin/page.tsx` (`shadow-organik` + `bg-vurgu/70` top stripe) — it already matches this tier, no change needed structurally, only reused for new list pages (Kullanıcılar, Yedekleme, Loglar) where a quick-glance count is useful (e.g. "Toplam kullanıcı", "Sistem yöneticisi sayısı").
- **Status badge pill**: `rounded-full px-2.5 py-1 text-[11px] font-mono uppercase tracking-wide` — already the established pattern (`FiligranRozeti` in `DersYonetimi.tsx`). Reuse for: kullanıcı rolü, yedekleme durumu (başarılı/başarısız), log seviyesi (INFO/ERROR).
- **Dense table**: `text-sm`, `px-5 py-3` cells (existing `Kategoriler`/`Kurslar`/`Üyelikler` admin tables already use this — carry forward unchanged), wrapped in `overflow-x-auto` (fixed earlier this session — keep doing this for every new admin table).
- **Avatar/user chip** (new, for `AdminHeader`): `size-8 rounded-full bg-gradient-to-br from-vurgu to-vurgu-dark text-white text-xs font-semibold` showing initials — same idea as the reference's header avatar, re-themed to the sage gradient instead of violet.

## Explicitly not adopted from the reference dashboard archetype

- No blue/amber color swap — see above.
- No Fira Code/Fira Sans swap — the project's existing display/body/mono trio stays.
- No gauge needles, leaderboard ranking animations, deal-movement motion — not relevant to this product; violates the Subtle (3/10) motion tier anyway.
