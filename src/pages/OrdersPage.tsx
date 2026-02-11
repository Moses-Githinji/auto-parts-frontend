import { Link } from "react-router-dom";
import { useEffect } from "react";
import { Badge } from "../components/ui/badge";
import { useOrderStore } from "../stores/orderStore";
import type { OrderItem, OrderStatus } from "../types/order";

function groupItemsByVendor(items: OrderItem[]) {
  const map = new Map<string, OrderItem[]>();
  for (const item of items) {
    // FIX: Access vendorId from the nested product object if available
    const vid =
      (item as any).product?.vendorId ||
      (item as any).product?.vendor?.id ||
      item.vendorId ||
      "unknown";
    const list = map.get(vid) ?? [];
    list.push(item);
    map.set(vid, list);
  }
  return map;
}

function getStatusVariant(
  status: OrderStatus
): "default" | "outline" | "success" | "warning" {
  switch (status) {
    case "PENDING":
      return "warning";
    case "CONFIRMED":
    case "PROCESSING":
      return "default";
    case "SHIPPED":
      return "default";
    case "DELIVERED":
      return "success";
    case "CANCELLED":
      return "outline";
    default:
      return "outline";
  }
}

export function OrdersPage() {
  const { orders, isLoading, error, fetchOrders, clearError } = useOrderStore();

  useEffect(() => {
    clearError();
    fetchOrders();
  }, [fetchOrders, clearError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF9900] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 text-center py-16">
        <p className="text-red-600">Error: {error}</p>
        <button
          onClick={() => fetchOrders()}
          className="text-blue-600 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-dark-text">My Orders</h1>
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg p-8 text-center text-sm text-slate-600 dark:text-dark-textMuted">
          <p className="mb-4">You haven't placed any orders yet.</p>
          <Link to="/" className="text-blue-600 hover:underline">
            Continue shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-lg font-semibold text-slate-900 dark:text-dark-text">My Orders</h1>

      {orders.map((order, index) => {
        if (!order) return null;
        // Debug logging for troubleshooting data issues
        if (index === 0) {
          console.log("Debug Order Data:", JSON.stringify(order, null, 2));
        }

        const vendorEntries = Array.from(
          groupItemsByVendor(order.items || []).entries()
        );

        return (
          <section
            key={`${order.id}-${index}`}
            className="space-y-3 rounded-md border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg p-4"
          >
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-dark-text">
                  Order #{order.orderNumber}
                </h2>
                <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                  {new Date(order.createdAt).toLocaleDateString()} •{" "}
                  {order.paymentMethod || "N/A"}
                </p>
              </div>
              <Badge variant={getStatusVariant(order.status)}>
                {order.status}
              </Badge>
            </header>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-dark-text">
                Shipping Address
              </h3>
              <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
                <br />
                {order.shippingAddress.phone}
                <br />
                {order.shippingAddress.email}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
            </div>

            {vendorEntries.length > 0 ? (
              vendorEntries.map(([vendorId, vendorItems]) => {
                // FIX: Access Vendor Name from the product relation
                const firstItem = vendorItems[0] as any;
                const vendorName =
                  firstItem.product?.vendor?.companyName ??
                  firstItem.vendorName ??
                  "Vendor";

                // FIX: Use 'price' instead of 'unitPrice' if available
                const vendorSubtotal = vendorItems.reduce(
                  (sum, i: any) =>
                    sum +
                    Number(i.price || i.unitPrice || 0) *
                      Number(i.quantity || 1),
                  0
                );
                const currency = firstItem.currency ?? "KES";

                return (
                  <div
                    key={vendorId}
                    className="space-y-2 rounded-md border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-3 text-xs"
                  >
                    <h4 className="font-semibold text-slate-900 dark:text-dark-text">
                      {vendorName}
                    </h4>
                    <div className="divide-y divide-slate-100">
                      {vendorItems.map((item: any) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between py-2"
                        >
                          <div>
                            {/* FIX: Access name and partNumber from 'product' */}
                            <p className="font-semibold text-slate-900 dark:text-dark-text">
                              {item.product?.name || "Unknown Product"} –{" "}
                              {item.product?.partNumber || "N/A"}
                            </p>
                            <p className="text-[11px] text-slate-600 dark:text-dark-textMuted">
                              Qty {item.quantity}
                              {item.product?.specifications?.Volume
                                ? ` • ${item.product.specifications.Volume}`
                                : ""}
                            </p>
                          </div>
                          <p className="font-semibold text-slate-900 dark:text-dark-text">
                            {currency}{" "}
                            {(
                              Number(item.price || item.unitPrice || 0) *
                              Number(item.quantity || 1)
                            ).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end pt-2">
                      <Badge variant="outline">
                        Subtotal: {currency} {vendorSubtotal.toLocaleString()}
                      </Badge>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-md border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-3 text-xs">
                <p className="mb-2 text-slate-600 italic">
                  Order details not available
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      KES{" "}
                      {Number(
                        order.subtotal || (order as any).sub_total || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>
                      KES{" "}
                      {Number(
                        order.shipping || (order as any).shipping_cost || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>
                      KES{" "}
                      {Number(
                        order.tax || (order as any).vat || 0
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Badge>
                Total: KES{" "}
                {Number(
                  order.total ||
                    (order as any).totalAmount ||
                    (order as any).total_amount ||
                    0
                ).toLocaleString()}
              </Badge>
            </div>
          </section>
        );
      })}

      <div className="pt-4">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
