# 🏠 Me Kost

> **Aplikasi PWA Mobile-First untuk Pencatatan Sederhana Pembayaran Tagihan Sewa Kost Bulanan.**

Me Kost hadir untuk menyelesaikan permasalahan klasik pengelolaan kost: bukti transfer yang tercecer di chat WhatsApp, pemilik lupa siapa saja yang belum bayar, dan penghuni yang bingung kapan tanggal jatuh tempo sewanya. 

Aplikasi ini dirancang seringan aplikasi chat dengan tampilan modern clean fintech, ramah jempol (*thumb-friendly*), serta dapat di-install langsung ke layar utama (*Homescreen*) smartphone layaknya aplikasi native (Progressive Web App).

---

## 🌟 Fitur Utama

### 1. 🏢 Untuk Pemilik Kost (Pengelola)
- **Ringkasan Finansial Real-time**: Pantau total pendapatan bulan ini, kamar yang sudah lunas, menunggak, dan tingkat keterisian unit kamar.
- **Antrean Verifikasi Bukti Transfer**:
  - Tinjau bukti transfer masuk dalam satu daftar antrean yang rapi.
  - **Lightbox Zoom**: Periksa keaslian foto struk/tangkapan layar secara detail dan layar penuh (*zoomable*).
  - **Aksi Cepat Setujui / Tolak**: Setujui pelunasan atau tolak dengan mencantumkan alasan penolakan yang jelas bagi penghuni.
- **Tandai Lunas Tunai (Cash)**: Catat pembayaran tunai secara instan hanya dengan 1 klik disertai catatan opsional.
- **Manajemen Kamar & Penghuni**:
  - Pantau status fisik unit kamar (`TERISI` atau `KOSONG`).
  - Tambah penghuni baru di kamar kosong (atur nama, kontak WhatsApp, email, dan tanggal jatuh tempo).
  - Kelola tarif sewa kamar per unit.
  - Alur **Keluarkan Penghuni (*Check-out*)** dengan opsi membatalkan tagihan aktif atau menyimpannya sebagai arsip piutang/tunggakan.
- **Pengingat WhatsApp 1-Klik**: Kirim pengingat tagihan ramah langsung ke nomor WhatsApp penghuni dengan pesan yang sudah terformat otomatis.

### 2. 🛏️ Untuk Penghuni Kost
- **Kartu Tagihan Aktif**: Cek informasi periode sewa, nominal tagihan, dan tanggal jatuh tempo dengan jelas.
- **Upload Bukti Transfer Cepat**:
  - Foto bukti pembayaran dikompresi otomatis di sisi browser (< 300KB) sebelum diunggah untuk menghemat kuota internet dan mempercepat proses.
  - Status pembayaran langsung berganti ke `MENUNGGU_VERIFIKASI`.
- **Notifikasi Penolakan Terbuka**: Jika bukti ditolak pemilik, penghuni dapat membaca alasan penolakan dan langsung mengunggah ulang bukti pembayaran yang benar.
- **Panduan Pembayaran Tunai**: Petunjuk bayar cash langsung ke pemilik kost jika tidak ingin transfer.
- **Riwayat Pembayaran**: Akses arsip tagihan bulan-bulan sebelumnya lengkap dengan status lunas dan bukti transfer.

