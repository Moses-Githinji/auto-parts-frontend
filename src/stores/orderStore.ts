import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "../lib/apiClient";
import type {
  Order,
  OrderStatus,
  OrderListResponse,
  CreateOrderRequest,
  UpdatePaymentStatusRequest,
  OrderAnalytics,
} from "../types/order";

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  isLoading: boolean;
  error: string | null;
  fetchOrders: (filters?: {
    page?: number;
    limit?: number;
    status?: string;
  }) => Promise<void>;
  fetchOrder: (orderId: string) => Promise<void>;
  createOrder: (data: CreateOrderRequest) => Promise<Order>;
  updatePaymentStatus: (
    orderId: string,
    data: UpdatePaymentStatusRequest
  ) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<Order>;
  deleteOrder: (orderId: string) => Promise<void>;
  updateOrderStatus: (
    orderId: string,
    status: OrderStatus,
    data?: Record<string, unknown>
  ) => Promise<Order>;
  sendOrderNotification: (
    orderId: string,
    notificationType: "shipped" | "delivered" | "out_for_delivery"
  ) => Promise<void>;
  fetchOrderAnalytics: (
    vendorId: string,
    filters?: {
      duration?: string;
      startDate?: string;
      endDate?: string;
    }
  ) => Promise<OrderAnalytics>;
  clearError: () => void;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: [],
      currentOrder: null,
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
      },
      isLoading: false,
      error: null,

      fetchOrders: async (filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
              params.append(key, String(value));
            }
          });

          const response = await apiClient.get<OrderListResponse>(
            `/api/orders?${params.toString()}`
          );
          set({
            orders: response.orders,
            pagination: response.pagination,
            isLoading: false,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch orders",
            isLoading: false,
          });
        }
      },

      fetchOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get<{ order: Order }>(
            `/api/orders/${orderId}`
          );
          set({ currentOrder: response.order, isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch order",
            isLoading: false,
          });
        }
      },

      createOrder: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<{
            order?: Order;
            orders?: Order[];
          }>("/api/orders", data);

          const newOrders =
            response.orders || (response.order ? [response.order] : []);

          set((state) => ({
            orders: [...newOrders, ...state.orders],
            currentOrder: newOrders[0] || null,
            isLoading: false,
          }));
          return newOrders[0];
        } catch (error) {
          // Extract error message from backend response if available
          let errorMessage = "Failed to create order";
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          // Check if it's an axios error with response data
          const axiosError = error as {
            response?: { data?: { error?: string } };
          };
          if (axiosError.response?.data?.error) {
            errorMessage = axiosError.response.data.error;
          }
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw new Error(errorMessage);
        }
      },

      updatePaymentStatus: async (orderId, data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.put<any>(
            `/api/orders/${orderId}/payment`,
            data
          );
          const updatedOrder = response.order || response;
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? updatedOrder : o
            ),
            currentOrder:
              state.currentOrder?.id === orderId
                ? updatedOrder
                : state.currentOrder,
            isLoading: false,
          }));
          return updatedOrder;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update payment status",
            isLoading: false,
          });
          throw error;
        }
      },

      cancelOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.put<any>(
            `/api/orders/${orderId}/cancel`
          );
          const updatedOrder = response.order || response;
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? updatedOrder : o
            ),
            currentOrder:
              state.currentOrder?.id === orderId
                ? updatedOrder
                : state.currentOrder,
            isLoading: false,
          }));
          return updatedOrder;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to cancel order",
            isLoading: false,
          });
          throw error;
        }
      },

      updateOrderStatus: async (orderId, status, data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.put<any>(
            `/api/orders/${orderId}/status`,
            { status, ...data }
          );
          const updatedOrder = response.order || response;
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? updatedOrder : o
            ),
            currentOrder:
              state.currentOrder?.id === orderId
                ? updatedOrder
                : state.currentOrder,
            isLoading: false,
          }));
          return updatedOrder;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update order status",
            isLoading: false,
          });
          throw error;
        }
      },

      sendOrderNotification: async (orderId, notificationType) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.post(`/api/orders/${orderId}/notify`, {
            type: notificationType,
          });
          set({ isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to send notification",
            isLoading: false,
          });
          throw error;
        }
      },

      fetchOrderAnalytics: async (vendorId, filters = {}) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (filters.duration) params.append("duration", filters.duration);
          if (filters.startDate) params.append("startDate", filters.startDate);
          if (filters.endDate) params.append("endDate", filters.endDate);

          const response = await apiClient.get<OrderAnalytics>(
            `/api/orders/analytics/vendor/${vendorId}?${params.toString()}`
          );
          set({ isLoading: false });
          return response;
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to fetch analytics",
            isLoading: false,
          });
          throw error;
        }
      },

      deleteOrder: async (orderId) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.delete(`/api/orders/${orderId}`);
          set((state) => ({
            orders: state.orders.filter((o) => o.id !== orderId),
            currentOrder:
              state.currentOrder?.id === orderId ? null : state.currentOrder,
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to delete order",
            isLoading: false,
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "order-store",
      partialize: (state) => ({ orders: state.orders }),
    }
  )
);
