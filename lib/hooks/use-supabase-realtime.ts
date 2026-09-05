"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { RealtimeChannel } from "@supabase/supabase-js";
import { useSafeQueryClient, QUERY_KEYS } from "./use-payment-query";
import { usePaymentStore } from "@/lib/store/use-payment-store";
import { createClient } from "@/lib/supabase/client";
import { Tagihan, StatusPembayaran, MetodePembayaran } from "@/types/payment";
import { mapDatabaseRowToTagihan } from "@/lib/supabase/tagihan";

export interface SupabaseRealtimeOptions {
  role?: "PEMILIK" | "PENGHUNI";
  kamarId?: string;
  nomorKamar?: string;
  enabled?: boolean;
}

/**
 * Memproses payload perubahan baris tabel tagihan dari Supabase Realtime
 * dan memperbarui TanStack Query cache serta Zustand store.
 */
export function handleRealtimeTagihanPayload(
  payload: {
    eventType: string;
    new: Record<string, unknown>;
    old: Record<string, unknown>;
  },
  options: SupabaseRealtimeOptions,
  queryClient: ReturnType<typeof useSafeQueryClient>
) {
  const row = payload.new;
  if (!row || !row.id) return;

  const tagihanId = String(row.id);
  const status = row.status as StatusPembayaran;
  const metode = row.metode_pembayaran as MetodePembayaran | undefined;
  const nomorKamar = typeof row.nomor_kamar === "string" ? row.nomor_kamar : "";

  // 1. Perbarui Zustand store
  usePaymentStore.setState((state) => {
    const exists = state.tagihanList.some((t) => t.id === tagihanId);
    let updatedList: Tagihan[];

    if (exists) {
      updatedList = state.tagihanList.map((t) => {
        if (t.id !== tagihanId) return t;
        return {
          ...t,
          status,
          metodePembayaran: metode,
          alasanPenolakan: typeof row.alasan_penolakan === "string" ? row.alasan_penolakan : undefined,
          catatanPemilik: typeof row.catatan_pemilik === "string" ? row.catatan_pemilik : undefined,
          paidAt: typeof row.paid_at === "string" ? row.paid_at : t.paidAt,
          verifiedAt: typeof row.verified_at === "string" ? row.verified_at : t.verifiedAt,
        };
      });
    } else {
      // Jika tagihan baru (misal terbit H-7)
      const mapped = mapDatabaseRowToTagihan(
        row as unknown as Parameters<typeof mapDatabaseRowToTagihan>[0]
      );
      updatedList = [mapped, ...state.tagihanList];
    }

    return { tagihanList: updatedList };
  });

  // 2. Perbarui TanStack Query Cache jika tersedia
  if (queryClient) {
    queryClient.setQueryData<Tagihan[]>(QUERY_KEYS.tagihan, (old) => {
      if (!old) return old;
      const exists = old.some((t) => t.id === tagihanId);
      if (exists) {
        return old.map((t) =>
          t.id === tagihanId
            ? {
                ...t,
                status,
                metodePembayaran: metode,
                alasanPenolakan:
                  typeof row.alasan_penolakan === "string"
                    ? row.alasan_penolakan
                    : undefined,
                catatanPemilik:
                  typeof row.catatan_pemilik === "string"
                    ? row.catatan_pemilik
                    : undefined,
                paidAt:
                  typeof row.paid_at === "string" ? row.paid_at : t.paidAt,
                verifiedAt:
                  typeof row.verified_at === "string"
                    ? row.verified_at
                    : t.verifiedAt,
              }
            : t
        );
      }
      return [
        mapDatabaseRowToTagihan(
          row as unknown as Parameters<typeof mapDatabaseRowToTagihan>[0]
        ),
        ...old,
      ];
    });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tagihan });
  }

  // 3. Notifikasi Toast Berdasarkan Peran
  if (options.role === "PEMILIK") {
    if (status === "MENUNGGU_VERIFIKASI") {
      toast.info(`Bukti transfer baru diunggah!`, {
        description: `Kamar ${nomorKamar || "kost"} menunggu verifikasi pembayaran Anda.`,
      });
    }
  } else if (options.role === "PENGHUNI") {
    const isMyKamar =
      !options.nomorKamar ||
      options.nomorKamar === nomorKamar ||
      options.kamarId === String(row.kamar_id || "");

    if (isMyKamar) {
      if (status === "LUNAS") {
        toast.success("Pembayaran Anda Telah Diverifikasi!", {
          description: `Tagihan periode ini dinyatakan LUNAS (${metode || "TRANSFER"}).`,
        });
      } else if (status === "DITOLAK") {
        toast.error("Bukti Pembayaran Ditolak", {
          description:
            typeof row.alasan_penolakan === "string"
              ? row.alasan_penolakan
              : "Mohon periksa catatan penolakan dan unggah ulang bukti yang jelas.",
        });
      }
    }
  }
}

/**
 * Hook untuk mengaktifkan langganan Supabase Realtime dua arah via WebSocket.
 */
export function useSupabaseRealtime(options: SupabaseRealtimeOptions = {}) {
  const queryClient = useSafeQueryClient();
  const { enabled = true, role = "PEMILIK", kamarId, nomorKamar } = options;

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    let channel: RealtimeChannel | null = null;

    try {
      const supabase = createClient();
      const channelName = `realtime-tagihan-${role.toLowerCase()}-${Date.now()}`;

      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "tagihan" },
          (payload: {
            eventType: string;
            new: Record<string, unknown>;
            old: Record<string, unknown>;
          }) => {
            handleRealtimeTagihanPayload(
              payload,
              { role, kamarId, nomorKamar },
              queryClient
            );
          }
        )
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "bukti_pembayaran" },
          (payload: {
            eventType: string;
            new: Record<string, unknown>;
            old: Record<string, unknown>;
          }) => {
            const row = payload.new;
            if (row && row.tagihan_id) {
              // Trigger invalidation untuk memuat URL bukti transfer baru
              if (queryClient) {
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.tagihan });
              }
            }
          }
        )
        .subscribe();
    } catch {
      // Offline atau mock environment
    }

    return () => {
      if (channel) {
        try {
          const supabase = createClient();
          supabase.removeChannel(channel);
        } catch {
          // Silent cleanup
        }
      }
    };
  }, [enabled, role, kamarId, nomorKamar, queryClient]);
}
