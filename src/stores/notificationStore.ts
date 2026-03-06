import { create } from "zustand";
import { apiClient } from "../lib/apiClient";
import type { VendorNotification } from "../types/vendor";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationState {
  notifications: Notification[];
  toasts: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => string;
  removeNotification: (id: string) => void;
  addToast: (toast: Omit<Notification, "id">) => string;
  removeToast: (id: string) => void;
  vendorNotifications: VendorNotification[];
  fetchVendorNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  clearAll: () => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  toasts: [],

  addNotification: (notification) => {
    const id = generateId();
    set((state) => ({
      notifications: [{ ...notification, id }, ...state.notifications],
    }));
    return id;
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  addToast: (toast) => {
    const id = generateId();
    const duration = toast.duration ?? 5000;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }

    return id;
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  vendorNotifications: [],

  fetchVendorNotifications: async () => {
    try {
      const response = await apiClient.get<VendorNotification[]>("/api/vendors/notifications");
      set({ vendorNotifications: Array.isArray(response) ? response : [] });
    } catch (error) {
      console.error("Failed to fetch vendor notifications:", error);
      set({ vendorNotifications: [] });
    }
  },

  markAsRead: async (id) => {
    try {
      await apiClient.post(`/api/vendors/notifications/${id}/read`);
      set((state) => ({
        vendorNotifications: Array.isArray(state.vendorNotifications) 
          ? state.vendorNotifications.map((n) =>
              n.id === id ? { ...n, read: true } : n
            )
          : [],
      }));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  },

  clearAll: () => {
    set({ notifications: [], toasts: [] });
  },
}));

// Helper functions for common notifications
export const notify = {
  success: (title: string, message?: string) => {
    return useNotificationStore.getState().addToast({
      type: "success",
      title,
      message,
    });
  },
  error: (title: string, message?: string) => {
    return useNotificationStore.getState().addToast({
      type: "error",
      title,
      message,
    });
  },
  warning: (title: string, message?: string) => {
    return useNotificationStore.getState().addToast({
      type: "warning",
      title,
      message,
    });
  },
  info: (title: string, message?: string) => {
    return useNotificationStore.getState().addToast({
      type: "info",
      title,
      message,
    });
  },
};
