import { describe, it, expect, vi, beforeEach } from "vitest";
import { SupabaseClient } from "@supabase/supabase-js";
import {
  mapDatabaseRowToKamar,
  fetchDaftarKamar,
  tambahPenghuniKamar,
  ubahEmailPenghuni,
  keluarkanPenghuniKamar,
} from "@/lib/supabase/kamar";

describe("Supabase Kamar Service & Soft Disconnect", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. mapDatabaseRowToKamar", () => {
    it("memetakan baris dengan objek user tunggal aktif", () => {
      const kamar = mapDatabaseRowToKamar({
        id: "kamar-101-uuid",
        nomor_kamar: "101",
        tipe_kamar: "Kamar Deluxe Lt. 1",
        tarif_bulanan: 1500000,
        status_hunian: "TERISI",
        tanggal_masuk: "2026-09-01",
        tanggal_jatuh_tempo: 10,
        users: {
          id: "usr-1",
          nama: "Rizky Ramadhan",
          email: "rizky@gmail.com",
          telepon: "0812-9876-101",
          status: "AKTIF",
        },
      });

      expect(kamar.nomorKamar).toBe("101");
      expect(kamar.statusHunian).toBe("TERISI");
      expect(kamar.penghuni?.nama).toBe("Rizky Ramadhan");
      expect(kamar.tanggalJatuhTempo).toBe(10);
    });

    it("memetakan baris kamar kosong dengan benar", () => {
      const kamar = mapDatabaseRowToKamar({
        id: "kamar-105-uuid",
        nomor_kamar: "105",
        tipe_kamar: "Kamar VIP Lt. 2",
        tarif_bulanan: 1800000,
        status_hunian: "KOSONG",
        tanggal_masuk: null,
        tanggal_jatuh_tempo: 1,
        users: null,
      });

      expect(kamar.nomorKamar).toBe("105");
      expect(kamar.statusHunian).toBe("KOSONG");
      expect(kamar.penghuni).toBeNull();
    });

    it("memilih user yang berstatus AKTIF jika ada array users dari relasi", () => {
      const kamar = mapDatabaseRowToKamar({
        id: "kamar-102-uuid",
        nomor_kamar: "102",
        tipe_kamar: "Kamar Standard",
        tarif_bulanan: 1300000,
        status_hunian: "TERISI",
        tanggal_masuk: "2026-08-15",
        tanggal_jatuh_tempo: 15,
        users: [
          {
            id: "usr-old",
            nama: "Penghuni Lama",
            email: "lama@gmail.com",
            telepon: null,
            status: "NONAKTIF",
          },
          {
            id: "usr-new",
            nama: "Siti Nurhaliza",
            email: "siti@gmail.com",
            telepon: "0812-9876-102",
            status: "AKTIF",
          },
        ],
      });

      expect(kamar.penghuni?.nama).toBe("Siti Nurhaliza");
      expect(kamar.penghuni?.email).toBe("siti@gmail.com");
    });
  });

  describe("2. fetchDaftarKamar", () => {
    it("mengambil seluruh unit kamar dan mengurutkan secara berurutan fisik (101, 102, dst.)", async () => {
      const mockRows = [
        {
          id: "k-103",
          nomor_kamar: "103",
          tipe_kamar: "Deluxe",
          tarif_bulanan: 1500000,
          status_hunian: "TERISI",
          tanggal_jatuh_tempo: 5,
          users: { id: "u-3", nama: "Budi", email: "budi@gmail.com", status: "AKTIF" },
        },
        {
          id: "k-101",
          nomor_kamar: "101",
          tipe_kamar: "Deluxe",
          tarif_bulanan: 1500000,
          status_hunian: "TERISI",
          tanggal_jatuh_tempo: 1,
          users: { id: "u-1", nama: "Rizky", email: "rizky@gmail.com", status: "AKTIF" },
        },
        {
          id: "k-102",
          nomor_kamar: "102",
          tipe_kamar: "Standard",
          tarif_bulanan: 1300000,
          status_hunian: "KOSONG",
          tanggal_jatuh_tempo: 1,
          users: null,
        },
      ];

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: mockRows,
              error: null,
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      const result = await fetchDaftarKamar(mockSupabase);

      expect(result.length).toBe(3);
      expect(result[0].nomorKamar).toBe("101");
      expect(result[1].nomorKamar).toBe("102");
      expect(result[2].nomorKamar).toBe("103");
      expect(result[1].statusHunian).toBe("KOSONG");
    });

    it("melempar error jika query database kamar gagal", async () => {
      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: null,
              error: { message: "Database connection failed" },
            }),
          }),
        }),
      } as unknown as SupabaseClient;

      await expect(fetchDaftarKamar(mockSupabase)).rejects.toThrow(
        "Gagal mengambil data kamar: Database connection failed"
      );
    });
  });

  describe("3. tambahPenghuniKamar", () => {
    it("memvalidasi nama, format email, dan tanggal masuk", async () => {
      const mockSupabase = {} as unknown as SupabaseClient;

      const resEmptyName = await tambahPenghuniKamar(mockSupabase, {
        kamarId: "k-1",
        nama: "",
        email: "test@gmail.com",
        tanggalMasuk: "2026-09-15",
      });
      expect(resEmptyName.success).toBe(false);
      expect(resEmptyName.error).toBe("Nama lengkap wajib diisi.");

      const resInvalidEmail = await tambahPenghuniKamar(mockSupabase, {
        kamarId: "k-1",
        nama: "Test",
        email: "not-an-email",
        tanggalMasuk: "2026-09-15",
      });
      expect(resInvalidEmail.success).toBe(false);
      expect(resInvalidEmail.error).toBe("Format email Google tidak valid.");
    });

    it("secara otomatis menyetel tanggal jatuh tempo sesuai tanggal masuk (day of month)", async () => {
      const mockKamarSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "k-105", nomor_kamar: "105", tarif_bulanan: 1800000 },
            error: null,
          }),
        }),
      });

      const mockUsersSelect = vi.fn().mockReturnValue({
        ilike: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null, // user baru belum ada
            error: null,
          }),
        }),
      });

      const mockUsersInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "new-user-id" },
            error: null,
          }),
        }),
      });

      const mockKamarUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      });

      const mockTagihanSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          in: vi.fn().mockReturnValue({
            maybeSingle: vi.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      });

      const mockTagihanInsert = vi.fn().mockResolvedValue({
        error: null,
      });

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "kamar") {
            return {
              select: mockKamarSelect,
              update: mockKamarUpdate,
            };
          }
          if (table === "users") {
            return {
              select: mockUsersSelect,
              insert: mockUsersInsert,
            };
          }
          if (table === "tagihan") {
            return {
              select: mockTagihanSelect,
              insert: mockTagihanInsert,
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const result = await tambahPenghuniKamar(mockSupabase, {
        kamarId: "k-105",
        nama: "Dewi Putri",
        email: "dewiputri@gmail.com",
        telepon: "0812-3344-5566",
        tanggalMasuk: "2026-09-17",
      });

      expect(result.success).toBe(true);
      expect(result.penghuniId).toBe("new-user-id");
      expect(result.tenantId).toBe("new-user-id");

      // Verifikasi update status kamar menjadi TERISI dan tanggal_jatuh_tempo = 17
      expect(mockKamarUpdate).toHaveBeenCalledWith({
        status_hunian: "TERISI",
        tanggal_masuk: "2026-09-17",
        tanggal_jatuh_tempo: 17,
      });
    });

    it("memperbolehkan penyesuaian manual tanggal jatuh tempo jika disepakati", async () => {
      const mockKamarSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "k-105", nomor_kamar: "105", tarif_bulanan: 1800000 },
            error: null,
          }),
        }),
      });

      const mockUsersSelect = vi.fn().mockReturnValue({
        ilike: vi.fn().mockReturnValue({
          maybeSingle: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      });

      const mockUsersInsert = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: "new-user-id" },
            error: null,
          }),
        }),
      });

      const mockKamarUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      });

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "kamar") {
            return {
              select: mockKamarSelect,
              update: mockKamarUpdate,
            };
          }
          if (table === "users") {
            return {
              select: mockUsersSelect,
              insert: mockUsersInsert,
            };
          }
          if (table === "tagihan") {
            return {
              select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                  in: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                  }),
                }),
              }),
              insert: vi.fn().mockResolvedValue({ error: null }),
            };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const result = await tambahPenghuniKamar(mockSupabase, {
        kamarId: "k-105",
        nama: "Dewi Putri",
        email: "dewiputri@gmail.com",
        telepon: "0812-3344-5566",
        tanggalMasuk: "2026-09-17",
        tanggalJatuhTempo: 25, // Custom disepakati tanggal 25
      });

      expect(result.success).toBe(true);
      expect(mockKamarUpdate).toHaveBeenCalledWith({
        status_hunian: "TERISI",
        tanggal_masuk: "2026-09-17",
        tanggal_jatuh_tempo: 25,
      });
    });
  });

  describe("4. ubahEmailPenghuni", () => {
    it("memvalidasi email Google yang baru", async () => {
      const mockSupabase = {} as unknown as SupabaseClient;
      const res = await ubahEmailPenghuni(mockSupabase, {
        userId: "u-1",
        emailBaru: "invalid-email",
      });

      expect(res.success).toBe(false);
      expect(res.error).toBe("Format email tidak valid.");
    });

    it("memperbarui email pengguna pada tabel users berdasarkan userId", async () => {
      const mockUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockSupabase = {
        from: vi.fn().mockReturnValue({
          update: mockUpdate,
        }),
      } as unknown as SupabaseClient;

      const res = await ubahEmailPenghuni(mockSupabase, {
        userId: "usr-101",
        emailBaru: "rizky.baru@gmail.com",
      });

      expect(res.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith({
        email: "rizky.baru@gmail.com",
      });
    });
  });

  describe("5. keluarkanPenghuniKamar (Soft Disconnect)", () => {
    it("menjalankan soft disconnect: melepas anak kost (kamar_id = null, status = NONAKTIF) dan mereset kamar jadi KOSONG", async () => {
      const mockUserUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockKamarUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const tagihanQueryBuilder = {
        eq: vi.fn(),
        in: vi.fn().mockResolvedValue({ error: null }),
      };
      tagihanQueryBuilder.eq.mockReturnValue(tagihanQueryBuilder);
      const mockTagihanDelete = vi.fn().mockReturnValue(tagihanQueryBuilder);

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "users") {
            return { update: mockUserUpdate };
          }
          if (table === "kamar") {
            return { update: mockKamarUpdate };
          }
          if (table === "tagihan") {
            return { delete: mockTagihanDelete };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const result = await keluarkanPenghuniKamar(mockSupabase, {
        kamarId: "kamar-101",
        penghuniId: "usr-101",
        batalkanTagihanAktif: true,
      });

      expect(result.success).toBe(true);

      // 1. User dilepas
      expect(mockUserUpdate).toHaveBeenCalledWith({
        kamar_id: null,
        status: "NONAKTIF",
      });

      // 2. Kamar diubah jadi KOSONG
      expect(mockKamarUpdate).toHaveBeenCalledWith({
        status_hunian: "KOSONG",
        tanggal_masuk: null,
      });

      // 3. Tagihan aktif dibatalkan
      expect(mockTagihanDelete).toHaveBeenCalled();
    });

    it("mempertahankan tagihan aktif sebagai arsip jika batalkanTagihanAktif bernilai false", async () => {
      const mockUserUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockKamarUpdate = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      const mockTagihanDelete = vi.fn();

      const mockSupabase = {
        from: vi.fn((table: string) => {
          if (table === "users") {
            return { update: mockUserUpdate };
          }
          if (table === "kamar") {
            return { update: mockKamarUpdate };
          }
          if (table === "tagihan") {
            return { delete: mockTagihanDelete };
          }
          return {};
        }),
      } as unknown as SupabaseClient;

      const result = await keluarkanPenghuniKamar(mockSupabase, {
        kamarId: "kamar-101",
        penghuniId: "usr-101",
        batalkanTagihanAktif: false, // Pertahankan tagihan
      });

      expect(result.success).toBe(true);
      expect(mockTagihanDelete).not.toHaveBeenCalled();
    });
  });
});
