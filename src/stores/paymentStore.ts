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
    paymentReference?: string;
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
  
  checkOrderStatus: (orderId: string) => Promise<PaymentStatus>;
  
  startPolling: (transactionId: string, onComplete: (status: PaymentStatus) => void, isOrderId?: boolean) => void;
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

  checkOrderStatus: async (orderId) => {
    try {
      // In C2B, we check the order itself
      // Handle both wrapped { order: ... } and direct responses
      let response;
      try {
        response = await apiClient.get<any>(`/api/orders/${orderId}`);
      } catch (err: any) {
        // Fallback to public endpoint if 401 or session-less
        if (err.response?.status === 401) {
          console.log("Unauthorized, trying public guest endpoint...");
          response = await apiClient.get<any>(`/api/orders/group/${orderId}`);
        } else {
          throw err;
        }
      }

      const order = response.order || response.orderGroup || response;
      
      if (!order) {
        throw new Error("Order not found");
      }

      // Map order status to PaymentStatus format
      const status: PaymentStatus = {
        transactionId: orderId,
        status: order.paymentStatus === "PAID" ? "PAID" : "PENDING",
        provider: "mpesa", // C2B is always M-Pesa for this context
        amount: Number(order.totalAmount || order.total || 0),
        createdAt: order.createdAt,
        orderGroup: {
          id: order.id,
          orderNumber: order.orderNumber,
          paymentReference: order.paymentReference || order.orderGroup?.paymentReference,
          paymentStatus: order.paymentStatus,
        }
      };
      
      set({ paymentStatus: status, error: null });
      return status;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to check order status";
      set({ error: errorMessage });
      // Don't throw here to avoid unhandled rejections in polling
      return {
        transactionId: orderId,
        status: "PENDING",
        provider: "mpesa",
        amount: 0,
        createdAt: new Date().toISOString(),
      } as PaymentStatus;
    }
  },

  startPolling: (transactionId, onComplete, isOrderId = false) => {
    // Clear any existing polling
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    set({ isPolling: true });

    // Poll immediately
    const checkStatus = isOrderId ? get().checkOrderStatus : get().checkPaymentStatus;
    
    checkStatus(transactionId).then((status) => {
      if (status.status === "PAID" || status.status === "FAILED") {
        get().stopPolling();
        onComplete(status);
      }
    });

    // Then poll every 5 seconds (as per backend guidelines)
    pollingInterval = setInterval(async () => {
      try {
        const status = await checkStatus(transactionId);
        
        if (status.status === "PAID" || status.status === "FAILED") {
          get().stopPolling();
          onComplete(status);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 5000);

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
