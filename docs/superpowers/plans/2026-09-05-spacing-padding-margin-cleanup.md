# Modern Airy Clean Spacing, Padding, & Margin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menata ulang seluruh spacing, padding, margin, dan touch targets pada aplikasi Kost Syantika agar terasa lapang, bersih (*airy clean*), konsisten secara modular 8pt/4pt, serta nyaman diakses pada perangkat seluler tanpa merusak fungsionalitas dan assertions tes yang sudah ada.

**Architecture:** Mengadopsi prinsip desain modular spacing 8pt/4pt pada seluruh wrapper kontainer halaman, kartu, daftar antrean, dialog modal, dan navigasi bawah. Memberikan offset bawah yang aman untuk floating bottom navigation bar (`pb-28`) dan touch targets minimal 36px–44px untuk kenyamanan jempol.

**Tech Stack:** Next.js App Router (React 19), Tailwind CSS v4, Lucide React, Vitest & Testing Library.

## Global Constraints

- Standar skala spacing: kelipatan 4px/8px (`space-y-6` antar-seksi besar, `space-y-3.5` s/d `space-y-4` antar-item, `p-5` untuk padding kartu kontainer utama, `p-3.5` s/d `p-4` untuk sub-kartu/item).
- Pertahankan seluruh atribut data semantik, teks judul/deskripsi, dan test id agar seluruh 75 tests tetap lulus 100%.
- Touch target tombol interaktif mobile minimal 36px s/d 44px (`h-9` s/d `h-11`).
- Bottom navigation clearance: halaman dashboard harus memiliki `pb-28` untuk memastikan tidak ada konten yang tertutup floating nav.
- Linter dan TypeScript build harus bersih tanpa error (`pnpm run lint` dan `pnpm run build`).

---

### Task 1: Screen Containers & Header Spacing (`app/login/page.tsx`, `app/dashboard/page.tsx`, `components/dashboard/dashboard-header.tsx`)

**Files:**
- Modify: `app/login/page.tsx:80-268`
- Modify: `app/dashboard/page.tsx:20-56`
- Modify: `components/dashboard/dashboard-header.tsx:30-70`
- Test: `tests/login-page.test.tsx`, `tests/dashboard-page.test.tsx`

**Interfaces:**
- Consumes: Zustand `useAuthStore`, `UserSession`, UI components (`Card`, `Button`, `Input`).
- Produces: Layout wrapper yang lega dengan spacing `space-y-6`, header dengan pembatas `pb-4 border-b border-slate-200/70 mb-2`, dan tombol logout `h-9 px-3`.

- [x] **Step 1: Periksa status pengujian awal pada login dan dashboard**
  Run: `pnpm test tests/login-page.test.tsx tests/dashboard-page.test.tsx`
  Expected: PASS

- [x] **Step 2: Perbarui spacing & padding pada `app/login/page.tsx`**
  - Ubah kontainer utama: `<main className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4.5 py-8 sm:py-12 safe-top safe-bottom">`
  - Ubah pembungkus konten: `<div className="w-full max-w-md flex flex-col space-y-6">`
  - Header brand: beri jarak `space-y-3 mb-1`
  - Card Form Login: `CardHeader className="p-5 pb-4"`, `CardContent className="p-5 pt-0 space-y-4"`, input `h-10 text-sm`, tombol submit `h-11 text-sm font-semibold`
  - Card Demo Kredensial: `CardHeader className="p-5 pb-3"`, `CardContent className="p-5 pt-0 space-y-4"`, tombol Pemilik `p-3.5 min-h-[52px]`, grid kamar `gap-2`, chip tombol `h-10 text-xs font-semibold`
  - Footer: `py-4 text-xs text-slate-400`

- [x] **Step 3: Perbarui spacing & padding pada `app/dashboard/page.tsx`**
  - Ubah kontainer utama: `<main className="min-h-screen bg-slate-50 flex flex-col items-center justify-start px-4 pt-4 pb-28 sm:px-6 safe-top safe-bottom">`
  - Ubah wrapper konten: `<div className="w-full max-w-md flex flex-col space-y-6">`
  - Footer: `<footer className="text-center py-6 text-[11px] text-slate-400">`

