import { create } from "zustand";
import { apiClient } from "../lib/apiClient";
import type { StaffUser } from "../types/user";

interface StaffState {
  staff: StaffUser[];
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchStaff: () => Promise<void>;
  createStaff: (data: Partial<StaffUser> & { password?: string }) => Promise<void>;
  updateStaff: (id: string, data: Partial<StaffUser>) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staff: [],
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchStaff: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<{ staff: StaffUser[] }>("/api/admin/staff");
      set({ staff: Array.isArray(response.staff) ? response.staff : [], isLoading: false });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.error || "Failed to fetch staff", 
        isLoading: false 
      });
    }
  },

  createStaff: async (data) => {
    set({ isSubmitting: true, error: null });
    try {
      await apiClient.post("/api/admin/staff", data);
      await get().fetchStaff();
      set({ isSubmitting: false });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.error || "Failed to create staff member", 
        isSubmitting: false 
      });
      throw err;
    }
  },

  updateStaff: async (id, data) => {
    set({ isSubmitting: true, error: null });
    try {
      await apiClient.put(`/api/admin/staff/${id}`, data);
      await get().fetchStaff();
      set({ isSubmitting: false });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.error || "Failed to update staff member", 
        isSubmitting: false 
      });
      throw err;
    }
  },

  deleteStaff: async (id) => {
    set({ isSubmitting: true, error: null });
    try {
      await apiClient.delete(`/api/admin/staff/${id}`);
      await get().fetchStaff();
      set({ isSubmitting: false });
    } catch (err: any) {
      set({ 
        error: err.response?.data?.error || "Failed to delete staff member", 
        isSubmitting: false 
      });
      throw err;
    }
  },
}));
