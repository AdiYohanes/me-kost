export type UserRole = "PEMILIK" | "PENGHUNI";

export interface UserSession {
  id: string;
  username: string;
  email?: string;
  name: string;
  role: UserRole;
  kamarId?: string;
  nomorKamar?: string;
  tipeKamar?: string;
  tarifBulanan?: number;
  phone?: string;
}

export interface MockUserAccount extends UserSession {
  password: string;
}

export interface SupabaseUserProfile {
  id: string;
  auth_id?: string | null;
  role: UserRole;
  nama: string;
  email: string;
  telepon?: string | null;
  kamar_id?: string | null;
  status: "AKTIF" | "NONAKTIF";
  created_at?: string;
  kamar?: {
    id: string;
    nomor_kamar: string;
    tipe_kamar: string;
    tarif_bulanan: number;
    status_hunian: string;
    tanggal_masuk?: string | null;
    tanggal_jatuh_tempo: number;
  } | null;
}

export interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  quickLogin: (username: string) => { success: boolean; error?: string };
  loginWithPassword: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  syncSupabaseSession: () => Promise<UserSession | null>;
  logout: () => Promise<void> | void;
  setHasHydrated: (state: boolean) => void;
}

