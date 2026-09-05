import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BayarTunaiDialog } from "@/components/dashboard/bayar-tunai-dialog";

describe("BayarTunaiDialog", () => {
  it("membuka modal dialog saat trigger ditekan dan menampilkan panduan pembayaran tunai", () => {
    render(
      <BayarTunaiDialog
        trigger={
          <button type="button">Buka Panduan Tunai</button>
        }
      />
    );

    expect(screen.queryByText(/Panduan Pembayaran Tunai/i)).not.toBeInTheDocument();

    const triggerBtn = screen.getByRole("button", { name: /Buka Panduan Tunai/i });
    fireEvent.click(triggerBtn);

    expect(screen.getByText(/Panduan Pembayaran Tunai/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Adi Yohanes/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/0812-3456-7890/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ruang Pengelola Kost/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: /Salin Nomor/i })).toBeInTheDocument();
  });
});
