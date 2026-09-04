<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Kost Syantika

Aplikasi PWA manajemen pembayaran sewa kamar kost bulanan (mobile-first) berbasis Next.js App Router, Tailwind CSS v4, dan Zustand client persist store.

## Architecture & Conventions

- **Client-Side Mock Store**: Seluruh state data (`Kamar`, `Penghuni`, `Tagihan`, `Bukti Pembayaran`, dan sesi login) dikelola di sisi klien menggunakan Zustand dengan persistensi LocalStorage (`lib/store/use-payment-store.ts` dan `lib/store/use-auth-store.ts`). Tidak ada backend database atau cloud storage riil pada Fase 1 (lihat `docs/adr/0001-client-side-mock-state-zustand.md`).
- **Bukti Pembayaran**: Berkas foto bukti transfer dikonversi menjadi data string Base64 melalui `FileReader` agar langsung dapat dipratinjau dan diverifikasi tanpa storage pihak ketiga.
- **Rute Terpadu**: Rute `/dashboard` bersifat polimorfik — me-render `PemilikDashboardView` untuk peran `PEMILIK`, atau `PenghuniDashboardView` untuk peran `PENGHUNI`. Akses tanpa sesi dialihkan ke `/login`. Root `/` otomatis mengarah ke `/dashboard` atau `/login`.
- **Kredensial Demo**: Pemilik: `pemilik` / `123456`. Penghuni: nomor kamar `101` s/d `108` / `123456`.
- **Desain & PWA**: Mobile-first responsive layout terinspirasi Mamikos/Duolingo dengan warna primer emerald (`#04A552`), Bottom Navigation bar terpadu, dan manifest PWA standalone (`app/manifest.ts`, `public/manifest.json`).

## Domain Language

Konsultasikan `CONTEXT.md` sebelum menamai tipe data, variabel, label UI, atau konsep domain:
- **Entitas & Aktor**: `Pemilik Kost`, `Penghuni`, `Kamar`, `Tagihan`, `Bukti Pembayaran`.
- **Status & Metode**: `Status Pembayaran` (`BELUM_BAYAR`, `MENUNGGU_VERIFIKASI`, `LUNAS`, `DITOLAK`), `Metode Pembayaran` (`TRANSFER`, `CASH`).
- **Aksi & Catatan**: `Alasan Penolakan` (wajib saat menolak bukti transfer), `Tandai Lunas (Cash)` (dengan catatan opsional).
- *Hindari*: Sinonim seperti `Admin`, `Tenant`, `Room`, `Invoice`, `Receipt`, `Bill`.

## Verification Commands

- **Unit & Integration Tests**: `pnpm test` (Vitest)
- **Linter**: `pnpm run lint` (ESLint 9)
- **Production Build**: `pnpm run build` (Next.js Turbopack)
- **Development Server**: `pnpm dev`

## Agent Workflow & Skills

- **Issue Tracker**: Tiket tersimpan di `.scratch/<feature>/issues/<NN>-<slug>.md` dan spesifikasi di `.scratch/<feature>/spec.md`. Panduan format di `docs/agents/issue-tracker.md`.
- **Triage Labels**: Gunakan 5 label standar (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). Lihat `docs/agents/triage-labels.md`.
- **Domain Docs**: Baca `CONTEXT.md` dan `docs/adr/` sebelum eksplorasi atau mengubah arsitektur. Lihat `docs/agents/domain.md`.
