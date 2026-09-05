import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import {
  useOptimisticTagihanMutations,
  QUERY_KEYS,
} from "@/lib/hooks/use-payment-query";
import { handleRealtimeTagihanPayload } from "@/lib/hooks/use-supabase-realtime";
import { PemilikVerifikasiAntrean } from "@/components/dashboard/pemilik-verifikasi-antrean";
import { Tagihan } from "@/types/payment";
import * as tagihanApi from "@/lib/supabase/tagihan";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 5 * 60 * 1000 },
      mutations: { retry: false },
    },
  });
}

function Wrapper({
  client,
  children,
}: {
  client: QueryClient;
  children: React.ReactNode;
}) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("Issue 07: Optimasi Kecepatan UI Smooth & Supabase Realtime", () => {
  let queryClient: QueryClient;
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    usePaymentStore.getState().resetPayments();
    queryClient = createTestQueryClient();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("1. Optimistic UI Updates (<50ms Response Time)", () => {
    it("memperbarui status tagihan menjadi LUNAS secara instan saat Verifikasi Lunas ditekan", async () => {
      // Kamar 102 pada mock berstatus MENUNGGU_VERIFIKASI
      const tagihanAwal = usePaymentStore.getState().getTagihanAktifByKamar("102");
      expect(tagihanAwal?.status).toBe("MENUNGGU_VERIFIKASI");

      queryClient.setQueryData(
        QUERY_KEYS.tagihan,
        usePaymentStore.getState().tagihanList
      );

      function TestMutator() {
        const { verifikasiMutation } = useOptimisticTagihanMutations();
        return (
          <button
            onClick={() =>
              verifikasiMutation.mutate({
                tagihanId: "tagihan-102-2026-09",
                nomorKamar: "102",
                penghuniNama: "Siti Nurhaliza",
              })
            }
          >
            Verifikasi
          </button>
        );
      }

      render(
        <Wrapper client={queryClient}>
          <TestMutator />
        </Wrapper>
      );

      const startTime = performance.now();
      fireEvent.click(screen.getByRole("button", { name: "Verifikasi" }));
      const elapsed = performance.now() - startTime;

      // Respon state perubahan instan secara sinkron tanpa menunggu jaringan (<50ms di browser riil, <500ms di runner beban penuh Vitest)
      expect(elapsed).toBeLessThan(500);

      // Verifikasi seketika di store lokal
      const updatedTagihan = usePaymentStore
        .getState()
        .getTagihanAktifByKamar("102");
      expect(updatedTagihan?.status).toBe("LUNAS");
      expect(updatedTagihan?.metodePembayaran).toBe("TRANSFER");

      // Verifikasi seketika di cache TanStack Query
      const cached = queryClient.getQueryData<Tagihan[]>(QUERY_KEYS.tagihan);
      const cached102 = cached?.find((t) => t.id === "tagihan-102-2026-09");
      expect(cached102?.status).toBe("LUNAS");
    });

    it("memperbarui status tagihan menjadi DITOLAK seketika saat Tolak Bukti ditekan", async () => {
      queryClient.setQueryData(
        QUERY_KEYS.tagihan,
        usePaymentStore.getState().tagihanList
      );

      function TestRejectMutator() {
        const { tolakMutation } = useOptimisticTagihanMutations();
        return (
          <button
            onClick={() =>
              tolakMutation.mutate({
                tagihanId: "tagihan-107-2026-09",
                alasan: "Foto bukti tidak terbaca",
                nomorKamar: "107",
                penghuniNama: "Dewi Lestari",
              })
            }
          >
            Tolak
          </button>
        );
      }

      render(
        <Wrapper client={queryClient}>
          <TestRejectMutator />
        </Wrapper>
      );

      const startTime = performance.now();
      fireEvent.click(screen.getByRole("button", { name: "Tolak" }));
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(500);

      const tagihan107 = usePaymentStore.getState().getTagihanAktifByKamar("107");
      expect(tagihan107?.status).toBe("DITOLAK");
      expect(tagihan107?.alasanPenolakan).toBe("Foto bukti tidak terbaca");
    });

    it("memperbarui status tagihan menjadi LUNAS (CASH) seketika saat Tandai Cash ditekan", async () => {
      function TestCashMutator() {
        const { tandaiCashMutation } = useOptimisticTagihanMutations();
        return (
          <button
            onClick={() =>
              tandaiCashMutation.mutate({
                tagihanId: "tagihan-101-2026-09",
                catatan: "Uang pas diterima",
                nomorKamar: "101",
                penghuniNama: "Rizky Ramadhan",
              })
            }
          >
            Tandai Cash
          </button>
        );
      }

      render(
        <Wrapper client={queryClient}>
          <TestCashMutator />
        </Wrapper>
      );

      const startTime = performance.now();
      fireEvent.click(screen.getByRole("button", { name: "Tandai Cash" }));
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(500);

      const tagihan101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
      expect(tagihan101?.status).toBe("LUNAS");
      expect(tagihan101?.metodePembayaran).toBe("CASH");
      expect(tagihan101?.catatanPemilik).toBe("Uang pas diterima");
    });
  });

  describe("2. Penanganan Kegagalan Jaringan & Automatic Rollback", () => {
    it("melakukan rollback otomatis ke status awal jika pengiriman verifikasi ke Supabase gagal", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

      // Mock Supabase API untuk melempar error server / jaringan 500
      vi.spyOn(tagihanApi, "verifikasiLunasSupabase").mockResolvedValueOnce({
        success: false,
        error: "Koneksi jaringan terputus (500 Internal Server Error)",
      });

      queryClient.setQueryData(
        QUERY_KEYS.tagihan,
        usePaymentStore.getState().tagihanList
      );

      function TestComponent() {
        const { verifikasiMutation } = useOptimisticTagihanMutations();
        return (
          <button
            onClick={() =>
              verifikasiMutation.mutate({
                tagihanId: "tagihan-102-2026-09",
                nomorKamar: "102",
                penghuniNama: "Siti Nurhaliza",
              })
            }
          >
            Verifikasi
          </button>
        );
      }

      render(
        <Wrapper client={queryClient}>
          <TestComponent />
        </Wrapper>
      );

      // Klik tombol
      fireEvent.click(screen.getByRole("button", { name: "Verifikasi" }));

      // Langsung optimis LUNAS seketika pada frame pertama
      expect(
        usePaymentStore.getState().getTagihanAktifByKamar("102")?.status
      ).toBe("LUNAS");

      // Tunggu hingga mutasi gagal di server dan rollback dieksekusi
      await waitFor(() => {
        const tagihan102 = usePaymentStore.getState().getTagihanAktifByKamar("102");
        expect(tagihan102?.status).toBe("MENUNGGU_VERIFIKASI");
      });

      // Verifikasi rollback juga di cache TanStack Query
      const cached = queryClient.getQueryData<Tagihan[]>(QUERY_KEYS.tagihan);
      const cached102 = cached?.find((t) => t.id === "tagihan-102-2026-09");
      expect(cached102?.status).toBe("MENUNGGU_VERIFIKASI");

      // Verifikasi toast error notifikasi rollback muncul
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Gagal menyetujui pembayaran Kamar 102"),
        expect.objectContaining({
          description: expect.stringContaining("rollback"),
        })
      );
    });

    it("melakukan rollback otomatis saat penolakan bukti gagal di server", async () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = "https://mock.supabase.co";
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "mock-anon-key";

      vi.spyOn(tagihanApi, "tolakBuktiPembayaranSupabase").mockResolvedValueOnce({
        success: false,
        error: "Timeout basis data",
      });

      queryClient.setQueryData(
        QUERY_KEYS.tagihan,
        usePaymentStore.getState().tagihanList
      );

      function TestComponent() {
        const { tolakMutation } = useOptimisticTagihanMutations();
        return (
          <button
            onClick={() =>
              tolakMutation.mutate({
                tagihanId: "tagihan-107-2026-09",
                alasan: "Nominal tidak cocok",
                nomorKamar: "107",
                penghuniNama: "Dewi Lestari",
              })
            }
          >
            Tolak
          </button>
        );
      }

      render(
        <Wrapper client={queryClient}>
          <TestComponent />
        </Wrapper>
      );

      fireEvent.click(screen.getByRole("button", { name: "Tolak" }));

      // Awalnya optimis DITOLAK seketika
      expect(
        usePaymentStore.getState().getTagihanAktifByKamar("107")?.status
      ).toBe("DITOLAK");

      // Rollback kembali ke MENUNGGU_VERIFIKASI setelah server mengembalikan error
      await waitFor(() => {
        expect(
          usePaymentStore.getState().getTagihanAktifByKamar("107")?.status
        ).toBe("MENUNGGU_VERIFIKASI");
      });

      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Gagal menolak bukti transfer Kamar 107"),
        expect.anything()
      );
    });
  });

  describe("3. Sinkronisasi Supabase Realtime (WebSocket)", () => {
    it("memperbarui antrean Pemilik Kost saat payload Realtime 'MENUNGGU_VERIFIKASI' diterima", () => {
      queryClient.setQueryData(
        QUERY_KEYS.tagihan,
        usePaymentStore.getState().tagihanList
      );

      // Kamar 101 awalnya BELUM_BAYAR
      expect(
        usePaymentStore.getState().getTagihanAktifByKamar("101")?.status
      ).toBe("BELUM_BAYAR");

      // Simulasikan payload WebSocket Realtime saat Penghuni 101 mengunggah bukti
      const realtimePayload = {
        eventType: "UPDATE",
        new: {
          id: "tagihan-101-2026-09",
          nomor_kamar: "101",
          kamar_id: "101",
          status: "MENUNGGU_VERIFIKASI",
          penghuni_nama_snapshot: "Rizky Ramadhan",
          periode_label: "September 2026",
          tanggal_jatuh_tempo: "2026-09-10",
          nominal: 1500000,
        },
        old: {
          id: "tagihan-101-2026-09",
          status: "BELUM_BAYAR",
        },
      };

      handleRealtimeTagihanPayload(
        realtimePayload,
        { role: "PEMILIK" },
        queryClient
      );

      // Cek di store
      const updated101 = usePaymentStore.getState().getTagihanAktifByKamar("101");
      expect(updated101?.status).toBe("MENUNGGU_VERIFIKASI");

      // Cek di TanStack Query cache
      const cached = queryClient.getQueryData<Tagihan[]>(QUERY_KEYS.tagihan);
      const cached101 = cached?.find((t) => t.id === "tagihan-101-2026-09");
      expect(cached101?.status).toBe("MENUNGGU_VERIFIKASI");

      // Pemilik menerima toast pemberitahuan bukti baru
      expect(toast.info).toHaveBeenCalledWith(
        expect.stringContaining("Bukti transfer baru diunggah!"),
        expect.objectContaining({
          description: expect.stringContaining("Kamar 101"),
        })
      );
    });

    it("memperbarui dashboard Penghuni secara langsung saat Pemilik Kost menyetujui pembayaran (LUNAS)", () => {
      queryClient.setQueryData(
        QUERY_KEYS.tagihan,
        usePaymentStore.getState().tagihanList
      );

      const realtimePayload = {
        eventType: "UPDATE",
        new: {
          id: "tagihan-102-2026-09",
          nomor_kamar: "102",
          kamar_id: "102",
          status: "LUNAS",
          metode_pembayaran: "TRANSFER",
          penghuni_nama_snapshot: "Siti Nurhaliza",
          periode_label: "September 2026",
          tanggal_jatuh_tempo: "2026-09-10",
          nominal: 1500000,
          verified_at: new Date().toISOString(),
        },
        old: {
          id: "tagihan-102-2026-09",
          status: "MENUNGGU_VERIFIKASI",
        },
      };

      handleRealtimeTagihanPayload(
        realtimePayload,
        { role: "PENGHUNI", nomorKamar: "102", kamarId: "102" },
        queryClient
      );

      const updated102 = usePaymentStore.getState().getTagihanAktifByKamar("102");
      expect(updated102?.status).toBe("LUNAS");
      expect(updated102?.metodePembayaran).toBe("TRANSFER");

      // Penghuni menerima toast konfirmasi Lunas
      expect(toast.success).toHaveBeenCalledWith(
        expect.stringContaining("Pembayaran Anda Telah Diverifikasi!"),
        expect.anything()
      );
    });

    it("memperbarui antrean verifikasi Pemilik secara visual tanpa perlu reload halaman", async () => {
      render(
        <Wrapper client={queryClient}>
          <PemilikVerifikasiAntrean />
        </Wrapper>
      );

      // Kamar 102 dan 107 sudah ada di antrean default
      expect(screen.getByText(/Kamar 102/i)).toBeInTheDocument();
      expect(screen.getByText(/Kamar 107/i)).toBeInTheDocument();
      expect(screen.queryByText(/Kamar 101/i)).not.toBeInTheDocument();

      // Datang event realtime bahwa Kamar 101 baru saja mengunggah bukti transfer
      const realtimePayload = {
        eventType: "UPDATE",
        new: {
          id: "tagihan-101-2026-09",
          nomor_kamar: "101",
          kamar_id: "101",
          status: "MENUNGGU_VERIFIKASI",
          penghuni_nama_snapshot: "Rizky Ramadhan",
          periode_label: "September 2026",
          tanggal_jatuh_tempo: "2026-09-10",
          nominal: 1500000,
        },
        old: {
          id: "tagihan-101-2026-09",
          status: "BELUM_BAYAR",
        },
      };

      act(() => {
        handleRealtimeTagihanPayload(
          realtimePayload,
          { role: "PEMILIK" },
          queryClient
        );
      });

      // Kamar 101 seketika muncul di antrean verifikasi tanpa refresh!
      await waitFor(() => {
        expect(screen.getByText(/Kamar 101/i)).toBeInTheDocument();
        expect(screen.getByText(/Rizky Ramadhan/i)).toBeInTheDocument();
      });
    });
  });
});
