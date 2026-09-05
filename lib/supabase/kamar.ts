import { SupabaseClient } from "@supabase/supabase-js";
import {
  Kamar,
  StatusHunian,
  TambahPenghuniInput,
  UbahEmailPenghuniInput,
  KeluarkanPenghuniInput,
} from "@/types/kamar";

/**
 * Format helper untuk memetakan baris basis data tabel `kamar` & `users` ke tipe domain `Kamar`.
 */
export function mapDatabaseRowToKamar(
  row: {
    id: string;
    nomor_kamar: string;
    tipe_kamar: string;
    tarif_bulanan: number;
    status_hunian: string;
    tanggal_masuk?: string | null;
    tanggal_jatuh_tempo: number;
    users?: Array<{
      id: string;
      nama: string;
      email: string;
      telepon?: string | null;
      status: string;
    }> | {
      id: string;
      nama: string;
      email: string;
      telepon?: string | null;
      status: string;
    } | null;
  }
): Kamar {
  let activePenghuni: {
    id: string;
    nama: string;
    email: string;
    telepon?: string;
  } | null = null;

  if (Array.isArray(row.users)) {
    const active = row.users.find((u) => u.status === "AKTIF");
    if (active) {
      activePenghuni = {
        id: active.id,
        nama: active.nama,
        email: active.email,
        telepon: active.telepon ?? undefined,
      };
    }
  } else if (row.users && row.users.status === "AKTIF") {
    activePenghuni = {
      id: row.users.id,
      nama: row.users.nama,
      email: row.users.email,
      telepon: row.users.telepon ?? undefined,
    };
  }

  return {
    id: row.id,
    nomorKamar: row.nomor_kamar,
    tipeKamar: row.tipe_kamar,
    tarifBulanan: row.tarif_bulanan,
    statusHunian: (row.status_hunian as StatusHunian) || (activePenghuni ? "TERISI" : "KOSONG"),
    tanggalMasuk: row.tanggal_masuk ?? undefined,
    tanggalJatuhTempo: row.tanggal_jatuh_tempo || 1,
    penghuni: activePenghuni,
  };
}

/**
 * Mengambil seluruh unit fisik kamar terurut berurutan (101, 102, dst.)
 * beserta data Penghuni aktif dari Supabase BaaS.
 */
export async function fetchDaftarKamar(supabase: SupabaseClient): Promise<Kamar[]> {
  const { data, error } = await supabase
    .from("kamar")
    .select("*, users(*)")
    .order("nomor_kamar", { ascending: true });

  if (error) {
    throw new Error(`Gagal mengambil data kamar: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  const mapped = data.map((row) => mapDatabaseRowToKamar(row));

  // Pastikan urutan numerik fisik (101, 102, dst.)
  return mapped.sort(
    (a, b) => parseInt(a.nomorKamar, 10) - parseInt(b.nomorKamar, 10)
  );
}

/**
 * Mendaftarkan Penghuni baru pada kamar kosong.
 * Menyimpan profil Penghuni ke tabel `users`, mengupdate status kamar menjadi `TERISI`,
 * dan menyetel Tanggal Jatuh Tempo secara otomatis mengikuti tanggal masuk.
 */
export async function tambahPenghuniKamar(
  supabase: SupabaseClient,
  input: TambahPenghuniInput
): Promise<{ success: boolean; penghuniId: string; tenantId: string; error?: string }> {
  const nama = input.nama.trim();
  const email = input.email.trim().toLowerCase();
  const telepon = input.telepon?.trim() || null;

  if (!nama) {
    return { success: false, penghuniId: "", tenantId: "", error: "Nama lengkap wajib diisi." };
  }

  if (!email || !email.includes("@")) {
    return { success: false, penghuniId: "", tenantId: "", error: "Format email Google tidak valid." };
  }

  if (!input.tanggalMasuk) {
    return { success: false, penghuniId: "", tenantId: "", error: "Tanggal masuk wajib diisi." };
  }

  // Hitung Tanggal Jatuh Tempo otomatis dari tanggal masuk (day of month) jika tidak ditentukan manual
  let tanggalJatuhTempo = input.tanggalJatuhTempo;
  if (!tanggalJatuhTempo || tanggalJatuhTempo < 1 || tanggalJatuhTempo > 31) {
    const masukDate = new Date(input.tanggalMasuk);
    tanggalJatuhTempo = isNaN(masukDate.getDate()) ? 1 : masukDate.getDate();
  }

  // 1. Ambil data kamar terlebih dahulu untuk informasi tarif
  const { data: kamarData, error: kamarFetchError } = await supabase
    .from("kamar")
    .select("*")
    .eq("id", input.kamarId)
    .single();

  if (kamarFetchError || !kamarData) {
    return {
      success: false,
      penghuniId: "",
      tenantId: "",
      error: kamarFetchError?.message || "Unit kamar tidak ditemukan.",
    };
  }

  // 2. Cek apakah pengguna dengan email ini sudah ada di tabel users
  const { data: existingUser, error: findUserError } = await supabase
    .from("users")
    .select("id")
    .ilike("email", email)
    .maybeSingle();

  if (findUserError) {
    return { success: false, penghuniId: "", tenantId: "", error: findUserError.message };
  }

  let penghuniId = existingUser?.id;

  if (existingUser) {
    const { error: updateUserError } = await supabase
      .from("users")
      .update({
        nama,
        telepon,
        kamar_id: input.kamarId,
        status: "AKTIF",
        role: "PENGHUNI",
      })
      .eq("id", existingUser.id);

    if (updateUserError) {
      return { success: false, penghuniId: "", tenantId: "", error: updateUserError.message };
    }
  } else {
    const { data: insertedUser, error: insertUserError } = await supabase
      .from("users")
      .insert({
        nama,
        email,
        telepon,
        kamar_id: input.kamarId,
        status: "AKTIF",
        role: "PENGHUNI",
      })
      .select("id")
      .single();

    if (insertUserError || !insertedUser) {
      return {
        success: false,
        penghuniId: "",
        tenantId: "",
        error: insertUserError?.message || "Gagal membuat akun penghuni baru.",
      };
    }
    penghuniId = insertedUser.id;
  }

  // 3. Update status kamar menjadi TERISI
  const { error: updateKamarError } = await supabase
    .from("kamar")
    .update({
      status_hunian: "TERISI",
      tanggal_masuk: input.tanggalMasuk,
      tanggal_jatuh_tempo: tanggalJatuhTempo,
    })
    .eq("id", input.kamarId);

  if (updateKamarError) {
    return {
      success: false,
      penghuniId: penghuniId || "",
      tenantId: penghuniId || "",
      error: updateKamarError.message,
    };
  }

  // 4. Provisioning Tagihan perdana jika belum ada tagihan aktif berjalan
  try {
    const { data: existingTagihan } = await supabase
      .from("tagihan")
      .select("id")
      .eq("kamar_id", input.kamarId)
      .in("status", ["BELUM_BAYAR", "MENUNGGU_VERIFIKASI"])
      .maybeSingle();

    if (!existingTagihan) {
      const masukDate = new Date(input.tanggalMasuk);
      const year = masukDate.getFullYear();
      const month = masukDate.getMonth();
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const periodeLabel = `${monthNames[month]} ${year}`;
      const dueDateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(tanggalJatuhTempo).padStart(2, "0")}`;
      const startDateString = input.tanggalMasuk;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

      await supabase.from("tagihan").insert({
        kamar_id: input.kamarId,
        penghuni_id: penghuniId,
        penghuni_nama_snapshot: nama,
        periode_label: periodeLabel,
        periode_mulai: startDateString,
        periode_selesai: endDateString,
        tanggal_jatuh_tempo: dueDateString,
        nominal: kamarData.tarif_bulanan,
        status: "BELUM_BAYAR",
      });
    }
  } catch {
    // Pengabaian kegagalan non-fatal saat provisioning tagihan
  }

  return { success: true, penghuniId: penghuniId || "", tenantId: penghuniId || "" };
}

