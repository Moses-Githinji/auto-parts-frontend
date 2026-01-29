import { Link } from "react-router-dom";
import { useMemo } from "react";
import { Badge } from "../components/ui/badge";
import { useOrderStore } from "../stores/orderStore";
import type { OrderItem } from "../types/order";

function groupItemsByVendor(items: OrderItem[]) {
  const map = new Map<string, OrderItem[]>();
  for (const item of items) {
    const list = map.get(item.vendorId) ?? [];
    list.push(item);
    map.set(item.vendorId, list);
  }
  return map;
}

export function OrdersPage() {
  const orders = useOrderStore((s) => s.orders);

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-slate-900">My Orders</h1>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
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
      <h1 className="text-lg font-semibold text-slate-900">My Orders</h1>

      {orders.map((order) => {
        const vendorEntries = useMemo(
          () => Array.from(groupItemsByVendor(order.items).entries()),
          [order.items],
        );

        return (
          <section
            key={order.id}
            className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-4"
          >
            <header className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Order #{order.id.slice(-8)}
                </h2>
                <p className="text-xs text-slate-600">
                  {new Date(order.orderDate).toLocaleDateString()} •{" "}
                  {order.paymentMethod}
                </p>
              </div>
              <Badge
                variant={order.status === "processing" ? "default" : "outline"}
              >
                {order.status}
              </Badge>
            </header>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-900">
                Shipping Address
              </h3>
              <p className="text-xs text-slate-600">
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
                <br />
                {order.shippingAddress.phone}
                <br />
                {order.shippingAddress.email}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.estate}
              </p>
            </div>

            {vendorEntries.map(([vendorId, vendorItems]) => {
              const vendorName = vendorItems[0]?.vendorName ?? "Vendor";
              const vendorSubtotal = vendorItems.reduce(
                (sum, i) => sum + i.unitPrice * i.quantity,
                0,
              );
              const currency = vendorItems[0]?.currency ?? "KES";

              return (
                <div
                  key={vendorId}
                  className="space-y-2 rounded-md border border-slate-200 bg-white p-3 text-xs"
                >
                  <h4 className="font-semibold text-slate-900">{vendorName}</h4>
                  <div className="divide-y divide-slate-100">
                    {vendorItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.partName} – {item.partNumber}
                          </p>
                          <p className="text-[11px] text-slate-600">
                            Qty {item.quantity}
                            {item.fitmentVehicle
                              ? ` • Fits: ${item.fitmentVehicle}`
                              : ""}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900">
                          {currency}{" "}
                          {(item.unitPrice * item.quantity).toLocaleString()}
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
            })}

            <div className="flex justify-end pt-2">
              <Badge>Total: KES {order.totalAmount.toLocaleString()}</Badge>
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
