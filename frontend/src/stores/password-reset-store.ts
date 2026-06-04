import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
      // 2. Bezpieczne i oficjalne użycie sessionStorage przez Zustand
      storage: createJSONStorage(() => sessionStorage), 
    }
  )
);
