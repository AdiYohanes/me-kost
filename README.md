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

## 📱 PWA (Install di Smartphone)

1. Buka URL aplikasi di browser smartphone (Safari di iOS atau Chrome di Android).
2. Tekan menu **Share** (iOS) atau titik tiga (Android).
3. Pilih **"Add to Home Screen"** (*Tambahkan ke Layar Utama*).
4. Me Kost akan terpasang sebagai aplikasi standalone dengan pengalaman layar penuh tanpa bar alamat browser.

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Bebas digunakan, dipelajari, dan dikembangkan untuk keperluan pribadi maupun bisnis kost Anda.

