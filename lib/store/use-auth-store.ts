import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { AuthState, UserSession } from "@/types/auth";
import { findMockUser } from "@/lib/mock-data";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      hasHydrated: false,

      setHasHydrated: (state: boolean) => set({ hasHydrated: state }),

      login: (username: string, password: string) => {
        const found = findMockUser(username);
        if (!found) {
          return {
            success: false,
            error: "Username atau nomor kamar tidak ditemukan.",
          };
        }

        if (found.password !== password) {
          return {
            success: false,
            error: "Kata sandi salah. Silakan coba lagi.",
          };
        }

        // Exclude password from session
        const session: UserSession = {
          id: found.id,
          username: found.username,
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

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
        });
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
