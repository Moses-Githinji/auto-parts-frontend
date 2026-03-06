export type DisputeStatus = "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";
export type DisputeResolution = "VENDOR" | "CUSTOMER";

export interface Dispute {
  id: string;
  orderId: string;
  orderNumber: string;
  vendorId: string;
  vendorName: string;
  customerId: string;
  customerName: string;
  status: DisputeStatus;
  reason: string;
  amount: number;
  resolution?: DisputeResolution;
  resolutionNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PoolHealth {
  totalPoolFunds: number;
  claimsPaid: number;
  investments: number;
  liquidity: number;
  healthStatus: "GOOD" | "WARNING" | "CRITICAL";
  lastUpdated: string;
}

export interface PoolInvestmentRequest {
  amount: number;
  source: "EXTERNAL" | "PLATFORM_PROFITS" | "RESERVE_FUND";
  note?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorType: "ADMIN" | "VENDOR" | "USER" | "STAFF";
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
  amount?: number; // Kept for backward compatibility with financial logs
  adminName?: string; // Kept for backward compatibility
  createdAt: string;
}

export interface DisputeResolutionRequest {
  resolution: DisputeResolution;
  note: string;
}
