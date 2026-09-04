# 01: Fondasi Desain PWA Setup

**What to build:** Fondasi visual aplikasi berbasis Next.js App Router dengan tema desain hijau segar ala Mamikos/Duolingo, konfigurasi komponen primitif antarmuka yang ramah sentuhan, serta konfigurasi Web App Manifest dan ikon PWA agar aplikasi dapat diakses secara mobile-first dan siap ditambahkan ke Home Screen smartphone (*Add to Home Screen*).

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Tema warna primer hijau segar (emerald modern), tipografi bersih, dan utilitas styling mobile-first terpasang dengan baik
- [x] Komponen UI primitif reusable (Button, Card, Badge, Input, Dialog, Sonner Toast) terpasang dan siap digunakan di seluruh aplikasi
- [x] File Web App Manifest (`manifest.json`) terkonfigurasi dengan nama aplikasi "Kost Syantika", mode `display: standalone`, tema warna, dan ikon aplikasi (192x192 dan 512x512)
- [x] Meta tags viewport dan mobile web app capability aktif di root layout
- [x] Halaman dasar dapat diakses tanpa error kompilasi atau styling

## Answer

Fondasi desain visual mobile-first dan arsitektur PWA berhasil diimplementasikan:
1. **Tema Emerald Modern**: Palet warna primer hijau segar (`#04A552`), variabel CSS, dan utilitas interaksi sentuh mobile di `app/globals.css`.
2. **Komponen Primitif Reusable**: Komponen `Button`, `Card`, `Badge` (dengan 4 status pembayaran: Lunas, Menunggu Verifikasi, Ditolak, Belum Bayar), `Input`, `Dialog` (Radix UI), dan `Toaster` (Sonner) di folder `components/ui/`.
3. **PWA Manifest & Ikon**: `public/manifest.json` dan `app/manifest.ts` dengan mode `standalone`, warna tema `#04A552`, serta aset ikon 192x192, 512x512, apple-touch-icon, dan favicon SVG/PNG.
4. **Root Layout**: Metadata PWA dan viewport mobile di `app/layout.tsx`.
5. **Pengujian**: 8 unit test di Vitest untuk validasi manifest dan komponen UI primitif (100% lolos). Build produksi Next.js Turbopack sukses.

