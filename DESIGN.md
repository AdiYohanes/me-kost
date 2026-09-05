---
name: Me Kost
description: High-Density Architectural Ledger design system for precision boarding house rent management.
colors:
  primary: "#059669"
  primary-hover: "#047857"
  primary-muted: "#ECFDF5"
  primary-foreground: "#FFFFFF"
  accent-amber: "#D97706"
  accent-amber-subtle: "#FFFBEB"
  accent-amber-text: "#92400E"
  accent-rose: "#DC2626"
  accent-rose-subtle: "#FEF2F2"
  accent-rose-text: "#991B1B"
  neutral-bg: "#FAFAFA"
  neutral-surface: "#FFFFFF"
  neutral-text: "#09090B"
  neutral-muted: "#71717A"
  neutral-border: "#E4E4E7"
typography:
  display:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 800
    lineHeight: 1.2
  headline:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.35
  body:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Plus Jakarta Sans, monospace, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.3
  caption:
    fontFamily: "Plus Jakarta Sans, monospace, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.3
  nano:
    fontFamily: "Plus Jakarta Sans, monospace, sans-serif"
    fontSize: "0.625rem"
    fontWeight: 600
    lineHeight: 1.2
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "8px 14px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-destructive:
    backgroundColor: "{colors.accent-rose-subtle}"
    textColor: "{colors.accent-rose-text}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "8px 14px"
  button-outline:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "8px 14px"
  card-surface:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.lg}"
    padding: "16px"
  badge-lunas:
    backgroundColor: "{colors.primary-muted}"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  badge-pending:
    backgroundColor: "{colors.accent-amber-subtle}"
    textColor: "{colors.accent-amber-text}"
    rounded: "{rounded.sm}"
    padding: "2px 8px"
  input-text:
    backgroundColor: "{colors.neutral-surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.md}"
    height: "40px"
    padding: "6px 12px"
---

# Design System: Me Kost

## Overview

**Creative North Star: "High-Density Architectural Ledger"**

Me Kost mengadopsi identitas visual baru bertajuk High-Density Architectural Ledger. Desain ini menggantikan gaya rounded fintech santai dengan estetika buku besar arsitektural yang berdisiplin tinggi, monokromatik terstruktur, dan berfokus mutlak pada keterbacaan data numerik serta verifikasi transaksi yang cepat.

Estetika ini mereduksi elemen dekoratif, gradien warna tebal, serta bayangan membulat. Sebagai gantinya, sistem menggunakan garis hairline 1px presisi, penataan kisi grid rapat (*high-density*), perataan angka tabular monospaced, serta aksen warna fungsional tunggal (Signal Emerald) yang hanya menyala saat terjadi verifikasi atau aksi afirmatif penting.

**Key Characteristics:**
- Tata letak kisi buku besar rapat (*high-density grid*) dengan garis pemisah hairline 1px yang tegas.
- Angka numerik dan nominal diformat tabular (`tabular-nums` / mono) untuk perbandingan cepat.
- Palet monokromatik netral Zinc/Slate dingin dengan satu aksen primer fungsional (Signal Emerald).
- Sudut struktural terukur (radius 4px untuk chip dan 8–12px untuk kartu) tanpa membulat berlebihan.
- Kepatuhan mutlak pada terminologi resmi `CONTEXT.md` tanpa kompromi.

## Colors

Palet didominasi oleh skala monokromatik abu-abu netral dengan aksen warna sinyal murni untuk status operasional.

### Primary
- **Signal Emerald** (`#059669` / hover `#047857` / subtle `#ECFDF5`): Warna sinyal keberhasilan dan verifikasi. Digunakan untuk tombol Setujui Pembayaran, status Lunas, dan indikator aktif utama.

### Secondary
- **Signal Amber** (`#D97706` / subtle `#FFFBEB` / text `#92400E`): Warna sinyal perhatian. Digunakan eksklusif untuk status Menunggu Verifikasi dan antrean bukti transfer baru.

