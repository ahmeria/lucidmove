import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        zemin: "#F2F0EC", // sayfa arkaplanı — sıcak krem
        "zemin-acik": "#FFFFFF", // admin panel zemini — kart içindeki bg-zemin şeritlerle (ör. tablo başlığı) karışmasın diye kart yüzeyiyle aynı, sınır kartlar border+gölge ile ayrılır
        kart: "#FFFFFF", // kart yüzeyi
        metin: "#121212", // ana metin — neredeyse siyah
        vurgu: {
          DEFAULT: "#417572", // accent/CTA — çamurlu adaçayı yeşili
          light: "#6FA09D",
          dark: "#2E5452",
        },
        ikincil: {
          DEFAULT: "#10551F", // ikincil vurgu — derin orman yeşili
          light: "#3A7A49",
          dark: "#0B3C15",
        },
        koyu: "#133241", // koyu bölüm zemini (footer, kontrast bölümler) — koyu lacivert-yeşil
        cizgi: "#E5E1D6", // border/ayraç
        hata: "#DC2626", // destructive
      },
      fontFamily: {
        display: ["var(--font-bricolage)", "sans-serif"],
        body: ["var(--font-archivo)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      boxShadow: {
        organik: "0 8px 30px rgba(15, 23, 42, 0.06)",
        "organik-hover": "0 16px 40px rgba(15, 23, 42, 0.10)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(0.86)", opacity: "0.75" },
          "50%": { transform: "scale(1)", opacity: "1" },
        },
        breatheSmall: {
          "0%, 100%": { transform: "scale(0.7)" },
          "50%": { transform: "scale(1)" },
        },
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        breathe: "breathe 7s ease-in-out infinite",
        breatheSmall: "breatheSmall 7s ease-in-out infinite",
        riseIn: "riseIn 0.7s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
