import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BottomNav } from "@/components/dashboard/bottom-nav";

describe("BottomNav", () => {
  it("merender tab navigasi mobile untuk peran PEMILIK", () => {
    const handleTabChange = vi.fn();

    render(
      <BottomNav
        role="PEMILIK"
        activeTab="ringkasan"
        onTabChange={handleTabChange}
      />
    );

    expect(screen.getByRole("button", { name: /Ringkasan/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Daftar Kamar/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pengaturan/i })).toBeInTheDocument();
  });

  it("merender tab navigasi mobile untuk peran PENGHUNI", () => {
    const handleTabChange = vi.fn();

    render(
      <BottomNav
        role="PENGHUNI"
        activeTab="tagihan"
        onTabChange={handleTabChange}
      />
    );

    expect(screen.getByRole("button", { name: /Tagihan/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Riwayat/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Pengaturan/i })).toBeInTheDocument();
  });

  it("memanggil onTabChange saat tab ditekan", () => {
    const handleTabChange = vi.fn();

    render(
      <BottomNav
        role="PEMILIK"
        activeTab="ringkasan"
        onTabChange={handleTabChange}
      />
    );

    const kamarTab = screen.getByRole("button", { name: /Daftar Kamar/i });
    fireEvent.click(kamarTab);

    expect(handleTabChange).toHaveBeenCalledWith("kamar");
  });
});
