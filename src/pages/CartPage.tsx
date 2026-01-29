import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useCartStore } from "../stores/cartStore";
import { cartItemSubtotal } from "../types/cart";
import type { CartItem } from "../types/cart";

function groupItemsByVendor(items: CartItem[]) {
  const map = new Map<string, CartItem[]>();
  for (const item of items) {
    const list = map.get(item.vendorId) ?? [];
    list.push(item);
    map.set(item.vendorId, list);
  }
  return map;
}

export function CartPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const vendorEntries = useMemo(
    () => Array.from(groupItemsByVendor(items).entries()),
    [items],
  );
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const totalAmount = useCartStore((s) => s.totalAmount());
  const clearCart = useCartStore((s) => s.clearCart);

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-slate-900">Cart</h1>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
          <p className="mb-4">Your cart is empty.</p>
          <Button onClick={() => navigate("/search")}>Browse parts</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Cart</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearCart}
          className="text-xs text-slate-600"
        >
          Clear cart
        </Button>
      </header>

      {vendorEntries.map(([vendorId, vendorItems]) => {
        const vendorName = vendorItems[0]?.vendorName ?? "Vendor";
        const vendorSubtotal = vendorItems.reduce(
          (sum, i) => sum + cartItemSubtotal(i),
          0,
        );
        const currency = vendorItems[0]?.currency ?? "KES";

        return (
          <section
            key={vendorId}
            className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs"
          >
            <h2 className="text-sm font-semibold text-slate-900">
              {vendorName}
            </h2>
            <p className="text-[11px] text-slate-600">
              Fulfilled by vendor • Pickup or courier
            </p>
            <div className="mt-2 divide-y divide-slate-100 rounded-md border border-slate-200 bg-white">
              {vendorItems.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-900">
                      {item.name} – {item.partNumber}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Qty {item.quantity}
                      {item.fitmentVehicle
                        ? ` • Fits: ${item.fitmentVehicle}`
                        : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded border border-slate-200 bg-slate-50">
                      <button
                        type="button"
                        className="h-7 w-7 rounded-l text-slate-600 hover:bg-slate-200"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        className="h-7 w-7 rounded-r text-slate-600 hover:bg-slate-200"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs font-semibold text-slate-900">
                      {currency} {(item.price * item.quantity).toLocaleString()}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 hover:text-red-700"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-2">
              <p className="text-[11px] text-slate-600">
                Delivery ETA: Select at checkout
              </p>
              <Badge variant="outline">
                Vendor subtotal: {currency} {vendorSubtotal.toLocaleString()}
              </Badge>
            </div>
          </section>
        );
      })}

      <section className="flex flex-col justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs md:flex-row md:items-center">
        <div>
          <p className="font-semibold text-slate-900">Order summary</p>
          <p className="text-[11px] text-slate-600">
            {vendorEntries.length} vendor{vendorEntries.length !== 1 ? "s" : ""}{" "}
            • {items.length} item{items.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-600">Total (KES)</p>
            <p className="text-base font-semibold text-slate-900">
              {totalAmount.toLocaleString()}
            </p>
          </div>
          <Button size="sm" onClick={() => navigate("/checkout")}>
            Proceed to checkout
          </Button>
        </div>
      </section>
    </div>
  );
}
