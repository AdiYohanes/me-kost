# Spesifikasi Desain: Modern FinTech & Friendly Kost UI Polish

- **Tanggal**: 2026-09-04
- **Topik**: Polish Menyeluruh Antarmuka Mobile-First Kost Syantika
- **Pendekatan**: Modern FinTech & Friendly Kost (Kombinasi FinTech clarity ala Flip/GoPay & Keramahan visual Mamikos/Duolingo)
- **Status**: Disetujui Pengguna (Brainstorming Selesai)

---

## 1. Latar Belakang & Tujuan

Aplikasi PWA Kost Syantika telah memiliki seluruh fungsionalitas inti Fase 1: autentikasi mock, pelacakan tagihan sewa 8 unit kamar, verifikasi & penolakan bukti transfer, pencatatan lunas uang tunai (cash), pengelolaan tarif, serta pembuatan periode tagihan baru.

Tujuan dari pemolesan (_UI polish_) ini adalah mentransformasi tampilan fungsional yang sudah ada menjadi antarmuka kelas dunia (_delightful & modern mobile-first web app_) yang memukau pengguna pada pandangan pertama, memiliki hierarki informasi finansial yang kokoh, interaksi sentuhan yang nyaman, serta nuansa kekeluargaan yang hangat.

---

## 2. Prinsip & Token Desain Visual

### 2.1 Palet Warna & Kontras

- **Emerald FinTech Primer**:
  - Warna inti: `#04A552` (Emerald 600)
  - Hover & Active: `#038E46` (Emerald 700)
  - Tinted Background: `#ECFDF5` (Emerald 50) dan `#D1FAE5` (Emerald 100)
  - Kontras Teks di Atas Latar Primer: Putih `#FFFFFF` (Rasio Kontras > 4.5:1)
- **Netral Seimbang**:
  - Latar Layar: `#F8FAFC` (Slate 50)
  - Latar Kartu: `#FFFFFF` (Putih Bersih)
  - Border Halus: `#E2E8F0` (Slate 200) dengan transparansi aksen `/80`
  - Teks Utama: `#0F172A` (Slate 900)
  - Teks Sekunder: `#475569` (Slate 600) dan `#64748B` (Slate 500)
- **Status Pembayaran (Semantic Tokens)**:
  - `LUNAS`: Emerald (`bg-emerald-50 text-emerald-800 border-emerald-200`)
  - `MENUNGGU_VERIFIKASI`: Amber Hangat (`bg-amber-50 text-amber-900 border-amber-200`)
  - `DITOLAK`: Rose (`bg-rose-50 text-rose-800 border-rose-200`)
  - `BELUM_BAYAR`: Slate Netral (`bg-slate-100 text-slate-800 border-slate-200`)

### 2.2 Tipografi & Angka Finansial

- **Font Family**: Plus Jakarta Sans (Variable Font)
- **Skala Bobot**:
  - `font-black` (900): Angka nominal rupiah utama, judul brand hero.
  - `font-bold` (700): Subjudul kartu, nama kamar, judul dialog.
  - `font-semibold` (600): Label aksi, tombol, status badge.
  - `font-medium` (500): Teks deskripsi, keterangan tanggal.
- **Rupiah Formatting**: Ditampilkan dengan `Intl.NumberFormat('id-ID')` dan `tracking-tight` agar tampak solid dan mudah dicerna.

### 2.3 Elevasi, Radius & Micro-Interactions

- Sudut membulat: `rounded-2xl` (16px) untuk kartu kontainer, `rounded-xl` (12px) untuk sub-item & input, `rounded-full` untuk badge status dan tab pills.
- Sentuhan tactile: Efek `active:scale-[0.98]` pada tombol aksi dan kartu yang dapat ditekan.
- Bayangan halus (_soft depth_):
  - `.card-shadow`: `0 4px 20px -2px rgba(4, 165, 82, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)`
  - `.card-elevated`: `0 10px 25px -3px rgba(4, 165, 82, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`

---

## 3. Rincian Pembaruan Komponen

### 3.1 Halaman Login (`app/login/page.tsx`)

1. **Hero Branding**:
   - Logo Kost Syantika dengan efek _ring halo_ lembut (`ring-4 ring-emerald-500/10`).
   - Tagline bernuansa ramah: _"Hunian Nyaman, Pembayaran Transparan"_.
2. **Form Masuk**:
   - Input field berbingkai modern dengan label berikon, _placeholder_ yang informatif, dan tombol login yang kokoh.
3. **Kartu Kredensial Demo 1-Klik**:
   - Tampilan akun Pemilik (Adi Yohanes) dengan badge otoritas pengelola dan tombol akses langsung.
   - Grid nomor kamar (101 - 108) dengan desain chip pill interaktif berlatar lembut dan transisi hover yang nyaman.

### 3.2 Top Header Dashboard (`components/dashboard/dashboard-header.tsx`)

1. **Sapaan Dinamis Kontekstual Waktu**:
   - Menghitung waktu lokal (Pagi 05:00-11:00, Siang 11:00-15:00, Sore 15:00-18:00, Malam 18:00-05:00).
   - Teks sapaan ramah di samping identitas kamar/pengelola.
2. **Badge Peran & Indikator Sesi**:
   - Indikator titik hijau berdenyut halus (_online session pulse_).
   - Tombol logout yang rapi dan elegan dengan ikon pintu keluar.

