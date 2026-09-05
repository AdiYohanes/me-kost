import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  signInWithGoogle,
  signInWithEmailPassword,
  verifyAndLinkPenghuniGoogleUser,
  fetchUserProfile,
  signOutUser,
  mapProfileToSession,
} from "@/lib/supabase/auth";
import { useAuthStore } from "@/lib/store/use-auth-store";
import { GET } from "@/app/auth/callback/route";
import { SupabaseUserProfile } from "@/types/auth";

// Mock Supabase Client modules
const mockSignInWithOAuth = vi.fn();
const mockSignInWithPassword = vi.fn();
const mockSignOut = vi.fn();
const mockGetSession = vi.fn();
const mockExchangeCodeForSession = vi.fn();
const mockFrom = vi.fn();

const mockSupabaseClient = {
  auth: {
    signInWithOAuth: mockSignInWithOAuth,
    signInWithPassword: mockSignInWithPassword,
    signOut: mockSignOut,
    getSession: mockGetSession,
    exchangeCodeForSession: mockExchangeCodeForSession,
  },
  from: mockFrom,
};

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => mockSupabaseClient,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => mockSupabaseClient,
}));

describe("Supabase Authentication & Automated Room Linker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  describe("1. Penghuni Google OAuth Initiator", () => {
    it("memulai autentikasi Google OAuth dengan provider dan redirect URL yang benar", async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({
        data: { url: "https://accounts.google.com/o/oauth2/v2/auth?client_id=123" },
        error: null,
      });

      const res = await signInWithGoogle("http://localhost:3000/auth/callback");

      expect(res.success).toBe(true);
      expect(res.url).toContain("accounts.google.com");
      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/auth/callback",
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });
    });

    it("menangani error jika Google OAuth gagal diinisiasi", async () => {
      mockSignInWithOAuth.mockResolvedValueOnce({
        data: { url: null },
        error: { message: "OAuth provider error" },
      });

      const res = await signInWithGoogle();
      expect(res.success).toBe(false);
      expect(res.error).toBe("OAuth provider error");
    });
  });

  describe("2. Penaut Kamar Otomatis (verifyAndLinkPenghuniGoogleUser)", () => {
    it("berhasil memverifikasi penghuni terdaftar dan memperbarui auth_id", async () => {
      const mockProfile: SupabaseUserProfile = {
        id: "usr-uuid-1",
        auth_id: null,
        role: "PENGHUNI",
        nama: "Rizky Ramadhan",
        email: "rizky@gmail.com",
        kamar_id: "kamar-101-uuid",
        status: "AKTIF",
        kamar: {
          id: "kamar-101-uuid",
          nomor_kamar: "101",
          tipe_kamar: "Kamar Deluxe Lt. 1",
          tarif_bulanan: 1500000,
          status_hunian: "TERISI",
          tanggal_jatuh_tempo: 1,
        },
      };

      const mockUpdateEq = vi.fn().mockResolvedValue({ error: null });
      const mockUpdate = vi.fn().mockReturnValue({ eq: mockUpdateEq });

      mockFrom.mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: () => ({
              ilike: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: mockProfile, error: null }),
              }),
            }),
            update: mockUpdate,
          };
        }
        return {};
      });

      // @ts-expect-error test mock
      const result = await verifyAndLinkPenghuniGoogleUser(mockSupabaseClient, "auth-google-uuid-99", "rizky@gmail.com");

      expect(result.success).toBe(true);
      expect(result.profile?.nama).toBe("Rizky Ramadhan");
      expect(result.profile?.auth_id).toBe("auth-google-uuid-99");
      expect(mockUpdate).toHaveBeenCalledWith({ auth_id: "auth-google-uuid-99" });
      expect(mockUpdateEq).toHaveBeenCalledWith("id", "usr-uuid-1");
    });

    it("menolak pengguna dengan reason 'unregistered' jika email tidak ditemukan di tabel users", async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: () => ({
              ilike: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          };
        }
        return {};
      });

      // @ts-expect-error test mock
      const result = await verifyAndLinkPenghuniGoogleUser(mockSupabaseClient, "auth-unknown-uuid", "calon@gmail.com");

      expect(result.success).toBe(false);
      expect(result.reason).toBe("unregistered");
      expect(result.error).toContain("Email Google belum terdaftar");
    });

    it("menolak pengguna dengan reason 'inactive' jika status penghuni NONAKTIF", async () => {
      const inactiveProfile: SupabaseUserProfile = {
        id: "usr-uuid-2",
        auth_id: null,
        role: "PENGHUNI",
        nama: "Mantan Penghuni",
        email: "mantan@gmail.com",
        kamar_id: null,
        status: "NONAKTIF",
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: () => ({
              ilike: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: inactiveProfile, error: null }),
              }),
            }),
          };
        }
        return {};
      });

      // @ts-expect-error test mock
      const result = await verifyAndLinkPenghuniGoogleUser(mockSupabaseClient, "auth-uuid", "mantan@gmail.com");

      expect(result.success).toBe(false);
      expect(result.reason).toBe("inactive");
    });

    it("menolak pengguna dengan reason 'no_room' jika kamar_id belum ditautkan", async () => {
      const noRoomProfile: SupabaseUserProfile = {
        id: "usr-uuid-3",
        auth_id: null,
        role: "PENGHUNI",
        nama: "Penghuni Baru",
        email: "baru@gmail.com",
        kamar_id: null,
        status: "AKTIF",
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: () => ({
              ilike: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: noRoomProfile, error: null }),
              }),
            }),
          };
        }
        return {};
      });

      // @ts-expect-error test mock
      const result = await verifyAndLinkPenghuniGoogleUser(mockSupabaseClient, "auth-uuid", "baru@gmail.com");

      expect(result.success).toBe(false);
      expect(result.reason).toBe("no_room");
    });
  });

  describe("3. Login Manual Pemilik Kost (signInWithEmailPassword)", () => {
    it("berhasil login sebagai Pemilik Kost dengan email dan kata sandi valid", async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: "pemilik-auth-id", email: "pemilik@kostsyantika.com" },
        },
        error: null,
      });

      const mockOwnerProfile: SupabaseUserProfile = {
        id: "usr-pemilik-id",
        auth_id: "pemilik-auth-id",
        role: "PEMILIK",
        nama: "Ibu Hj. Syantika",
        email: "pemilik@kostsyantika.com",
        telepon: "0812-3456-7890",
        status: "AKTIF",
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: () => ({
              or: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: mockOwnerProfile, error: null }),
              }),
            }),
          };
        }
        return {};
      });

      // @ts-expect-error test mock
      const res = await signInWithEmailPassword("pemilik@kostsyantika.com", "password123", mockSupabaseClient);

      expect(res.success).toBe(true);
      expect(res.session?.role).toBe("PEMILIK");
      expect(res.session?.name).toBe("Ibu Hj. Syantika");
    });

    it("menolak jika kredensial salah", async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: { user: null },
        error: { message: "Invalid login credentials" },
      });

      // @ts-expect-error test mock
      const res = await signInWithEmailPassword("pemilik@kostsyantika.com", "salah", mockSupabaseClient);

      expect(res.success).toBe(false);
      expect(res.error).toBe("Invalid login credentials");
    });

    it("menolak jika peran akun bukan PEMILIK (misal penghuni login di form pemilik)", async () => {
      mockSignInWithPassword.mockResolvedValueOnce({
        data: {
          user: { id: "penghuni-auth-id", email: "penghuni@gmail.com" },
        },
        error: null,
      });

      const tenantProfile: SupabaseUserProfile = {
        id: "usr-penghuni-id",
        auth_id: "penghuni-auth-id",
        role: "PENGHUNI",
        nama: "Anak Kost",
        email: "penghuni@gmail.com",
        status: "AKTIF",
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: () => ({
              or: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: tenantProfile, error: null }),
              }),
            }),
          };
        }
        return {};
      });

      // @ts-expect-error test mock
      const res = await signInWithEmailPassword("penghuni@gmail.com", "secret", mockSupabaseClient);

      expect(res.success).toBe(false);
      expect(res.error).toContain("khusus untuk Pemilik Kost");
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe("4. OAuth Callback Route Handler (/auth/callback)", () => {
    it("mengarahkan ke /dashboard ketika penghuni terdaftar berhasil diverifikasi", async () => {
      mockExchangeCodeForSession.mockResolvedValueOnce({
        data: {
          session: {
            user: { id: "auth-rizky-id", email: "rizky@gmail.com" },
          },
        },
        error: null,
      });

      const mockTenantProfile: SupabaseUserProfile = {
        id: "usr-rizky",
        auth_id: null,
        role: "PENGHUNI",
        nama: "Rizky Ramadhan",
        email: "rizky@gmail.com",
        kamar_id: "kamar-101",
        status: "AKTIF",
        kamar: {
          id: "kamar-101",
          nomor_kamar: "101",
          tipe_kamar: "Deluxe",
          tarif_bulanan: 1500000,
          status_hunian: "TERISI",
          tanggal_jatuh_tempo: 1,
        },
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: () => ({
              or: () => ({
                // fetchUserProfile (cek apakah pemilik)
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
              ilike: () => ({
                // verifyAndLinkTenantGoogleUser
                maybeSingle: vi.fn().mockResolvedValue({ data: mockTenantProfile, error: null }),
              }),
            }),
            update: () => ({
              eq: vi.fn().mockResolvedValue({ error: null }),
            }),
          };
        }
        return {};
      });

      const request = new Request("http://localhost:3000/auth/callback?code=oauth-valid-code");
      const response = await GET(request);

      expect(response.status).toBe(307); // NextResponse.redirect
      expect(response.headers.get("location")).toBe("http://localhost:3000/dashboard");
    });

    it("menghapus sesi dan mengarahkan ke /login?error=unregistered saat email Google belum terdaftar", async () => {
      mockExchangeCodeForSession.mockResolvedValueOnce({
        data: {
          session: {
            user: { id: "auth-unknown-id", email: "stranger@gmail.com" },
          },
        },
        error: null,
      });

      mockFrom.mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: () => ({
              or: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
              ilike: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
              }),
            }),
          };
        }
        return {};
      });

      const request = new Request("http://localhost:3000/auth/callback?code=oauth-unregistered-code");
      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(mockSignOut).toHaveBeenCalled();
      const location = response.headers.get("location") || "";
      expect(location).toContain("/login?error=unregistered");
      expect(location).toContain("email=stranger%40gmail.com");
    });

    it("mengarahkan ke /login?error=no_code jika parameter code tidak ada", async () => {
      const request = new Request("http://localhost:3000/auth/callback");
      const response = await GET(request);

      expect(response.status).toBe(307);
      expect(response.headers.get("location")).toBe("http://localhost:3000/login?error=no_code");
    });
  });

  describe("5. Integrasi Store & Persistensi Sesi", () => {
    it("memulihkan sesi pengguna dari Supabase via syncSupabaseSession", async () => {
      mockGetSession.mockResolvedValueOnce({
        data: {
          session: {
            user: { id: "auth-persisted-id", email: "rizky@gmail.com" },
          },
        },
        error: null,
      });

      const persistedProfile: SupabaseUserProfile = {
        id: "usr-persisted",
        auth_id: "auth-persisted-id",
        role: "PENGHUNI",
        nama: "Rizky Ramadhan",
        email: "rizky@gmail.com",
        kamar_id: "kamar-101",
        status: "AKTIF",
        kamar: {
          id: "kamar-101",
          nomor_kamar: "101",
          tipe_kamar: "Deluxe",
          tarif_bulanan: 1500000,
          status_hunian: "TERISI",
          tanggal_jatuh_tempo: 1,
        },
      };

      mockFrom.mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: () => ({
              or: () => ({
                maybeSingle: vi.fn().mockResolvedValue({ data: persistedProfile, error: null }),
              }),
            }),
          };
        }
        return {};
      });

      const session = await useAuthStore.getState().syncSupabaseSession();

      expect(session).not.toBeNull();
      expect(session?.nomorKamar).toBe("101");
      expect(session?.role).toBe("PENGHUNI");
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.name).toBe("Rizky Ramadhan");
    });

    it("logout membersihkan sesi lokal dan memanggil signOutUser", () => {
      useAuthStore.getState().quickLogin("101");
      expect(useAuthStore.getState().isAuthenticated).toBe(true);

      useAuthStore.getState().logout();

      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(mockSignOut).toHaveBeenCalled();
    });

    it("mengonversi SupabaseUserProfile ke UserSession via mapProfileToSession", () => {
      const sampleProfile: SupabaseUserProfile = {
        id: "profile-1",
        auth_id: "auth-1",
        role: "PENGHUNI",
        nama: "Budi Santoso",
        email: "budi@gmail.com",
        telepon: "08123456789",
        kamar_id: "kamar-103",
        status: "AKTIF",
        kamar: {
          id: "kamar-103",
          nomor_kamar: "103",
          tipe_kamar: "Deluxe",
          tarif_bulanan: 1500000,
          status_hunian: "TERISI",
          tanggal_jatuh_tempo: 5,
        },
      };

      const session = mapProfileToSession(sampleProfile);
      expect(session.id).toBe("profile-1");
      expect(session.username).toBe("budi@gmail.com");
      expect(session.email).toBe("budi@gmail.com");
      expect(session.nomorKamar).toBe("103");
      expect(session.tarifBulanan).toBe(1500000);
    });

    it("mengambil profil pengguna via fetchUserProfile dan memanggil signOutUser", async () => {
      mockFrom.mockImplementation((table: string) => {
        if (table === "users") {
          return {
            select: () => ({
              eq: () => ({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: {
                    id: "u1",
                    nama: "Pemilik",
                    email: "p@k.com",
                    role: "PEMILIK",
                    status: "AKTIF",
                  },
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      // @ts-expect-error test mock
      const profile = await fetchUserProfile(mockSupabaseClient, "auth-id-123");
      expect(profile).not.toBeNull();
      expect(profile?.nama).toBe("Pemilik");

      // Test signOutUser
      // @ts-expect-error test mock
      await signOutUser(mockSupabaseClient);
      expect(mockSignOut).toHaveBeenCalled();
    });
  });
});
