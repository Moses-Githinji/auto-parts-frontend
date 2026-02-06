// Shipment Status Types
export type ShipmentStatus =
  | "PENDING"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "RETURNED"
  | "CANCELLED";

// Status transition map - which statuses can follow which
export const STATUS_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  PENDING: ["PICKED_UP", "CANCELLED"],
  PICKED_UP: ["IN_TRANSIT", "RETURNED"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY", "RETURNED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
  DELIVERED: [],
  FAILED: ["RETURNED", "OUT_FOR_DELIVERY"],
  RETURNED: [],
  CANCELLED: [],
};

// Status display configuration
export const STATUS_CONFIG: Record<
  ShipmentStatus,
  { icon: string; description: string; color: string }
> = {
  PENDING: {
    icon: "📦",
    description: "Package is awaiting pickup",
    color: "#6b7280", // Gray
  },
  PICKED_UP: {
    icon: "📬",
    description: "Package has been picked up by courier",
    color: "#3b82f6", // Blue
  },
  IN_TRANSIT: {
    icon: "🚚",
    description: "Package is on its way",
    color: "#f59e0b", // Amber
  },
  OUT_FOR_DELIVERY: {
    icon: "🛵",
    description: "Package is out for delivery",
    color: "#10b981", // Emerald
  },
  DELIVERED: {
    icon: "✅",
    description: "Package has been delivered",
    color: "#059669", // Green
  },
  FAILED: {
    icon: "❌",
    description: "Delivery attempt failed",
    color: "#dc2626", // Red
  },
  RETURNED: {
    icon: "↩️",
    description: "Package has been returned to sender",
    color: "#7c3aed", // Purple
  },
  CANCELLED: {
    icon: "❌",
    description: "Package shipment has been cancelled",
    color: "#6b7280", // Gray
  },
};

// Progress percentage based on status
export const STATUS_PROGRESS: Record<ShipmentStatus, number> = {
  PENDING: 0,
  PICKED_UP: 25,
  IN_TRANSIT: 50,
  OUT_FOR_DELIVERY: 75,
  DELIVERED: 100,
  FAILED: 75,
  RETURNED: 50,
  CANCELLED: 0,
};

// Location type for scan events
export interface ScanLocation {
  lat: number;
  lng: number;
}

// Scan event in the history
export interface ScanEvent {
  status: ShipmentStatus;
  location: ScanLocation | null;
  notes: string | null;
  timestamp: string;
}

// Scan event response from API
export interface ScanEventResponse {
  status: ShipmentStatus;
  location?: { lat: number; lng: number } | null;
  notes?: string | null;
  timestamp: string;
}

// Tracking response from GET /api/scan/:trackingId
export interface TrackingInfo {
  trackingId: string;
  currentStatus: ShipmentStatus;
  orderNumber: string;
  customerName: string;
  scanHistory: ScanEvent[];
}

// Generate tracking response
export interface GenerateTrackingResponse {
  success: boolean;
  reconciliation: {
    id: string;
    trackingId: string;
    currentStatus: ShipmentStatus;
    qrCodeDataUri: string;
    trackingUrl: string;
  };
}

// Update status request body
export interface UpdateStatusRequest {
  trackingId: string;
  status: ShipmentStatus;
  lat?: number;
  lng?: number;
  notes?: string;
}

// Update status response
export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  scan: {
    id: string;
    trackingId: string;
    status: ShipmentStatus;
    timestamp: string;
  };
  reconciliation: {
    id: string;
    currentStatus: ShipmentStatus;
  };
}

// QR Code payload format
export interface QRCodePayload {
  trackingId: string;
  trackingUrl: string;
  orderNumber?: string;
}

// Tracking validation regex
export const TRACKING_ID_REGEX = /^TRK-[A-Z0-9]{3}-[A-Z0-9]{3}$/;

// Validate tracking ID format
export function isValidTrackingId(id: string): boolean {
  return TRACKING_ID_REGEX.test(id);
}
