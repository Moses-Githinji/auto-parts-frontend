export type VendorStatus =
  | "PENDING"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED"
  | "DELETED";

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
  status: "PENDING" | "PAID";
  createdAt: string;
}
