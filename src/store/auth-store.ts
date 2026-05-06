import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { mockUsers } from '@/data';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
  isAuthenticated: false,

  login: (email: string, _password: string) => {
    // Mock login – caută userul după email
    const foundUser = mockUsers.find((u) => u.email === email);
    if (foundUser) {
      set({ user: foundUser, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
