export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItem {
  id: string;
  productId: string;
  partName: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  vendorId: string;
  vendorName: string;
  fitmentVehicle?: string;
}

export interface OrderAddress {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  vendorId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  trackingNumber?: string;
  notes?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateOrderRequest {
  vendorId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: OrderAddress;
  billingAddress?: OrderAddress;
  paymentMethod?: string;
}

export interface UpdatePaymentStatusRequest {
  paymentStatus: PaymentStatus;
}

export interface OrderAnalytics {
  analytics: {
    totalOrders: number;
    totalRevenue: number;
    ordersByStatus: Array<{
      status: OrderStatus;
      count: number;
    }>;
    topProducts: Array<{
      productId: string;
      name: string;
      ordersCount: number;
    }>;
  };
}
