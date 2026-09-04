# Arsitektur Mock State Berbasis Zustand dengan Persistensi Lokal

Untuk Fase 1, seluruh state data (Kamar, Penghuni, Tagihan, Bukti Pembayaran, dan Sesi Autentikasi) dikelola di sisi klien menggunakan Zustand dengan middleware `persist` (LocalStorage). Keputusan ini diambil untuk memenuhi batasan prototipe PWA frontend tanpa dependensi backend, database, maupun cloud storage asli, namun tetap mempertahankan data dan riwayat aksi secara reaktif saat aplikasi di-refresh atau dibuka via PWA di perangkat mobile.
