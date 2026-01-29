import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "../lib/apiClient";
import type {
  Order,
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
    data: UpdatePaymentStatusRequest,
  ) => Promise<Order>;
  cancelOrder: (orderId: string) => Promise<Order>;
  fetchOrderAnalytics: (
    vendorId: string,
    startDate?: string,
    endDate?: string,
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
            `/api/orders?${params.toString()}`,
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
            `/api/orders/${orderId}`,
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
          const response = await apiClient.post<{ order: Order }>(
            "/api/orders",
            data,
          );
          set((state) => ({
            orders: [response.order, ...state.orders],
            currentOrder: response.order,
            isLoading: false,
          }));
          return response.order;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to create order",
            isLoading: false,
          });
          throw error;
        }
      },

      updatePaymentStatus: async (orderId, data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.put<{ order: Order }>(
            `/api/orders/${orderId}/payment`,
            data,
          );
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? response.order : o,
            ),
            currentOrder:
              state.currentOrder?.id === orderId
                ? response.order
                : state.currentOrder,
            isLoading: false,
          }));
          return response.order;
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
          const response = await apiClient.put<{ order: Order }>(
            `/api/orders/${orderId}/cancel`,
          );
          set((state) => ({
            orders: state.orders.map((o) =>
              o.id === orderId ? response.order : o,
            ),
            currentOrder:
              state.currentOrder?.id === orderId
                ? response.order
                : state.currentOrder,
            isLoading: false,
          }));
          return response.order;
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to cancel order",
            isLoading: false,
          });
          throw error;
        }
      },

      fetchOrderAnalytics: async (vendorId, startDate, endDate) => {
        set({ isLoading: true, error: null });
        try {
          const params = new URLSearchParams();
          if (startDate) params.append("startDate", startDate);
          if (endDate) params.append("endDate", endDate);

          const response = await apiClient.get<OrderAnalytics>(
            `/api/orders/analytics/vendor/${vendorId}?${params.toString()}`,
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

      clearError: () => set({ error: null }),
    }),
    {
      name: "order-store",
      partialize: (state) => ({ orders: state.orders }),
    },
  ),
);
