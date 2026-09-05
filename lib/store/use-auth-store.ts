import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthState, UserSession } from "@/types/auth";
import { findMockUser } from "@/lib/mock-data";
import {
  signInWithGoogle,
  signInWithEmailPassword,
  signOutUser,
  fetchUserProfile,
  mapProfileToSession,
} from "@/lib/supabase/auth";
import { createClient as createBrowserClient } from "@/lib/supabase/client";

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,

      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),

      /**
       * Login mock untuk kompatibilitas pengujian dan demo instan
       */
      login: (username: string, password: string) => {
        const found = findMockUser(username);
        if (!found) {
          return {
            success: false,
            error: "Akun tidak ditemukan.",
          };
        }

        if (found.password !== password) {
          return {
            success: false,
            error: "Kata sandi salah.",
          };
        }

        const session: UserSession = {
          id: found.id,
          username: found.username,
          email: found.username === "pemilik" ? "pemilik@kostsyantika.com" : `kamar${found.nomorKamar}@kostsyantika.com`,
          name: found.name,
          role: found.role,
          kamarId: found.kamarId,
          nomorKamar: found.nomorKamar,
          tipeKamar: found.tipeKamar,
          tarifBulanan: found.tarifBulanan,
          phone: found.phone,
        };

        set({
          user: session,
          isAuthenticated: true,
        });

        return { success: true };
      },

      /**
       * Quick login demo instan per nomor kamar atau pemilik
       */
      quickLogin: (username: string) => {
        const found = findMockUser(username);
        if (!found) {
          return {
            success: false,
            error: "Akun demo tidak ditemukan.",
          };
        }

        const session: UserSession = {
          id: found.id,
          username: found.username,
          email: found.username === "pemilik" ? "pemilik@kostsyantika.com" : `kamar${found.nomorKamar}@kostsyantika.com`,
          name: found.name,
          role: found.role,
          kamarId: found.kamarId,
          nomorKamar: found.nomorKamar,
          tipeKamar: found.tipeKamar,
          tarifBulanan: found.tarifBulanan,
          phone: found.phone,
        };

        set({
          user: session,
          isAuthenticated: true,
        });

        return { success: true };
      },

      /**
       * Login Pemilik Kost menggunakan Email & Password Supabase (atau mock jika username non-email)
       */
      loginWithPassword: async (emailOrUsername: string, password: string) => {
        const trimmed = emailOrUsername.trim();
        const isEmail = trimmed.includes("@");

        // Jika bukan format email (misal: "pemilik", "101", atau input sembarang), gunakan mock store
        if (!isEmail) {
          return get().login(trimmed, password);
        }

        const mockFound = findMockUser(trimmed);
        if (mockFound) {
          return get().login(trimmed, password);
        }

        try {
          const res = await signInWithEmailPassword(trimmed, password);
          if (res.success && res.session) {
            set({
              user: res.session,
              isAuthenticated: true,
            });
            return { success: true };
          }
          return {
            success: false,
            error: res.error || "Kredensial salah atau pengguna tidak ditemukan.",
          };
        } catch (err: unknown) {
          const message =
            err instanceof Error
              ? err.message
              : "Terjadi kesalahan koneksi autentikasi.";
          return {
            success: false,
            error: message,
          };
        }
      },

      /**
       * Inisiasi alur Google OAuth untuk Penghuni Kost
       */
      loginWithGoogle: async () => {
        try {
          const res = await signInWithGoogle();
          if (!res.success) {
            return {
              success: false,
              error: res.error || "Gagal menghubungi layanan Google Sign-In.",
            };
          }
          return { success: true };
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Gagal memulai Google OAuth.";
          return {
            success: false,
            error: message,
          };
        }
      },

      /**
       * Sinkronisasi sesi Supabase Auth yang aktif dengan Zustand store
       */
      syncSupabaseSession: async () => {
        try {
          const supabase = createBrowserClient();
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error || !session?.user) {
            return null;
          }

          const profile = await fetchUserProfile(
            supabase,
            session.user.id,
            session.user.email
          );

          if (!profile) {
            return null;
          }

          if (profile.role === "PENGHUNI" && (!profile.kamar_id || profile.status !== "AKTIF")) {
            await signOutUser(supabase);
            set({ user: null, isAuthenticated: false });
            return null;
          }

          const userSession = mapProfileToSession(profile);
          set({
            user: userSession,
            isAuthenticated: true,
          });

          return userSession;
        } catch {
          // Kembalikan user lokal jika sesi offline/mock
          return get().user;
        }
      },

      /**
       * Logout aman: bersihkan state lokal seketika dan sesi Supabase di latar belakang
       */
      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });

        signOutUser().catch(() => {});
      },
    }),
    {
      name: "kost-syantika-auth",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
