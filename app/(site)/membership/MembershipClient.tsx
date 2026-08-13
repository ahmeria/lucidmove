"use client";

import FiyatPlanlari, { type FiyatPlani } from "@/components/FiyatPlanlari";

export default function MembershipClient({
  baslangicDurum,
  planlar,
}: {
  baslangicDurum?: string;
  planlar: FiyatPlani[];
}) {
  return (
    <div>
      {baslangicDurum === "basarili" && (
        <p className="text-center font-body text-sm bg-vurgu/15 text-vurgu-dark rounded-2xl py-3 px-4 mb-10 max-w-md mx-auto">
          Ödemeniz alındı — üyeliğiniz aktif. Hoş geldiniz!
        </p>
      )}
      {(baslangicDurum === "hata" || baslangicDurum === "basarisiz") && (
        <p className="text-center font-body text-sm bg-red-50 text-red-700 rounded-2xl py-3 px-4 mb-10 max-w-md mx-auto">
          Ödeme tamamlanamadı. Lütfen tekrar deneyin.
        </p>
      )}

      <FiyatPlanlari planlar={planlar} />
    </div>
  );
}
