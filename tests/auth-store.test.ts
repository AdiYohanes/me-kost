import { describe, it, expect, beforeEach } from "vitest";
import { useAuthStore } from "@/lib/store/use-auth-store";

describe("useAuthStore", () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it("memiliki state awal tidak terautentikasi", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("berhasil login sebagai Pemilik Kost dengan kredensial yang valid", () => {
    const res = useAuthStore.getState().login("pemilik", "123456");
    expect(res.success).toBe(true);
    expect(res.error).toBeUndefined();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.user?.role).toBe("PEMILIK");
    expect(state.user?.username).toBe("pemilik");
    expect(state.user?.name).toBe("Ibu Hj. Syantika");
  });

  it("berhasil login sebagai Penghuni Kamar 101 dengan kredensial valid", () => {
    const res = useAuthStore.getState().login("101", "123456");
    expect(res.success).toBe(true);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.role).toBe("PENGHUNI");
    expect(state.user?.nomorKamar).toBe("101");
    expect(state.user?.name).toBe("Rizky Ramadhan");
  });

  it("gagal login jika username tidak ditemukan", () => {
    const res = useAuthStore.getState().login("999", "123456");
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("gagal login jika kata sandi salah", () => {
    const res = useAuthStore.getState().login("pemilik", "password_salah");
    expect(res.success).toBe(false);
    expect(res.error).toBe("Kata sandi salah. Silakan coba lagi.");

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("berhasil quickLogin untuk tombol panduan demo", () => {
    const res = useAuthStore.getState().quickLogin("104");
    expect(res.success).toBe(true);

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.nomorKamar).toBe("104");
    expect(state.user?.role).toBe("PENGHUNI");
  });

  it("berhasil logout dan menghapus sesi aktif", () => {
    useAuthStore.getState().login("pemilik", "123456");
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });
});
