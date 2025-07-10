import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, LoginCredentials, RegisterData } from "../types/api";
import { authApi } from "../utils/api";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authApi.login(credentials);

          // Store token in localStorage for API client
          localStorage.setItem("auth_token", response.token);

          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || "Login failed";
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      register: async (userData: RegisterData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await authApi.register(userData);

          // Store token in localStorage for API client
          localStorage.setItem("auth_token", response.token);

          set({
            user: response.user,
            token: response.token,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.message || "Registration failed";
          set({
            isLoading: false,
            error: errorMessage,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          // Try to logout from backend if we have a token
          if (get().token) {
            await authApi.logout();
          }
        } catch (error) {
          // Ignore logout errors - still clear local state
          console.warn("Logout API call failed:", error);
        } finally {
          // Always clear local state and localStorage
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          set({
            user: null,
            token: null,
            isLoading: false,
            error: null,
          });
        }
      },

      refreshUser: async () => {
        try {
          const token = get().token || localStorage.getItem("auth_token");
          if (!token) return;

          set({ isLoading: true });

          const response = await authApi.getUserProfile();

          set({
            user: response.data,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          // If refresh fails, logout user
          get().logout();
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// Convenience hooks
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => !!state.token);
export const useIsLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);

// External logout function for use in API interceptors
export const logoutUser = () => useAuthStore.getState().logout();
