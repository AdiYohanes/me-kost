import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

describe("Primitive UI Components", () => {
  describe("Button", () => {
    it("renders children and handles click events", () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Bayar Sekarang</Button>);

      const btn = screen.getByRole("button", { name: "Bayar Sekarang" });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("respects disabled state", () => {
      const handleClick = vi.fn();
      render(<Button disabled onClick={handleClick}>Nonaktif</Button>);

      const btn = screen.getByRole("button", { name: "Nonaktif" });
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it("applies variant classes correctly", () => {
      const { rerender } = render(<Button variant="outline">Garis Luar</Button>);
      expect(screen.getByRole("button")).toHaveClass("border");

      rerender(<Button variant="destructive">Hapus</Button>);
      expect(screen.getByRole("button")).toHaveClass("bg-rose-600");
    });
  });

  describe("Badge", () => {
    it("renders text with default and status-specific variants", () => {
      const { rerender } = render(<Badge variant="lunas">Lunas</Badge>);
      const badge = screen.getByText("Lunas");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveClass("bg-emerald-100");

      rerender(<Badge variant="pending">Menunggu Verifikasi</Badge>);
      expect(screen.getByText("Menunggu Verifikasi")).toHaveClass("bg-amber-100");

      rerender(<Badge variant="ditolak">Ditolak</Badge>);
      expect(screen.getByText("Ditolak")).toHaveClass("bg-rose-100");

      rerender(<Badge variant="belumbayar">Belum Bayar</Badge>);
      expect(screen.getByText("Belum Bayar")).toHaveClass("bg-slate-100");
    });
  });

  describe("Card", () => {
    it("renders card components together", () => {
      render(
        <Card>
          <CardHeader>
            <CardTitle>Tagihan Kamar 101</CardTitle>
            <CardDescription>Bulan September 2026</CardDescription>
          </CardHeader>
          <CardContent>Rp 1.500.000</CardContent>
          <CardFooter>Batas: 10 Sep 2026</CardFooter>
        </Card>
      );

      expect(screen.getByText("Tagihan Kamar 101")).toBeInTheDocument();
      expect(screen.getByText("Bulan September 2026")).toBeInTheDocument();
      expect(screen.getByText("Rp 1.500.000")).toBeInTheDocument();
      expect(screen.getByText("Batas: 10 Sep 2026")).toBeInTheDocument();
    });
  });

  describe("Input", () => {
    it("handles typing and supports custom attributes", () => {
      const handleChange = vi.fn();
      render(
        <Input
          placeholder="Nomor Kamar"
          onChange={handleChange}
          data-testid="room-input"
        />
      );

      const input = screen.getByTestId("room-input");
      expect(input).toBeInTheDocument();
      fireEvent.change(input, { target: { value: "102" } });
      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue("102");
    });
  });

  describe("Dialog", () => {
    it("opens and displays dialog content when triggered", () => {
      render(
        <Dialog>
          <DialogTrigger asChild>
            <Button>Buka Detail</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Detail Bukti Pembayaran</DialogTitle>
            <DialogDescription>Pratinjau bukti transfer penghuni</DialogDescription>
          </DialogContent>
        </Dialog>
      );

      expect(screen.queryByText("Detail Bukti Pembayaran")).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Buka Detail" }));
      expect(screen.getByText("Detail Bukti Pembayaran")).toBeInTheDocument();
      expect(screen.getByText("Pratinjau bukti transfer penghuni")).toBeInTheDocument();
    });
  });
});
