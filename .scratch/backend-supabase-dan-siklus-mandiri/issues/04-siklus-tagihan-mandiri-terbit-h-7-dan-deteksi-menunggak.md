# 04: Siklus Tagihan Mandiri per Kamar, Terbit Otomatis H-7, & Deteksi Menunggak

**What to build:** Mesin penagihan mandiri yang mengelola tanggal jatuh tempo per kamar, menerbitkan tagihan periode berikutnya secara otomatis 7 hari sebelum jatuh tempo, mendeteksi keterlambatan pembayaran secara visual, serta menyediakan filter kamar yang ergonomis bagi Pemilik Kost.

**Blocked by:** 03: Manajemen Kamar, Pendaftaran Penghuni Baru, & Alur Keluar Kost (Soft Disconnect)

**Status:** resolved

- [x] Logika kalkulasi menentukan periode sewa mandiri dan tanggal jatuh tempo bulanan berdasarkan data kamar yang terisi.
- [x] Mekanisme penerbitan tagihan otomatis menerbitkan record tagihan berstatus `BELUM_BAYAR` ketika sistem mendeteksi kamar telah mencapai H-7 sebelum tanggal jatuh tempo berikutnya.
- [x] Tagihan yang telah melampaui tanggal jatuh tempo tanpa pelunasan otomatis diberi status visual `MENUNGGAK (Telat X Hari)` dengan aksen merah mencolok.
- [x] Tab filter cepat di dashboard Pemilik Kost berfungsi untuk menyaring kamar: `Semua`, `Butuh Verifikasi`, `Mendekati Jatuh Tempo (H-3)`, `Menunggak`, dan `Kamar Kosong`.
- [x] Pemilik Kost dapat membuka dialog untuk mengedit nominal tagihan suatu kamar (misal untuk penambahan biaya fasilitas atau pemotongan diskon).
- [x] Pengujian integrasi memverifikasi penerbitan H-7, evaluasi status Menunggak, dan fungsi filter tab kamar.
