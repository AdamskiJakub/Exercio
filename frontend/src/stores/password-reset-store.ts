import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PasswordResetState {
  email: string | null;
  setEmail: (email: string) => void;
  clearEmail: () => void;
}

/**
 * Store for password reset flow
 * Persists email between forgot-password and reset-password pages
 * Uses sessionStorage so it clears when browser closes
 */
export const usePasswordResetStore = create<PasswordResetState>()(
  persist(
    (set) => ({
      email: null,
      setEmail: (email: string) => set({ email }),
      clearEmail: () => set({ email: null }),
    }),
    {
      name: 'password-reset-storage',
      // Use sessionStorage instead of localStorage
      // This way the email is cleared when browser closes
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    }
  )
);