- [x] **Step 4: Perbarui spacing & touch target pada `components/dashboard/dashboard-header.tsx`**
  - Header wrapper: `<header className="flex items-center justify-between pb-4 mb-2 border-b border-slate-200/70">`
  - Brand group: beri jarak `gap-3` antara ikon dan teks identitas
  - Tombol Keluar: `<Button ... className="h-9 px-3 text-xs font-medium gap-1.5 ...">`

- [x] **Step 5: Jalankan pengujian verifikasi Task 1**
  Run: `pnpm test tests/login-page.test.tsx tests/dashboard-page.test.tsx`
  Expected: PASS

- [x] **Step 6: Commit perubahan Task 1**
  ```bash
  git add app/login/page.tsx app/dashboard/page.tsx components/dashboard/dashboard-header.tsx
  git commit -m "style: polish layout container, login, and dashboard header spacing"
  ```

---

### Task 2: Dashboard Pemilik Spacing Polish (`pemilik-dashboard-view.tsx`, `pemilik-summary-cards.tsx`, `pemilik-verifikasi-antrean.tsx`, `pemilik-daftar-kamar.tsx`)

**Files:**
- Modify: `components/dashboard/pemilik-dashboard-view.tsx:35-95`
- Modify: `components/dashboard/pemilik-summary-cards.tsx:43-112`
- Modify: `components/dashboard/pemilik-verifikasi-antrean.tsx:64-225`
- Modify: `components/dashboard/pemilik-daftar-kamar.tsx:175-353`
- Test: `tests/pemilik-ringkasan.test.tsx`, `tests/pemilik-verifikasi.test.tsx`, `tests/kelola-tagihan.test.tsx`

**Interfaces:**
- Consumes: Zustand `usePaymentStore`, modal dialogs.
- Produces: Komponen pemilik yang lapang dengan spacing `space-y-6` antar-seksi, kartu metrik `p-3.5 sm:p-4 rounded-2xl`, item antrean `p-4 rounded-xl space-y-3`, dan item kamar `p-3.5 sm:p-4 space-y-3`.

- [x] **Step 1: Periksa pengujian pemilik sebelum perubahan**
  Run: `pnpm test tests/pemilik-ringkasan.test.tsx tests/pemilik-verifikasi.test.tsx tests/kelola-tagihan.test.tsx`
  Expected: PASS

- [x] **Step 2: Perbarui spacing pada `pemilik-dashboard-view.tsx`**
  - Container wrapper: `space-y-6`
  - Welcome Banner Card: `CardHeader className="p-5 pb-3"`, judul `text-lg font-black mt-1`, info box unit kamar `p-3.5 rounded-xl mt-3`

- [x] **Step 3: Perbarui spacing pada `pemilik-summary-cards.tsx`**
  - Container wrapper: `space-y-4`
  - Kartu Finansial Utama: `CardContent className="p-5 relative"`, header row `pb-3 border-b border-emerald-500/30`, nominal `mt-4 text-2xl sm:text-3xl font-black`, progress row `mt-2 text-xs font-medium`
  - Grid 3 Kartu Metrik: `grid grid-cols-3 gap-2.5 sm:gap-3`, masing-masing kartu `p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1`

- [x] **Step 4: Perbarui spacing pada `pemilik-verifikasi-antrean.tsx`**
  - Card: `CardHeader className="p-5 pb-3.5"`, `CardContent className="p-5 pt-0 space-y-3.5"`
  - Queue item: `p-4 rounded-xl border border-slate-200/90 space-y-3`
  - Baris thumbnail & catatan penghuni: `p-3 bg-slate-50/90 rounded-xl border border-slate-100 flex items-center gap-3`
  - Tombol aksi (Tolak & Setujui): `pt-2.5 border-t border-slate-100 flex items-center gap-2.5`, tinggi tombol `h-9 text-xs font-bold`
  - Empty state: `py-8 px-5 rounded-2xl text-center flex flex-col items-center gap-2`

