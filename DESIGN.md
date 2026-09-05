---
name: Kost Syantika
description: Modern Clean Fintech design system for mobile-first boarding house rent payment management.
colors:
  primary: "#04A552"
  primary-hover: "#038E46"
  primary-muted: "#E8F8EF"
  primary-foreground: "#FFFFFF"
  accent-amber: "#F59E0B"
  accent-amber-subtle: "#FEF3C7"
  accent-amber-text: "#92400E"
  accent-rose: "#E11D48"
  accent-rose-subtle: "#FFE4E6"
  accent-rose-text: "#9F1239"
  neutral-bg: "#F8FAFC"
  neutral-surface: "#FFFFFF"
  neutral-text: "#0F172A"
  neutral-muted: "#64748B"
  neutral-border: "#E2E8F0"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.25
  headline:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "10px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-destructive:
    backgroundColor: "{colors.accent-rose}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "10px 16px"
  button-outline:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "10px 16px"
  card-surface:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.lg}"
    padding: "20px"
  badge-lunas:
    backgroundColor: "{colors.primary-muted}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: "2px 10px"
  badge-pending:
    backgroundColor: "{colors.accent-amber-subtle}"
    textColor: "{colors.accent-amber-text}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
  input-text:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    height: "44px"
    padding: "8px 14px"
---

# Design System: Kost Syantika

## Overview

**Creative North Star: "Modern Clean Fintech"**

Kost Syantika menerapkan bahasa visual Modern Clean Fintech yang dirancang khusus untuk kenyamanan perangkat genggam (mobile-first). Antarmuka memadukan latar kanvas netral yang tenang dengan aksen Syantika Emerald yang segar, menciptakan rasa aman, transparan, dan teratur dalam setiap tahapan transaksi sewa kamar kost.

Pendekatan estetika ini menolak secara tegas tampilan formulir birokratis abu-abu, tabel spreadsheet kaku yang padat, serta spanduk promosi komersial yang berisik. Seluruh pengalaman dioptimalkan untuk kecepatan pemindaian data finansial, peninjauan bukti transfer, dan tindakan verifikasi dengan satu tangan tanpa friksi kognitif.

**Key Characteristics:**
- Ergonomi kontrol ramah jempol (*thumb-friendly* minimum tinggi 40–44px dengan micro-scale saat ditekan).
- Palet Syantika Emerald yang segar dengan kontras rasio tinggi yang memenuhi standar WCAG.
- Elevasi bertingkat lembut (*ambient tinted glow*) di atas kanvas Slate-50 yang bersih.
- Status badge bernuansa halus (*soft-tinted*) yang informatif tanpa membebani hirarki visual kartu.
- Kepatuhan total terhadap terminologi domain resmi Kost Syantika.

## Colors

Palet warna difokuskan pada ketegasan identitas finansial modern dengan aksen fungsional yang intuitif.

### Primary
- **Syantika Emerald** (`#04A552` / hover `#038E46` / muted `#E8F8EF`): Warna identitas utama sistem. Digunakan secara eksklusif untuk aksi afirmatif kunci (Setujui, Bayar, Simpan), status Lunas, dan indikator navigasi aktif.

### Secondary
- **Amber Alert** (`#F59E0B` / subtle `#FEF3C7` / text `#92400E`): Warna aksen penanda atensi dan antrean. Digunakan pada badge Menunggu Verifikasi, badge nomor kamar pada kartu antrean, serta indikator lencana belum tertangani.

### Tertiary
- **Crimson Rose** (`#E11D48` / subtle `#FFE4E6` / text `#9F1239`): Warna aksen penolakan dan peringatan. Digunakan untuk tombol Tolak Bukti, status Ditolak, pesan kesalahan validasi, serta dialog pembatalan.

### Neutral
- **Slate Canvas** (`#F8FAFC`): Latar belakang aplikasi menyeluruh yang sejuk dan menenangkan mata.
- **Pure White** (`#FFFFFF`): Permukaan kontainer kartu, lembar dialog modal, input formulir, dan bilah navigasi bawah.
- **Midnight Slate** (`#0F172A`): Warna tipografi utama untuk keterbacaan tajam pada nominal uang, nama penghuni, dan judul kartu.
- **Muted Slate** (`#64748B` / `#94A3B8`): Teks sekunder, label penjelas, tanggal unggah, dan placeholder input.
- **Subtle Mist** (`#E2E8F0`): Garis batas tepi (*border*) pemisah seksi dan kontainer bukti transfer.

