import { create } from "zustand";
import { persist } from "zustand/middleware";

// Minimal user data returned by auth endpoints (login/register)
// Note: Does not include createdAt/updatedAt (those are in full User type)
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: "CLIENT" | "INSTRUCTOR" | "ADMIN" | "ENTERPRISE";
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl?: string | null; // Profile picture (from OAuth or upload)
  provider?: string | null; // "local" | "google" | "facebook" | "apple"
  isEmailVerified?: boolean; // Email verification status
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser) => void;
  logout: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      setAuth: (user) =>
        set({
          user,
          isAuthenticated: true,
        }),

      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
        }),

      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: "exercio-auth",
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          const { token, ...rest } = persistedState;
          return rest;
        }
        return persistedState;
      },
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
