# 05: Aksi Tandai Cash dan Kelola Tagihan Pemilik

**What to build:** Fitur penyelesaian pembayaran tunai oleh Pemilik Kost via modal konfirmasi 'Tandai Lunas (Cash)' dengan pencatatan metode CASH dan catatan opsional, kemampuan Pemilik Kost mengelola periode tagihan bulanan baru atau menyesuaikan tarif kamar, tombol utilitas reset mock data ke kondisi awal, serta penyempurnaan Bottom Navigation bar terpadu yang mulus pada perangkat mobile.

**Blocked by:** 04: Tampilan Pemilik Ringkasan dan Verifikasi Bukti

**Status:** ready-for-agent

- [ ] Pada daftar kamar yang berstatus Belum Bayar atau Ditolak, tersedia tombol aksi 'Tandai Lunas (Cash)'
- [ ] Menekan tombol 'Tandai Lunas (Cash)' membuka modal konfirmasi yang menampilkan identitas Kamar, nama Penghuni, nominal tagihan, dan input catatan opsional penerimaan uang tunai
- [ ] Mengonfirmasi pembayaran tunai mengubah status menjadi Lunas dengan metode CASH dan mencatat waktu pelunasan
- [ ] Tersedia kontrol/tombol bagi Pemilik Kost untuk membuat tagihan periode bulan baru atau mengubah nominal tagihan kamar tertentu
- [ ] Tersedia tombol 'Reset Mock Data' di menu pengaturan/profil untuk mengembalikan seluruh state ke data benih (seed) awal demo
- [ ] Komponen Bottom Navigation bar mobile berfungsi secara responsif, rapi, dan mudah dijangkau jempol di layar HP untuk kedua peran