### Tertiary
- **Signal Crimson** (`#DC2626` / subtle `#FEF2F2` / text `#991B1B`): Warna sinyal penolakan atau pembatalan. Digunakan untuk tombol Tolak dan status Ditolak.

### Neutral
- **Ledger Canvas** (`#FAFAFA`): Latar kanvas dasar yang sangat bersih dan kontras.
- **Pure Surface** (`#FFFFFF`): Permukaan modul kartu, dialog, dan baris tabel transaksi.
- **Deep Ink** (`#09090B`): Teks utama, judul metrik, dan nominal rupiah.
- **Muted Zinc** (`#71717A`): Label penjelas, metadata waktu, tanggal periode, dan placeholder.
- **Hairline Border** (`#E4E4E7`): Garis kisi pembatas 1px presisi di seluruh komponen.

### Named Rules
**The Single-Accent Doctrine.** Warna Signal Emerald hanya boleh digunakan pada elemen yang mewakili aksi afirmatif atau status berhasil. Lebih dari 90% permukaan visual adalah monokromatik terstruktur.

## Typography

**Display Font:** Plus Jakarta Sans (`var(--font-jakarta)`, dengan fallback `sans-serif`)
**Body Font:** Plus Jakarta Sans (`var(--font-jakarta)`, dengan fallback `sans-serif`)
**Tabular Font:** Plus Jakarta Sans dengan `tabular-nums` untuk angka dan mata uang

**Character:** Tipografi modern, bersih, proporsional, dan humanis dengan dukungan Plus Jakarta Sans via `@theme` Tailwind CSS v4. Keterbacaan data keuangan dioptimalkan menggunakan perataan angka tabular (`tabular-nums`).

### Hierarchy
- **Display** (800 / ExtraBold, `1.5rem` - `1.875rem`, line-height `1.2`): Ringkasan total penerimaan kas dan nominal sewa bulanan utama.
- **Headline** (700 / Bold, `1rem` / 16px, line-height `1.3`): Judul modul, kartu tagihan, antrean verifikasi, dan judul dialog.
- **Title** (700 / Bold, `0.875rem` / 14px, line-height `1.35`): Nama penghuni, nomor kamar, dan baris judul data.
- **Body** (400-500 / Regular-Medium, `0.75rem` - `0.875rem` / 12px - 14px, line-height `1.5`): Teks deskripsi, catatan bukti penghuni, dan informasi dialog.
- **Label / Badges** (600 / SemiBold, `0.75rem` / 12px, line-height `1.3`): Lencana status pembayaran, tab navigasi, dan tombol aksi.
- **Caption** (400-500 / Regular-Medium, `0.75rem` / 12px, line-height `1.3`): Timestamp unggah, tanggal jatuh tempo, dan metadata transaksi.

### Named Rules
**The Tabular Precision Rule.** Seluruh nominal rupiah, persentase pelunasan, dan tanggal transaksi wajib menggunakan fitur `tabular-nums` agar kolom angka selalu sejajar secara vertikal.
**The Clean Sans Rule.** Seluruh judul modul, deskripsi, lencana status, dan tombol menggunakan `font-sans` murni (Plus Jakarta Sans) tanpa monospace tiruan untuk menjaga estetika modern, bersih, dan konsisten.

## Layout

Model tata letak menggunakan kisi berdensitas tinggi (*high-density structure*) yang meminimalkan ruang kosong tak berfaedah demi efisiensi visual pada perangkat mobile (`max-w-md mx-auto`).

- **Grid Spacing:** Spasi terukur kelipatan 4px/8px/12px/16px (p-3 sm:p-4 untuk kartu modul).
- **Hairline Dividers:** Pemisahan seksi menggunakan garis batas 1px solid `#E4E4E7` tanpa bayangan kabur.
- **Compact Bottom Shelf:** Navigasi bawah dirancang tipis (tinggi 56px) dengan batas hairline atas dan indikator tab minimalis.

