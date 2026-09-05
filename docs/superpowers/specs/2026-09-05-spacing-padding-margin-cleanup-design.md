# Spesifikasi Desain: Modern Airy Clean Spacing, Padding, & Margin

- **Tanggal**: 2026-09-05
- **Topik**: Penataan Ulang Sistem Spacing, Padding, dan Margin Seluruh Aplikasi Kost Syantika
- **Pendekatan**: Modern Airy Clean (Modular 8pt Design Scale)
- **Status**: Disetujui Pengguna (Brainstorming Selesai)

---

## 1. Latar Belakang & Masalah

Pada implementasi Fase 1, antarmuka aplikasi telah memiliki seluruh fungsi pembayaran, verifikasi bukti, pelunasan uang tunai, dan pengaturan akun. Namun, penataan jarak visual (spacing) masih memiliki beberapa ketidakkonsistenan yang membuat tampilan terasa padat atau kurang lega (*cluttered*):

1. **Jeda Antar-Seksi Terlalu Mepet**: Menggunakan `space-y-4` (16px) di tingkat halaman dan di dalam komponen kartu, sehingga seksi-seksi besar tidak memiliki batas hierarki yang tenang.
2. **Padding Kartu & Item Dalam Tidak Seragam**: Komponen `Card` dasar memiliki default `p-5 sm:p-6`, namun beberapa kartu menimpa dengan `p-4`, `p-3.5`, atau `p-3`, menciptakan efek "kotak di dalam kotak" yang sesak pada kartu antrean verifikasi dan daftar kamar.
3. **Bottom Navigation Overlap**: Padding bawah halaman (`pb-20`) terlalu dekat dengan floating bottom bar (`h-16`), membuat elemen kartu terakhir menempel ke bilah navigasi bawah saat di-scroll.
4. **Touch Target & Kerapatan Tombol**: Beberapa tombol aksi memiliki tinggi 28px (`h-7`) dengan padding ketat, yang kurang ergonomis untuk penggunaan jempol pada perangkat seluler.

Tujuan dari perbaikan ini adalah menetapkan **ritme modular 8pt/4pt** yang konsisten, memberikan ruang bernapas yang cukup (*airy*), serta menonjolkan kerapian dan estetika berkelas (*clean modern fintech style*).

---

## 2. Sistem Token Spacing & Skala Modular

Aplikasi Kost Syantika mengadopsi skala spacing berbasis kelipatan 4px/8px:

| Token Tailwind | Ukuran Pixel | Penggunaan Standar |
| :--- | :--- | :--- |
| `gap-1` / `space-y-1` | 4px | Jarak antar teks mikro (judul ke deskripsi, badge ke label) |
| `gap-1.5` / `gap-2` | 6px / 8px | Jarak ikon ke teks tombol, chip pill kamar |
| `gap-2.5` / `gap-3` | 10px / 12px | Jarak antar tombol aksi berdampingan, thumbnail ke teks |
| `p-3.5` / `p-4` | 14px / 16px | Padding item dalam kartu (kartu antrean, item kamar, nominal box) |
| `p-5` | 20px | Padding standar kontainer kartu utama (`CardHeader`, `CardContent`, `CardFooter`) |
| `space-y-4` | 16px | Jarak antar-elemen di dalam formulir atau list antrean |
| `space-y-6` | 24px | Jarak antar-seksi besar pada halaman dashboard |
| `pb-28` | 112px | Padding bawah halaman untuk floating bottom navigation |

---

## 3. Rincian Pembaruan per Komponen & Halaman

### 3.1 Kontainer Halaman Utama (`app/dashboard/page.tsx` & `app/login/page.tsx`)
- **`app/dashboard/page.tsx`**:
  - Main container: `min-h-screen px-4 pt-4 pb-28 sm:px-6 max-w-md mx-auto flex flex-col space-y-6`.
  - Memberikan jarak lega dari tepi layar dan memastikan konten kartu paling bawah memiliki ruang bebas 48px di atas bottom bar saat di-scroll ke titik maksimal.
  - Footer copyright: `py-6 text-[11px] text-slate-400`.
- **`app/login/page.tsx`**:
  - Main container: `min-h-screen px-4 py-8 sm:py-12 safe-top safe-bottom flex flex-col items-center justify-center`.
  - Content wrapper: `w-full max-w-md flex flex-col space-y-6`.
  - Header brand: icon container `w-14 h-14 mb-3`, brand title `text-2xl font-black`, subtitle `mt-1 text-xs`.
  - Form Login Card: `CardHeader p-5 pb-4`, `CardContent p-5 pt-0 space-y-4`, input label `mb-1.5`, input field `h-10 text-sm`, submit button `h-11 text-sm font-semibold`.
  - Demo Credentials Card: `CardHeader p-5 pb-3`, `CardContent p-5 pt-0 space-y-4`, button Pemilik `p-3.5 min-h-[52px]`, grid kamar `grid grid-cols-4 gap-2`, tombol chip nomor kamar `h-10 text-xs font-semibold`.

### 3.2 Top Header Dashboard (`components/dashboard/dashboard-header.tsx`)
- Padding & pemisah: `pb-4 border-b border-slate-200/70 mb-2 flex items-center justify-between`.
- Brand block: ikon `w-10 h-10 rounded-xl`, jarak ke identitas akun `gap-3`.
- Tombol Keluar: diperlebar menjadi `h-9 px-3 text-xs gap-1.5` untuk touch target yang lebih mantap.

