// Commission Rule Types
export type CommissionRuleType = "STANDARD" | "FLOOR" | "CAP";

// Commission Configuration
export interface CommissionConfig {
  id: string;
  name: string;
  categorySlug: string;
  commissionRate: number; // Percentage (e.g., 8.5 for 8.5%)
  minFee: number; // Floor value in KES
  maxFee: number; // Cap value in KES
  ruleType: CommissionRuleType;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Fee Calculation Request
export interface FeeCalculationRequest {
  price: number;
  categorySlug: string;
}

// Fee Calculation Response
export interface FeeCalculationResponse {
  price: number;
  categorySlug: string;
  categoryName: string;
  baseCommission: number;
  commissionRate: number;
  minFee: number;
  maxFee: number;
  ruleType: CommissionRuleType;
  appliedFee: number;
  totalDeductions: number;
  vendorPayout: number;
  breakdown: {
    baseCommission: number;
    floorAdjustment?: number;
    capAdjustment?: number;
    gitFee: number;
  };
}

// Commission Config List Response
export interface CommissionConfigListResponse {
  configs: CommissionConfig[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Create Commission Config Request
export interface CreateCommissionConfigRequest {
  name: string;
  categorySlug: string;
  commissionRate: number;
  minFee: number;
  maxFee: number;
  ruleType: CommissionRuleType;
  isActive: boolean;
}

// Update Commission Config Request
export interface UpdateCommissionConfigRequest {
  commissionRate?: number;
  minFee?: number;
  maxFee?: number;
  ruleType?: CommissionRuleType;
  isActive?: boolean;
}

// Commission Summary for Order
export interface OrderCommissionSummary {
  orderId: string;
  orderAmount: number;
  commissionRate: number;
  marketplaceFee: number;
  gitFee: number;
  vendorPayout: number;
}
