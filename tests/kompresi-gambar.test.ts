import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  formatUkuranBerkas,
  buatStoragePathBukti,
  hitungDimensiProporsional,
  kompresGambarBukti,
} from "@/lib/kompresi-gambar";

describe("Modul Kompresi Foto Bukti Transfer (lib/kompresi-gambar.ts)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("formatUkuranBerkas", () => {
    it("memformat byte ke satuan B, KB, dan MB dengan tepat", () => {
      expect(formatUkuranBerkas(500)).toBe("500 B");
      expect(formatUkuranBerkas(153600)).toBe("150 KB"); // 150 KB
      expect(formatUkuranBerkas(2097152)).toBe("2.0 MB"); // 2 MB
      expect(formatUkuranBerkas(-10)).toBe("0 B");
    });
  });

  describe("buatStoragePathBukti", () => {
    it("menghasilkan struktur path objek Supabase Storage sesuai konvensi spesifikasi", () => {
      const path = buatStoragePathBukti("101", 2026, 9, "abc12345");
      expect(path).toBe("kamar-101/2026-09-abc12345.webp");
    });

    it("menghasilkan suffix acak jika uniqueSuffix tidak ditentukan", () => {
      const path = buatStoragePathBukti("102", 2026, 10);
      expect(path).toMatch(/^kamar-102\/2026-10-[a-zA-Z0-9_-]+\.webp$/);
    });
  });

  describe("hitungDimensiProporsional", () => {
    it("tidak memperkecil gambar yang dimensinya sudah <= 1280px", () => {
      const { targetWidth, targetHeight } = hitungDimensiProporsional(800, 600, 1280);
      expect(targetWidth).toBe(800);
      expect(targetHeight).toBe(600);
    });

    it("memperkecil gambar landscape > 1280px dengan menjaga rasio aspek", () => {
      const { targetWidth, targetHeight } = hitungDimensiProporsional(2560, 1440, 1280);
      expect(targetWidth).toBe(1280);
      expect(targetHeight).toBe(720);
    });

    it("memperkecil gambar portrait > 1280px dengan menjaga rasio aspek", () => {
      const { targetWidth, targetHeight } = hitungDimensiProporsional(1080, 2160, 1280);
      expect(targetHeight).toBe(1280);
      expect(targetWidth).toBe(640);
    });

    it("mengembalikan nilai default jika dimensi input tidak valid (<= 0)", () => {
      const { targetWidth, targetHeight } = hitungDimensiProporsional(0, 0, 1280);
      expect(targetWidth).toBe(1280);
      expect(targetHeight).toBe(1280);
    });
  });

  describe("kompresGambarBukti", () => {
    it("menolak berkas yang bukan gambar dengan pesan kesalahan bahasa Indonesia yang jelas", async () => {
      const nonImageFile = new File(["dummy text"], "document.pdf", {
        type: "application/pdf",
      });

      await expect(kompresGambarBukti(nonImageFile)).rejects.toThrow(
        /Berkas yang dipilih harus berupa gambar/i
      );
    });

    it("memproses berkas gambar dan menghasilkan output WebP", async () => {
      const imageFile = new File(["dummy image content"], "struk-transfer.jpg", {
        type: "image/jpeg",
      });

      // Mock FileReader
      const mockDataUrl = "data:image/jpeg;base64,mockImageData";
      const originalFileReader = window.FileReader;
      class MockFileReader {
        result: string = "";
        onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
        readAsDataURL() {
          this.result = mockDataUrl;
          setTimeout(() => {
            if (this.onload) {
              this.onload.call(this as unknown as FileReader, {} as ProgressEvent<FileReader>);
            }
          }, 0);
        }
      }
      window.FileReader = MockFileReader as unknown as typeof FileReader;

      // Mock Image
      const originalImage = window.Image;
      class MockImage {
        width = 1920;
        height = 1080;
        onload: (() => void) | null = null;
        set src(_val: string) {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      }
      window.Image = MockImage as unknown as typeof Image;

      // Mock Canvas
      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tagName: string) => {
        if (tagName.toLowerCase() === "canvas") {
          const mockCanvas = originalCreateElement("canvas");
          mockCanvas.toDataURL = vi.fn().mockReturnValue("data:image/webp;base64,mockWebpData");
          mockCanvas.toBlob = vi.fn((callback) => {
            callback(new Blob(["compressed-webp"], { type: "image/webp" }));
          });
          const mockCtx = {
            drawImage: vi.fn(),
          } as unknown as CanvasRenderingContext2D;
          mockCanvas.getContext = vi.fn().mockReturnValue(mockCtx);
          return mockCanvas;
        }
        return originalCreateElement(tagName);
      });

      const hasil = await kompresGambarBukti(imageFile, { maxDimension: 1280, quality: 0.8 });

      expect(hasil.format).toBe("image/webp");
      expect(hasil.file.name).toBe("struk-transfer.webp");
      expect(hasil.width).toBe(1280);
      expect(hasil.height).toBe(720);
      expect(hasil.dataUrl).toContain("data:image/webp;base64");

      window.FileReader = originalFileReader;
      window.Image = originalImage;
    });
  });
});
