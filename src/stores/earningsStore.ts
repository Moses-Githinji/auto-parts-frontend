import { create } from "zustand";
import { apiClient } from "../lib/apiClient";

export interface Earning {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  commission: number; // Platform commission (e.g. 8.5%)
  gitFee: number;     // GIT Risk Pool fee (e.g. 1.5%)
  netEarning: number;
  paymentMethod: "mpesa";
  status: "PENDING_DELIVERY" | "PENDING_CONFIRMATION" | "CONFIRMED" | "PAID_OUT" | "HELD";
  type?: "SALE" | "REFERRAL";
  deliveredAt?: string;
  confirmedAt?: string;
  paidOutAt?: string;
  daysUntilAutoConfirm?: number;
  createdAt: string;
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
  confirmedEarnings: number;
  paidEarnings: number;
  heldEarnings: number;
  earnings: Earning[];
  payoutHistory: PayoutHistory[];
  isLoading: boolean;
  error: string | null;

  fetchEarnings: () => Promise<void>;
  fetchPayoutHistory: () => Promise<void>;
  clearError: () => void;
}

export const useEarningsStore = create<EarningsStore>((set) => ({
  totalEarnings: 0,
  pendingEarnings: 0,
  confirmedEarnings: 0,
  paidEarnings: 0,
  heldEarnings: 0,
  earnings: [],
  payoutHistory: [],
  isLoading: false,
  error: null,

  fetchEarnings: async () => {
    try {
      set({ isLoading: true, error: null });

      const response = await apiClient.get<{
        totalEarnings: number;
        pendingEarnings: number;
        confirmedEarnings: number;
        paidEarnings: number;
        heldEarnings: number;
        earnings: Earning[];
      }>("/api/vendors/earnings");

      set({
        totalEarnings: response?.totalEarnings ?? 0,
        pendingEarnings: response?.pendingEarnings ?? 0,
        confirmedEarnings: response?.confirmedEarnings ?? 0,
        paidEarnings: response?.paidEarnings ?? 0,
        heldEarnings: response?.heldEarnings ?? 0,
        earnings: Array.isArray(response?.earnings) ? response.earnings : [],
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
