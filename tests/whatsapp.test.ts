import { describe, it, expect } from "vitest";
import {
  formatNomorWhatsApp,
  buatPesanWhatsApp,
  buatTautanWhatsApp,
} from "@/lib/whatsapp";

describe("WhatsApp Domain Helper (lib/whatsapp.ts)", () => {
  describe("formatNomorWhatsApp", () => {
    it("menormalisasi nomor awalan 08 menjadi 628 dengan menghapus karakter pemisah", () => {
      expect(formatNomorWhatsApp("0812-9876-101")).toBe("628129876101");
      expect(formatNomorWhatsApp("0812 3456 7890")).toBe("6281234567890");
    });

    it("menormalisasi nomor awalan +62 menjadi 62", () => {
      expect(formatNomorWhatsApp("+62 812-9876-101")).toBe("628129876101");
      expect(formatNomorWhatsApp("+628129876101")).toBe("628129876101");
    });

    it("mempertahankan nomor yang sudah diawali 62", () => {
      expect(formatNomorWhatsApp("628129876101")).toBe("628129876101");
    });

    it("mengembalikan string kosong jika nomor tidak valid atau kosong", () => {
      expect(formatNomorWhatsApp("")).toBe("");
      expect(formatNomorWhatsApp("   ")).toBe("");
      expect(formatNomorWhatsApp("abc")).toBe("");
    });
  });

  describe("buatPesanWhatsApp", () => {
    it("membuat pesan ramah pengingat H-3 dengan nama, nomor kamar, nominal, dan batas bayar", () => {
      const pesan = buatPesanWhatsApp({
        penghuniNama: "Rizky Ramadhan",
        nomorKamar: "101",
        nominal: 1500000,
        batasBayar: "10 Sep 2026",
        tipe: "H3",
      });

      expect(pesan).toContain("Rizky Ramadhan");
      expect(pesan).toContain("101");
      expect(pesan).toContain("Rp 1.500.000");
      expect(pesan).toContain("10 Sep 2026");
      expect(pesan).toContain("jatuh tempo");
    });

    it("membuat pesan pemberitahuan ramah untuk tagihan Menunggak", () => {
      const pesan = buatPesanWhatsApp({
        penghuniNama: "Dimas Anggara",
        nomorKamar: "104",
        nominal: 1300000,
        batasBayar: "10 Sep 2026",
        tipe: "MENUNGGAK",
      });

      expect(pesan).toContain("Dimas Anggara");
      expect(pesan).toContain("104");
      expect(pesan).toContain("Rp 1.300.000");
      expect(pesan).toContain("10 Sep 2026");
      expect(pesan).toContain("melewati tanggal jatuh tempo");
    });
  });

  describe("buatTautanWhatsApp", () => {
    it("menghasilkan tautan deep-link https://wa.me/... dengan teks ter-encode", () => {
      const url = buatTautanWhatsApp({
        telepon: "0812-9876-101",
        penghuniNama: "Rizky Ramadhan",
        nomorKamar: "101",
        nominal: 1500000,
        batasBayar: "10 Sep 2026",
        tipe: "H3",
      });

      expect(url).toMatch(/^https:\/\/wa\.me\/628129876101\?text=/);
      expect(decodeURIComponent(url!)).toContain("Rizky Ramadhan");
      expect(decodeURIComponent(url!)).toContain("Rp 1.500.000");
    });

    it("mengembalikan null jika nomor telepon tidak valid", () => {
      const url = buatTautanWhatsApp({
        telepon: "",
        penghuniNama: "Rizky Ramadhan",
        nomorKamar: "101",
        nominal: 1500000,
        batasBayar: "10 Sep 2026",
        tipe: "H3",
      });

      expect(url).toBeNull();
    });
  });
});
