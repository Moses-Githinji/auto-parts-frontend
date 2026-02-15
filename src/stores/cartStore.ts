import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, AddToCartRequest } from "../types/cart";

interface CartState {
  items: CartItem[];
  isLoading: boolean;
  error: string | null;
  addItem: (item: AddToCartRequest) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  itemCount: () => number;
  totalAmount: () => number;
  itemsByVendor: () => Map<string, CartItem[]>;
}

// Generate a unique ID for cart items
function generateCartItemId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      error: null,

      addItem: async (item) => {
        set({ isLoading: true, error: null });
        try {
          // Check if item is in stock
          if (item.stock !== undefined && item.stock <= 0) {
            throw new Error("Item is out of stock");
          }

          const existingItem = get().items.find(
            (i) => i.productId === item.productId && i.vendorId === item.vendorId
          );

          if (existingItem) {
            // Check if adding more exceeds stock
            if (item.stock !== undefined && existingItem.quantity + item.quantity > item.stock) {
              throw new Error(`Only ${item.stock} items available in stock`);
            }
            
            const updatedItems = get().items.map((i) =>
              i.productId === item.productId && i.vendorId === item.vendorId
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            );
            set({ items: updatedItems, isLoading: false });
          } else {
            // Add new item
            const newItem: CartItem = {
              id: generateCartItemId(),
              productId: item.productId,
              name: item.name,
              partNumber: item.productId,
              price: item.price,
              quantity: item.quantity,
              image: item.image,
              vendorId: item.vendorId,
              vendorName: item.vendorName,
              inStock: true,
              stock: item.stock, // Store stock for validation during updates
              currency: "KES",
              addedAt: new Date().toISOString(),
            };
            set((state) => ({
              items: [...state.items, newItem],
              isLoading: false,
            }));
          }
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
          await new Promise((resolve) => setTimeout(resolve, 50));

          if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            set((state) => ({
              items: state.items.filter((item) => item.id !== itemId),
              isLoading: false,
            }));
          } else {
            const item = get().items.find((i) => i.id === itemId);
            if (item && item.stock !== undefined && quantity > item.stock) {
              throw new Error(`Only ${item.stock} items available in stock`);
            }

            set((state) => ({
              items: state.items.map((item) =>
                item.id === itemId ? { ...item, quantity } : item,
              ),
              isLoading: false,
            }));
          }
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
          await new Promise((resolve) => setTimeout(resolve, 50));
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
          await new Promise((resolve) => setTimeout(resolve, 50));
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
    },
  ),
);