### Named Rules
**The Emerald Reserve Rule.** Warna Syantika Emerald (#04A552) dikhususkan murni untuk aksi sukses atau afirmatif (Setujui, Bayar, Status Lunas, Sesi Aktif) dan tidak pernah dipakai untuk elemen netral, latar umum, atau dekorasi pasif semata.

## Typography

**Display Font:** Plus Jakarta Sans (`var(--font-jakarta)`, dengan fallback `sans-serif`)
**Body Font:** Plus Jakarta Sans (`var(--font-jakarta)`, dengan fallback `sans-serif`)
**Label Font:** Plus Jakarta Sans (`var(--font-jakarta)`, dengan fallback `sans-serif`)

**Character:** Tipografi geometris modern yang bersih dan proporsional dengan kemampuan keterbacaan tinggi pada layar ponsel beresolusi tinggi maupun padat piksel.

### Hierarchy
- **Display** (800 / ExtraBold, `1.25rem` / 20px, line-height `1.25`): Header saldo ringkasan dan nominal utama dashboard.
- **Headline** (700 / Bold, `1.125rem` / 18px, line-height `1.3`): Judul kartu utama, nama seksi antrean, dan judul modal.
- **Title** (700 / Bold, `1rem` / 16px, line-height `1.35`): Nama penghuni pada item antrean dan sub-judul daftar kamar.
- **Body** (400 / Regular & 500 / Medium, `0.875rem` / 14px, line-height `1.5`): Catatan bukti penghuni, rincian biaya sewa, dan paragraf instruksi.
- **Label** (600 / SemiBold & 700 / Bold, `0.75rem` / 12px, line-height `1.4`): Nomor kamar pada badge, teks status pembayaran, label navigasi bawah, dan tombol aksi.

### Named Rules
**The Scan-First Metric Rule.** Nominal rupiah dan nomor kamar wajib berbobot tegas (`font-bold` atau `font-black`) dengan posisi konsisten agar verifikator dapat mencocokkan nominal dalam waktu kurang dari 1 detik.

## Layout

Tata letak mengadopsi model ponsel terpusat (*mobile viewport container*) dengan batas lebar maksimum `max-w-md` (~390px hingga 448px) yang selalu berpusat horizontal (`mx-auto`) di desktop.

- **Rhythm Spacing:** Skala kelipatan 4px/8px (spasi mikro 4px, standar 8px/12px, antar-komponen 16px/20px, seksi utama 24px/32px).
- **Safe-Area Insets:** Mengakomodasi bilah status dan gestur beranda iOS/Android melalui kelas `.safe-top` dan `.safe-bottom`.
- **Navigation Shelf:** Bilah Navigasi Bawah (*Bottom Navigation*) mengambang permanen di bagian bawah layar setinggi 64px dengan efek kabur latar belakang (*backdrop-blur-md*) dan batas atas tipis.

## Elevation & Depth

Sistem mengusung filosofi *Tactile & Ambient Depth*. Permukaan datar secara default dengan batas garis 1px halus, lalu diangkat menggunakan bayangan berpendar hijau emerald lembut (*ambient tinted glow*).

### Shadow Vocabulary
- **Ambient Card Shadow** (`box-shadow: 0 4px 20px -2px rgba(4, 165, 82, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.04)`): Elevasi standar untuk seluruh kontainer kartu di atas latar kanvas.
- **Elevated Floating Shadow** (`box-shadow: 0 10px 25px -3px rgba(4, 165, 82, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`): Digunakan saat kartu sedang aktif disentuh, modal dialog, atau menu popover.
- **Nav Shelf Shadow** (`box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.04)`): Memisahkan bilah navigasi bawah dari konten gulir di baliknya.

### Named Rules
**The Tinted Atmosphere Rule.** Bayangan elevasi kartu menggunakan dispersi warna emerald tipis (6%–10% opacity) yang memancarkan kesan segar, meniadakan bayangan hitam legam pekat yang membuat UI terasa kusam.

## Shapes

Bahasa bentuk mengedepankan kurva ramah sentuhan (*friendly rounded geometry*) yang harmonis di seluruh elemen.

- **Small Radius** (`8px` / `rounded-lg`): Kapsul badge nomor kamar, badge status pending, dan thumbnail bukti transfer.
- **Medium Radius** (`12px` / `rounded-xl`): Tombol aksi verifikasi, kontrol formulir, dan input teks.
- **Large Radius** (`16px`–`24px` / `rounded-2xl`–`rounded-3xl`): Kontainer kartu utama dan panel dialog konfirmasi.
- **Pill Geometry** (`9999px` / `rounded-full`): Lencana status lunas dan kapsul indikator tab aktif pada navigasi bawah.
- **Document Aspect Ratio:** Thumbnail foto bukti transfer menggunakan proporsi dokumen struk (lebar 56px x tinggi 64px) dengan radius 8px dan indikator ikon perbesaran di pojok.

## Components

Setiap komponen dirancang dengan fokus sentuhan ergonomis dan kejelasan respon status.

### Buttons
- **Shape:** Sudut membulat modern (`12px` / `rounded-xl`), tinggi ergonomis 40px (`h-10`) hingga 44px (`h-11`).
- **Primary:** Latar Syantika Emerald (`#04A552`), teks putih, shadow tipis emerald, transisi `active:scale-[0.98]`.
- **Destructive (Tolak):** Latar Crimson Rose lembut (`bg-rose-50/80`), teks rose pekat (`text-rose-700`), border halus (`border-rose-200/90`).
- **Outline / Ghost:** Border emerald halus dengan latar putih atau transparan, teks emerald pekat.

### Badges & Chips
- **Lunas:** Kapsul hijau muda (`bg-emerald-100 text-emerald-800 border-emerald-200`).
- **Menunggu Verifikasi:** Kapsul kuning amber lembut (`bg-amber-100 text-amber-800 border-amber-200`).
- **Ditolak:** Kapsul merah muda (`bg-rose-100 text-rose-800 border-rose-200`).
- **Nomor Kamar:** Kapsul amber modern (`bg-amber-50 text-amber-800 border-amber-200/80 font-bold`).

### Cards & Containers
- **Corner Style:** Radius `16px` (`rounded-2xl`).
- **Background:** Pure White (`#FFFFFF`).
- **Border:** Garis batas halus `border-slate-200/80` atau `border-emerald-950/10`.
- **Shadow Strategy:** Ambient Card Shadow (`card-shadow`).
- **Internal Padding:** 16px hingga 20px (`p-4` sm:`p-5`).

### Inputs & Fields
- **Style:** Tinggi 44px (`h-11`), radius `12px` (`rounded-xl`), border `border-slate-200`, latar putih.
- **Focus State:** Ring emerald bercahaya (`focus-visible:ring-2 focus-visible:ring-emerald-500`).

### Navigation
- **Bottom Navigation Bar:** Bilah terpasang di bawah setinggi 64px, latar `bg-white/95 backdrop-blur-md`, pembagian proporsional 3 tab sesuai peran pengguna dengan badge notifikasi antrean berbentuk lingkaran amber berdenyut halus.

### Signature Component: Proof Thumbnail Card
- Kartu item antrean verifikasi yang memadukan thumbnail struk interaktif dengan tombol perbesaran layar penuh (*lightbox zoom*), kutipan catatan penghuni, serta aksi berdampingan Tolak dan Setujui.

## Do's and Don'ts

### Do:
- **Do** sediakan target sentuh minimal 40px (`h-10`) hingga 44px (`h-11`) untuk seluruh tombol aksi utama guna kenyamanan navigasi satu jempol.
- **Do** tampilkan nominal uang menggunakan utilitas `formatRupiah` dengan bobot `font-bold` atau `font-black`.
- **Do** wajibkan pengisian Alasan Penolakan saat Pemilik Kost menolak bukti transfer penghuni.
- **Do** pertahankan selektor pengujian Vitest (`Antrean Verifikasi Bukti`, `Setujui`, `Tolak`, `Lihat Bukti`) pada setiap perombakan visual.

### Don't:
- **Don't** gunakan warna primer Emerald untuk elemen pasif, teks biasa, atau status netral ("The Emerald Reserve Rule").
- **Don't** menduplikasi nomor kamar dan nama dalam badge tebal yang bertumpuk dalam satu baris.
- **Don't** memakai bayangan hitam pekat (*heavy black drop shadow*) yang membuat UI ponsel terasa kusam dan berat.
- **Don't** melanggar batas terminologi domain resmi di `CONTEXT.md` dengan memakai kata seperti Admin, Tenant, Room, Invoice, atau Bill.
