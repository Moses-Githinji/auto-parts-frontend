export interface CartItem {
  id: string;
  productId: string;
  name: string;
  partNumber: string;
  price: number;
  quantity: number;
  image?: string;
  vendorId: string;
  vendorName: string;
  inStock?: boolean;
  stock?: number;
  fitmentVehicle?: string;
  currency?: string;
  addedAt?: string;
}

export interface CartListResponse {
  data: CartItem[];
}

export interface AddToCartRequest {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  vendorId: string;
  vendorName: string;
  inStock?: boolean;
  stock?: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export function cartItemKey(
  item: Pick<CartItem, "productId" | "vendorId">,
): string {
  return `${item.vendorId}-${item.productId}`;
}

export function cartItemSubtotal(item: CartItem): number {
  return item.price * item.quantity;
}
