import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import HomePage from "@/app/page";
import { useAuthStore } from "@/lib/store/use-auth-store";

// Mock next/navigation
const mockReplace = vi.fn();
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it("merender homepage untuk pengunjung belum login dengan carousel dan tombol CTA", () => {
    render(<HomePage />);

    // Memeriksa identitas nama kost & lokasi
    expect(screen.getByRole("heading", { name: "Kost Syantika" })).toBeInTheDocument();
    expect(screen.getByText("Jl. Melati No. 15")).toBeInTheDocument();

    // Memeriksa konten slide carousel aktif awal
    expect(screen.getByText("Fasad Modern Tropis")).toBeInTheDocument();
    expect(screen.getByText("8 Unit Kamar Terawat")).toBeInTheDocument();

    // Memeriksa kartu CTA dan tombol masuk
    expect(screen.getByRole("button", { name: /masuk ke akun sekarang/i })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("menampilkan UI loading dan berpindah ke /login saat tombol CTA diklik", async () => {
    render(<HomePage />);

    const ctaButton = screen.getByRole("button", { name: /masuk ke akun sekarang/i });
    fireEvent.click(ctaButton);

    // Memeriksa overlay status loading muncul
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/menyiapkan sesi login kost syantika.../i)).toBeInTheDocument();

    // Memeriksa setelah transisi memanggil router.push("/login")
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      },
      { timeout: 1000 }
    );
  });

  it("berpindah ke /login saat tombol Masuk pada header diklik", async () => {
    render(<HomePage />);

    const headerMasukButton = screen.getByRole("button", { name: /^masuk$/i });
    fireEvent.click(headerMasukButton);

    expect(screen.getByRole("status")).toBeInTheDocument();
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      },
      { timeout: 1000 }
    );
  });

  it("mengarahkan otomatis ke /dashboard jika pengguna sudah login", async () => {
    useAuthStore.getState().login("pemilik", "123456");

    render(<HomePage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });
});

