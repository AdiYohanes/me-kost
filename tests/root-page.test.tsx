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

  it("merender homepage untuk pengunjung belum login dengan Logo Me Kost dan tombol CTA Login", () => {
    render(<HomePage />);

    // Memeriksa identitas nama Syantika Kost
    expect(screen.getByRole("heading", { name: "Syantika Kost" })).toBeInTheDocument();

    // Memeriksa Logo Me Kost
    const logoImg = screen.getByAltText("Logo Me Kost");
    expect(logoImg).toBeInTheDocument();

    // Memeriksa tombol CTA Login
    expect(screen.getByRole("button", { name: /^login$/i })).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("menampilkan UI loading dan berpindah ke /login saat tombol CTA Login diklik", async () => {
    render(<HomePage />);

    const ctaButton = screen.getByRole("button", { name: /^login$/i });
    fireEvent.click(ctaButton);

    // Memeriksa overlay status loading muncul
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText(/menyiapkan sesi login me kost.../i)).toBeInTheDocument();

    // Memeriksa setelah transisi memanggil router.push("/login")
    await waitFor(
      () => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      },
      { timeout: 2000 }
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
