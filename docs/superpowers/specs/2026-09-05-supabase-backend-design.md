# Desain Arsitektur Backend Serverless: Supabase + Next.js (Kost Syantika)

* **Tanggal**: 2026-09-05
* **Status**: Disetujui (Approved)
* **Konteks Domain**: [CONTEXT.md](file:///c:/Users/USER/Documents/ai-native/kost-syantika/CONTEXT.md)
* **Target Pengguna**: Pemilik Kost & Penghuni (< 30 kamar kost)

---

## 1. Ringkasan & Tujuan

Aplikasi Kost Syantika saat ini beroperasi dengan mock store sisi klien (Zustand + LocalStorage). Untuk memungkinkan penggunaan nyata multi-perangkat (Penghuni mengunggah bukti pembayaran di HP masing-masing dan Pemilik Kost memverifikasinya di HP Pemilik), dibutuhkan media penyimpanan awan bersama.

Keputusan arsitektur yang disepakati adalah **Backend-as-a-Service (BaaS) menggunakan Supabase** yang dikombinasikan dengan **hosting frontend di Vercel**. Pola ini menghilangkan kebutuhan membangun dan memelihara server backend kustom, dengan total biaya operasional **Rp 0 / bulan (100% Free Tier)** untuk kapasitas < 30 kamar kost.

---

## 2. Arsitektur Tingkat Tinggi

```
[ HP Penghuni (PWA) ]              [ HP Pemilik Kost (PWA) ]
        │                                      │
        ▼                                      ▼
┌───────────────────────────────────────────────────────────┐
│               Frontend Next.js (Hosted di Vercel)          │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│                     Supabase (BaaS)                       │
│  ┌───────────────────┬───────────────────┬─────────────┐  │
│  │   PostgreSQL DB   │  Storage Buckets  │  GoTrue     │  │
│  │  (kamar, users,   │ (bukti-pembayaran │  Auth Engine│  │
│  │ tagihan, bukti)   │  kompresi WebP)   │(Google/Pass)│  │
│  └───────────────────┴───────────────────┴─────────────┘  │
│  ┌─────────────────────────────────────────────────────┐  │
│  │        Row Level Security (RLS) Protection          │  │
│  └─────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

### Keuntungan & Biaya (Kapasitas < 30 Kamar)
1. **Hosting Frontend**: Vercel Hobby Tier (Gratis selamanya, HTTPS otomatis, PWA standalone).
2. **Database & API**: Supabase Free Tier (Kapasitas 500 MB — mencukupi ribuan baris tagihan selama bertahun-tahun).
3. **Storage Bukti Pembayaran**: Supabase Storage 1 GB (dengan kompresi WebP ~150 KB/foto, mampu menampung >6.000 bukti transfer atau setara >15 tahun operasional).
4. **Total Biaya**: **Rp 0 / bulan**.

---

## 3. Skema Basis Data (PostgreSQL)

### 3.1 Tabel `kamar`
Menyimpan identitas fisik kamar kost dan tarif dasarnya.
```sql
CREATE TABLE public.kamar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_kamar TEXT NOT NULL UNIQUE,
    tipe_kamar TEXT NOT NULL,
    tarif_bulanan INTEGER NOT NULL,
    status_hunian TEXT NOT NULL DEFAULT 'KOSONG' CHECK (status_hunian IN ('TERISI', 'KOSONG')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.2 Tabel `users`
Menyimpan profil pengguna yang terikat dengan identitas `auth.users` Supabase.
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('PEMILIK', 'PENGHUNI')),
    nama TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telepon TEXT,
    kamar_id UUID REFERENCES public.kamar(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.3 Tabel `tagihan`
Mencatat kewajiban pembayaran sewa bulanan untuk setiap kamar.
```sql
CREATE TABLE public.tagihan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kamar_id UUID NOT NULL REFERENCES public.kamar(id) ON DELETE CASCADE,
    penghuni_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    periode_bulan TEXT NOT NULL,       -- Contoh: 'September 2026'
    tahun SMALLINT NOT NULL,           -- Contoh: 2026
    bulan SMALLINT NOT NULL,           -- Nilai: 1-12
    nominal INTEGER NOT NULL,          -- Nominal tagihan sewa
    batas_bayar DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'BELUM_BAYAR' 
        CHECK (status IN ('BELUM_BAYAR', 'MENUNGGU_VERIFIKASI', 'LUNAS', 'DITOLAK')),
    metode_pembayaran TEXT CHECK (metode_pembayaran IN ('TRANSFER', 'CASH')),
    alasan_penolakan TEXT,             -- Wajib diisi jika status = DITOLAK
    catatan_pemilik TEXT,              -- Catatan opsional dari Pemilik Kost
    paid_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.4 Tabel `bukti_pembayaran`
Menyimpan referensi file bukti transfer bank/e-wallet yang diunggah oleh Penghuni.
```sql
CREATE TABLE public.bukti_pembayaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tagihan_id UUID NOT NULL REFERENCES public.tagihan(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,           -- URL publik file di bucket Supabase Storage
    catatan_penghuni TEXT,             -- Catatan opsional saat upload bukti transfer
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 4. Alur Autentikasi & Manajemen Penghuni

### 4.1 Login Pemilik Kost
* Mendaftar dan masuk secara **manual menggunakan Email & Password**.
* Memiliki `role = 'PEMILIK'`.
* Mengakses seluruh navigasi manajemen kost, verifikasi antrean, dan pengaturan kamar.

### 4.2 Login Penghuni Kost (Google OAuth)
* Penghuni masuk menggunakan tombol **"Lanjutkan dengan Google"** (atau fallback Email/Password).
* **Mekanisme Pencocokan Kamar:**
  1. Pemilik Kost mendaftarkan email Google calon penghuni di kamar terkait via dashboard.
  2. Saat penghuni pertama kali login via Google, Supabase Auth mengembalikan email pengguna yang terverifikasi.
  3. Aplikasi mencocokkan email tersebut dengan data `users` / pendaftaran kamar.
  4. Jika cocok, sesi langsung diikat ke kamar tersebut dan penghuni diarahkan ke dashboard tagihan kamar.
  5. Jika email belum pernah didaftarkan oleh Pemilik Kost, aplikasi menampilkan pesan ramah: *"Email Anda belum terdaftar sebagai penghuni Kost Syantika. Silakan hubungi Pemilik Kost."*

### 4.3 Siklus Hidup "Keluar Kost" (Checkout)
* Saat masa sewa penghuni berakhir dan keluar kost:
  1. Pemilik Kost menekan tombol **"Keluarkan Penghuni"** pada kamar terkait.
  2. Sistem melepaskan tautan akun penghuni dari kamar tersebut (`kamar_id = NULL`), dan mengubah `status_hunian` kamar menjadi `'KOSONG'`.
  3. Riwayat tagihan dan arsip bukti pembayaran masa lalu tetap tersimpan untuk pembukuan Pemilik Kost.
  4. Jika mantan penghuni mencoba login kembali, akses ke dashboard aktif tertolak karena akun sudah tidak memiliki kamar aktif.
  5. Kamar yang kosong siap didaftarkan untuk anak kost berikutnya via tombol **"Tambah Penghuni"**.

---

## 5. Optimalisasi Penyimpanan Foto Bukti Pembayaran

* **Bucket Supabase Storage**: `bukti-pembayaran` (bersifat *authenticated read* atau *public read with unguessable path*).
* **Kompresi Klien (Client-Side Compression)**:
  * Sebelum berkas dikirim ke Supabase, aplikasi Next.js memproses gambar di browser menggunakan Canvas HTML5.
  * Resolusi dibatasi maksimal lebar/tinggi 1280px dengan kualitas WebP 0.8.
  * Ukuran rata-rata menyusut dari ~3 MB menjadi ~100-200 KB per bukti pembayaran, memastikan efisiensi bandwidth dan masa pakai kuota gratis yang panjang.
* **Struktur File**: `bukti/[nomor_kamar]/[tahun]-[bulan]-[uuid].webp`.

---

## 6. Keamanan Data (Row Level Security / RLS)

* **Prinsip Hak Akses**:
  * Pengguna dengan peran `PEMILIK` memiliki hak `ALL` (baca, buat, ubah, hapus) di semua tabel.
  * Pengguna dengan peran `PENGHUNI`:
    * Hanya dapat membaca record `kamar` miliknya sendiri.
    * Hanya dapat membaca record `tagihan` yang memiliki `kamar_id` miliknya.
    * Hanya dapat mengunggah dan membuat record `bukti_pembayaran` untuk tagihannya sendiri yang berstatus `BELUM_BAYAR` atau `DITOLAK`.
    * Dilarang membaca data tagihan atau bukti transfer kamar lain.

---

## 7. Rencana Integrasi Frontend (Next.js)

1. **Dependensi**: Memasang `@supabase/supabase-js` dan `@supabase/ssr`.
2. **Klien Supabase**:
   * `lib/supabase/client.ts`: Klien browser untuk autentikasi dan mutasi real-time.
   * `lib/supabase/server.ts`: Klien server untuk Server Actions / SSR.
3. **Penyelarasan Komponen**:
   * Memperbarui halaman `/login` dengan tombol Google Sign-In dan form manual Pemilik Kost.
   * Menambahkan modal "Tambah Penghuni" dan dialog "Keluarkan Penghuni" pada kartu kamar di dashboard Pemilik.
   * Memodifikasi input upload bukti pembayaran pada dashboard Penghuni untuk menjalankan kompresi gambar sebelum upload ke storage Supabase.
4. **Skrip Otomatisasi Database**:
   * Menyediakan file `supabase/schema.sql` siap eksekusi di SQL Editor Supabase.
