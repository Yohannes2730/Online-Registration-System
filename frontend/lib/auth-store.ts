import { create } from "zustand";
import { useSession } from "./auth-client";

export interface User {
  id: string;
  email: string;
  name?: string;
  role: "user" | "admin";
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

export interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initializeAuth: () => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initializeAuth: async () => {
    try {
      const { data: session } = await useSession();
      if (session?.user) {
        set({
          user: session.user as User,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      console.error("Failed to initialize auth:", error);
      set({ isAuthenticated: false, isLoading: false });
    }
  },

  logout: async () => {
    try {
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  },

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
    });
  },
}));
