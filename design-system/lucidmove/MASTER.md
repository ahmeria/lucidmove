# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** LucidMove
**Generated:** 2026-08-07 11:52:02 (raw tool output below, superseded by ground truth)
**Ground-truthed:** 2026-08-07 — overridden to match the actually-implemented site (`tailwind.config.ts`, `app/globals.css`, `app/layout.tsx`) instead of the generic keyword-matched output. Earlier sessions already ran multiple real redesign passes (dylanwerneryoga.com-inspired → kodesolution.com/yogava palette+font pass → Yona Club navbar/hero pass) before this skill was persisted; **this file documents what shipped**, not a fresh proposal. Treat it as authoritative; do not regenerate colors/fonts from scratch on future runs — only widen/refine.
**Category:** Yoga & Stretching / Wellness Video Membership
**Design Dials:** Variance 3/10 (Centered / Minimal) | Motion 4/10 (Standard) | Density 5/10 (Standard) — matches what's implemented (calm, editorial, low-chroma; motion limited to `riseIn`/`breathe` micro-animations, no aggressive choreography)

---

## Global Rules

### Color Palette (actual — `tailwind.config.ts`)

| Role | Hex | Tailwind Token | Usage |
|------|-----|-----------------|-------|
| Background | `#F2F0EC` | `zemin` | Page background — warm cream |
| Surface | `#FFFFFF` | `kart` | Card surfaces |
| Text | `#121212` | `metin` | Primary text — near-black |
| Accent/CTA | `#417572` (light `#6FA09D`, dark `#2E5452`) | `vurgu` | Primary accent, buttons, links, focus ring |
| Secondary accent | `#10551F` (light `#3A7A49`, dark `#0B3C15`) | `ikincil` | Secondary accent — deep forest green |
| Dark section bg | `#133241` | `koyu` | Footer, contrast sections — dark navy-green |
| Border | `#E5E1D6` | `cizgi` | Borders/dividers |
| Destructive | `#DC2626` | `hata` | Error states |

**Color notes:** Muted sage/adaçayı + cream + near-black, with a dark navy-green for contrast sections. Deliberately low-chroma/organic, not the generic teal/slate the raw tool output below suggests — **use the table above, not the "raw tool output" section's hex values.**

### Typography (actual — `app/layout.tsx`)