/**
 * Mengubah email Google terdaftar Penghuni pada kamar aktif.
 */
export async function ubahEmailPenghuni(
  supabase: SupabaseClient,
  input: UbahEmailPenghuniInput
): Promise<{ success: boolean; error?: string }> {
  const newEmail = input.emailBaru.trim().toLowerCase();

  if (!newEmail || !newEmail.includes("@")) {
    return { success: false, error: "Format email tidak valid." };
  }

  let query = supabase.from("users").update({ email: newEmail });

  const targetPenghuniId = input.penghuniId || input.userId;
  if (targetPenghuniId) {
    query = query.eq("id", targetPenghuniId);
  } else if (input.kamarId) {
    query = query.eq("kamar_id", input.kamarId).eq("status", "AKTIF");
  } else {
    return { success: false, error: "Identifier penghuni atau kamar wajib diberikan." };
  }

  const { error } = await query;

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Melepaskan Penghuni dari kamar (Soft Disconnect).
 * - Menghapus relasi kamar pada akun Penghuni (`kamar_id = NULL`, status `NONAKTIF`).
 * - Mengembalikan status kamar menjadi `KOSONG` dan mengosongkan `tanggal_masuk`.
 * - Membatalkan tagihan aktif bulan berjalan (jika dipilih) atau mempertahankan sebagai arsip.
 * - Seluruh riwayat pembayaran masa lalu tetap utuh dengan snapshot nama penghuni.
 */
export async function keluarkanPenghuniKamar(
  supabase: SupabaseClient,
  input: KeluarkanPenghuniInput
): Promise<{ success: boolean; error?: string }> {
  // 1. Soft disconnect pada baris Penghuni di tabel users
  let userQuery = supabase
    .from("users")
    .update({ kamar_id: null, status: "NONAKTIF" });

  if (input.penghuniId) {
    userQuery = userQuery.eq("id", input.penghuniId);
  } else {
    userQuery = userQuery.eq("kamar_id", input.kamarId).eq("status", "AKTIF");
  }

  const { error: userError } = await userQuery;
  if (userError) {
    return { success: false, error: userError.message };
  }

  // 2. Set status kamar menjadi KOSONG
  const { error: kamarError } = await supabase
    .from("kamar")
    .update({
      status_hunian: "KOSONG",
      tanggal_masuk: null,
    })
    .eq("id", input.kamarId);

  if (kamarError) {
    return { success: false, error: kamarError.message };
  }

  // 3. Batalkan tagihan aktif bulan berjalan jika dipilih oleh pemilik
  if (input.batalkanTagihanAktif) {
    let tagihanQuery = supabase
      .from("tagihan")
      .delete()
      .eq("kamar_id", input.kamarId);

    if (input.penghuniId) {
      tagihanQuery = tagihanQuery.eq("penghuni_id", input.penghuniId);
    }

    const { error: tagihanError } = await tagihanQuery.in("status", [
      "BELUM_BAYAR",
      "MENUNGGU_VERIFIKASI",
      "DITOLAK",
    ]);

    if (tagihanError) {
      return { success: false, error: tagihanError.message };
    }
  }

  return { success: true };
}
