-- ==============================================================================
-- KOST SYANTIKA: SKEMA BASIS DATA SUPABASE (POSTGRESQL)
-- Referensi: CONTEXT.md, ADR-0002, dan Spesifikasi Desain Backend
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABEL: kamar
CREATE TABLE IF NOT EXISTS public.kamar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nomor_kamar TEXT NOT NULL UNIQUE,
    tipe_kamar TEXT NOT NULL,
    tarif_bulanan INTEGER NOT NULL,
    status_hunian TEXT NOT NULL DEFAULT 'KOSONG' CHECK (status_hunian IN ('TERISI', 'KOSONG')),
    tanggal_masuk DATE,
    tanggal_jatuh_tempo SMALLINT NOT NULL DEFAULT 1 CHECK (tanggal_jatuh_tempo BETWEEN 1 AND 31),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABEL: users (Profil Pengguna terhubung ke auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('PEMILIK', 'PENGHUNI')),
    nama TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    telepon TEXT,
    kamar_id UUID REFERENCES public.kamar(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'AKTIF' CHECK (status IN ('AKTIF', 'NONAKTIF')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABEL: tagihan
CREATE TABLE IF NOT EXISTS public.tagihan (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kamar_id UUID NOT NULL REFERENCES public.kamar(id) ON DELETE CASCADE,
    penghuni_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    penghuni_nama_snapshot TEXT NOT NULL,
    periode_label TEXT NOT NULL,
    periode_mulai DATE NOT NULL,
    periode_selesai DATE NOT NULL,
    batas_bayar DATE NOT NULL,
    nominal INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'BELUM_BAYAR' 
        CHECK (status IN ('BELUM_BAYAR', 'MENUNGGU_VERIFIKASI', 'LUNAS', 'DITOLAK', 'MENUNGGAK')),
    metode_pembayaran TEXT CHECK (metode_pembayaran IN ('TRANSFER', 'CASH')),
    alasan_penolakan TEXT,
    catatan_pemilik TEXT,
    paid_at TIMESTAMPTZ,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. TABEL: bukti_pembayaran
CREATE TABLE IF NOT EXISTS public.bukti_pembayaran (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tagihan_id UUID NOT NULL REFERENCES public.tagihan(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    catatan_penghuni TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. INDEXES UNTUK PERFORMA QUERY CEPAT
CREATE INDEX IF NOT EXISTS idx_kamar_nomor ON public.kamar(nomor_kamar);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_kamar ON public.users(kamar_id);
CREATE INDEX IF NOT EXISTS idx_tagihan_kamar ON public.tagihan(kamar_id);
CREATE INDEX IF NOT EXISTS idx_tagihan_status ON public.tagihan(status);
CREATE INDEX IF NOT EXISTS idx_tagihan_batas_bayar ON public.tagihan(batas_bayar);
CREATE INDEX IF NOT EXISTS idx_bukti_tagihan ON public.bukti_pembayaran(tagihan_id);

-- 7. KEAMANAN: ROW LEVEL SECURITY (RLS)
ALTER TABLE public.kamar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tagihan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bukti_pembayaran ENABLE ROW LEVEL SECURITY;

-- Helper function: cek apakah pengguna saat ini adalah Pemilik Kost
CREATE OR REPLACE FUNCTION public.is_pemilik()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users
        WHERE id = auth.uid() AND role = 'PEMILIK'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies untuk `kamar`
CREATE POLICY "kamar_read_all_authenticated"
    ON public.kamar FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "kamar_all_pemilik"
    ON public.kamar FOR ALL
    TO authenticated
    USING (public.is_pemilik())
    WITH CHECK (public.is_pemilik());

-- Policies untuk `users`
CREATE POLICY "users_read_self_or_pemilik"
    ON public.users FOR SELECT
    TO authenticated
    USING (id = auth.uid() OR public.is_pemilik());

CREATE POLICY "users_update_self_or_pemilik"
    ON public.users FOR UPDATE
    TO authenticated
    USING (id = auth.uid() OR public.is_pemilik())
    WITH CHECK (id = auth.uid() OR public.is_pemilik());

CREATE POLICY "users_insert_pemilik"
    ON public.users FOR INSERT
    TO authenticated
    WITH CHECK (public.is_pemilik() OR id = auth.uid());

CREATE POLICY "users_delete_pemilik"
    ON public.users FOR DELETE
    TO authenticated
    USING (public.is_pemilik());

-- Policies untuk `tagihan`
CREATE POLICY "tagihan_read_self_or_pemilik"
    ON public.tagihan FOR SELECT
    TO authenticated
    USING (
        public.is_pemilik() OR 
        kamar_id = (SELECT kamar_id FROM public.users WHERE id = auth.uid())
    );

CREATE POLICY "tagihan_all_pemilik"
    ON public.tagihan FOR ALL
    TO authenticated
    USING (public.is_pemilik())
    WITH CHECK (public.is_pemilik());

CREATE POLICY "tagihan_penghuni_update_upload"
    ON public.tagihan FOR UPDATE
    TO authenticated
    USING (
        kamar_id = (SELECT kamar_id FROM public.users WHERE id = auth.uid())
    )
    WITH CHECK (
        kamar_id = (SELECT kamar_id FROM public.users WHERE id = auth.uid())
    );

-- Policies untuk `bukti_pembayaran`
CREATE POLICY "bukti_read_self_or_pemilik"
    ON public.bukti_pembayaran FOR SELECT
    TO authenticated
    USING (
        public.is_pemilik() OR
        tagihan_id IN (
            SELECT id FROM public.tagihan 
            WHERE kamar_id = (SELECT kamar_id FROM public.users WHERE id = auth.uid())
        )
    );

CREATE POLICY "bukti_insert_penghuni_or_pemilik"
    ON public.bukti_pembayaran FOR INSERT
    TO authenticated
    WITH CHECK (
        public.is_pemilik() OR
        tagihan_id IN (
            SELECT id FROM public.tagihan 
            WHERE kamar_id = (SELECT kamar_id FROM public.users WHERE id = auth.uid())
        )
    );

-- 8. BUCKET SUPABASE STORAGE: bukti-pembayaran
INSERT INTO storage.buckets (id, name, public)
VALUES ('bukti-pembayaran', 'bukti-pembayaran', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "storage_upload_authenticated"
    ON storage.objects FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'bukti-pembayaran');

CREATE POLICY "storage_select_public"
    ON storage.objects FOR SELECT
    TO public
    USING (bucket_id = 'bukti-pembayaran');

-- 9. SEED DATA AWAL KAMAR 101 - 108
INSERT INTO public.kamar (nomor_kamar, tipe_kamar, tarif_bulanan, status_hunian, tanggal_masuk, tanggal_jatuh_tempo)
VALUES
    ('101', 'Kamar Deluxe Lt. 1', 1500000, 'TERISI', '2026-09-01', 1),
    ('102', 'Kamar Standard Lt. 1', 1300000, 'TERISI', '2026-09-05', 5),
    ('103', 'Kamar Deluxe Lt. 1', 1500000, 'TERISI', '2026-09-10', 10),
    ('104', 'Kamar Standard Lt. 1', 1300000, 'TERISI', '2026-09-15', 15),
    ('105', 'Kamar VIP Lt. 2', 1800000, 'TERISI', '2026-09-18', 18),
    ('106', 'Kamar Standard Lt. 2', 1300000, 'KOSONG', NULL, 1),
    ('107', 'Kamar Deluxe Lt. 2', 1500000, 'TERISI', '2026-09-22', 22),
    ('108', 'Kamar VIP Lt. 2', 1800000, 'TERISI', '2026-09-25', 25)
ON CONFLICT (nomor_kamar) DO NOTHING;
