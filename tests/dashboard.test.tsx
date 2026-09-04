import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";
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

describe("DashboardPage & Unified Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().logout();
    localStorage.clear();
  });

  it("mengalihkan pengguna tanpa sesi ke /login", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });

  it("me-render antarmuka Pemilik Kost jika login sebagai pemilik", async () => {
    useAuthStore.getState().login("pemilik", "123456");

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Ibu Hj\. Syantika/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Pemilik Kost/i)).toBeInTheDocument();
      expect(screen.getByText(/Panel Pengelola Properti/i)).toBeInTheDocument();
    });

    // Make sure penghuni UI is not displayed
    expect(screen.queryByText(/Tagihan Kamar Anda/i)).not.toBeInTheDocument();
  });

  it("me-render antarmuka Penghuni bersangkutan jika login sebagai penghuni", async () => {
    useAuthStore.getState().login("102", "123456");

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Siti Nurhaliza/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/Kamar 102/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/Tagihan Kamar Anda/i)).toBeInTheDocument();
    });

    // Make sure pemilik UI is not displayed
    expect(screen.queryByText(/Panel Pengelola Properti/i)).not.toBeInTheDocument();
  });

  it("membersihkan sesi dan mengarahkan ke /login saat tombol Logout ditekan", async () => {
    useAuthStore.getState().login("pemilik", "123456");

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /keluar/i })).toBeInTheDocument();
    });

    const logoutBtn = screen.getByRole("button", { name: /keluar/i });
    fireEvent.click(logoutBtn);

    await waitFor(() => {
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().user).toBeNull();
      expect(mockReplace).toHaveBeenCalledWith("/login");
    });
  });
});
