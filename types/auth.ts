export type UserRole = "PEMILIK" | "PENGHUNI";

export interface UserSession {
  id: string;
  username: string;
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

export interface AuthState {
  user: UserSession | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (username: string, password: string) => { success: boolean; error?: string };
  quickLogin: (username: string) => { success: boolean; error?: string };
  logout: () => void;
  setHasHydrated: (state: boolean) => void;
}