### 3.3 Dashboard Pemilik (`components/dashboard/pemilik-*.tsx`)
1. **`pemilik-dashboard-view.tsx`**:
   - Wrapper antar-seksi: `space-y-6`.
   - Banner sambutan: `CardHeader p-5 pb-3`, subjudul `mt-1`, info box unit kamar `p-3.5 rounded-xl mt-3`.
2. **`pemilik-summary-cards.tsx`**:
   - Wrapper: `space-y-4`.
   - Kartu Finansial Utama: `CardContent p-5`, header baris `pb-3 border-b border-emerald-500/30`, angka nominal `mt-4 text-2xl sm:text-3xl font-black`, progress row `mt-2 text-xs font-medium`.
   - Grid 3 Kartu Metrik: `grid grid-cols-3 gap-2.5 sm:gap-3`, masing-masing kartu `p-3.5 sm:p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-1`.
3. **`pemilik-verifikasi-antrean.tsx`**:
   - Card wrapper: `CardHeader p-5 pb-3.5`, `CardContent p-5 pt-0 space-y-3.5`.
   - Item antrean: `p-4 rounded-xl border border-slate-200/90 space-y-3`.
   - Baris thumbnail & catatan penghuni: `p-3 bg-slate-50/90 rounded-xl border border-slate-100 flex items-center gap-3`.
   - Tombol aksi (Tolak & Setujui): `pt-2.5 border-t border-slate-100 flex items-center gap-2.5`, tinggi tombol `h-9 text-xs`.
   - Empty state: `py-8 px-5 rounded-2xl text-center flex flex-col items-center gap-2`.
4. **`pemilik-daftar-kamar.tsx`**:
   - Card wrapper: `CardHeader p-5 pb-3.5`, `CardContent p-5 pt-0 space-y-3`.
   - Filter pills: `flex items-center gap-2 overflow-x-auto pb-2 pt-3 no-scrollbar`, chip button `px-3.5 py-1.5 rounded-xl text-xs`.
   - Item kamar: `p-3.5 sm:p-4 rounded-xl border border-slate-200/80 space-y-3`.
   - Baris aksi jatuh tempo & tombol cash/tarif: `pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]`, tombol aksi `h-8 px-2.5 text-xs`.

### 3.4 Dashboard Penghuni (`components/dashboard/penghuni-*.tsx`)
1. **`penghuni-dashboard-view.tsx`**:
   - Wrapper antar-seksi: `space-y-6`.
   - Kartu sambutan: `CardHeader p-5 pb-3`, `CardContent p-5 pt-0`.
2. **`penghuni-tagihan-card.tsx`**:
   - Card wrapper: `CardHeader p-5 pb-3.5`, `CardContent p-5 pt-0 space-y-4`.
   - Kotak nominal sewa: `p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between`.
   - Kotak status penolakan / verifikasi / lunas: `p-4 rounded-xl space-y-2.5`.
   - Kotak pratinjau bukti unggah: `p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-3.5`.
   - Tombol aksi utama (Unggah Bukti & Bayar Tunai): `h-10 text-xs font-semibold gap-2`.
   - Card Footer: `p-5 pt-0`.
3. **`penghuni-riwayat-pembayaran.tsx`**:
   - Card wrapper: `CardHeader p-5 pb-3.5`, `CardContent p-5 pt-0 space-y-3`.
   - Item riwayat: `p-3.5 sm:p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-3`.

### 3.5 Pengaturan & Profil (`components/dashboard/pengaturan-profil-view.tsx`)
- Wrapper: `space-y-6`.
- Card Profil & Info Rekening: `CardHeader p-5 pb-3`, `CardContent p-5 pt-0 space-y-3`.
- Item info rincian: `p-3.5 rounded-xl bg-white/90 border border-emerald-100/80 space-y-2`.
- Tombol Reset Mock Data & Logout: `h-10 text-xs font-bold gap-2`.

### 3.6 Bottom Navigation Bar (`components/dashboard/bottom-nav.tsx`)
- Container: `h-16 px-4 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]`.
- Tab Buttons: `py-1`, kapsul pill indikator `w-12 h-7.5 rounded-full flex items-center justify-center`, label teks `text-[10px] mt-1 font-medium`.

### 3.7 Dialog Modals
- `DialogContent`: `p-5 sm:p-6 max-w-md`, header `pb-3 space-y-1`, footer `pt-4 gap-2.5`, input forms `space-y-3.5`.

---

## 4. Jaminan Kualitas & Rencana Verifikasi

1. **Unit & Integration Tests**:
   - Seluruh tes yang sudah ada (75 unit & integration tests) harus tetap lulus 100% (`pnpm test`).
   - Tidak ada perubahan pada atribut data, test IDs, atau teks semantik yang menjadi assertions tes.
2. **Linter & Type Checking**:
   - Menjalankan `pnpm run lint` untuk memastikan tidak ada lint errors/warnings.
   - Menjalankan `pnpm run build` untuk memverifikasi kompatibilitas TypeScript dan Next.js production bundle.
3. **Tampilan Responsif Mobile**:
   - Verifikasi bahwa tidak ada horizontal overflow pada viewport sempit (360px s/d 430px).
   - Memastikan seluruh touch target berukuran minimal 36px–44px untuk kenyamanan jempol.
