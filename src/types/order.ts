export interface OrderItem {
  id: string;
  partName: string;
  partNumber: string;
  quantity: number;
  unitPrice: number;
  currency: string;
  vendorId: string;
  vendorName: string;
  fitmentVehicle?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    city: string;
    estate: string;
  };
  paymentMethod: string;
  orderDate: string;
  status: "processing" | "shipped" | "delivered";
}
