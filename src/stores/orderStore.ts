import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Order } from "../types/order";

interface OrderStore {
  orders: Order[];
  addOrder: (order: Order) => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      addOrder: (order) =>
        set((state) => ({
          orders: [order, ...state.orders],
        })),
    }),
    {
      name: "order-store",
    },
  ),
);
