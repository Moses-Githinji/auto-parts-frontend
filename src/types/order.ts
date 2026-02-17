export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: string;
  product?: {
    id: string;
    vendorId: string;
    name: string;
    partNumber: string;
    description: string;
    price: string;
    stock: number;
    category: string;
    brand: string;
    make: string | null;
    model: string | null;
    condition: string;
    images: string[];
    specifications: Record<string, string>;
    status: string;
    views: number;
    ordersCount: number;
    createdAt: string;
    updatedAt: string;
    vendor: {
      id: string;
      companyName: string;
      city: string;
    };
  };
  vendorId?: string;
  vendorName?: string;
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
    averageOrderValue: number;
    ordersByStatus: Array<{
      status: OrderStatus;
      count: number;
    }>;
    topProducts: Array<{
      productId: string;
      productType?: string;
      sales?: number;
      revenue?: number;
      _sum?: { quantity: number };
      product?: any;
    }>;
    salesOverTime: Array<{
      date: string;
      amount: number;
    }>;
  };
}
