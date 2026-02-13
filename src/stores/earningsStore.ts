import { create } from "zustand";
import { apiClient } from "../lib/apiClient";

export interface Earning {
  id: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  commission: number;
  netEarning: number;
  paymentMethod: "mpesa" | "stripe";
  status: "PENDING_DELIVERY" | "PENDING_CONFIRMATION" | "CONFIRMED" | "PAID_OUT" | "HELD";
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
        totalEarnings: response.totalEarnings,
        pendingEarnings: response.pendingEarnings,
        confirmedEarnings: response.confirmedEarnings,
        paidEarnings: response.paidEarnings,
        heldEarnings: response.heldEarnings,
        earnings: response.earnings,
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
        payoutHistory: response.payouts,
        isLoading: false,
      });
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to fetch payout history";
      set({ error: errorMessage, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
