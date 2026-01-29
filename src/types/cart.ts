export interface CartItem {
  id: string;
  partNumber: string;
  partName: string;
  vendorId: string;
  vendorName: string;
  unitPrice: number;
  currency: string;
  quantity: number;
  fitmentVehicle?: string;
}

export function cartItemSubtotal(item: CartItem): number {
  return item.unitPrice * item.quantity;
}

export function cartItemKey(
  item: Pick<CartItem, "partNumber" | "vendorId">,
): string {
  return `${item.vendorId}-${item.partNumber}`;
}
