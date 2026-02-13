import { create } from "zustand";
import { apiClient } from "../lib/apiClient";

export interface PaymentResponse {
  success: boolean;
  provider: "mpesa" | "stripe";
  transactionId: string;
  message?: string;
  checkoutRequestId?: string;
  clientSecret?: string;
  publishableKey?: string;
  pollUrl: string;
}

export interface PaymentStatus {
  transactionId: string;
  status: "PENDING" | "PAID" | "FAILED";
  provider: "mpesa" | "stripe";
  amount: number;
  mpesaReceiptNumber?: string;
  paidAt?: string;
  failureReason?: string;
  createdAt: string;
  orderGroup?: {
    id: string;
    orderNumber: string;
    paymentStatus: string;
  };
}

interface PaymentStore {
  currentTransaction: PaymentResponse | null;
  paymentStatus: PaymentStatus | null;
  isPolling: boolean;
  error: string | null;
  
  initiatePayment: (
    orderGroupId: string,
    paymentMethod: "mpesa" | "stripe",
    phoneNumber?: string
  ) => Promise<PaymentResponse>;
  
  checkPaymentStatus: (transactionId: string) => Promise<PaymentStatus>;
  
  startPolling: (transactionId: string, onComplete: (status: PaymentStatus) => void) => void;
  stopPolling: () => void;
  
  clearError: () => void;
  reset: () => void;
}

let pollingInterval: ReturnType<typeof setInterval> | null = null;

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  currentTransaction: null,
  paymentStatus: null,
  isPolling: false,
  error: null,

  initiatePayment: async (orderGroupId, paymentMethod, phoneNumber) => {
    try {
      set({ error: null });
      
      const payload: any = {
        orderGroupId,
        paymentMethod,
      };

      if (paymentMethod === "mpesa" && phoneNumber) {
        payload.phoneNumber = phoneNumber;
      }

      const response = await apiClient.post<PaymentResponse>(
        "/api/payments/initiate",
        payload
      );

      set({ currentTransaction: response });
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to initiate payment";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  checkPaymentStatus: async (transactionId) => {
    try {
      const response = await apiClient.get<PaymentStatus>(
        `/api/payments/${transactionId}/status`
      );
      
      set({ paymentStatus: response });
      return response;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Failed to check payment status";
      set({ error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  startPolling: (transactionId, onComplete) => {
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    set({ isPolling: true });

    // Poll immediately
    get().checkPaymentStatus(transactionId).then((status) => {
      if (status.status === "PAID" || status.status === "FAILED") {
        get().stopPolling();
        onComplete(status);
      }
    });

    // Then poll every 3 seconds
    pollingInterval = setInterval(async () => {
      try {
        const status = await get().checkPaymentStatus(transactionId);
        
        if (status.status === "PAID" || status.status === "FAILED") {
          get().stopPolling();
          onComplete(status);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 3000);

    // Stop polling after 5 minutes (timeout)
    setTimeout(() => {
      if (get().isPolling) {
        get().stopPolling();
        set({ 
          error: "Payment timeout. Please check your order status.",
          paymentStatus: {
            ...get().paymentStatus!,
            status: "FAILED",
            failureReason: "Timeout - payment not completed within 5 minutes"
          }
        });
        onComplete(get().paymentStatus!);
      }
    }, 5 * 60 * 1000);
  },

  stopPolling: () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    set({ isPolling: false });
  },

  clearError: () => set({ error: null }),

  reset: () => {
    get().stopPolling();
    set({
      currentTransaction: null,
      paymentStatus: null,
      isPolling: false,
      error: null,
    });
  },
}));
