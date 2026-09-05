import { SupabaseClient } from "@supabase/supabase-js";
import { Tagihan, StatusPembayaran, MetodePembayaran, BuktiPembayaran } from "@/types/payment";
import { mapDatabaseRowToKamar } from "@/lib/supabase/kamar";
import { evaluasiPenerbitanH7, BULAN_SHORT, formatDuaDigit } from "@/lib/siklus-tagihan";
import { buatStoragePathBukti } from "@/lib/kompresi-gambar";

/**
 * Format tanggal YYYY-MM-DD ke string tampilan bahasa Indonesia ("10 Sep 2026")
 */
function formatTanggalIndonesia(isoDate: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length >= 3) {
    const year = parts[0];
    const monthIndex = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const monthShort = BULAN_SHORT[monthIndex] || "";
    return `${day} ${monthShort} ${year}`;
  }
  return isoDate;
}

/**
 * Memetakan baris tabel `tagihan` Supabase ke entitas domain `Tagihan`.
 */
export function mapDatabaseRowToTagihan(row: {
  id: string;
  kamar_id: string;
  penghuni_id?: string | null;
  penghuni_nama_snapshot: string;
  periode_label: string;
  periode_mulai: string;
  periode_selesai: string;
  tanggal_jatuh_tempo: string;
  nominal: number;
  status: string;
  metode_pembayaran?: string | null;
  alasan_penolakan?: string | null;
  catatan_pemilik?: string | null;
  paid_at?: string | null;
  verified_at?: string | null;
  kamar?: { nomor_kamar: string } | null;
  bukti_pembayaran?: Array<{
    id: string;
    tagihan_id: string;
    image_url: string;
    catatan_penghuni?: string | null;
    uploaded_at: string;
  }> | null;
}): Tagihan {
  const nomorKamar = row.kamar?.nomor_kamar || "";

  // Ambil bukti pembayaran terbaru jika ada
  let bukti: BuktiPembayaran | undefined = undefined;
  if (Array.isArray(row.bukti_pembayaran) && row.bukti_pembayaran.length > 0) {
    const latest = row.bukti_pembayaran[0];
    bukti = {
      id: latest.id,
      tagihanId: row.id,
      kamarId: row.kamar_id,
      nomorKamar,
      penghuniId: row.penghuni_id || "",
      penghuniNama: row.penghuni_nama_snapshot,
      imageUrl: latest.image_url,
      uploadedAt: latest.uploaded_at,
      catatanPenghuni: latest.catatan_penghuni || undefined,
    };
  }

  // Parse bulan dan tahun dari tanggal_jatuh_tempo
  const dateParts = (row.tanggal_jatuh_tempo || "").split("-");
  const tahun = parseInt(dateParts[0], 10) || 2026;
  const bulan = parseInt(dateParts[1], 10) || 9;

  return {
    id: row.id,
    kamarId: row.kamar_id,
    nomorKamar,
    penghuniId: row.penghuni_id || "",
    penghuniNama: row.penghuni_nama_snapshot,
    periodeBulan: row.periode_label,
    periodeLabel: row.periode_label,
    periodeMulai: row.periode_mulai,
    periodeSelesai: row.periode_selesai,
    tanggalJatuhTempo: row.tanggal_jatuh_tempo,
    tahun,
    bulan,
    nominal: row.nominal,
    batasBayar: formatTanggalIndonesia(row.tanggal_jatuh_tempo),
    status: row.status as StatusPembayaran,
    metodePembayaran: (row.metode_pembayaran as MetodePembayaran) || undefined,
    buktiPembayaran: bukti,
    alasanPenolakan: row.alasan_penolakan || undefined,
    catatanPemilik: row.catatan_pemilik || undefined,
    paidAt: row.paid_at || undefined,
    verifiedAt: row.verified_at || undefined,
  };
}

/**
 * Mengambil seluruh daftar tagihan dari Supabase BaaS.
 */
