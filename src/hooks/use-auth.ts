import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
interface User {
  id: string;
  name: string;
  email: string;
}
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}
export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (user) => set({ isAuthenticated: true, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'aetherflow-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);