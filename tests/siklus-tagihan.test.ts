import { describe, it, expect } from "vitest";
import {
  parseBatasBayar,
  hitungPeriodeSewa,
  hitungStatusTagihan,
  evaluasiPenerbitanH7,
  formatPeriodeLabel,
} from "@/lib/siklus-tagihan";
import { Kamar } from "@/types/kamar";
import { Tagihan } from "@/types/payment";

describe("Logika Siklus Tagihan Mandiri (lib/siklus-tagihan.ts)", () => {
  describe("parseBatasBayar", () => {
    it("dapat mem-parsing format tanggal bahasa Indonesia singkat (contoh: '10 Sep 2026')", () => {
      const parsed = parseBatasBayar("10 Sep 2026");
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed?.getFullYear()).toBe(2026);
      expect(parsed?.getMonth()).toBe(8); // September = index 8
      expect(parsed?.getDate()).toBe(10);
    });

    it("dapat mem-parsing format nama bulan lengkap (contoh: '15 Oktober 2026')", () => {
      const parsed = parseBatasBayar("15 Oktober 2026");
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed?.getFullYear()).toBe(2026);
      expect(parsed?.getMonth()).toBe(9); // Oktober = index 9
      expect(parsed?.getDate()).toBe(15);
    });

    it("dapat mem-parsing format tanggal standar ISO (contoh: '2026-09-10')", () => {
      const parsed = parseBatasBayar("2026-09-10");
      expect(parsed).toBeInstanceOf(Date);
      expect(parsed?.getFullYear()).toBe(2026);
      expect(parsed?.getMonth()).toBe(8);
      expect(parsed?.getDate()).toBe(10);
    });

    it("mengembalikan null jika format tanggal tidak valid", () => {
      expect(parseBatasBayar("")).toBeNull();
      expect(parseBatasBayar("tanggal-ngawur")).toBeNull();
    });
  });

  describe("hitungPeriodeSewa", () => {
    it("menghitung periode sewa mandiri bulanan berdasarkan tanggal masuk penghuni", () => {
      // Masuk tanggal 15 September 2026, siklus tanggal 15
      const periode = hitungPeriodeSewa("2026-09-15", 15, new Date(2026, 8, 16));
      expect(periode.periodeMulai).toBe("2026-09-15");
      expect(periode.periodeSelesai).toBe("2026-10-14");
      expect(periode.periodeLabel).toBe("15 Sep - 14 Okt 2026");
      expect(periode.batasBayar).toBe("15 Sep 2026");
    });

    it("menyesuaikan batas akhir bulan untuk bulan dengan jumlah hari berbeda (misal Februari)", () => {
      const label = formatPeriodeLabel(new Date(2026, 0, 31), new Date(2026, 1, 28));
      expect(label).toBe("31 Jan - 28 Feb 2026");
    });
  });

  describe("hitungStatusTagihan & Deteksi Menunggak", () => {
    const mockTagihanBase: Tagihan = {
      id: "tagihan-101-2026-09",
      kamarId: "101",
      nomorKamar: "101",
      penghuniId: "usr-101",
      penghuniNama: "Rizky Ramadhan",
      periodeBulan: "September 2026",
      tahun: 2026,
      bulan: 9,
      nominal: 1500000,
      batasBayar: "10 Sep 2026",
      status: "BELUM_BAYAR",
    };

    it("mengevaluasi tagihan LUNAS sebagai tidak menunggak dan tidak H-3", () => {
      const tagihan: Tagihan = { ...mockTagihanBase, status: "LUNAS" };
      const refDate = new Date(2026, 8, 15); // Sudah lewat tanggal 10
      const evaluasi = hitungStatusTagihan(tagihan, refDate);

      expect(evaluasi.isMenunggak).toBe(false);
      expect(evaluasi.isH3).toBe(false);
      expect(evaluasi.statusVisual).toBe("LUNAS");
    });

    it("mengevaluasi tagihan MENUNGGU_VERIFIKASI sebagai tidak menunggak meski telah lewat tanggal", () => {
      const tagihan: Tagihan = { ...mockTagihanBase, status: "MENUNGGU_VERIFIKASI" };
      const refDate = new Date(2026, 8, 15);
      const evaluasi = hitungStatusTagihan(tagihan, refDate);

      expect(evaluasi.isMenunggak).toBe(false);
      expect(evaluasi.statusVisual).toBe("MENUNGGU_VERIFIKASI");
    });

    it("mengevaluasi tagihan belum bayar sebelum H-3 sebagai BELUM_BAYAR normal", () => {
      const refDate = new Date(2026, 8, 5); // 5 September, jatuh tempo 10 September (H-5)
      const evaluasi = hitungStatusTagihan(mockTagihanBase, refDate);

      expect(evaluasi.isMenunggak).toBe(false);
      expect(evaluasi.isH3).toBe(false);
      expect(evaluasi.sisaHari).toBe(5);
      expect(evaluasi.statusVisual).toBe("BELUM_BAYAR");
    });

    it("mengevaluasi tagihan dalam rentang H-3 sebagai isH3 = true", () => {
      const refDate = new Date(2026, 8, 8); // 8 September, jatuh tempo 10 September (H-2)
      const evaluasi = hitungStatusTagihan(mockTagihanBase, refDate);

      expect(evaluasi.isMenunggak).toBe(false);
      expect(evaluasi.isH3).toBe(true);
      expect(evaluasi.sisaHari).toBe(2);
      expect(evaluasi.statusVisual).toBe("BELUM_BAYAR");
    });

    it("mendeteksi keterlambatan otomatis dan menghasilkan label 'MENUNGGAK (Telat X Hari)'", () => {
      // Tanggal acuan: 13 September 2026 (terlambat 3 hari dari 10 September)
      const refDate = new Date(2026, 8, 13);
      const evaluasi = hitungStatusTagihan(mockTagihanBase, refDate);

      expect(evaluasi.isMenunggak).toBe(true);
      expect(evaluasi.telatHari).toBe(3);
      expect(evaluasi.statusVisual).toBe("MENUNGGAK");
      expect(evaluasi.labelStatus).toBe("MENUNGGAK (Telat 3 Hari)");
    });

    it("mengevaluasi tagihan DITOLAK yang melewati jatuh tempo juga sebagai MENUNGGAK", () => {
      const tagihan: Tagihan = {
        ...mockTagihanBase,
        status: "DITOLAK",
        alasanPenolakan: "Bukti transfer buram",
      };
      const refDate = new Date(2026, 8, 11); // Terlambat 1 hari
      const evaluasi = hitungStatusTagihan(tagihan, refDate);

      expect(evaluasi.isMenunggak).toBe(true);
      expect(evaluasi.telatHari).toBe(1);
      expect(evaluasi.statusVisual).toBe("MENUNGGAK");
      expect(evaluasi.labelStatus).toBe("MENUNGGAK (Telat 1 Hari)");
    });
  });

  describe("evaluasiPenerbitanH7", () => {
    const mockKamarTerisi: Kamar = {
      id: "101",
      nomorKamar: "101",
      tipeKamar: "Kamar Standard",
      tarifBulanan: 1500000,
      statusHunian: "TERISI",
      tanggalMasuk: "2026-08-10",
      tanggalJatuhTempo: 10,
      penghuni: {
        id: "usr-101",
        nama: "Rizky Ramadhan",
        email: "kamar101@kostsyantika.com",
      },
    };

    it("tidak menerbitkan tagihan jika unit kamar KOSONG", () => {
      const kamarKosong: Kamar = {
        ...mockKamarTerisi,
        statusHunian: "KOSONG",
        penghuni: null,
      };
      const evaluasi = evaluasiPenerbitanH7(kamarKosong, [], new Date(2026, 8, 5));
      expect(evaluasi.perluTerbit).toBe(false);
    });

    it("tidak menerbitkan tagihan jika masih lebih dari 7 hari sebelum jatuh tempo (H-8 atau lebih)", () => {
      // Jatuh tempo: 10 Oktober 2026. H-7 = 3 Oktober.
      // Tanggal acuan: 1 Oktober 2026 (H-9)
      const existingTagihanList: Tagihan[] = [
        {
          id: "tagihan-101-2026-09",
          kamarId: "101",
          nomorKamar: "101",
          penghuniId: "usr-101",
          penghuniNama: "Rizky Ramadhan",
          periodeBulan: "September 2026",
          tahun: 2026,
          bulan: 9,
          nominal: 1500000,
          batasBayar: "10 Sep 2026",
          status: "LUNAS",
        },
      ];

      const evaluasi = evaluasiPenerbitanH7(
        mockKamarTerisi,
        existingTagihanList,
        new Date(2026, 9, 1) // 1 Oktober (H-9 sebelum 10 Oktober)
      );

      expect(evaluasi.perluTerbit).toBe(false);
    });

    it("menerbitkan tagihan periode berikutnya ketika telah mencapai H-7 sebelum jatuh tempo dengan siklus mandiri", () => {
      // Jatuh tempo: 10 Oktober 2026. H-7 = 3 Oktober.
      // Tanggal acuan: 3 Oktober 2026 (Tepat H-7)
      const existingTagihanList: Tagihan[] = [
        {
          id: "tagihan-101-2026-09",
          kamarId: "101",
          nomorKamar: "101",
          penghuniId: "usr-101",
          penghuniNama: "Rizky Ramadhan",
          periodeBulan: "September 2026",
          tahun: 2026,
          bulan: 9,
          nominal: 1500000,
          batasBayar: "10 Sep 2026",
          status: "LUNAS",
        },
      ];

      const evaluasi = evaluasiPenerbitanH7(
        mockKamarTerisi,
        existingTagihanList,
        new Date(2026, 9, 3) // 3 Oktober 2026
      );

      expect(evaluasi.perluTerbit).toBe(true);
      expect(evaluasi.newTagihanData).toBeDefined();
      expect(evaluasi.newTagihanData?.bulan).toBe(10);
      expect(evaluasi.newTagihanData?.tahun).toBe(2026);
      expect(evaluasi.newTagihanData?.nominal).toBe(1500000);
      expect(evaluasi.newTagihanData?.status).toBe("BELUM_BAYAR");
      expect(evaluasi.newTagihanData?.batasBayar).toContain("10 Okt 2026");
      expect(evaluasi.newTagihanData?.periodeLabel).toBe("10 Okt - 9 Nov 2026");
    });

    it("tidak menerbitkan tagihan jika tagihan untuk periode tersebut sudah ada", () => {
      const existingTagihanList: Tagihan[] = [
        {
          id: "tagihan-101-2026-10",
          kamarId: "101",
          nomorKamar: "101",
          penghuniId: "usr-101",
          penghuniNama: "Rizky Ramadhan",
          periodeBulan: "Oktober 2026",
          tahun: 2026,
          bulan: 10,
          nominal: 1500000,
          batasBayar: "10 Okt 2026",
          status: "BELUM_BAYAR",
        },
      ];

      const evaluasi = evaluasiPenerbitanH7(
        mockKamarTerisi,
        existingTagihanList,
        new Date(2026, 9, 5) // 5 Oktober 2026
      );

      expect(evaluasi.perluTerbit).toBe(false);
    });
  });
});
