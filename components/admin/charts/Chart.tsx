"use client";

import dynamic from "next/dynamic";
import type { ApexOptions } from "apexcharts";

/**
 * ApexCharts sarmalayıcısı — LucidMove admin paneli tek (açık) temalı olduğu
 * için dishekimihaber'deki koyu/açık mod izleme mantığı burada yok.
 *
 * `ssr: false` zorunlu: ApexCharts modül seviyesinde `window`a dokunuyor,
 * sunucuda import edilirse sayfa çöker. Yükleme sırasında grafiğin kaplayacağı
 * alan kadar bir iskelet bırakılıyor — yoksa grafik geldiğinde altındaki
 * kartlar aşağı sıçrıyor.
 */
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => <div className="h-full w-full animate-pulse rounded-lg bg-zemin" />,
});

// vurgu, ikincil, amber, vurgu-light, ikincil-dark, metin/50 — sitenin renk
// paletinden, yeni bir grafik rengi icat etmeden.
export const GRAFIK_RENKLERI = ["#417572", "#10551F", "#f59e0b", "#6FA09D", "#0B3C15", "#8a8578"];

function temelSecenekler(): ApexOptions {
  return {
    chart: {
      fontFamily: "inherit",
      foreColor: "#6b6862",
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: { enabled: true, speed: 400 },
      background: "transparent",
    },
    colors: GRAFIK_RENKLERI,
    grid: { borderColor: "#E5E1D6", strokeDashArray: 4, padding: { left: 4, right: 8 } },
    dataLabels: { enabled: false },
    tooltip: { theme: "light" },
    legend: { fontSize: "12px", markers: { size: 6 }, itemMargin: { horizontal: 8, vertical: 4 } },
    xaxis: { axisBorder: { show: false }, axisTicks: { show: false }, labels: { style: { fontSize: "11px" } } },
    yaxis: { labels: { style: { fontSize: "11px" } } },
    states: { hover: { filter: { type: "lighten" } } },
  };
}

// İki ayar nesnesini derin birleştirir — dizi ve ilkel değerlerde üsttekiler kazanır.
function birlestir<T extends Record<string, unknown>>(taban: T, ustyaz: Record<string, unknown>): T {
  const out: Record<string, unknown> = { ...taban };
  for (const key of Object.keys(ustyaz)) {
    const a = out[key];
    const b = ustyaz[key];
    out[key] =
      a && b && typeof a === "object" && typeof b === "object" && !Array.isArray(a) && !Array.isArray(b)
        ? birlestir(a as Record<string, unknown>, b as Record<string, unknown>)
        : b;
  }
  return out as T;
}

export function Chart({
  type,
  series,
  options = {},
  height = 280,
}: {
  type: "area" | "bar" | "donut" | "line" | "radialBar" | "heatmap";
  series: ApexOptions["series"];
  options?: ApexOptions;
  height?: number;
}) {
  const birlesmis = birlestir(temelSecenekler() as Record<string, unknown>, options as Record<string, unknown>) as ApexOptions;

  return (
    <div style={{ height }}>
      <ReactApexChart type={type} series={series} options={birlesmis} height={height} width="100%" />
    </div>
  );
}