- [x] **Step 5: Perbarui spacing pada `pemilik-daftar-kamar.tsx`**
  - Card: `CardHeader className="p-5 pb-3.5"`, `CardContent className="p-5 pt-0 space-y-3"`
  - Filter pills: `flex items-center gap-2 overflow-x-auto pb-2 pt-3 no-scrollbar`, chip button `px-3.5 py-1.5 rounded-xl text-xs font-semibold`
  - Item kamar: `p-3.5 sm:p-4 rounded-xl border border-slate-200/80 space-y-3`
  - Baris aksi jatuh tempo & tombol cash/tarif: `pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]`, tombol aksi `h-8 px-2.5 text-xs font-semibold`

- [x] **Step 6: Jalankan pengujian verifikasi Task 2**
  Run: `pnpm test tests/pemilik-ringkasan.test.tsx tests/pemilik-verifikasi.test.tsx tests/kelola-tagihan.test.tsx`
  Expected: PASS

- [x] **Step 7: Commit perubahan Task 2**
  ```bash
  git add components/dashboard/pemilik-dashboard-view.tsx components/dashboard/pemilik-summary-cards.tsx components/dashboard/pemilik-verifikasi-antrean.tsx components/dashboard/pemilik-daftar-kamar.tsx
  git commit -m "style: clean up spacing and padding across pemilik dashboard components"
  ```

---

### Task 3: Dashboard Penghuni & Profil Spacing Polish (`penghuni-dashboard-view.tsx`, `penghuni-tagihan-card.tsx`, `penghuni-riwayat-pembayaran.tsx`, `pengaturan-profil-view.tsx`)

**Files:**
- Modify: `components/dashboard/penghuni-dashboard-view.tsx:35-86`
- Modify: `components/dashboard/penghuni-tagihan-card.tsx:130-398`
- Modify: `components/dashboard/penghuni-riwayat-pembayaran.tsx:44-180`
- Modify: `components/dashboard/pengaturan-profil-view.tsx:69-265`
- Test: `tests/penghuni-tagihan.test.tsx`, `tests/penghuni-riwayat.test.tsx`, `tests/bottom-nav-reset.test.tsx`

**Interfaces:**
- Consumes: Zustand `usePaymentStore`, `useAuthStore`, `UserSession`.
- Produces: Komponen penghuni dan profil dengan spacing lapang `space-y-6`, form tagihan `space-y-4`, kotak status `p-4 rounded-xl space-y-2.5`, dan tombol aksi `h-10 text-xs font-semibold`.

- [x] **Step 1: Periksa pengujian penghuni sebelum perubahan**
  Run: `pnpm test tests/penghuni-tagihan.test.tsx tests/penghuni-riwayat.test.tsx tests/bottom-nav-reset.test.tsx`
  Expected: PASS

- [x] **Step 2: Perbarui spacing pada `penghuni-dashboard-view.tsx`**
  - Wrapper antar-seksi: `space-y-6`
  - Kartu sambutan: `CardHeader className="p-5 pb-3"`, `CardContent className="p-5 pt-0"`

- [x] **Step 3: Perbarui spacing pada `penghuni-tagihan-card.tsx`**
  - Card: `CardHeader className="p-5 pb-3.5"`, `CardContent className="p-5 pt-0 space-y-4"`
  - Nominal box: `p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between`
  - Status alert (Ditolak / Menunggu / Lunas): `p-4 rounded-xl space-y-2.5`
  - Upload preview box: `p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3.5`
  - Tombol aksi utama (Unggah Bukti & Bayar Tunai): `h-10 text-xs font-semibold gap-2`
  - Card Footer: `p-5 pt-0`

- [x] **Step 4: Perbarui spacing pada `penghuni-riwayat-pembayaran.tsx`**
  - Card: `CardHeader className="p-5 pb-3.5"`, `CardContent className="p-5 pt-0 space-y-3"`
  - Item riwayat: `p-3.5 sm:p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-3`

- [x] **Step 5: Perbarui spacing pada `pengaturan-profil-view.tsx`**
  - Wrapper: `space-y-6`
  - Cards: `CardHeader className="p-5 pb-3"`, `CardContent className="p-5 pt-0 space-y-3"`
  - Info boxes: `p-3.5 rounded-xl space-y-2`
  - Tombol Reset & Logout: `h-10 text-xs font-bold gap-2`

