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
  vatAmount: number;
  totalDeductions: number;
  vendorPayout: number;
  breakdown: {
    baseCommission: number;
    floorAdjustment?: number;
    capAdjustment?: number;
    vatAmount: number;
  };
}

// VAT Configuration
export interface VatConfig {
  rate: number; // 16 for 16%
  name: string;
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

// Update Commission Config Request
export interface UpdateCommissionConfigRequest {
  commissionRate?: number;
  minFee?: number;
  maxFee?: number;
  ruleType?: CommissionRuleType;
  isActive?: boolean;
}

// Create Commission Config Request
export interface CreateCommissionConfigRequest {
  name: string;
  slug: string;
  commissionRate?: number;
  minFee?: number;
  maxFee?: number;
  ruleType?: CommissionRuleType;
  parentId?: string;
}

// Commission Summary for Order
export interface OrderCommissionSummary {
  orderId: string;
  orderAmount: number;
  commissionRate: number;
  marketplaceFee: number;
  vatAmount: number;
  vendorPayout: number;
}

// Commission Stats Response
export interface CommissionStatsResponse {
  totalCommissionEarned: number;
  avgCommissionRate: number;
  totalOrders: number;
  pendingPayouts: number;
  commissionByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
}

// Fee Preview State for Component
export interface FeePreviewState {
  price: number;
  categorySlug: string;
  categoryName: string;
  isCalculating: boolean;
  fee: FeeCalculationResponse | null;
  error: string | null;
}
