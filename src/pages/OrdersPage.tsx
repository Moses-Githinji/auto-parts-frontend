import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useOrderStore } from "../stores/orderStore";
import type { Order, OrderItem, OrderStatus } from "../types/order";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "../components/ui/dialog";
import { Textarea } from "../components/ui/textarea";
import { AlertCircle, Loader2, ShieldAlert } from "lucide-react";

function groupItemsByVendor(items: OrderItem[]) {
  const map = new Map<string, OrderItem[]>();
  for (const item of items) {
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
  const { orders, isLoading, error, fetchOrders, raiseDispute, clearError } = useOrderStore();
  
  // Dispute Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disputeSuccess, setDisputeSuccess] = useState(false);

  useEffect(() => {
    clearError();
    fetchOrders();
  }, [fetchOrders, clearError]);

  const handleRaiseDispute = async () => {
    if (!selectedOrder || !disputeReason) return;
    
    setIsSubmitting(true);
    try {
      await raiseDispute(selectedOrder.id, disputeReason, selectedOrder.total);
      setDisputeSuccess(true);
      setTimeout(() => {
        setSelectedOrder(null);
        setDisputeReason("");
        setDisputeSuccess(false);
        fetchOrders();
      }, 2000);
    } catch (err) {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="space-y-4 text-center py-16">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={() => fetchOrders()} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-dark-text">My Orders</h1>
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-base p-8 text-center text-sm text-slate-600 dark:text-dark-textMuted">
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

        const vendorEntries = Array.from(
          groupItemsByVendor(order.items || []).entries()
        );

        return (
          <section
            key={`${order.id}-${index}`}
            className="space-y-3 rounded-md border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-base p-4"
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
              <div className="flex items-center gap-2">
                {order.status === "DELIVERED" && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] text-red-600 hover:text-red-700 hover:bg-red-50 gap-1 border border-red-100"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <ShieldAlert className="h-3 w-3" />
                    Raise Dispute
                  </Button>
                )}
                <Badge variant={getStatusVariant(order.status)}>
                  {order.status}
                </Badge>
              </div>
            </header>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold text-slate-900 dark:text-dark-text">
                Shipping Address
              </h3>
              <p className="text-xs text-slate-600 dark:text-dark-textMuted whitespace-pre-line">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                {"\n"}{order.shippingAddress.phone}
                {"\n"}{order.shippingAddress.email}
                {"\n"}{order.shippingAddress.city}, {order.shippingAddress.state}
              </p>
            </div>

            {vendorEntries.length > 0 ? (
              vendorEntries.map(([vendorId, vendorItems]) => {
                const firstItem = vendorItems[0] as any;
                const vendorName =
                  firstItem.product?.vendor?.companyName ??
                  firstItem.vendorName ??
                  "Vendor";

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
                    className="space-y-2 rounded-md border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-3 text-xs"
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
              <div className="rounded-md border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-3 text-xs">
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
                    <span>VAT (16%)</span>
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

      {/* Raise Dispute Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => !isSubmitting && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Raise a Dispute</DialogTitle>
            <DialogDescription>
              Are you unhappy with your order #{selectedOrder?.orderNumber}? 
              Please describe the issue in detail.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {disputeSuccess ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-2">
                <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-slate-900">Dispute Submitted</h3>
                <p className="text-sm text-slate-600">Our team will review your claim and get back to you within 24-48 hours.</p>
              </div>
            ) : (
              <>
                <div className="flex items-start gap-3 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>
                    <strong>GIT Protection:</strong> Your funds are currently held in escrow. 
                    Raising a dispute will freeze the payout to the vendor until resolved.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reason" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Reason for Dispute
                  </label>
                  <Textarea
                    id="reason"
                    placeholder="e.g. Received wrong part/damaged item..."
                    className="min-h-[120px] text-sm"
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                  />
                </div>
              </>
            )}
          </div>

          {!disputeSuccess && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedOrder(null)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button 
                onClick={handleRaiseDispute} 
                disabled={!disputeReason || isSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Claim
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