### 3. ⚙️ Otomatisasi & Sistem Pintar
- **Siklus Mandiri Tiap Kamar**: Siklus penagihan mengikuti tanggal masuk masing-masing penghuni, bukan tanggal seragam.
- **Terbit Otomatis H-7**: Tagihan periode baru terbit otomatis 7 hari sebelum tanggal jatuh tempo kamar bersangkutan.
- **Deteksi Menunggak Otomatis**: Tagihan yang melewati tanggal jatuh tempo otomatis diberi status `MENUNGGAK (Telat X Hari)`.
- **Peringatan H-3**: Tanda peringatan khusus untuk tagihan yang akan jatuh tempo dalam 3 hari ke depan.
- **Optimistic UI & Supabase Realtime**: Interaksi tombol terasa instan, dan perubahan status pembayaran tersinkronisasi langsung antar perangkat tanpa perlu refresh.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Styling & UI**: [Tailwind CSS v4](https://tailwindcss.com/), Radix UI Primitives, Lucide Icons, Sonner Toast
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) (Persistent Local Store & Sync Layer)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Supabase Auth / Google OAuth, Row Level Security, Storage, Realtime)
- **PWA**: Web App Manifest standalone, Service Worker support, Mobile-First layout
- **Testing**: [Vitest](https://vitest.dev/) (33 test suites, 202 unit & integration tests)

---

## 🚀 Memulai (Local Development)

### 1. Prasyarat
- Node.js versi 18+ atau 20+
- Package Manager `pnpm` (disarankan)

### 2. Kloning Repositori & Instalasi Dependensi
```bash
git clone https://github.com/AdiYohanes/me-kost.git
cd me-kost
pnpm install
```

### 3. Konfigurasi Lingkungan (Environment Variables)
Salin berkas `.env.example` ke `.env.local`:
```bash
cp .env.example .env.local
```

Isi variabel lingkungan sesuai proyek Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```
*(Catatan: Aplikasi juga dapat berjalan dalam mode Client Mock Store offline untuk demonstrasi).*

### 4. Jalankan Server Pengembangan
```bash
pnpm dev
```
Buka browser dan akses [http://localhost:3000](http://localhost:3000).

---

## 🔑 Kredensial Demo (Mode Client Mock)

Untuk kemudahan demonstrasi tanpa konfigurasi backend awal:
- **Pemilik Kost**: Username `pemilik`, Password `123456`
- **Penghuni Kost**: Nomor kamar `101` s/d `108`, Password `123456`

---

## 🧪 Verifikasi & Pengujian Otomatis

Proyek ini dilengkapi dengan 200+ pengujian unit dan integrasi untuk memastikan keandalan alur bisnis dan kepatuhan UI:

```bash
# Menjalankan seluruh test suite Vitest
pnpm test

# Menjalankan linting kode
pnpm run lint

# Membangun build produksi Next.js
pnpm run build
```

---

## 📱 Cara Memasang di Smartphone (PWA)

Aplikasi **Me Kost** berbasis Progressive Web App (PWA), sehingga dapat di-install langsung ke layar ponsel tanpa perlu mengunduh dari Google Play Store atau Apple App Store.

### 🤖 Untuk Pengguna Android (Google Chrome)
1. Buka URL aplikasi di peramban **Google Chrome**.
2. Ketuk ikon **titik tiga (⋮)** di pojok kanan atas layar.
3. Pilih opsi **"Instal aplikasi"** atau **"Tambahkan ke Layar Utama"** (*Add to Home screen*).
4. Ketuk **Instal**.
5. Ikon **Me Kost** akan otomatis muncul di menu aplikasi/Homescreen HP Anda dan dapat dibuka secara *full-screen* seperti aplikasi Android bawaan.

### 🍏 Untuk Pengguna iPhone / iPad (Safari)
1. Buka URL aplikasi di peramban **Safari** *(wajib menggunakan Safari)*.
2. Ketuk ikon **Share / Bagikan** (ikon kotak dengan tanda panah ke atas di bagian bawah layar).
3. Gulir ke bawah, lalu pilih menu **"Add to Home Screen"** (*Tambahkan ke Layar Utama*).
4. Ketuk **Add** di pojok kanan atas.
5. Ikon **Me Kost** akan langsung terpasang di Homescreen iPhone Anda.

### ✨ Keunggulan PWA Me Kost
- **Tanpa Unduh App Store/Play Store**: Menghemat ruang penyimpanan HP.
- **Tampilan Standalone**: Bersih dan bebas dari bilah URL/tab browser.
- **Selalu Terbarui**: Pembaruan fitur otomatis diterima tanpa perlu update manual di store.
- **Realtime Notification & Sync**: Terintegrasi langsung dengan Supabase Realtime untuk pembaruan status pembayaran seketika.

---

## ⚡ Supabase Keep-Alive (Anti Auto-Pause)

Paket gratis Supabase secara otomatis menonaktifkan (*pause*) project jika tidak ada aktivitas selama 7 hari. Repositori ini telah dilengkapi dengan **GitHub Actions Cron Workflow** otomatis (`.github/workflows/supabase-keep-alive.yml`) yang melakukan *ping* query database setiap 3 hari sekali.

### Langkah Aktivasi di GitHub:
1. Buka repositori Anda di GitHub $\rightarrow$ **Settings** $\rightarrow$ **Secrets and variables** $\rightarrow$ **Actions**.
2. Klik tombol **New repository secret**, lalu tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`: URL project Supabase Anda (misal `https://xxxx.supabase.co`).
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Kunci anonim publik Supabase Anda.
   - *(Opsional)* `APP_URL`: URL web deploy Anda (misal `https://kost-syantika.vercel.app`) untuk memicu endpoint `/api/keep-alive`.
3. Buka tab **Actions** di GitHub $\rightarrow$ pilih workflow **Supabase Keep-Alive** $\rightarrow$ klik **Run workflow** untuk menguji secara instan.

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Bebas digunakan, dipelajari, dan dikembangkan untuk keperluan pribadi maupun bisnis kost Anda.

