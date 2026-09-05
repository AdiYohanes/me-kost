import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";
import { useAuthStore } from "@/lib/store/use-auth-store";

// Mock next/navigation
const mockReplace = vi.fn();
const mockPush = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams = new URLSearchParams();
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it("merender form input username, password, dan tombol masuk", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email atau username/i)).toBeInTheDocument();
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

    const usernameInput = screen.getByLabelText(/email atau username/i);
    const passwordInput = screen.getByLabelText(/kata sandi/i);
    const submitBtn = screen.getByRole("button", { name: /masuk ke dashboard/i });

    fireEvent.change(usernameInput, { target: { value: "salah" } });
    fireEvent.change(passwordInput, { target: { value: "salah" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/akun tidak ditemukan/i)).toBeInTheDocument();
    });
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("berhasil login manual dengan kredensial pemilik dan redirect ke /dashboard", async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText(/email atau username/i);
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

  it("merender tombol Lanjutkan dengan Google untuk Penghuni dan memanggil loginWithGoogle", async () => {
    const loginWithGoogleSpy = vi
      .spyOn(useAuthStore.getState(), "loginWithGoogle")
      .mockResolvedValue({ success: true });

    render(<LoginPage />);

    const googleBtn = screen.getByRole("button", { name: /lanjutkan dengan google/i });
    expect(googleBtn).toBeInTheDocument();

    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(loginWithGoogleSpy).toHaveBeenCalled();
    });
  });

  it("menampilkan pesan penolakan ramah jika akun Google belum terdaftar dan tautan WhatsApp", async () => {
    mockSearchParams = new URLSearchParams("error=unregistered&email=calon%40gmail.com");

    render(<LoginPage />);

    expect(screen.getByTestId("unregistered-alert")).toBeInTheDocument();
    expect(screen.getByText(/akun google belum terdaftar/i)).toBeInTheDocument();
    expect(screen.getByText(/calon@gmail.com/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /hubungi pemilik kost via whatsapp/i })).toBeInTheDocument();

    // Verifikasi link WhatsApp mengandung format nomor dan URL encoded text
    const waLink = screen.getByRole("link", { name: /hubungi pemilik kost via whatsapp/i });
    expect(waLink).toHaveAttribute("href", expect.stringContaining("wa.me/6281234567890"));
    expect(waLink).toHaveAttribute("href", expect.stringContaining("calon%40gmail.com"));

    // Tutup alert
    const closeBtn = screen.getByRole("button", { name: /tutup notifikasi/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByTestId("unregistered-alert")).not.toBeInTheDocument();
  });
});

