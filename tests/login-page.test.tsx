import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";
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

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it("merender form input username, password, dan tombol masuk", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/username atau nomor kamar/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kata sandi/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /masuk ke dashboard/i })).toBeInTheDocument();
  });

  it("merender kartu panduan kredensial demo untuk Pemilik dan Penghuni", () => {
    render(<LoginPage />);

    expect(screen.getByText(/panduan kredensial demo/i)).toBeInTheDocument();
    expect(screen.getByText(/Akses Pemilik Kost:/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Ibu Hj\. Syantika/i })).toBeInTheDocument();
    // Verify room 101 through 108 demo chips are available
    for (const room of ["101", "102", "103", "104", "105", "106", "107", "108"]) {
      expect(screen.getByRole("button", { name: new RegExp(room, "i") })).toBeInTheDocument();
    }
  });

  it("menampilkan pesan error jika kredensial salah", async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText(/username atau nomor kamar/i);
    const passwordInput = screen.getByLabelText(/kata sandi/i);
    const submitBtn = screen.getByRole("button", { name: /masuk ke dashboard/i });

    fireEvent.change(usernameInput, { target: { value: "salah" } });
    fireEvent.change(passwordInput, { target: { value: "salah" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/username atau nomor kamar tidak ditemukan/i)).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("berhasil login manual dengan kredensial pemilik dan redirect ke /dashboard", async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText(/username atau nomor kamar/i);
    const passwordInput = screen.getByLabelText(/kata sandi/i);
    const submitBtn = screen.getByRole("button", { name: /masuk ke dashboard/i });

    fireEvent.change(usernameInput, { target: { value: "pemilik" } });
    fireEvent.change(passwordInput, { target: { value: "123456" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.role).toBe("PEMILIK");
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("berhasil quick login saat klik chip Kamar 101 pada kartu demo", async () => {
    render(<LoginPage />);

    const chip101 = screen.getByRole("button", { name: /101/i });
    fireEvent.click(chip101);

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(true);
      expect(useAuthStore.getState().user?.role).toBe("PENGHUNI");
      expect(useAuthStore.getState().user?.nomorKamar).toBe("101");
      expect(mockReplace).toHaveBeenCalledWith("/dashboard");
    });
  });
});
