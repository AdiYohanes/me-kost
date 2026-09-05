# Polish Visual Kartu Antrean Verifikasi Bukti Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memperbarui visual kartu antrean verifikasi bukti transfer pemilik kost menjadi tampilan Modern Clean Fintech yang elegan, menghilangkan teks berulang, menyempurnakan thumbnail struk dengan petunjuk zoom, dan menyediakan tombol sentuh yang ergonomis.

**Architecture:** Refaktor murni pada layer presentasi UI komponen `components/dashboard/pemilik-verifikasi-antrean.tsx` dengan styling Tailwind CSS v4, mempertahankan seluruh state management Zustand (`usePaymentStore`), dialog lightbox, dialog tolak bukti, serta selektor tes Vitest.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind CSS v4, Lucide React, Vitest, Testing Library.

## Global Constraints

- Domain Language: Tetap gunakan istilah domain `Antrean Verifikasi Bukti`, `Kamar`, `Penghuni`, `Tagihan`, `Bukti Pembayaran`.
- Kompatibilitas Tes: Jangan mengubah atau menghapus teks `Antrean Verifikasi Bukti`, `Kamar {nomorKamar}`, `Dewi Lestari`, `Siti Nurhaliza`, `Setujui`, `Tolak`, dan `Lihat Bukti`.
- Vitest pass rate: 100% lulus untuk seluruh suite tes aplikasi.
- Zero lint error: `pnpm run lint` harus bersih.

---

### Task 1: Update Test Assertion untuk Visual Polish

**Files:**
- Modify: `tests/pemilik-verifikasi-antrean.test.tsx`

**Interfaces:**
- Consumes: `PemilikVerifikasiAntrean` dari `@/components/dashboard/pemilik-verifikasi-antrean`
- Produces: Pengujian otomatis yang memvalidasi label "Sewa Bulanan" dan elemen UI terpoles.

- [x] **Step 1: Tambahkan assertion untuk teks label baru "Sewa Bulanan" di test file**

Update `tests/pemilik-verifikasi-antrean.test.tsx`:
```tsx
    // Kamar 102 & 107 ada dalam antrean
    expect(screen.getByText(/Kamar 102/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Siti Nurhaliza/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Kamar 107/i)).toBeInTheDocument();
    expect(screen.getByText(/Dewi Lestari/i)).toBeInTheDocument();

    // Label penjelas nominal Sewa Bulanan ter-render
    expect(screen.getAllByText(/Sewa Bulanan/i).length).toBe(2);
```

- [x] **Step 2: Jalankan test untuk memverifikasi kegagalan (Red phase)**

Run: `pnpm test tests/pemilik-verifikasi-antrean.test.tsx`
Expected: FAIL karena teks "Sewa Bulanan" belum di-render oleh komponen.

- [x] **Step 3: Commit perubahan test**

```bash
git add tests/pemilik-verifikasi-antrean.test.tsx
git commit -m "test: add assertion for polished verifikasi card labels"
```

---

### Task 2: Implementasi Desain Polish pada `pemilik-verifikasi-antrean.tsx`

**Files:**
- Modify: `components/dashboard/pemilik-verifikasi-antrean.tsx`

**Interfaces:**
- Consumes: `Tagihan` dari `@/types/payment`, `usePaymentStore` dari `@/lib/store/use-payment-store`
- Produces: Komponen `PemilikVerifikasiAntrean` dengan styling Modern Clean Fintech.

- [x] **Step 1: Modifikasi header item kamar, nama penghuni, dan nominal**

Gantikan blok oranye kotak dan teks duplikat dengan:
- Kapsul badge kamar: `<span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">Kamar {tagihan.nomorKamar}</span>`
- Judul nama penghuni: `<h4 className="text-sm font-bold text-slate-900 leading-snug">{tagihan.penghuniNama}</h4>`
- Waktu unggah dengan ikon kalender: `<p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5"><Calendar className="w-3 h-3 text-slate-400" /><span>Unggah: {formattedUploadTime}</span></p>`
- Display nominal bersih: `<div className="text-right shrink-0"><span className="text-sm sm:text-base font-black text-slate-900 block">{formatRupiah(tagihan.nominal)}</span><span className="text-[10px] text-slate-500 font-medium">Sewa Bulanan</span></div>`

