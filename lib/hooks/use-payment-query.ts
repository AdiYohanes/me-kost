"use client";

import { useContext } from "react";
import {
  useQuery,
  useMutation,
  QueryClientContext,
  QueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { Tagihan, BuktiPembayaran } from "@/types/payment";
import { Kamar } from "@/types/kamar";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { createClient } from "@/lib/supabase/client";
import {
  fetchDaftarTagihan,
  verifikasiLunasSupabase,
  tolakBuktiPembayaranSupabase,
  tandaiLunasCashSupabase,
  uploadBuktiTransferSupabase,
} from "@/lib/supabase/tagihan";
import { fetchDaftarKamar } from "@/lib/supabase/kamar";
import { getQueryClient } from "@/components/providers/query-provider";

export const QUERY_KEYS = {
  tagihan: ["tagihan"] as const,
  kamar: ["kamar"] as const,
};

/**
 * Mendapatkan QueryClient aktif dari React Context, atau fallback ke singleton browser client
 * sehingga tidak pernah melempar error saat komponen diuji secara terisolasi tanpa QueryClientProvider.
 */
export function useSafeQueryClient(): QueryClient {
  const contextClient = useContext(QueryClientContext);
  return contextClient || getQueryClient();
}

/**
 * Hook untuk membaca data tagihan dengan caching TanStack Query dan fallback ke usePaymentStore.
 */
export function useTagihanQuery() {
  const queryClient = useSafeQueryClient();
  const storeTagihan = usePaymentStore((state) => state.tagihanList);

  return useQuery<Tagihan[]>(
    {
      queryKey: QUERY_KEYS.tagihan,
      queryFn: async () => {
        try {
          const supabase = createClient();
          const serverData = await fetchDaftarTagihan(supabase);
          if (serverData && serverData.length > 0) {
            return serverData;
          }
        } catch {
          // Fallback saat offline atau mode mock
        }
        return usePaymentStore.getState().tagihanList;
      },
      initialData: storeTagihan,
      staleTime: 60 * 1000,
    },
    queryClient
  );
}

/**
 * Hook untuk membaca data kamar dengan caching TanStack Query.
 */
export function useKamarQuery() {
  const queryClient = useSafeQueryClient();
  const storeKamar = usePaymentStore((state) => state.kamarList);

  return useQuery<Kamar[]>(
    {
      queryKey: QUERY_KEYS.kamar,
      queryFn: async () => {
        try {
          const supabase = createClient();
          const serverData = await fetchDaftarKamar(supabase);
          if (serverData && serverData.length > 0) {
            return serverData;
          }
        } catch {
          // Fallback
        }
        return usePaymentStore.getState().kamarList;
      },
      initialData: storeKamar,
      staleTime: 60 * 1000,
    },
    queryClient
  );
}

/**
 * Context payload untuk rollback optimistik
 */
interface MutationRollbackContext {
  previousTagihanList: Tagihan[];
}

/**
 * Hook mutasi terpadu dengan Optimistic UI (<50ms) dan Rollback otomatis jika transaksi gagal terkirim ke server.
 */
export function useOptimisticTagihanMutations() {
  const queryClient = useSafeQueryClient();
  const { approveTagihan, rejectTagihan, markCashTagihan, uploadBuktiTransfer } =
    usePaymentStore();

  // 1. Mutasi Verifikasi Lunas (Transfer)
  const verifikasiMutation = useMutation<
    void,
    Error,
    { tagihanId: string; nomorKamar?: string; penghuniNama?: string },
    MutationRollbackContext
  >(
    {
      mutationFn: async ({ tagihanId }) => {
        try {
          const supabase = createClient();
          const res = await verifikasiLunasSupabase(supabase, tagihanId);
          if (!res.success) {
            throw new Error(res.error || "Gagal memverifikasi tagihan di server.");
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes("belum dikonfigurasi")) {
            return; // Mode mock murni
          }
          throw err;
        }
      },
      onMutate: ({ tagihanId }) => {
        // Snapshot state sebelumnya
        const previousTagihanList = [...usePaymentStore.getState().tagihanList];

        if (queryClient) {
          queryClient.cancelQueries({ queryKey: QUERY_KEYS.tagihan });
          queryClient.setQueryData<Tagihan[]>(QUERY_KEYS.tagihan, (old) => {
            if (!old) return old;
            const now = new Date().toISOString();
            return old.map((t) =>
              t.id === tagihanId
                ? {
                    ...t,
                    status: "LUNAS",
                    metodePembayaran: "TRANSFER",
                    verifiedAt: now,
                    paidAt: t.paidAt || now,
                  }
                : t
            );
          });
        }

        // Optimistic update pada Zustand store seketika (<50ms)
        approveTagihan(tagihanId);

        return { previousTagihanList };
      },
      onError: (err, variables, context) => {
        // Rollback jika terjadi kesalahan server / jaringan
        if (context?.previousTagihanList) {
          usePaymentStore.setState({ tagihanList: context.previousTagihanList });
          queryClient?.setQueryData(
            QUERY_KEYS.tagihan,
            context.previousTagihanList
          );
        }
        toast.error(
          `Gagal menyetujui pembayaran Kamar ${variables.nomorKamar || ""}`,
          {
            description: `Terjadi kesalahan jaringan: ${err.message}. Perubahan telah dibatalkan (rollback).`,
          }
        );
      },
      onSettled: () => {
        queryClient?.invalidateQueries({ queryKey: QUERY_KEYS.tagihan });
      },
    },
    queryClient
  );

  // 2. Mutasi Tolak Bukti Transfer
  const tolakMutation = useMutation<
    void,
    Error,
    { tagihanId: string; alasan: string; nomorKamar?: string; penghuniNama?: string },
    MutationRollbackContext
  >(
    {
      mutationFn: async ({ tagihanId, alasan }) => {
        try {
          const supabase = createClient();
          const res = await tolakBuktiPembayaranSupabase(supabase, tagihanId, alasan);
          if (!res.success) {
            throw new Error(res.error || "Gagal menolak bukti pembayaran di server.");
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes("belum dikonfigurasi")) {
            return;
          }
          throw err;
        }
      },
      onMutate: ({ tagihanId, alasan }) => {
        const previousTagihanList = [...usePaymentStore.getState().tagihanList];

        if (queryClient) {
          queryClient.cancelQueries({ queryKey: QUERY_KEYS.tagihan });
          queryClient.setQueryData<Tagihan[]>(QUERY_KEYS.tagihan, (old) => {
            if (!old) return old;
            return old.map((t) =>
              t.id === tagihanId
                ? {
                    ...t,
                    status: "DITOLAK",
                    alasanPenolakan: alasan,
                  }
                : t
            );
          });
        }

        // Optimistic update pada store
        rejectTagihan(tagihanId, alasan);

        return { previousTagihanList };
      },
      onError: (err, variables, context) => {
        if (context?.previousTagihanList) {
          usePaymentStore.setState({ tagihanList: context.previousTagihanList });
          queryClient?.setQueryData(
            QUERY_KEYS.tagihan,
            context.previousTagihanList
          );
        }
        toast.error(
          `Gagal menolak bukti transfer Kamar ${variables.nomorKamar || ""}`,
          {
            description: `Terjadi kesalahan server: ${err.message}. Perubahan telah dibatalkan (rollback).`,
          }
        );
      },
      onSettled: () => {
        queryClient?.invalidateQueries({ queryKey: QUERY_KEYS.tagihan });
      },
    },
    queryClient
  );

  // 3. Mutasi Tandai Lunas Tunai (Cash)
  const tandaiCashMutation = useMutation<
    void,
    Error,
    { tagihanId: string; catatan?: string; nomorKamar?: string; penghuniNama?: string },
    MutationRollbackContext
  >(
    {
      mutationFn: async ({ tagihanId, catatan }) => {
        try {
          const supabase = createClient();
          const res = await tandaiLunasCashSupabase(supabase, tagihanId, catatan);
          if (!res.success) {
            throw new Error(res.error || "Gagal mencatat pembayaran tunai di server.");
          }
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes("belum dikonfigurasi")) {
            return;
          }
          throw err;
        }
      },
      onMutate: ({ tagihanId, catatan }) => {
        const previousTagihanList = [...usePaymentStore.getState().tagihanList];

        if (queryClient) {
          queryClient.cancelQueries({ queryKey: QUERY_KEYS.tagihan });
          queryClient.setQueryData<Tagihan[]>(QUERY_KEYS.tagihan, (old) => {
            if (!old) return old;
            const now = new Date().toISOString();
            return old.map((t) =>
              t.id === tagihanId
                ? {
                    ...t,
                    status: "LUNAS",
                    metodePembayaran: "CASH",
                    paidAt: now,
                    verifiedAt: now,
                    catatanPemilik: catatan,
                    alasanPenolakan: undefined,
                    buktiPembayaran: undefined,
                  }
                : t
            );
          });
        }

        // Optimistic update pada store
        markCashTagihan(tagihanId, catatan);

        return { previousTagihanList };
      },
      onError: (err, variables, context) => {
        if (context?.previousTagihanList) {
          usePaymentStore.setState({ tagihanList: context.previousTagihanList });
          queryClient?.setQueryData(
            QUERY_KEYS.tagihan,
            context.previousTagihanList
          );
        }
        toast.error(
          `Gagal mencatat pembayaran kas Kamar ${variables.nomorKamar || ""}`,
          {
            description: `Terjadi galat jaringan: ${err.message}. Perubahan telah dibatalkan (rollback).`,
          }
        );
      },
      onSettled: () => {
        queryClient?.invalidateQueries({ queryKey: QUERY_KEYS.tagihan });
      },
    },
    queryClient
  );

  // 4. Mutasi Unggah Bukti Transfer
  const uploadBuktiMutation = useMutation<
    { imageUrl?: string; buktiId?: string } | void,
    Error,
    {
      tagihanId: string;
      nomorKamar: string;
      tahun: number;
      bulan: number;
      previewUrl: string;
      file?: File | Blob;
      catatanPenghuni?: string;
    },
    MutationRollbackContext
  >(
    {
      mutationFn: async ({ tagihanId, nomorKamar, tahun, bulan, file, catatanPenghuni }) => {
        if (file) {
          try {
            const supabase = createClient();
            const res = await uploadBuktiTransferSupabase(supabase, {
              tagihanId,
              nomorKamar,
              tahun,
              bulan,
              file,
              catatanPenghuni,
            });
            if (!res.success) {
              throw new Error(res.error || "Gagal mengunggah bukti pembayaran ke server.");
            }
            return res;
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            if (message.includes("belum dikonfigurasi")) {
              return;
            }
            throw err;
          }
        }
      },
      onMutate: ({ tagihanId, nomorKamar, previewUrl, catatanPenghuni }) => {
        const previousTagihanList = [...usePaymentStore.getState().tagihanList];

        // Optimistic update pada Zustand store seketika
        uploadBuktiTransfer(tagihanId, previewUrl, catatanPenghuni);

        if (queryClient) {
          queryClient.cancelQueries({ queryKey: QUERY_KEYS.tagihan });
          queryClient.setQueryData<Tagihan[]>(QUERY_KEYS.tagihan, (old) => {
            if (!old) return old;
            return old.map((t) => {
              if (t.id !== tagihanId) return t;
              const bukti: BuktiPembayaran = {
                id: `bukti-${nomorKamar}-${Date.now()}`,
                tagihanId: t.id,
                kamarId: t.kamarId,
                nomorKamar,
                penghuniId: t.penghuniId,
                penghuniNama: t.penghuniNama,
                imageUrl: previewUrl,
                uploadedAt: new Date().toISOString(),
                catatanPenghuni,
              };
              return {
                ...t,
                status: "MENUNGGU_VERIFIKASI",
                metodePembayaran: "TRANSFER",
                buktiPembayaran: bukti,
                alasanPenolakan: undefined,
              };
            });
          });
        }

        return { previousTagihanList };
      },
      onError: (err, variables, context) => {
        if (context?.previousTagihanList) {
          usePaymentStore.setState({ tagihanList: context.previousTagihanList });
          queryClient?.setQueryData(
            QUERY_KEYS.tagihan,
            context.previousTagihanList
          );
        }
        toast.error("Gagal mengunggah bukti transfer", {
          description: `${err.message}. Perubahan telah dibatalkan (rollback).`,
        });
      },
      onSettled: () => {
        queryClient?.invalidateQueries({ queryKey: QUERY_KEYS.tagihan });
      },
    },
    queryClient
  );

  return {
    verifikasiMutation,
    tolakMutation,
    tandaiCashMutation,
    uploadBuktiMutation,
    verifikasiLunas: (tagihan: { id: string; nomorKamar?: string; penghuniNama?: string }) => {
      approveTagihan(tagihan.id);
      return verifikasiMutation.mutateAsync({
        tagihanId: tagihan.id,
        nomorKamar: tagihan.nomorKamar,
        penghuniNama: tagihan.penghuniNama,
      });
    },
    tolakBukti: (tagihan: { id: string; nomorKamar?: string; penghuniNama?: string }, alasan: string) => {
      rejectTagihan(tagihan.id, alasan);
      return tolakMutation.mutateAsync({
        tagihanId: tagihan.id,
        alasan,
        nomorKamar: tagihan.nomorKamar,
        penghuniNama: tagihan.penghuniNama,
      });
    },
    tandaiCash: (tagihan: { id: string; nomorKamar?: string; penghuniNama?: string }, catatan?: string) => {
      markCashTagihan(tagihan.id, catatan);
      return tandaiCashMutation.mutateAsync({
        tagihanId: tagihan.id,
        catatan,
        nomorKamar: tagihan.nomorKamar,
        penghuniNama: tagihan.penghuniNama,
      });
    },
  };
}
