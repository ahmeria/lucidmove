"use client";

import { useEffect, useRef, useState } from "react";

// Sayfa kaydırıldıkça içerik görünür alana girince hafifçe beliren/yükselen bir
// sarmalayıcı — mevcut `animate-riseIn` keyframe'ini (hero'da da kullanılan)
// tetikler. prefers-reduced-motion zaten globals.css'te sitewide sıfırlanıyor,
// burada ayrıca ele almaya gerek yok. Liste/grid öğelerinde `gecikme` (ms) ile
// art arda (staggered) beliriş sağlanır.
export default function Canlandir({
  children,
  gecikme = 0,
  className = "",
}: {
  children: React.ReactNode;
  gecikme?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [gorunur, setGorunur] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const gozlemci = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGorunur(true);
          gozlemci.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    gozlemci.observe(node);
    return () => gozlemci.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${gorunur ? "animate-riseIn" : "opacity-0"} ${className}`}
      style={gorunur && gecikme ? { animationDelay: `${gecikme}ms` } : undefined}
    >
      {children}
    </div>
  );
}
