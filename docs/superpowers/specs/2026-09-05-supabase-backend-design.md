# Desain Arsitektur Backend Serverless: Supabase + Next.js (Kost Syantika)

* **Tanggal**: 2026-09-05
* **Status**: Disetujui & Dimatangkan (Approved via Grill-with-Docs)
* **Konteks Domain**: [CONTEXT.md](file:///c:/Users/USER/Documents/ai-native/kost-syantika/CONTEXT.md)
* **Keputusan Terkait**: [ADR 0002](file:///c:/Users/USER/Documents/ai-native/kost-syantika/docs/adr/0002-independent-billing-cycle-and-supabase-backend.md)
* **Target Pengguna**: Pemilik Kost & Penghuni (< 30 kamar kost)

---

## 1. Ringkasan & Tujuan

Aplikasi Kost Syantika beralih dari prototipe client-side mock store menuju aplikasi siap pakai di dunia nyata yang berjalan multi-perangkat (Penghuni mengunggah bukti pembayaran di HP masing-masing dan Pemilik Kost memverifikasinya di HP Pemilik).

Arsitektur yang disepakati adalah **Backend-as-a-Service (BaaS) Supabase + Vercel Frontend Hosting**. Sistem mengusung **Siklus Tagihan Mandiri per Kamar** (sesuai tanggal masuk masing-masing anak kost), penerbitan tagihan **H-7**, pengingat jatuh tempo **H-3**, status **Menunggak** jika terlambat, serta UI yang super halus (*smooth*) berbasis **Optimistic UI + Supabase Realtime + TanStack Query**.

Total biaya operasional: **Rp 0 / bulan (100% Free Tier untuk < 30 kamar)**.

---

## 2. Arsitektur Tingkat Tinggi & Strategi "Smooth UI"

```
[ HP Penghuni (PWA) ]              [ HP Pemilik Kost (PWA) ]
        │                                      │
        ▼                                      ▼
┌───────────────────────────────────────────────────────────┐
│               Frontend Next.js (Hosted di Vercel)          │
│  ┌─────────────────────────┬───────────────────────────┐  │
│  │   TanStack Query Cache  │  Optimistic UI Updates    │  │
│  │   (Buka app instan <50ms│ (Respon klik tanpa lag)   │  │
│  └─────────────────────────┴───────────────────────────┘  │
└─────────────────────────────┬─────────────────────────────┘
                              │
                    WebSocket Realtime & REST
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

---

## 3. Skema Basis Data (PostgreSQL di Supabase)

### 3.1 Tabel `kamar`
Menyimpan identitas fisik kamar kost, tarif dasar, tanggal masuk, dan siklus tanggal jatuh tempo.
```sql
CREATE TABLE public.kamar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_kamar TEXT NOT NULL UNIQUE,
    tipe_kamar TEXT NOT NULL,
    tarif_bulanan INTEGER NOT NULL,
    status_hunian TEXT NOT NULL DEFAULT 'KOSONG' CHECK (status_hunian IN ('TERISI', 'KOSONG')),
    tanggal_masuk DATE,                               -- Tanggal mulai sewa penghuni aktif
    tanggal_jatuh_tempo SMALLINT NOT NULL DEFAULT 1  -- Tanggal 1-31 siklus bulanan kamar
        CHECK (tanggal_jatuh_tempo BETWEEN 1 AND 31),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.2 Tabel `users`
Menyimpan identitas pengguna yang terhubung ke `auth.users` Supabase.
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('PEMILIK', 'PENGHUNI')),
    nama TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telepon TEXT,
    kamar_id UUID REFERENCES public.kamar(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'AKTIF' CHECK (status IN ('AKTIF', 'NONAKTIF')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.3 Tabel `tagihan`
Mencatat kewajiban pembayaran sewa kamar per siklus bulanan mandiri.
```sql
CREATE TABLE public.tagihan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kamar_id UUID NOT NULL REFERENCES public.kamar(id) ON DELETE CASCADE,
    penghuni_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    penghuni_nama_snapshot TEXT NOT NULL,              -- Preservasi nama saat penghuni keluar
    periode_label TEXT NOT NULL,                       -- Contoh: '15 Sep - 14 Okt 2026'
    periode_mulai DATE NOT NULL,
    periode_selesai DATE NOT NULL,
    batas_bayar DATE NOT NULL,                         -- Tanggal jatuh tempo
    nominal INTEGER NOT NULL,                          -- Nominal tagihan sewa
    status TEXT NOT NULL DEFAULT 'BELUM_BAYAR' 
        CHECK (status IN ('BELUM_BAYAR', 'MENUNGGU_VERIFIKASI', 'LUNAS', 'DITOLAK', 'MENUNGGAK')),
    metode_pembayaran TEXT CHECK (metode_pembayaran IN ('TRANSFER', 'CASH')),
    alasan_penolakan TEXT,                             -- Wajib jika status = DITOLAK
    catatan_pemilik TEXT,                              -- Catatan Pemilik Kost
    paid_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 3.4 Tabel `bukti_pembayaran`
Menyimpan referensi file bukti transfer yang diunggah oleh Penghuni.
```sql
CREATE TABLE public.bukti_pembayaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tagihan_id UUID NOT NULL REFERENCES public.tagihan(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,                           -- URL publik bucket Supabase Storage
    catatan_penghuni TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

## 4. Siklus Operasional & Fitur Utama

### 4.1 Siklus Mandiri per Kamar & Otomasi Penerbitan H-7
* Setiap kamar yang `TERISI` memiliki tanggal jatuh tempo bulanan (misal tanggal 15).
* **Penerbitan H-7 (Hybrid On-Open):** Ketika aplikasi dibuka, sistem secara otomatis mengecek kamar terisi yang telah memasuki H-7 sebelum jatuh tempo namun belum dibuatkan tagihan periode berikutnya. Sistem langsung meng-generate record tagihan baru dengan status `BELUM_BAYAR`.
* Penghuni dapat melihat tagihan baru dan melakukan pembayaran lebih awal (misal tepat setelah gajian).

### 4.2 Notifikasi & Pengingat Jatuh Tempo (H-3)
* **In-App Banner:** Pada H-3 sebelum jatuh tempo, dashboard Penghuni memunculkan *banner* kuning/amber peringatan jatuh tempo.
* **Tombol 1-Klik WhatsApp:** Di dashboard Pemilik Kost, kamar yang berada pada rentang H-3 atau Menunggak dilengkapi tombol hijau WhatsApp yang langsung membuka chat ke Penghuni dengan pesan santun yang sudah disiapkan otomatis.
* **Web Push Notification:** Notifikasi push background dikirimkan ke perangkat Penghuni jika izin notifikasi diaktifkan.

### 4.3 Keterlambatan Pembayaran (`MENUNGGAK`)
* Jika tanggal jatuh tempo telah lewat dan tagihan belum berstatus `LUNAS` atau `MENUNGGU_VERIFIKASI`, status otomatis berubah menjadi `MENUNGGAK (Telat X Hari)` dengan badge merah menyala.
* Tidak ada denda otomatis kaku; Pemilik Kost dapat mengedit nominal tagihan secara fleksibel jika ada denda yang disepakati.

### 4.4 Autentikasi & Alur "Keluar Kost" (Checkout)
* **Pemilik Kost:** Login manual dengan Email & Password biasa.
* **Penghuni:** Login 1-klik dengan Google OAuth.
  * Pemilik Kost mendaftarkan email Google anak kost pada kamar kosong (beserta nama, no. HP, dan tanggal masuk).
  * Saat login dengan Google, sistem mencocokkan email dengan kamar terkait.
  * Jika email salah / belum terdaftar, muncul pesan ramah dan di dashboard Pemilik Kost ada tombol cepat `Ubah Email Penghuni`.
* **Keluarkan Penghuni:**
  * Pemilik menekan tombol `Keluarkan Penghuni` pada kamar terkait.
  * Dialog konfirmasi menawarkan penanganan tagihan aktif bulan berjalan (batalkan atau biarkan sebagai arsip tunggakan).
  * Sistem melakukan *soft disconnect*: akun penghuni dilepas (`kamar_id = NULL`, status `'NONAKTIF'`), status kamar kembali `'KOSONG'`.
  * Riwayat tagihan dan nama penghuni di bulan-bulan sebelumnya tetap utuh di pembukuan keuangan.

---

## 5. Optimalisasi Media & Keamanan (RLS)

* **Kompresi WebP Klien:** Foto bukti transfer di-render ke Canvas HTML5 di HP sebelum dikirim, menyusut dari ~3 MB menjadi ~150 KB. Kuota 1 GB gratis mampu menampung >6.000 bukti sewa (>15 tahun).
* **Supabase Storage:** Bucket `bukti-pembayaran` dengan format direktori `kamar-[nomor]/[tahun]-[bulan]-[uuid].webp`.
* **Row Level Security (RLS):**
  * Pemilik memiliki akses penuh (`ALL`) ke semua data kamar, tagihan, dan bukti pembayaran.
  * Penghuni hanya dapat membaca kamar & tagihannya sendiri, dan hanya dapat mengunggah bukti ke tagihannya sendiri.

---

## 6. Integrasi Frontend Next.js

1. **Paket**: `@supabase/supabase-js`, `@supabase/ssr`, `@tanstack/react-query`.
2. **Klien Supabase**:
   * `lib/supabase/client.ts` (Browser)
   * `lib/supabase/server.ts` (Server Actions)
3. **Penyempurnaan Antarmuka**:
   * **Login Page (`app/login/page.tsx`)**: Tombol Google Sign-in untuk Penghuni & Form Login Pemilik.
   * **Dashboard Pemilik (`PemilikDaftarKamar`)**:
     * Urutan nomor kamar (101, 102, ...) dengan tab filter: *Semua*, *Butuh Verifikasi*, *H-3*, *Menunggak*, *Kosong*.
     * Tombol `+ Tambah Penghuni` untuk kamar kosong.
     * Tombol `Keluarkan Penghuni` & `Ubah Email` untuk kamar terisi.
     * Tombol 1-klik WhatsApp untuk kamar H-3 dan Menunggak.
   * **Dashboard Penghuni (`PenghuniDashboardView`)**:
     * Banner pengingat H-3.
     * Formulir unggah bukti transfer dengan kompresi otomatis client-side.
4. **File Skema SQL**:
   * File `supabase/schema.sql` siap eksekusi di Supabase SQL Editor sekali klik.
