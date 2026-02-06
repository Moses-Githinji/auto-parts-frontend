import { create } from "zustand";
import { notify } from "./notificationStore";
import {
  generateTracking as generateTrackingApi,
  getTrackingInfo as getTrackingInfoApi,
  updateShipmentStatus as updateShipmentStatusApi,
} from "../lib/trackingService";
import type {
  TrackingInfo,
  GenerateTrackingResponse,
  UpdateStatusRequest,
  UpdateStatusResponse,
} from "../types/tracking";

interface TrackingState {
  // Tracking info state
  trackingInfo: TrackingInfo | null;
  isLoadingTracking: boolean;
  trackingError: string | null;

  // Generate tracking state
  isGeneratingTracking: boolean;
  generatedTracking: GenerateTrackingResponse["reconciliation"] | null;
  generateError: string | null;

  // Update status state
  isUpdatingStatus: boolean;
  updateStatusError: string | null;

  // Actions
  fetchTrackingInfo: (trackingId: string) => Promise<void>;
  generateTracking: (
    orderId: string
  ) => Promise<GenerateTrackingResponse["reconciliation"] | null>;
  updateStatus: (data: UpdateStatusRequest) => Promise<boolean>;
  clearTrackingInfo: () => void;
  clearGeneratedTracking: () => void;
  clearErrors: () => void;
}

export const useTrackingStore = create<TrackingState>((set, get) => ({
  // Initial state
  trackingInfo: null,
  isLoadingTracking: false,
  trackingError: null,
  isGeneratingTracking: false,
  generatedTracking: null,
  generateError: null,
  isUpdatingStatus: false,
  updateStatusError: null,

  // Actions
  fetchTrackingInfo: async (trackingId: string) => {
    set({ isLoadingTracking: true, trackingError: null });
    try {
      const trackingInfo = await getTrackingInfoApi(trackingId);
      set({ trackingInfo, isLoadingTracking: false });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch tracking info";
      set({ trackingError: errorMessage, isLoadingTracking: false });
      notify.error(errorMessage);
    }
  },

  generateTracking: async (orderId: string) => {
    set({ isGeneratingTracking: true, generateError: null });
    try {
      const response = await generateTrackingApi(orderId);
      set({
        generatedTracking: response.reconciliation,
        isGeneratingTracking: false,
      });
      notify.success("Tracking QR code generated successfully");
      return response.reconciliation;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate tracking";
      set({ generateError: errorMessage, isGeneratingTracking: false });
      notify.error(errorMessage);
      return null;
    }
  },

  updateStatus: async (data: UpdateStatusRequest) => {
    set({ isUpdatingStatus: true, updateStatusError: null });
    try {
      const response = (await updateShipmentStatusApi(
        data
      )) as UpdateStatusResponse;
      set({ isUpdatingStatus: false });
      notify.success("Shipment status updated successfully");

      // Update tracking info if we have one
      const currentState = get();
      if (currentState.trackingInfo?.trackingId === data.trackingId) {
        set({
          trackingInfo: {
            ...currentState.trackingInfo,
            currentStatus: response.reconciliation.currentStatus,
          },
        });
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update status";
      set({ updateStatusError: errorMessage, isUpdatingStatus: false });
      notify.error(errorMessage);
      return false;
    }
  },

  clearTrackingInfo: () => {
    set({ trackingInfo: null, trackingError: null });
  },

  clearGeneratedTracking: () => {
    set({ generatedTracking: null, generateError: null });
  },

  clearErrors: () => {
    set({ trackingError: null, generateError: null, updateStatusError: null });
  },
}));

// Selector hooks for specific state slices
export const useTrackingInfo = () =>
  useTrackingStore((state) => state.trackingInfo);
export const useIsLoadingTracking = () =>
  useTrackingStore((state) => state.isLoadingTracking);
export const useTrackingError = () =>
  useTrackingStore((state) => state.trackingError);
export const useGeneratedTracking = () =>
  useTrackingStore((state) => state.generatedTracking);
export const useIsGeneratingTracking = () =>
  useTrackingStore((state) => state.isGeneratingTracking);
export const useIsUpdatingStatus = () =>
  useTrackingStore((state) => state.isUpdatingStatus);
