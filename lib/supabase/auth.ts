import { SupabaseClient } from "@supabase/supabase-js";
import { createClient as createBrowserClient } from "./client";
import { SupabaseUserProfile, UserSession } from "@/types/auth";

export function mapProfileToSession(profile: SupabaseUserProfile): UserSession {
  return {
    id: profile.id,
    username: profile.email,
    email: profile.email,
    name: profile.nama,
    role: profile.role,
    kamarId: profile.kamar_id ?? undefined,
    nomorKamar: profile.kamar?.nomor_kamar,
    tipeKamar: profile.kamar?.tipe_kamar,
    tarifBulanan: profile.kamar?.tarif_bulanan,
    phone: profile.telepon ?? undefined,
  };
}

/**
 * Memulai alur autentikasi Google OAuth untuk Penghuni Kost.
 */
export async function signInWithGoogle(redirectTo?: string) {
  const supabase = createBrowserClient();
  const defaultRedirect =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback`
      : "/auth/callback";

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo || defaultRedirect,
      queryParams: {
        access_type: "offline",
        prompt: "select_account",
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, url: data.url };
}

/**
 * Autentikasi Pemilik Kost menggunakan Email dan Password.
 */
export async function signInWithEmailPassword(
  email: string,
  password: string,
  client?: SupabaseClient
) {
  const supabase = client || createBrowserClient();

  const { data: authData, error: authError } =
    await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

  if (authError || !authData.user) {
    return {
      success: false,
      error: authError?.message || "Kredensial salah atau pengguna tidak ditemukan.",
    };
  }

  // Ambil profil dari tabel public.users
  const profile = await fetchUserProfile(
    supabase,
    authData.user.id,
    authData.user.email
  );

  if (!profile) {
    return {
      success: false,
      error: "Profil akun belum terdaftar pada sistem Kost Syantika.",
    };
  }

  if (profile.role !== "PEMILIK") {
    // Jika penghuni mencoba login lewat form pemilik
    await supabase.auth.signOut();
    return {
      success: false,
      error: "Formulir ini khusus untuk Pemilik Kost. Untuk Penghuni, silakan gunakan 'Lanjutkan dengan Google'.",
    };
  }

  const session = mapProfileToSession(profile);
  return { success: true, session, user: profile };
}

/**
 * Mengambil profil pengguna beserta data kamar dari tabel public.users.
 */
export async function fetchUserProfile(
  supabase: SupabaseClient,
  authId?: string,
  email?: string
): Promise<SupabaseUserProfile | null> {
  let query = supabase
    .from("users")
    .select("*, kamar:kamar_id(*)");

  if (authId && email) {
    query = query.or(`auth_id.eq.${authId},email.ilike.${email.toLowerCase()}`);
  } else if (authId) {
    query = query.eq("auth_id", authId);
  } else if (email) {
    query = query.ilike("email", email.toLowerCase());
  } else {
    return null;
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as SupabaseUserProfile;
}

/**
 * Memvalidasi dan menautkan akun Google Penghuni ke data kamar terdaftar.
 * Dipanggil pada rute OAuth callback atau saat sinkronisasi sesi.
 */
export async function verifyAndLinkTenantGoogleUser(
  supabase: SupabaseClient,
  authUserId: string,
  email: string
): Promise<{
  success: boolean;
  profile?: SupabaseUserProfile;
  reason?: "unregistered" | "inactive" | "no_room";
  error?: string;
}> {
  const normalizedEmail = email.trim().toLowerCase();

  // Cari di tabel public.users berdasarkan email
  const { data, error } = await supabase
    .from("users")
    .select("*, kamar:kamar_id(*)")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (error || !data) {
    return {
      success: false,
      reason: "unregistered",
      error: "Email Google belum terdaftar di kamar manapun.",
    };
  }

  const profile = data as SupabaseUserProfile;

  // Verifikasi status akun aktif
  if (profile.status !== "AKTIF") {
    return {
      success: false,
      reason: "inactive",
      error: "Akun penghuni sudah tidak aktif.",
    };
  }

  // Verifikasi apakah memiliki kamar yang ditautkan
  if (!profile.kamar_id) {
    return {
      success: false,
      reason: "no_room",
      error: "Akun penghuni belum ditautkan ke kamar fisik.",
    };
  }

  // Tautkan auth_id jika belum terhubung atau berbeda
  if (profile.auth_id !== authUserId) {
    await supabase
      .from("users")
      .update({ auth_id: authUserId })
      .eq("id", profile.id);

    profile.auth_id = authUserId;
  }

  return {
    success: true,
    profile,
  };
}

/**
 * Logout dari sesi Supabase Auth.
 */
export async function signOutUser(client?: SupabaseClient) {
  try {
    const supabase = client || createBrowserClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan jika env Supabase tidak aktif di offline mode
  }
}
