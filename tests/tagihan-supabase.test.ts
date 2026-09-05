import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  mapDatabaseRowToTagihan,
  fetchDaftarTagihan,
  updateNominalTagihanSupabase,
  evaluasiTagihanMenunggakSupabase,
  periksaDanTerbitkanTagihanH7Supabase,
  uploadBuktiTransferSupabase,
  verifikasiLunasSupabase,
  tolakBuktiPembayaranSupabase,
  tandaiLunasCashSupabase,
} from "@/lib/supabase/tagihan";

describe("Supabase Tagihan Service (lib/supabase/tagihan.ts)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("mapDatabaseRowToTagihan", () => {
    it("memetakan baris tabel tagihan dari basis data ke objek domain Tagihan", () => {
      const tagihan = mapDatabaseRowToTagihan({
        id: "tagihan-uuid-1",
        kamar_id: "kamar-uuid-101",
        penghuni_id: "user-uuid-1",
        penghuni_nama_snapshot: "Rizky Ramadhan",
        periode_label: "September 2026",
        periode_mulai: "2026-09-01",
        periode_selesai: "2026-09-30",
        tanggal_jatuh_tempo: "2026-09-10",
        nominal: 1500000,
        status: "BELUM_BAYAR",
        metode_pembayaran: null,
        alasan_penolakan: null,
        catatan_pemilik: null,
        paid_at: null,
        verified_at: null,
        kamar: { nomor_kamar: "101" },
        bukti_pembayaran: [],
      });

      expect(tagihan.id).toBe("tagihan-uuid-1");
      expect(tagihan.nomorKamar).toBe("101");
      expect(tagihan.penghuniNama).toBe("Rizky Ramadhan");
      expect(tagihan.status).toBe("BELUM_BAYAR");
      expect(tagihan.nominal).toBe(1500000);
      expect(tagihan.batasBayar).toBe("10 Sep 2026");
    });
  });

  describe("fetchDaftarTagihan", () => {
    it("mengambil daftar seluruh tagihan dari tabel tagihan", async () => {
      const mockData = [
        {
          id: "tag-1",
          kamar_id: "kamar-101",
          penghuni_id: "usr-1",
          penghuni_nama_snapshot: "Rizky Ramadhan",
          periode_label: "September 2026",
          periode_mulai: "2026-09-01",
          periode_selesai: "2026-09-30",
          tanggal_jatuh_tempo: "2026-09-10",
          nominal: 1500000,
          status: "BELUM_BAYAR",
          kamar: { nomor_kamar: "101" },
        },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await fetchDaftarTagihan(mockSupabase);
      expect(result.length).toBe(1);
      expect(result[0].nomorKamar).toBe("101");
      expect(result[0].nominal).toBe(1500000);
    });
  });

  describe("updateNominalTagihanSupabase", () => {
    it("memperbarui nominal tagihan di basis data", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await updateNominalTagihanSupabase(mockSupabase, "tag-1", 1750000);
      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("tagihan");
    });
  });

  describe("evaluasiTagihanMenunggakSupabase", () => {
    it("mengupdate status tagihan yang telah melewati batas bayar menjadi MENUNGGAK", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: vi.fn().mockReturnValue({
            in: vi.fn().mockReturnValue({
              lt: vi.fn().mockResolvedValue({ error: null, count: 2 }),
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await evaluasiTagihanMenunggakSupabase(
        mockSupabase,
        new Date(2026, 8, 15) // 15 Sep 2026
      );

      expect(result.success).toBe(true);
      expect(mockSupabase.from).toHaveBeenCalledWith("tagihan");
    });
  });

  describe("periksaDanTerbitkanTagihanH7Supabase", () => {
    it("menerbitkan tagihan baru untuk kamar terisi yang mencapai batas H-7", async () => {
      const mockKamarRows = [
        {
          id: "kamar-101",
          nomor_kamar: "101",
          tipe_kamar: "Standard",
          tarif_bulanan: 1500000,
          status_hunian: "TERISI",
          tanggal_masuk: "2026-08-10",
          tanggal_jatuh_tempo: 10,
          users: [
            { id: "usr-1", nama: "Budi Santoso", email: "budi@gmail.com", status: "AKTIF" },
          ],
        },
      ];

      const mockExistingTagihan = [
        {
          id: "tag-1",
          kamar_id: "kamar-101",
          tanggal_jatuh_tempo: "2026-09-10",
          status: "LUNAS",
        },
      ];

      const insertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockResolvedValue({
          data: [
            {
              id: "tag-new-oct",
              kamar_id: "kamar-101",
              penghuni_id: "usr-1",
              penghuni_nama_snapshot: "Budi Santoso",
              periode_label: "Oktober 2026",
              periode_mulai: "2026-10-01",
              periode_selesai: "2026-10-31",
              tanggal_jatuh_tempo: "2026-10-10",
              nominal: 1500000,
              status: "BELUM_BAYAR",
            },
          ],
          error: null,
        }),
      });

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "kamar") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockResolvedValue({ data: mockKamarRows, error: null }),
              }),
            };
          }
          if (table === "tagihan") {
            return {
              select: vi.fn().mockReturnValue({
                order: vi.fn().mockResolvedValue({ data: mockExistingTagihan, error: null }),
              }),
              insert: insertMock,
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const result = await periksaDanTerbitkanTagihanH7Supabase(
        mockSupabase,
        new Date(2026, 9, 3) // 3 Oktober 2026 (H-7 sebelum 10 Oktober)
      );

      expect(result.success).toBe(true);
      expect(result.terbitCount).toBe(1);
      expect(insertMock).toHaveBeenCalled();
    });
  });

  describe("uploadBuktiTransferSupabase", () => {
    it("mengunggah berkas ke storage bucket bukti-pembayaran dan mencatat ke tabel bukti_pembayaran", async () => {
      const mockUpload = vi.fn().mockResolvedValue({ data: { path: "mock-path" }, error: null });
      const mockGetPublicUrl = vi.fn().mockReturnValue({
        data: { publicUrl: "https://supabase.co/storage/v1/object/public/bukti-pembayaran/kamar-101/bukti.webp" },
      });

      const mockBuktiInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "bukti-uuid-1", tagihan_id: "tag-1" },
            error: null,
          }),
        }),
      });

      const mockTagihanUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockSupabase = {
        storage: {
          from: vi.fn().mockReturnValue({
            upload: mockUpload,
            getPublicUrl: mockGetPublicUrl,
          }),
        },
        from: vi.fn((table: string) => {
          if (table === "bukti_pembayaran") {
            return { insert: mockBuktiInsert };
          }
          if (table === "tagihan") {
            return { update: mockTagihanUpdate };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const dummyBlob = new Blob(["webp content"], { type: "image/webp" });
      const res = await uploadBuktiTransferSupabase(mockSupabase, {
        tagihanId: "tag-1",
        nomorKamar: "101",
        tahun: 2026,
        bulan: 9,
        file: dummyBlob,
        catatanPenghuni: "Transfer via BCA a.n. Siti",
      });

      expect(res.success).toBe(true);
      expect(res.imageUrl).toContain("bukti-pembayaran/kamar-101/bukti.webp");
      expect(res.buktiId).toBe("bukti-uuid-1");
      expect(mockUpload).toHaveBeenCalled();
      expect(mockBuktiInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          tagihan_id: "tag-1",
          catatan_penghuni: "Transfer via BCA a.n. Siti",
        })
      );
      expect(mockTagihanUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "MENUNGGU_VERIFIKASI",
        })
      );
    });
  });

  describe("verifikasiLunasSupabase", () => {
    it("memperbarui status tagihan menjadi LUNAS dengan metode TRANSFER dan mencatat timestamp verifikasi", async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({ update: mockUpdate }),
      } as unknown as SupabaseClient;

      const res = await verifikasiLunasSupabase(mockSupabase, "tag-1");

      expect(res.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "LUNAS",
          metode_pembayaran: "TRANSFER",
          verified_at: expect.any(String),
          paid_at: expect.any(String),
        })
      );
    });
  });

  describe("tolakBuktiPembayaranSupabase", () => {
    it("menolak eksekusi jika alasan penolakan kosong", async () => {
      const mockSupabase = {} as unknown as SupabaseClient;
      const res = await tolakBuktiPembayaranSupabase(mockSupabase, "tag-1", "");

      expect(res.success).toBe(false);
      expect(res.error).toContain("Alasan penolakan wajib");
    });

    it("memperbarui status tagihan menjadi DITOLAK beserta alasan penolakan", async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({ update: mockUpdate }),
      } as unknown as SupabaseClient;

      const res = await tolakBuktiPembayaranSupabase(
        mockSupabase,
        "tag-1",
        "Foto bukti transfer buram dan nominal tidak terbaca"
      );

      expect(res.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "DITOLAK",
          alasan_penolakan: "Foto bukti transfer buram dan nominal tidak terbaca",
        })
      );
    });
  });

  describe("tandaiLunasCashSupabase", () => {
    it("memperbarui status tagihan menjadi LUNAS metode CASH dengan catatan pemilik opsional", async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({ update: mockUpdate }),
      } as unknown as SupabaseClient;

      const res = await tandaiLunasCashSupabase(
        mockSupabase,
        "tag-1",
        "Uang pas diterima di kantor"
      );

      expect(res.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "LUNAS",
          metode_pembayaran: "CASH",
          catatan_pemilik: "Uang pas diterima di kantor",
          paid_at: expect.any(String),
          verified_at: expect.any(String),
        })
      );
    });
  });
});
