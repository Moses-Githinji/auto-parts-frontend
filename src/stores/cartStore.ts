import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "../types/cart";
import { cartItemKey } from "../types/cart";

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id"> & { id?: string }) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  totalAmount: () => number;
  itemsByVendor: () => Map<string, CartItem[]>;
}

function generateId(partNumber: string, vendorId: string): string {
  return cartItemKey({ partNumber, vendorId });
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (payload) => {
        const id =
          payload.id ?? generateId(payload.partNumber, payload.vendorId);
        set((state) => {
          const existing = state.items.find((i) => i.id === id);
          const newItems = existing
            ? state.items.map((i) =>
                i.id === id
                  ? { ...i, quantity: i.quantity + (payload.quantity ?? 1) }
                  : i,
              )
            : [
                ...state.items,
                {
                  ...payload,
                  id,
                  quantity: payload.quantity ?? 1,
                } as CartItem,
              ];
          return { items: newItems };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      clearCart: () => set({ items: [] }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalAmount: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

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
      name: "auto-parts-cart",
      partialize: (state) => ({ items: state.items }),
      skipHydration: true,
    },
  ),
);
