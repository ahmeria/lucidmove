const TR_HARITASI: Record<string, string> = {
  ş: "s",
  Ş: "s",
  ğ: "g",
  Ğ: "g",
  ı: "i",
  I: "i",
  İ: "i",
  ö: "o",
  Ö: "o",
  ü: "u",
  Ü: "u",
  ç: "c",
  Ç: "c",
};

export function slugifyTr(metin: string): string {
  const donusturulmus = metin.replace(/[şŞğĞıIİöÖüÜçÇ]/g, (harf) => TR_HARITASI[harf] ?? harf);

  return donusturulmus
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