### 3.3 Dashboard Pemilik FinTech (`components/dashboard/pemilik-*.tsx`)

1. **Kartu Ringkasan Finansial (`pemilik-summary-cards.tsx`)**:
   - Kartu utama gradien emerald-teal dengan latar pola halus.
   - Nominal total penerimaan terkumpul ditampilkan dalam font ekstra tebal.
   - **Bilah Kemajuan Visual (Progress Bar)**: Menampilkan persentase realisasi penerimaan terhadap total potensi sewa (misal: _Rp 7.500.000 dari potensi Rp 12.000.000 • 62% Terkumpul_).
   - Grid 3 kartu metrik (_Lunas, Belum Lunas, Perlu Verifikasi_) dengan ikon berlatar warna senada (_tinted badges_).
2. **Antrean Verifikasi Bukti (`pemilik-verifikasi-antrean.tsx`)**:
   - Desain kartu antrean dengan identitas nomor kamar beraksen emas/amber.
   - Waktu unggah bukti tertera jelas.
   - Thumbnail bukti pembayaran interaktif dengan tombol pratinjau penuh (_lightbox_).
   - Dua tombol aksi terpadu: **Tolak Bukti** (merah lembut) dan **Setujui** (emerald solid).
3. **Daftar Unit Kamar & Filter Status (`pemilik-daftar-kamar.tsx`)**:
   - Baris tab filter berdesain pill dinamis dengan jumlah unit kamar per status.
   - Kartu item tiap unit kamar menampilkan nama penghuni, tarif bulanan, jatuh tempo, tombol ubah tarif, dan aksi kontekstual pembayaran tunai (_Tandai Lunas Cash_).

### 3.4 Dashboard Penghuni Digital Receipt (`components/dashboard/penghuni-*.tsx`)

1. **Stepper 3 Tahapan Pembayaran (`penghuni-tagihan-card.tsx`)**:
   - Visual progress bar 3 langkah:
     1. `Tagihan Terbit` (Centang hijau jika ada tagihan aktif)
     2. `Unggah Bukti` (Aktif/selesai jika bukti terkirim)
     3. `Diverifikasi` (Aktif jika menunggu, hijau penuh jika Lunas)
2. **Desain Struk Digital (Digital Receipt)**:
   - Tampilan rincian sewa yang rapi layaknya struk digital modern.
   - Dropzone unggah foto bukti transfer dengan garis putus-putus (_dashed emerald_) dan instruksi yang jelas.
   - Pratinjau foto instan dengan kemampuan mengganti foto dan input catatan opsional.
   - Tampilan status lunas yang meriah (_celebratory banner_) dengan cap lunas resmi.
3. **Riwayat Pembayaran (`penghuni-riwayat-pembayaran.tsx`)**:
   - Rincian bulan-bulan sebelumnya yang bersih dengan tombol pratinjau bukti bayar.

### 3.5 Navigasi Bawah (`components/dashboard/bottom-nav.tsx`)

1. **Bilah Navigasi Melayang Ergonomis**:
   - Efek _glassmorphism_ lembut (`bg-white/92 backdrop-blur-md border-t border-slate-200/90`).
   - Indikator tab aktif berbentuk kapsul/pill (`bg-emerald-100/90 text-emerald-800`).
   - Lencana jumlah antrean menunggu verifikasi pada tab Ringkasan milik Pemilik (_pulsing amber badge_).
   - Safe-area bottom padding untuk smartphone tanpa tombol fisik.

### 3.6 Dialog Modals (`components/dashboard/*-dialog.tsx`)

1. **Header Tematik Konsisten**:
   - Ikon lingkaran berlatar warna tematik pada tiap modal:
     - Rose untuk Tolak Bukti
     - Emerald untuk Tandai Cash / Sukses
     - Amber untuk Reset Data Demo
     - Teal/Blue untuk Ubah Tarif & Periode Baru
2. **Lightbox Bukti Pembayaran**:
   - Pratinjau foto bukti beresolusi penuh dengan latar belakang redup yang elegan dan tombol aksi langsung di dalam modal.

---

## 4. Rencana Pengujian & Jaminan Kualitas

1. **Unit & Integration Tests**:
   - Seluruh 75 unit & integration tests yang telah ada harus tetap lulus 100% (`pnpm test`).
   - Selector data/teks penting tidak diubah agar kompatibilitas tes tetap terjaga.
2. **Linter & Type Checking**:
   - Tidak ada error ESLint (`pnpm run lint`).
   - Tidak ada error TypeScript (`pnpm run build`).
3. **Responsive Mobile Testing**:
   - Pengujian tampilan pada viewport mobile (360px - 430px lebar layar) untuk memastikan tidak ada horizontal overflow atau layout clipping.

---

## 5. Keputusan Non-Fungsional (YAGNI & Out-of-Scope)

- Tidak menambahkan pustaka eksternal pihak ketiga (seperti framer-motion atau library charting berat) untuk menjaga bundle size tetap seringan mungkin (<100KB gzipped).
- Tetap menggunakan Tailwind CSS v4 bawaan dan CSS transitions murni.
- Tidak mengubah kontrak store Zustand atau format data mock yang sudah bekerja sempurna.
