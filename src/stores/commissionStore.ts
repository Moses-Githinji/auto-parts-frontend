import { create } from "zustand";
import apiClient from "../lib/apiClient";
import type {
  CommissionConfig,
  CommissionConfigListResponse,
  FeeCalculationResponse,
  UpdateCommissionConfigRequest,
  CreateCommissionConfigRequest,
} from "../types/commission";

interface CommissionState {
  // Fee Preview State
  feePreview: FeeCalculationResponse | null;
  isCalculatingFees: boolean;
  feeError: string | null;

  // Config State
  configs: CommissionConfig[];
  currentConfig: CommissionConfig | null;
  isLoadingConfigs: boolean;
  configError: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  // Actions
  calculateFees: (price: number, categorySlug: string) => Promise<void>;
  fetchConfigs: (search?: string, page?: number) => Promise<void>;
  fetchConfig: (id: string) => Promise<void>;
  createConfig: (
    data: CreateCommissionConfigRequest
  ) => Promise<CommissionConfig>;
  updateConfig: (
    id: string,
    data: UpdateCommissionConfigRequest
  ) => Promise<CommissionConfig>;
  deleteConfig: (id: string) => Promise<void>;
  clearFeePreview: () => void;
  clearError: () => void;
}

const VAT_RATE = 0.16; // 16% VAT

export const useCommissionStore = create<CommissionState>((set) => ({
  feePreview: null,
  isCalculatingFees: false,
  feeError: null,
  configs: [],
  currentConfig: null,
  isLoadingConfigs: false,
  configError: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },

  calculateFees: async (price, categorySlug) => {
    if (price <= 0 || !categorySlug) {
      set({ feePreview: null, feeError: null });
      return;
    }

    set({ isCalculatingFees: true, feeError: null });

    try {
      const response = await apiClient.get<FeeCalculationResponse>(
        `/api/products/calculate-fees?price=${price}&categorySlug=${categorySlug}`
      );

      // Final safety check on response data
      if (!response || typeof response.price !== "number") {
        throw new Error("Invalid response format from fee calculation API");
      }

      set({
        feePreview: response,
        isCalculatingFees: false,
      });
    } catch (error) {
      console.warn("Fee calculation API failed, using fallback:", error);
      // If API fails, calculate locally as fallback
      const baseCommission = price * 0.08; // Default 8% rate
      const vatAmount = baseCommission * VAT_RATE;
      const totalDeductions = baseCommission + vatAmount;
      const vendorPayout = price - totalDeductions;

      const fallbackPreview: FeeCalculationResponse = {
        price,
        categorySlug,
        categoryName: categorySlug,
        baseCommission,
        commissionRate: 8,
        minFee: 50,
        maxFee: 2000,
        ruleType: "STANDARD",
        appliedFee: baseCommission,
        vatAmount,
        totalDeductions,
        vendorPayout,
        breakdown: {
          baseCommission,
          vatAmount,
        },
      };

      set({
        feePreview: fallbackPreview,
        isCalculatingFees: false,
        feeError: null,
      });
    }
  },

  fetchConfigs: async (search = "", page = 1) => {
    set({ isLoadingConfigs: true, configError: null });
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", "20");
      if (search) {
        params.append("search", search);
      }

      const response = await apiClient.get<CommissionConfigListResponse>(
        `/api/products/commission-config?${params.toString()}`
      );

      set({
        configs: response.configs,
        pagination: response.pagination,
        isLoadingConfigs: false,
      });
    } catch (error) {
      set({
        configError:
          error instanceof Error
            ? error.message
            : "Failed to fetch commission configs",
        isLoadingConfigs: false,
      });
    }
  },

  fetchConfig: async (id) => {
    set({ isLoadingConfigs: true, configError: null });
    try {
      const response = await apiClient.get<CommissionConfig>(
        `/api/products/commission-config/${id}`
      );
      set({
        currentConfig: response,
        isLoadingConfigs: false,
      });
    } catch (error) {
      set({
        configError:
          error instanceof Error
            ? error.message
            : "Failed to fetch commission config",
        isLoadingConfigs: false,
      });
    }
  },

  createConfig: async (data) => {
    set({ isLoadingConfigs: true, configError: null });
    try {
      const response = await apiClient.post<CommissionConfig>(
        "/api/products/commission-config",
        data
      );
      set((state) => ({
        configs: [response, ...(state.configs || [])],
        isLoadingConfigs: false,
      }));
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to create commission config";
      set({
        configError: message,
        isLoadingConfigs: false,
      });
      throw new Error(message);
    }
  },

  updateConfig: async (id, data) => {
    set({ isLoadingConfigs: true, configError: null });
    try {
      const response = await apiClient.put<CommissionConfig>(
        `/api/products/commission-config/${id}`,
        data
      );
      set((state) => ({
        configs: (state.configs || []).map((c) => (c.id === id ? response : c)),
        currentConfig:
          state.currentConfig?.id === id ? response : state.currentConfig,
        isLoadingConfigs: false,
      }));
      return response;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update commission config";
      set({
        configError: message,
        isLoadingConfigs: false,
      });
      throw new Error(message);
    }
  },

  deleteConfig: async (id) => {
    set({ isLoadingConfigs: true, configError: null });
    try {
      await apiClient.delete(`/api/products/commission-config/${id}`);
      set((state) => ({
        configs: (state.configs || []).filter((c) => c.id !== id),
        isLoadingConfigs: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete commission config";
      set({
        configError: message,
        isLoadingConfigs: false,
      });
      throw new Error(message);
    }
  },

  clearFeePreview: () => set({ feePreview: null, feeError: null }),
  clearError: () => set({ feeError: null, configError: null }),
}));
