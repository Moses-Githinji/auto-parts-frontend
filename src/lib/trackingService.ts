import apiClient from "./apiClient";
import type {
  TrackingInfo,
  GenerateTrackingResponse,
  UpdateStatusRequest,
  UpdateStatusResponse,
} from "../types/tracking";

const API_BASE = "/api/scan";

// Generate tracking QR code for an order
export async function generateTracking(
  orderId: string
): Promise<GenerateTrackingResponse> {
  return apiClient.post<GenerateTrackingResponse>(
    `${API_BASE}/generate/${orderId}`
  );
}

// Get tracking info by tracking ID (public endpoint)
export async function getTrackingInfo(
  trackingId: string
): Promise<TrackingInfo> {
  return apiClient.get<TrackingInfo>(`${API_BASE}/${trackingId}`);
}

// Update shipment status after scanning
export async function updateShipmentStatus(
  data: UpdateStatusRequest
): Promise<UpdateStatusResponse> {
  return apiClient.post<UpdateStatusResponse>(API_BASE, data);
}

// Parse QR code scanned data
export function parseQRCodeData(
  scannedData: string
): { trackingId: string; trackingUrl?: string; orderNumber?: string } | null {
  try {
    // Try parsing as JSON first
    const payload = JSON.parse(scannedData);
    if (payload.trackingId) {
      return {
        trackingId: payload.trackingId,
        trackingUrl: payload.trackingUrl,
        orderNumber: payload.orderNumber,
      };
    }
  } catch {
    // Not JSON, treat as plain tracking ID
  }

  // Check if it's a plain tracking ID
  const trackingId = scannedData.trim();
  if (/^TRK-[A-Z0-9]{3}-[A-Z0-9]{3}$/.test(trackingId)) {
    return {
      trackingId,
      trackingUrl: `https://autopartsstore.co.ke/track/${trackingId}`,
    };
  }

  return null;
}

// Get allowed next statuses based on current status
export function getAllowedNextStatuses(currentStatus: string): string[] {
  const transitions: Record<string, string[]> = {
    PENDING: ["PICKED_UP", "CANCELLED"],
    PICKED_UP: ["IN_TRANSIT", "RETURNED"],
    IN_TRANSIT: ["OUT_FOR_DELIVERY", "RETURNED"],
    OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
    DELIVERED: [],
    FAILED: ["RETURNED", "OUT_FOR_DELIVERY"],
    RETURNED: [],
    CANCELLED: [],
  };
  return transitions[currentStatus] || [];
}