- **Display font:** Bricolage Grotesque (`font-display`, `--font-bricolage`)
- **Body font:** Archivo (`font-body`, `--font-archivo`)
- **Mono font:** IBM Plex Mono (`font-mono`, `--font-plex-mono`) — used for eyebrow/label text (tracked-out uppercase micro-labels above headings)
- Loaded via `next/font/google` (self-hosted, no external CSS import needed — do **not** add a Google Fonts `<link>`/`@import`, it's already optimal)
- Logo/wordmark specifically uses Plus Jakarta Sans (PNG-baked, logo file only — not a site-wide font)

### Spacing & Layout (actual)

- Content width: `.container-nefes` (max-width 1180px, responsive side padding) — reuse this class for any new full-width section instead of inventing a new max-width.
- Section anchor pattern: `id="kurslar"`, `id="uyelik"`, `id="hakkimda"` with `scroll-mt-20` so fixed navbar doesn't cover the anchor target on jump — **any new homepage section needs the same `scroll-mt-20` treatment.**
- Organic shape language: `.foto-organik` (asymmetric border-radius on editorial photos), `.blob` (blurred organic background shape) — reuse for visual consistency rather than plain rounded rectangles.

### Shadow Depths (actual — `tailwind.config.ts`)

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-organik` | `0 8px 30px rgba(15,23,42,0.06)` | Default card/element lift |
| `shadow-organik-hover` | `0 16px 40px rgba(15,23,42,0.10)` | Hover state |

### Motion (actual — already implemented)

- `animate-breathe` / `animate-breatheSmall` — slow 7s scale/opacity pulse, used sparingly for organic "alive" accents (not for content reveal)
- `animate-riseIn` — 0.7s translateY+opacity entrance
- Global `@media (prefers-reduced-motion: reduce)` already forces near-zero duration site-wide — already compliant with the checklist below, don't duplicate per-component reduced-motion handling
- Global `:focus-visible` outline (`2px solid #417572`) already applied to all interactive elements at the base-CSS level — already compliant, don't re-add per-component focus rings unless overriding this default

---

## Component Specs (actual patterns already in use — extend, don't replace)

### Buttons

Primary CTA: solid `vurgu` background, white text, generous padding (`px-6 py-3` scale), `rounded-full` or large radius, `shadow-organik` → `shadow-organik-hover` on hover, `transition`. Secondary: `vurgu` border + text on transparent/`kart` background. All interactive elements carry `cursor-pointer` implicitly via native `<button>`/`<a>` — don't override cursor.

### Cards

`kart` (white) background, `shadow-organik`, generous rounded corners, `shadow-organik-hover` + subtle `translateY(-2px)` on hover — matches the raw tool's generic card spec below closely enough to keep as-is.

### Inputs

Border `cizgi`, focus ring via the global `:focus-visible` rule (accent-colored) — don't hand-roll a different focus color per form.

### Status badges (new — introduced this session for filigran durumu)

Small pill: `rounded-full px-3 py-1 text-xs font-mono uppercase tracking-wide`, color-coded by state (bekliyor=gray/muted, işleniyor=amber/`vurgu-light` pulse, hazır=`ikincil` green, hata=`hata` red/10 bg + `hata` text). Keep this pattern for any future status/state indicator (subscription status, upload status, etc.) instead of inventing new badge styles per feature.

---

## Style Guidelines

**Actual style (shipped):** Organic Warm Minimalism — editorial photography with asymmetric organic crops, sage/cream/near-black palette, generous whitespace, Bricolage Grotesque display headings, tracked-out mono eyebrow labels, subtle breathing micro-animation. Inspired by boutique wellness sites (dylanwerneryoga.com, kodesolution.com/yogava, Yona Club navbar/hero treatment) — **not** the raw tool's "Exaggerated Minimalism" (that's a different, louder direction — oversized 900-weight type, high contrast fashion/agency aesthetic — do not apply it here, it would clash with the calm wellness positioning).

**Page pattern (actual):** One-page marketing site — Hero → `#uyelik` (pricing/plans) → `#kurslar` (courses grouped by category) → Testimonials → Gallery → `#hakkimda` (bio/certs/approach) → Footer. Legal/utility pages (`/sartlar`, `/gizlilik`) and the course-consumption routes (`/kurslar/[slug]`, `/kurslar/[slug]/[dersSlug]`) remain separate routes by design, not folded into the one-pager.

---

<details>
<summary>Raw tool output (keyword-matched, superseded — kept for reference only, do not follow the colors/style/typography below)</summary>

### Style Guidelines

**Style:** Exaggerated Minimalism

**Keywords:** Bold minimalism, oversized typography, high contrast, negative space, loud minimal, statement design

**Best For:** Fashion, architecture, portfolios, agency landing pages, luxury brands, editorial

**Key Effects:** font-size: clamp(3rem 10vw 12rem), font-weight: 900, letter-spacing: -0.05em, massive whitespace

### Page Pattern

**Pattern Name:** Video-First Hero

- **Conversion Strategy:** 86% higher engagement with video. Add captions for accessibility. Compress video for performance.
- **CTA Placement:** Overlay on video (center/bottom) + Bottom section
- **Section Order:** 1. Hero with video background, 2. Key features overlay, 3. Benefits section, 4. CTA

</details>

---

## Motion

**Stagger List** (Standard) — Trigger: load or scroll | Duration: 300-450ms | Easing: `back.out(1.4)`

```js
gsap.from('.grid-item', { opacity: 0, scale: 0.92, y: 16, duration: 0.4, stagger: { each: 0.06, from: 'start', grid: 'auto' }, ease: 'back.out(1.4)' });
```

**Framework notes:** grid: 'auto' lets GSAP infer rows/columns from a CSS grid layout for a natural wave stagger

- ✅ Combine with from: 'center' for a bento-grid layout to draw the eye inward first
- ❌ Don't use back.out on dense data tables; the overshoot reads as sloppy on informational UI
- ⚡ Group DOM writes; avoid interleaving layout reads (getBoundingClientRect) between staggered tweens

---

## Anti-Patterns (Do NOT Use)

- ❌ Inconsistent styling
- ❌ Poor contrast ratios

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
