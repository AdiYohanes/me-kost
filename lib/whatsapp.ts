/**
 * Format nominal angka ke dalam format Rupiah Indonesia standar.
 */
export function formatNominalRupiah(nominal: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(nominal)
    .replace(/\s+/g, " ");
}

/**
 * Menormalisasi nomor telepon Indonesia ke format internasional tanpa tanda plus untuk WhatsApp (wa.me).
 * Contoh:
 * - "0812-9876-101" -> "628129876101"
 * - "+62 812-9876-101" -> "628129876101"
 * - "628129876101" -> "628129876101"
 */
export function formatNomorWhatsApp(telepon: string): string {
  if (!telepon || typeof telepon !== "string") {
    return "";
  }

  // Hapus semua karakter non-digit
  const digits = telepon.replace(/\D/g, "");
  if (!digits) {
    return "";
  }

  // Jika diawali 0, gantikan dengan kode negara 62
  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  // Jika sudah diawali 62
  if (digits.startsWith("62")) {
    return digits;
  }

  return digits;
}

export type TipePesanWhatsApp = "H3" | "MENUNGGAK";

export interface BuatPesanWhatsAppParams {
  penghuniNama: string;
  nomorKamar: string;
  nominal: number;
  batasBayar: string;
  tipe: TipePesanWhatsApp;
}

/**
 * Membuat pesan sopan otomatis sesuai tata bahasa domain Kost Syantika.
 */
export function buatPesanWhatsApp({
  penghuniNama,
  nomorKamar,
  nominal,
  batasBayar,
  tipe,
}: BuatPesanWhatsAppParams): string {
  const nominalStr = formatNominalRupiah(nominal);

  if (tipe === "H3") {
    return `Halo Kak ${penghuniNama}, mengingatkan tagihan sewa Kost Syantika untuk Kamar ${nomorKamar} sebesar ${nominalStr} akan jatuh tempo pada ${batasBayar}. Pembayaran dapat dilakukan melalui transfer bank atau tunai. Terima kasih! 🙏`;
  }

  return `Halo Kak ${penghuniNama}, menginformasikan bahwa tagihan sewa Kost Syantika untuk Kamar ${nomorKamar} sebesar ${nominalStr} telah melewati tanggal jatuh tempo (${batasBayar}). Mohon kesediaannya untuk segera melakukan penyelesaian pembayaran sewa kamar. Terima kasih! 🙏`;
}

export interface BuatTautanWhatsAppParams extends BuatPesanWhatsAppParams {
  telepon: string;
}

/**
 * Menghasilkan URL deep-link https://wa.me/... dengan nomor tujuan yang dinormalisasi dan pesan ter-encode.
 */
export function buatTautanWhatsApp(
  params: BuatTautanWhatsAppParams
): string | null {
  const nomorClean = formatNomorWhatsApp(params.telepon);
  if (!nomorClean) {
    return null;
  }

  const pesan = buatPesanWhatsApp(params);
  return `https://wa.me/${nomorClean}?text=${encodeURIComponent(pesan)}`;
}
