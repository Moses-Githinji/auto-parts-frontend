import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient, { getToken, setToken, removeToken } from "../lib/apiClient";
import type {
  User,
  UserRegistrationRequest,
  UserLoginRequest,
  AuthResponse,
  UserProfile,
  VendorProfile,
} from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: UserLoginRequest) => Promise<void>;
  register: (data: UserRegistrationRequest) => Promise<void>;
  logout: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<AuthResponse>(
            "/api/auth/login",
            credentials,
          );
          const { user, token } = response;
          setToken(token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Login failed";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<AuthResponse>(
            "/api/auth/register",
            data,
          );
          const { user, token } = response;
          setToken(token);
          set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Registration failed";
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await apiClient.post("/api/auth/logout");
        } catch {
          // Continue with logout even if API call fails
        } finally {
          removeToken();
          set({ user: null, token: null, isAuthenticated: false });
        }
      },

      fetchProfile: async () => {
        const token = getToken();
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await apiClient.get<UserProfile | VendorProfile>(
            "/api/auth/profile",
          );
          const profile = response;

          if ("user" in profile) {
            set({
              user: profile.user,
              isAuthenticated: true,
              isLoading: false,
            });
          }
        } catch (error) {
          removeToken();
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      clearError: () => set({ error: null }),

      initializeAuth: () => {
        const token = getToken();
        if (token) {
          set({ token, isAuthenticated: true });
          get().fetchProfile();
        }
      },
    }),
    {
      name: "auth-store",
      partialize: (state) => ({
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
