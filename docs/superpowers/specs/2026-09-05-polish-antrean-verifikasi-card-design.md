# Spesifikasi Desain: Polish Visual Kartu Antrean Verifikasi Bukti

- **Tanggal**: 2026-09-05
- **Topik**: Refinement & Polishing Kartu Antrean Verifikasi Bukti Pembayaran (`components/dashboard/pemilik-verifikasi-antrean.tsx`)
- **Pendekatan**: Modern Clean Fintech (Sleek Visual Hierarchy, Soft Badges, & Tactile Ergonomic Controls)
- **Status**: Disetujui Pengguna (Brainstorming Selesai)

---

## 1. Latar Belakang & Tujuan

Kartu "Antrean Verifikasi Bukti" adalah komponen utama bagi Pemilik Kost untuk meninjau bukti transfer yang dikirim oleh penghuni kamar. Berdasarkan evaluasi visual pada tangkapan layar antarmuka saat ini:

1. **Redundansi Informasi**: Nomor kamar ditampilkan dua kali dalam satu baris (blok oranye tebal bertuliskan `KAMAR 107` dan teks `Kamar 107 • Dewi Lestari`).
2. **Badge Visual Terlalu Tebal & Ramai**: Kotak nomor kamar berwarna oranye pekat (`bg-amber-500`) dan badge kuning `Perlu Verifikasi` menumpuk di bawah nominal, padahal seluruh kartu sudah berada dalam seksi antrean verifikasi.
3. **Efek "Kotak di dalam Kotak"**: Kotak pratinjau thumbnail bukti transfer dan catatan penghuni menggunakan kontainer abu-abu kaku (`bg-slate-50 border border-slate-100`) yang terasa datar dan terkurung.
4. **Thumbnail Kurang Intuitif untuk Mobile**: Thumbnail bukti berukuran kecil dan berbentuk kotak statis tanpa indikator visual yang jelas bahwa gambar dapat diklik untuk pratinjau layar penuh (*lightbox zoom*).
5. **Tombol Aksi Kurang Nyaman & Datar**: Tombol "Tolak" (border tipis merah) dan "Setujui" (hijau polos) berukuran `h-9` (36px) dengan interaksi datar.

Tujuan dari perbaikan ini adalah mentransformasi kartu item antrean menjadi antarmuka **Modern Clean Fintech** yang rapi, berhierarki jelas, ramah sentuhan jempol (*thumb-friendly*), serta mempertahankan 100% kompatibilitas pengujian Vitest.

---

## 2. Rincian Perubahan Desain per Komponen

File target: `components/dashboard/pemilik-verifikasi-antrean.tsx`

### 2.1 Header Item (Identitas Kamar, Penghuni, Waktu, & Nominal)

- **Badge Nomor Kamar**:
  - Ganti blok oranye kotak tebal dengan kapsul badge modern yang anggun:
    ```tsx
    <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
      Kamar {tagihan.nomorKamar}
    </span>
    ```
- **Nama Penghuni**:
  - Tampilkan sebagai judul utama item dengan bobot tegas:
    ```tsx
    <h4 className="text-sm font-bold text-slate-900 leading-snug">
      {tagihan.penghuniNama}
    </h4>
    ```
- **Metadata Waktu Unggah**:
  - Teks waktu dengan ikon kalender/jam halus:
    ```tsx
    <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
      <Calendar className="w-3 h-3 text-slate-400" />
      <span>Unggah: {formattedUploadTime}</span>
    </p>
    ```
- **Display Nominal**:
  - Nominal tagihan ditampilkan bersih dan tegas di sisi kanan atas:
    ```tsx
    <div className="text-right shrink-0">
      <span className="text-sm sm:text-base font-black text-slate-900 block">
        {formatRupiah(tagihan.nominal)}
      </span>
      <span className="text-[10px] text-slate-500 font-medium">
        Sewa Bulanan
      </span>
    </div>
    ```

### 2.2 Box Bukti Transfer & Catatan Penghuni

- **Kontainer Bukti**:
  - Gunakan latar lembut terpadu dengan border halus:
    ```tsx
    <div className="flex items-center gap-3.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors">
    ```
