import { create } from "zustand";
import apiClient from "../lib/apiClient";
import type { VendorDashboardStats, Vendor } from "../types/vendor";

interface VendorState {
  stats: VendorDashboardStats["stats"] | null;
  profile: Vendor | null;
  isLoading: boolean;
  error: string | null;
  fetchDashboardStats: () => Promise<void>;
  fetchVendorProfile: () => Promise<void>;
}

export const useVendorStore = create<VendorState>((set) => ({
  stats: null,
  profile: null,
  isLoading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<any>(
        "/api/vendors/dashboard/stats"
      );
      // Backend might return { stats: { ... } } or { totalProducts: ..., health: ... }
      const stats = response.stats || response;
      set({ stats, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch dashboard stats",
        isLoading: false,
      });
    }
  },

  fetchVendorProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<{ vendor: Vendor }>(
        "/api/vendors/profile"
      );
      set({ profile: response.vendor, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || "Failed to fetch vendor profile",
        isLoading: false,
      });
    }
  },
}));
