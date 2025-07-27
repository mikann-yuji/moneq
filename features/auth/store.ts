import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user?: User;
  dek?: CryptoKey;
  setUser: (user: User) => void;
  setDek: (dek: CryptoKey) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: undefined,
  dek: undefined,
  setUser: (user) => set({ user }),
  setDek: (dek) => set({ dek }),
  clear: () => set({ user: undefined, dek: undefined })
}));