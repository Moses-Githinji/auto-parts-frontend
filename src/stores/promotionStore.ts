import { create } from "zustand";
import { apiClient } from "../lib/apiClient";
import type { CommissionPromotion } from "../types/vendor";

interface PromotionState {
  promotions: CommissionPromotion[];
  isLoading: boolean;
  error: string | null;
  fetchPromotions: () => Promise<void>;
  getActivePromotion: () => CommissionPromotion | null;
}

export const usePromotionStore = create<PromotionState>((set, get) => ({
  promotions: [],
  isLoading: false,
  error: null,

  fetchPromotions: async () => {
    set({ isLoading: true, error: null });
    try {
      // Use the new public endpoint
      const response = await apiClient.get<CommissionPromotion[]>("/api/promotions/public");
      console.log("DEBUG: PromotionStore: Fetched public promotions:", response);
      set({ promotions: response, isLoading: false });
    } catch (error: any) {
      console.error("DEBUG: PromotionStore: Fetch error:", error);
      set({ 
        error: error.response?.data?.message || "Failed to fetch promotions", 
        isLoading: false 
      });
    }
  },

  getActivePromotion: () => {
    const { promotions } = get();
    if (promotions.length === 0) return null;

    const now = new Date();
    
    // Only find promotions that are currently active
    return promotions.find(p => {
      const start = new Date(p.startDate);
      const end = p.endDate ? new Date(p.endDate) : null;
      return p.isActive && now >= start && (!end || now <= end);
    }) || null;
  }
}));
