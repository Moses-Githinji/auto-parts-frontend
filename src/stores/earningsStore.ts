import { create } from "zustand";
import { apiClient } from "../lib/apiClient";

export interface Earning {
  id: string;
  netAmount: number;
  status: "PENDING" | "PROCESSED" | "PAID" | "DISPUTED" | "HELD";
  type?: "SALE" | "REFERRAL";
  createdAt: string;
  order: {
    orderNumber: string;
    customerName?: string;
    amount?: number;
  };
  // Previous fields kept as optional for backward compatibility if needed in UI
  amount?: number;
  commission?: number;
  gitFee?: number;
  netEarning?: number;
  paymentMethod?: string;
  deliveredAt?: string;
  confirmedAt?: string;
  paidOutAt?: string;
  daysUntilAutoConfirm?: number;
}

export interface PayoutHistory {
  id: string;
  amount: number;
  commission: number;
  gitFee: number;
  netAmount: number;
  orderCount: number;
  paidAt: string;
  paymentMethod: string;
  referenceNumber: string;
}

interface EarningsStore {
  totalEarnings: number;
  pendingEarnings: number;
  processedEarnings: number;
  paidEarnings: number;
  heldEarnings: number;
  earnings: Earning[];
  payoutHistory: PayoutHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;

  fetchEarnings: (page?: number) => Promise<void>;
  fetchPayoutHistory: () => Promise<void>;
  clearError: () => void;
}

export const useEarningsStore = create<EarningsStore>((set) => ({
  totalEarnings: 0,
  pendingEarnings: 0,
  processedEarnings: 0,
  paidEarnings: 0,
  heldEarnings: 0,
  earnings: [],
  payoutHistory: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  isLoading: false,
  error: null,

  fetchEarnings: async (page = 1) => {
    try {
      set({ isLoading: true, error: null });

      const response = await apiClient.get<{
        earnings: Earning[];
        totals: {
          PENDING: number;
          PROCESSED: number;
          PAID: number;
          HELD?: number;
        };
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>(`/api/vendors/earnings?page=${page}`);

      set({
        totalEarnings: (response.totals.PENDING + response.totals.PROCESSED + response.totals.PAID) || 0,
        pendingEarnings: response.totals.PENDING || 0,
        processedEarnings: response.totals.PROCESSED || 0,
        paidEarnings: response.totals.PAID || 0,
        heldEarnings: response.totals.HELD || 0,
        earnings: Array.isArray(response.earnings) ? response.earnings : [],
        pagination: response.pagination || { page: 1, limit: 20, total: 0, pages: 0 },
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to fetch earnings";
      set({ error: errorMessage, isLoading: false });
    }
  },

  fetchPayoutHistory: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await apiClient.get<{ payouts: PayoutHistory[] }>(
        "/api/vendors/payouts"
      );

      set({
        payoutHistory: Array.isArray(response?.payouts) ? response.payouts : [],
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to fetch payout history";
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