export async function fetchDaftarTagihan(supabase: SupabaseClient): Promise<Tagihan[]> {
  const { data, error } = await supabase
    .from("tagihan")
    .select("*, kamar(nomor_kamar), bukti_pembayaran(*)")
    .order("tanggal_jatuh_tempo", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil data tagihan: ${error.message}`);
  }

  if (!data) return [];
  return data.map((row) => mapDatabaseRowToTagihan(row));
}

/**
 * Mengambil tagihan aktif dan riwayat tagihan berdasarkan ID kamar.
 */
export async function fetchTagihanByKamar(
  supabase: SupabaseClient,
  kamarId: string
): Promise<Tagihan[]> {
  const { data, error } = await supabase
    .from("tagihan")
    .select("*, kamar(nomor_kamar), bukti_pembayaran(*)")
    .eq("kamar_id", kamarId)
    .order("tanggal_jatuh_tempo", { ascending: false });

  if (error) {
    throw new Error(`Gagal mengambil tagihan kamar: ${error.message}`);
  }

  if (!data) return [];
  return data.map((row) => mapDatabaseRowToTagihan(row));
}

/**
 * Mengubah nominal tagihan suatu kamar (misal untuk penambahan biaya fasilitas atau diskon).
 */
export async function updateNominalTagihanSupabase(
  supabase: SupabaseClient,
  tagihanId: string,
  nominalBaru: number
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("tagihan")
    .update({ nominal: nominalBaru })
    .eq("id", tagihanId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Memperbarui status tagihan yang telah melampaui tanggal jatuh tempo tanpa pelunasan menjadi MENUNGGAK.
 */
export async function evaluasiTagihanMenunggakSupabase(
  supabase: SupabaseClient,
  referenceDate: Date = new Date()
): Promise<{ success: boolean; updatedCount?: number; error?: string }> {
  const tanggalHariIniString = `${referenceDate.getFullYear()}-${formatDuaDigit(referenceDate.getMonth() + 1)}-${formatDuaDigit(referenceDate.getDate())}`;

  const { error, count } = await supabase
    .from("tagihan")
    .update({ status: "MENUNGGAK" })
    .in("status", ["BELUM_BAYAR", "DITOLAK"])
    .lt("tanggal_jatuh_tempo", tanggalHariIniString);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true, updatedCount: count ?? 0 };
}

/**
 * Memeriksa seluruh unit kamar terisi dan menerbitkan tagihan H-7 otomatis ke basis data Supabase.
 */
export async function periksaDanTerbitkanTagihanH7Supabase(
  supabase: SupabaseClient,
  referenceDate: Date = new Date()
): Promise<{ success: boolean; terbitCount: number; tagihanList: Tagihan[]; error?: string }> {
  // 1. Ambil kamar terisi beserta data penghuni aktif
  const { data: kamarRows, error: kamarError } = await supabase
    .from("kamar")
    .select("*, users(*)")
    .eq("status_hunian", "TERISI");

  if (kamarError || !kamarRows) {
    return { success: false, terbitCount: 0, tagihanList: [], error: kamarError?.message };
  }

  const mappedKamarList = kamarRows.map((r) => mapDatabaseRowToKamar(r));

  // 2. Ambil tagihan yang ada untuk kamar-kamar tersebut
  const { data: tagihanRows, error: tagihanError } = await supabase
    .from("tagihan")
    .select("*")
    .order("tanggal_jatuh_tempo", { ascending: false });

  if (tagihanError) {
    return { success: false, terbitCount: 0, tagihanList: [], error: tagihanError.message };
  }

  const existingTagihanList = (tagihanRows || []).map((r) => mapDatabaseRowToTagihan(r));

  const newRecordsToInsert: Array<{
    kamar_id: string;
    penghuni_id: string | null;
    penghuni_nama_snapshot: string;
    periode_label: string;
    periode_mulai: string;
    periode_selesai: string;
    tanggal_jatuh_tempo: string;
    nominal: number;
    status: string;
  }> = [];

  for (const kamar of mappedKamarList) {
    if (kamar.statusHunian === "TERISI" && kamar.penghuni) {
      const h7Check = evaluasiPenerbitanH7(kamar, existingTagihanList, referenceDate);
      if (h7Check.perluTerbit && h7Check.newTagihanData) {
        const dataTagihanBaru = h7Check.newTagihanData;

        newRecordsToInsert.push({
          kamar_id: kamar.id,
          penghuni_id: kamar.penghuni.id,
          penghuni_nama_snapshot: kamar.penghuni.nama,
          periode_label: dataTagihanBaru.periodeLabel || dataTagihanBaru.periodeBulan,
          periode_mulai: dataTagihanBaru.periodeMulai || "",
          periode_selesai: dataTagihanBaru.periodeSelesai || "",
          tanggal_jatuh_tempo: dataTagihanBaru.tanggalJatuhTempo || "",
          nominal: kamar.tarifBulanan,
          status: "BELUM_BAYAR",
        });
      }
    }
  }

  if (newRecordsToInsert.length === 0) {
    return { success: true, terbitCount: 0, tagihanList: [] };
  }

  const { data: insertedData, error: insertError } = await supabase
    .from("tagihan")
    .insert(newRecordsToInsert)
    .select();

  if (insertError) {
    return { success: false, terbitCount: 0, tagihanList: [], error: insertError.message };
  }

  const createdList = (insertedData || []).map((r) => mapDatabaseRowToTagihan(r));
  return { success: true, terbitCount: createdList.length, tagihanList: createdList };
}

/**
 * Mengunggah berkas foto bukti transfer ke Supabase Storage bucket `bukti-pembayaran`
 * dan mencatat bukti ke tabel `bukti_pembayaran`.
 */
export async function uploadBuktiTransferSupabase(
  supabase: SupabaseClient,
  params: {
    tagihanId: string;
    nomorKamar: string;
    tahun: number;
    bulan: number;
    file: File | Blob;
    catatanPenghuni?: string;
  }
): Promise<{ success: boolean; imageUrl?: string; buktiId?: string; error?: string }> {
  try {
    const storagePath = buatStoragePathBukti(
      params.nomorKamar,
      params.tahun,
      params.bulan
    );

    // 1. Unggah berkas ke bucket Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("bukti-pembayaran")
      .upload(storagePath, params.file, {
        contentType: params.file.type || "image/webp",
        upsert: true,
      });

    if (uploadError) {
      return { success: false, error: `Gagal mengunggah foto bukti: ${uploadError.message}` };
    }

    // 2. Dapatkan public URL
    const { data: urlData } = supabase.storage
      .from("bukti-pembayaran")
      .getPublicUrl(storagePath);

    const imageUrl = urlData.publicUrl;

    // 3. Simpan record ke tabel `bukti_pembayaran`
    const { data: buktiRow, error: insertError } = await supabase
      .from("bukti_pembayaran")
      .insert({
        tagihan_id: params.tagihanId,
        image_url: imageUrl,
        catatan_penghuni: params.catatanPenghuni?.trim() || null,
      })
      .select()
      .single();

    if (insertError) {
      return { success: false, error: `Gagal mencatat bukti pembayaran: ${insertError.message}` };
    }

    // 4. Perbarui status tagihan menjadi MENUNGGU_VERIFIKASI
    const { error: tagihanError } = await supabase
      .from("tagihan")
      .update({
        status: "MENUNGGU_VERIFIKASI",
        alasan_penolakan: null,
      })
      .eq("id", params.tagihanId);

    if (tagihanError) {
      return { success: false, error: `Gagal memperbarui status tagihan: ${tagihanError.message}` };
    }

    return {
      success: true,
      imageUrl,
      buktiId: buktiRow?.id,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Terjadi kesalahan saat mengunggah bukti.";
    return { success: false, error: message };
  }
}

/**
 * Memverifikasi bukti pembayaran transfer menjadi LUNAS.
 */
export async function verifikasiLunasSupabase(
  supabase: SupabaseClient,
  tagihanId: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("tagihan")
    .update({
      status: "LUNAS",
      metode_pembayaran: "TRANSFER",
      verified_at: now,
      paid_at: now,
    })
    .eq("id", tagihanId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Menolak bukti pembayaran dengan alasan penolakan wajib.
 */
export async function tolakBuktiPembayaranSupabase(
  supabase: SupabaseClient,
  tagihanId: string,
  alasanPenolakan: string
): Promise<{ success: boolean; error?: string }> {
  if (!alasanPenolakan || !alasanPenolakan.trim()) {
    return { success: false, error: "Alasan penolakan wajib diisi." };
  }

  const { error } = await supabase
    .from("tagihan")
    .update({
      status: "DITOLAK",
      metode_pembayaran: null,
      alasan_penolakan: alasanPenolakan.trim(),
    })
    .eq("id", tagihanId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

/**
 * Menandai tagihan lunas secara tunai langsung (CASH) dengan catatan opsional.
 */
export async function tandaiLunasCashSupabase(
  supabase: SupabaseClient,
  tagihanId: string,
  catatanPemilik?: string
): Promise<{ success: boolean; error?: string }> {
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("tagihan")
    .update({
      status: "LUNAS",
      metode_pembayaran: "CASH",
      catatan_pemilik: catatanPemilik?.trim() || null,
      paid_at: now,
      verified_at: now,
      alasan_penolakan: null,
    })
    .eq("id", tagihanId);

  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}
