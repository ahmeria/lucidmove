import crypto from "crypto";

// GA servis hesabı gibi hassas kimlik bilgilerini DB'de düz metin tutmamak için
// AES-256-GCM ile şifreler. dishekimihaber projesindeki aynı desen.
const ALGORITHM = "aes-256-gcm";

// CREDENTIALS_ENCRYPTION_KEY tanımlı değilse NEXTAUTH_SECRET'tan türetilir; ikisi de
// yoksa (yanlış kurulmuş ortam) açıkça hata verir, sessizce zayıf bir anahtara düşmez.
function anahtarAl(): Buffer {
  const secret = process.env.CREDENTIALS_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("CREDENTIALS_ENCRYPTION_KEY veya NEXTAUTH_SECRET tanımlı değil.");
  }
  return crypto.createHash("sha256").update(secret).digest();
}

export function sirriSifrele(duzMetin: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, anahtarAl(), iv);
  const sifreliMetin = Buffer.concat([cipher.update(duzMetin, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return [iv.toString("hex"), authTag.toString("hex"), sifreliMetin.toString("hex")].join(":");
}

export function sirriCoz(veri: string): string {
  const [ivHex, tagHex, dataHex] = veri.split(":");
  const decipher = crypto.createDecipheriv(ALGORITHM, anahtarAl(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}
