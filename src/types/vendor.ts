export type VendorStatus =
  | "PENDING"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "DELETED";

export type VendorBadge = "PLATINUM" | "GOLD" | "SILVER" | "CRITICAL";

export interface UIConfig {
  icon: string;
  color: string;
  bg: string;
  label: string;
  description: string;
}

export interface VendorHealth {
  riskScore: number;
  badge: VendorBadge;
  payoutDays: number;
  uiConfig: UIConfig;
  progression?: {
    percentComplete: number;
    ordersNeeded: number;
    nextBadge: VendorBadge;
  };
  riskAlert?: {
    type: "WARNING" | "CRITICAL";
    message: string;
  } | null;
}

export interface Vendor {
  id: string;
  email: string;
  companyName: string;
  contactName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logoUrl?: string;
  description?: string;
  rating: number;
  totalReviews: number;
  status: VendorStatus;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
  promotions?: VendorPromotion[];
  accountNumber?: string;
  bankCode?: string;
  accountName?: string;
  paystackRecipientCode?: string;
  debtBalance?: number;
  stats?: {
    riskScore: number;
    payoutDays: number;
    badge: VendorBadge;
    totalOrders90Days: number;
    totalDisputes90Days: number;
  };
  uiConfig?: UIConfig;
}

export interface CommissionPromotion {
  id: string;
  name: string;
  description?: string;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue: number; // Changed to number to match usual API responses, though user said string "20.00" in one place and number in another. generic number is safer.
  startDate: string;
  endDate?: string;
  maxVendors?: number;
  isActive: boolean;
  _count?: {
    vendorPromotions: number;
  };
}

export interface VendorPromotion {
  id: string;
  vendorId: string;
  promotionId: string;
  startedAt: string;
  expiresAt: string;
  promotion: CommissionPromotion;
}

export interface VendorProfile {
  vendor: Vendor;
  userType: "vendor";
}

export interface VendorRegistrationRequest {
  email: string;
  password: string;
  companyName: string;
  contactName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface UpdateVendorRequest {
  companyName?: string;
  contactName?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logoUrl?: string;
  description?: string;
}

export interface VendorDashboardStats {
  stats: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    pendingOrders: number;
    totalRevenue: number;
    unreadNotifications: number;
    health?: VendorHealth;
  };
}

export interface VendorNotification {
  id: string;
  vendorId: string;
  title: string;
  message: string;
  type?: string;
  actionUrl?: string;
  read: boolean;
  createdAt: string;
}

export interface VendorEarnings {
  id: string;
  vendorId: string;
  orderId: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: "PENDING" | "PAID" | "WITHDRAWABLE" | "PROCESSING_PAYMENT" | "DISPUTED";
  withdrawableAt?: string;
  createdAt: string;
}
