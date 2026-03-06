import { create } from "zustand";
import { apiClient } from "../lib/apiClient";
import type { 
  Dispute, 
  PoolHealth, 
  AuditLog, 
  DisputeResolutionRequest,
  PoolInvestmentRequest 
} from "../types/finance";

interface FinanceState {
  // Disputes
  disputes: Dispute[];
  isLoadingDisputes: boolean;
  disputeError: string | null;

  // Pool Health
  poolHealth: PoolHealth | null;
  isLoadingPool: boolean;
  poolError: string | null;

  // Audit Logs
  auditLogs: AuditLog[];
  vendorLogs: AuditLog[];
  isLoadingLogs: boolean;
  logError: string | null;

  // Actions
  fetchDisputes: (status?: string) => Promise<void>;
  resolveDispute: (id: string, data: DisputeResolutionRequest) => Promise<void>;
  fetchPoolHealth: () => Promise<void>;
  investPoolFunds: (data: PoolInvestmentRequest) => Promise<void>;
  fetchAuditLogs: (page?: number) => Promise<void>;
  fetchVendorLogs: (vendorId: string) => Promise<void>;
}

export const useFinanceStore = create<FinanceState>((set, get) => ({
  disputes: [],
  isLoadingDisputes: false,
  disputeError: null,

  poolHealth: null,
  isLoadingPool: false,
  poolError: null,

  auditLogs: [],
  vendorLogs: [],
  isLoadingLogs: false,
  logError: null,

  fetchDisputes: async (status) => {
    set({ isLoadingDisputes: true, disputeError: null });
    try {
      const url = status ? `/api/admin/disputes?status=${status}` : "/api/admin/disputes";
      const response = await apiClient.get<Dispute[]>(url);
      set({ disputes: Array.isArray(response) ? response : [], isLoadingDisputes: false });
    } catch (err: any) {
      set({ 
        disputeError: err.response?.data?.error || "Failed to fetch disputes", 
        isLoadingDisputes: false 
      });
    }
  },

  resolveDispute: async (id, data) => {
    set({ isLoadingDisputes: true, disputeError: null });
    try {
      await apiClient.post(`/api/admin/disputes/${id}/resolve`, data);
      await get().fetchDisputes(); // Refresh
    } catch (err: any) {
      set({ 
        disputeError: err.response?.data?.error || "Failed to resolve dispute", 
        isLoadingDisputes: false 
      });
      throw err;
    }
  },

  fetchPoolHealth: async () => {
    set({ isLoadingPool: true, poolError: null });
    try {
      const response = await apiClient.get<PoolHealth>("/api/admin/finances/pool-health");
      set({ poolHealth: response, isLoadingPool: false });
    } catch (err: any) {
      set({ 
        poolError: err.response?.data?.error || "Failed to fetch pool health", 
        isLoadingPool: false 
      });
    }
  },

  investPoolFunds: async (data) => {
    set({ isLoadingPool: true, poolError: null });
    try {
      await apiClient.post("/api/admin/finances/pool-invest", data);
      await get().fetchPoolHealth(); // Refresh
    } catch (err: any) {
      set({ 
        poolError: err.response?.data?.error || "Failed to invest pool funds", 
        isLoadingPool: false 
      });
      throw err;
    }
  },

  fetchAuditLogs: async (page = 1) => {
    set({ isLoadingLogs: true, logError: null });
    try {
      // The guide says GET /api/admin/audit-logs returns all system activity
      const response = await apiClient.get<{ logs: AuditLog[] }>(`/api/admin/audit-logs?page=${page}`);
      set({ auditLogs: Array.isArray(response.logs) ? response.logs : [], isLoadingLogs: false });
    } catch (err: any) {
      set({ 
        logError: err.response?.data?.error || "Failed to fetch audit logs", 
        isLoadingLogs: false 
      });
    }
  },

  fetchVendorLogs: async (vendorId: string) => {
    set({ isLoadingLogs: true, logError: null });
    try {
      const response = await apiClient.get<AuditLog[]>(`/api/admin/vendors/${vendorId}/logs`);
      set({ vendorLogs: Array.isArray(response) ? response : [], isLoadingLogs: false });
    } catch (err: any) {
      set({ 
        logError: err.response?.data?.error || "Failed to fetch vendor logs", 
        isLoadingLogs: false 
      });
    }
  },
}));