- **Thumbnail Interaktif**:
  - Ubah rasio thumbnail menjadi rasio struk/dokumen (`w-14 h-16 rounded-lg`) dengan overflow hidden, border lembut, dan indikator zoom di pojok kanan bawah:
    ```tsx
    <div
      onClick={() => setSelectedTagihanForLightbox(tagihan)}
      className="w-14 h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0 cursor-pointer relative group shadow-xs"
      title="Klik untuk memperbesar bukti transfer"
    >
      <img
        src={tagihan.buktiPembayaran.imageUrl}
        alt={`Thumbnail bukti kamar ${tagihan.nomorKamar}`}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
      />
      <div className="absolute right-1 bottom-1 bg-black/60 text-white rounded-full p-1 backdrop-blur-xs flex items-center justify-center">
        <Eye className="w-3 h-3" />
      </div>
    </div>
    ```
- **Catatan Penghuni & Tautan Lihat Bukti**:
  - Teks catatan yang ramah dan kutipan jelas:
    ```tsx
    <div className="text-xs text-slate-600 flex-1 min-w-0">
      {tagihan.buktiPembayaran?.catatanPenghuni ? (
        <p className="line-clamp-2 italic text-slate-700 font-medium leading-relaxed">
          &ldquo;{tagihan.buktiPembayaran.catatanPenghuni}&rdquo;
        </p>
      ) : (
        <p className="text-slate-400 text-[11px] italic">
          Tidak ada catatan tambahan dari penghuni.
        </p>
      )}
      <Button
        type="button"
        variant="link"
        size="sm"
        onClick={() => setSelectedTagihanForLightbox(tagihan)}
        className="h-auto p-0 text-[11px] text-emerald-600 font-bold hover:text-emerald-700 gap-1.5 mt-1.5 cursor-pointer inline-flex items-center"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>Lihat Bukti Ukuran Penuh</span>
      </Button>
    </div>
    ```

### 2.3 Tombol Aksi (Tolak & Setujui)

- **Layout Grid Berdampingan**:
  - `pt-3 border-t border-slate-100/80 flex items-center gap-3`
- **Tombol Tolak (Soft Tinted Crimson)**:
  - Tinggi `h-10` (40px) untuk ergonomi sentuh jempol:
    ```tsx
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => setSelectedTagihanForReject(tagihan)}
      className="flex-1 h-10 text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100 border-rose-200/90 gap-2 rounded-xl active:scale-[0.98] transition-all cursor-pointer"
    >
      <XCircle className="w-4 h-4 text-rose-600" />
      <span>Tolak</span>
    </Button>
    ```
- **Tombol Setujui (Vibrant Emerald Fintech Glow)**:
  - Tinggi `h-10` (40px), solid emerald dengan depth shadow:
    ```tsx
    <Button
      type="button"
      size="sm"
      onClick={() => handleApprove(tagihan)}
      className="flex-1 h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white gap-2 rounded-xl shadow-sm shadow-emerald-600/25 hover:shadow-md hover:shadow-emerald-600/30 active:scale-[0.98] transition-all cursor-pointer"
    >
      <CheckCircle2 className="w-4 h-4 text-white" />
      <span>Setujui</span>
    </Button>
    ```

---

## 3. Kompatibilitas Pengujian (Vitest Verification)

Perubahan visual ini secara ketat mempertahankan seluruh selektor pengujian yang digunakan dalam `tests/pemilik-verifikasi-antrean.test.tsx` dan `tests/pemilik-dashboard-view.test.tsx`:
- Selektor teks: `Antrean Verifikasi Bukti`
- Selektor nomor kamar: `Kamar {nomorKamar}`
- Selektor nama penghuni: `Dewi Lestari`, `Siti Nurhaliza`
- Selektor tombol: `Setujui`, `Tolak`, dan `Lihat Bukti` (pada tombol "Lihat Bukti Ukuran Penuh")

---

## 4. Rencana Verifikasi

1. **Unit & Integration Tests**: `pnpm test` harus lulus 100%.
2. **Lint Check**: `pnpm run lint` tidak menghasilkan error.
3. **Build Check**: `pnpm run build` sukses tanpa error tipe atau bundling.
4. **Visual & Interaction Check**: Memeriksa tampilan kartu pada browser lokal (`http://localhost:3000`).
