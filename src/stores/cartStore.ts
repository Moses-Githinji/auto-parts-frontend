import { create } from "zustand";
import { persist } from "zustand/middleware";
import apiClient from "../lib/apiClient";
import type {
  CartItem,
  CartListResponse,
  AddToCartRequest,
} from "../types/cart";

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
  fetchCart: () => Promise<void>;
  addItem: (item: AddToCartRequest) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: () => number;
  totalAmount: () => number;
  itemsByVendor: () => Map<string, CartItem[]>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,
      isInitialized: false,

      fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.get<CartListResponse>("/api/cart");
          set({
            items: response.data || [],
            isLoading: false,
            isInitialized: true,
          });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to fetch cart",
            isLoading: false,
          });
        }
      },

      addItem: async (item) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.post<CartItem>("/api/cart", item);
          set((state) => ({
            items: [...state.items, response],
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to add item",
            isLoading: false,
          });
          throw error;
        }
      },

      updateQuantity: async (itemId, quantity) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.patch<CartItem>(
            `/api/cart/${itemId}`,
            { quantity },
          );
          set((state) => ({
            items: state.items.map((item) =>
              item.id === itemId ? response : item,
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : "Failed to update quantity",
            isLoading: false,
          });
          throw error;
        }
      },

      removeItem: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.delete(`/api/cart/${itemId}`);
          set((state) => ({
            items: state.items.filter((item) => item.id !== itemId),
            isLoading: false,
          }));
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to remove item",
            isLoading: false,
          });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          await apiClient.delete("/api/cart");
          set({ items: [], isLoading: false });
        } catch (error) {
          set({
            error:
              error instanceof Error ? error.message : "Failed to clear cart",
            isLoading: false,
          });
          throw error;
        }
      },

      itemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),

      totalAmount: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      itemsByVendor: () => {
        const map = new Map<string, CartItem[]>();
        for (const item of get().items) {
          const list = map.get(item.vendorId) ?? [];
          list.push(item);
          map.set(item.vendorId, list);
        }
        return map;
      },
    }),
    {
      name: "cart-store",
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);