- [x] **Step 2: Modifikasi wadah pratinjau bukti transfer dan catatan penghuni**

Gantikan styling box abu-abu kaku dengan:
- Wadah halus: `<div className="flex items-center gap-3.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/70 hover:bg-slate-50 transition-colors">`
- Thumbnail dokumen struk transfer bank dengan indikator zoom:
  `<div onClick={() => setSelectedTagihanForLightbox(tagihan)} className="w-14 h-16 rounded-lg border border-slate-200 overflow-hidden bg-slate-100 shrink-0 cursor-pointer relative group shadow-xs" title="Klik untuk memperbesar bukti transfer">`
  `<img src={tagihan.buktiPembayaran.imageUrl} alt={"Thumbnail bukti kamar " + tagihan.nomorKamar} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />`
  `<div className="absolute right-1 bottom-1 bg-black/60 text-white rounded-full p-1 backdrop-blur-xs flex items-center justify-center"><Eye className="w-3 h-3" /></div>`
- Teks kutipan catatan dan tombol link "Lihat Bukti Ukuran Penuh":
  `<Button type="button" variant="link" size="sm" onClick={() => setSelectedTagihanForLightbox(tagihan)} className="h-auto p-0 text-[11px] text-emerald-600 font-bold hover:text-emerald-700 gap-1.5 mt-1.5 cursor-pointer inline-flex items-center"><Eye className="w-3.5 h-3.5" /><span>Lihat Bukti Ukuran Penuh</span></Button>`

- [x] **Step 3: Modifikasi tombol aksi Tolak dan Setujui (Ergonomi Sentuh h-10)**

- Wadah aksi: `<div className="flex items-center gap-3 pt-3 border-t border-slate-100/80">`
- Tombol Tolak:
  `<Button type="button" variant="outline" size="sm" onClick={() => setSelectedTagihanForReject(tagihan)} className="flex-1 h-10 text-xs font-bold text-rose-700 bg-rose-50/80 hover:bg-rose-100 border-rose-200/90 gap-2 rounded-xl active:scale-[0.98] transition-all cursor-pointer"><XCircle className="w-4 h-4 text-rose-600" /><span>Tolak</span></Button>`
- Tombol Setujui:
  `<Button type="button" size="sm" onClick={() => handleApprove(tagihan)} className="flex-1 h-10 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white gap-2 rounded-xl shadow-sm shadow-emerald-600/25 hover:shadow-md hover:shadow-emerald-600/30 active:scale-[0.98] transition-all cursor-pointer"><CheckCircle2 className="w-4 h-4 text-white" /><span>Setujui</span></Button>`

- [x] **Step 4: Jalankan tes unit spesifik untuk memverifikasi kelulusan (Green phase)**

Run: `pnpm test tests/pemilik-verifikasi-antrean.test.tsx`
Expected: PASS (seluruh test case lulus).

- [x] **Step 5: Commit implementasi polish card**

```bash
git add components/dashboard/pemilik-verifikasi-antrean.tsx
git commit -m "feat(ui): polish antrean verifikasi card with modern fintech aesthetics"
```

---

### Task 3: Verifikasi Menyeluruh (Lint, Build, & Test Suite)

**Files:**
- None (Verifikasi menyeluruh)

- [x] **Step 1: Jalankan seluruh suite pengujian Vitest**

Run: `pnpm test`
Expected: All test suites passed (75+ tests passing).

- [x] **Step 2: Jalankan linter ESLint**

Run: `pnpm run lint`
Expected: No lint warnings or errors.

- [x] **Step 3: Jalankan Next.js production build**

Run: `pnpm run build`
Expected: Compiled successfully with zero errors.