## Elevation & Depth

Sistem menganut filosofi *Flat-by-Default Structural Depth*. Kedalaman ruang diciptakan melalui kontras permukaan dan garis batas hairline 1px, bukan melalui bayangan buram berat.

### Shadow Vocabulary
- **Flat Surface** (`box-shadow: none`, `border: 1px solid #E4E4E7`): Tampilan default untuk seluruh kartu dan baris data.
- **Micro Hairline Lift** (`box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.03)`): Digunakan untuk tombol aksi dan input saat melayang (*hover*).
- **Modal Overlay Lift** (`box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.08)`): Digunakan khusus untuk dialog modal dan pratinjau bukti layar penuh.

### Named Rules
**The Zero-Blur Rule.** Dilarang menggunakan bayangan ber-blur besar (`blur > 10px`) pada kontainer data di halaman operasional. Batas visual ditentukan oleh garis 1px dan kontras bidang.

## Shapes

Bentuk geometris mengedepankan presisi sudut yang lebih tegas dan rapi:

- **Micro Radius** (`4px` / `rounded`): Lencana status lunas, pending, dan nomor kamar.
- **Control Radius** (`8px` / `rounded-lg`): Tombol aksi, thumbnail struk transfer, dan bidang input.
- **Card Radius** (`12px` / `rounded-xl`): Kontainer kartu modul data dan panel dialog.
- **Full Pill** (`9999px` / `rounded-full`): Avatar inisial dan dot indikator antrean.

## Components

### Buttons
- **Shape:** Radius `8px` (`rounded-lg`), tinggi terukur 40px (`h-10`).
- **Primary:** Latar Signal Emerald solid (`#059669`), teks putih, active scale `scale-[0.98]`.
- **Destructive:** Latar Signal Crimson lembut (`#FEF2F2`), teks crimson pekat (`#991B1B`), border `border-red-200`.
- **Outline / Ledger:** Latar putih, border hairline `#E4E4E7`, hover `#F4F4F5`.

### Badges & Chips
- **Lunas:** Latar `#ECFDF5`, teks `#059669`, border `border-emerald-200`, radius 4px.
- **Menunggu Verifikasi:** Latar `#FFFBEB`, teks `#92400E`, border `border-amber-200`, radius 4px.
- **Ditolak:** Latar `#FEF2F2`, teks `#991B1B`, border `border-red-200`, radius 4px.

### Cards & Modules
- **Struktur:** Latar `#FFFFFF`, border `border-zinc-200`, padding 16px, sudut 12px, bayangan rata (*flat*).

### Navigation
- **Bilah Bawah:** Tinggi 56px, latar `#FFFFFF/98` dengan border atas `border-zinc-200`, tab aktif ditandai garis aksen minimalis.

## Do's and Don'ts

### Do:
- **Do** gunakan perataan angka tabular (`tabular-nums`) untuk seluruh nominal uang dan nomor unit kamar.
- **Do** gunakan garis pemisah hairline 1px tegas untuk mengelompokkan data yang padat.
- **Do** jaga tinggi tombol aksi pada ukuran ergonomis 40px (`h-10`) untuk kemudahan sentuhan satu tangan.
- **Do** patuhi terminologi resmi `CONTEXT.md` (`Pemilik Kost`, `Penghuni`, `Kamar`, `Tagihan`, `Bukti Pembayaran`).

### Don't:
- **Don't** menggunakan bayangan warna-warni berpendar atau blur besar yang mengaburkan batas tabel data ("The Zero-Blur Rule").
- **Don't** menyebarkan warna hijau/emerald di banyak tempat tanpa nilai aksi afirmatif ("The Single-Accent Doctrine").
- **Don't** menggunakan sudut membulat balon berlebihan (seperti 24px–32px) yang memboroskan area layar mobile.
- **Don't** menggunakan sinonim generik seperti Admin, Tenant, Room, Invoice, atau Bill.