- [x] **Step 6: Jalankan pengujian verifikasi Task 3**
  Run: `pnpm test tests/penghuni-tagihan.test.tsx tests/penghuni-riwayat.test.tsx tests/bottom-nav-reset.test.tsx`
  Expected: PASS

- [x] **Step 7: Commit perubahan Task 3**
  ```bash
  git add components/dashboard/penghuni-dashboard-view.tsx components/dashboard/penghuni-tagihan-card.tsx components/dashboard/penghuni-riwayat-pembayaran.tsx components/dashboard/pengaturan-profil-view.tsx
  git commit -m "style: clean up spacing across penghuni and settings components"
  ```

---

### Task 4: Bottom Navigation & Modal Dialogs Spacing Polish (`bottom-nav.tsx`, Dialog Modals)

**Files:**
- Modify: `components/dashboard/bottom-nav.tsx:77-121`
- Modify: `components/dashboard/bukti-lightbox-dialog.tsx:1-85`
- Modify: `components/dashboard/tandai-cash-dialog.tsx:1-95`
- Modify: `components/dashboard/tolak-bukti-dialog.tsx:1-95`
- Modify: `components/dashboard/kelola-tagihan-dialog.tsx:1-180`
- Modify: `components/dashboard/bayar-tunai-dialog.tsx:1-105`
- Test: `tests/bukti-lightbox-dialog.test.tsx`, `tests/tandai-cash-dialog.test.tsx`, `tests/tolak-bukti-dialog.test.tsx`, `tests/bottom-nav-reset.test.tsx`

**Interfaces:**
- Consumes: Dialog UI primitives (`DialogContent`, `DialogHeader`, `DialogFooter`), Zustand store actions.
- Produces: Bilah navigasi bawah yang rapi dengan padding yang presisi dan modal dialog berpadding `p-5 sm:p-6` yang terstruktur.

- [x] **Step 1: Periksa pengujian dialog sebelum perubahan**
  Run: `pnpm test tests/bukti-lightbox-dialog.test.tsx tests/tandai-cash-dialog.test.tsx tests/tolak-bukti-dialog.test.tsx`
  Expected: PASS

- [x] **Step 2: Perbarui spacing pada `bottom-nav.tsx`**
  - Nav bar: `h-16 px-4 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] safe-bottom`
  - Tab button item: `py-1`, pill container `w-12 h-7.5 rounded-full flex items-center justify-center`, label `text-[10px] mt-1 font-medium`

- [x] **Step 3: Perbarui spacing pada seluruh dialog modal**
  - Pada `bukti-lightbox-dialog.tsx`: `DialogContent className="max-w-md p-5 sm:p-6"`, header `pb-3 space-y-1`, tombol aksi `pt-4 gap-2.5`
  - Pada `tandai-cash-dialog.tsx`: `DialogContent className="max-w-md p-5 sm:p-6"`, header `pb-3 space-y-1`, form input `space-y-3.5`, footer `pt-4 gap-2.5`
  - Pada `tolak-bukti-dialog.tsx`: `DialogContent className="max-w-md p-5 sm:p-6"`, header `pb-3 space-y-1`, form textarea `space-y-3.5`, footer `pt-4 gap-2.5`
  - Pada `kelola-tagihan-dialog.tsx`: `DialogContent className="max-w-md p-5 sm:p-6"`, header `pb-3 space-y-1`, form input `space-y-3.5`, footer `pt-4 gap-2.5`
  - Pada `bayar-tunai-dialog.tsx`: `DialogContent className="max-w-md p-5 sm:p-6"`, header `pb-3 space-y-1`, rincian rekening `p-3.5 rounded-xl space-y-2`, footer `pt-4`

- [x] **Step 4: Jalankan pengujian verifikasi Task 4 & Suite Lengkap**
  Run: `pnpm test`
  Expected: All 75 tests PASS

- [x] **Step 5: Verifikasi Linting dan Build Produksi**
  Run: `pnpm run lint`
  Expected: No lint warnings or errors
  Run: `pnpm run build`
  Expected: Build succeeds with 0 type errors

- [x] **Step 6: Commit perubahan Task 4**
  ```bash
  git add components/dashboard/bottom-nav.tsx components/dashboard/*-dialog.tsx
  git commit -m "style: polish spacing and padding on bottom nav and dialog modals"
  ```
