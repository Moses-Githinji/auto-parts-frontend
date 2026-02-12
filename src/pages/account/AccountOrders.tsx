import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { apiClient } from "../../lib/apiClient";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
  OrderListResponse,
} from "../../types/order";

const statusColors: Record<OrderStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  CONFIRMED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PROCESSING: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  SHIPPED: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  OUT_FOR_DELIVERY: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  DELIVERED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const paymentStatusColors: Record<PaymentStatus, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  REFUNDED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

export function AccountOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<OrderListResponse>("/api/orders");
      setOrders(response.orders || []);
    } catch (err) {
      const axiosError = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      setError(
        axiosError.response?.data?.error ||
          axiosError.message ||
          "Failed to fetch orders"
      );
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filterStatus
    ? orders.filter((o) => o.status === filterStatus)
    : orders;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-dark-text">My Orders</h1>
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">
              Track and manage your orders from all vendors
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF9900] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-dark-text">My Orders</h1>
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">
              Track and manage your orders from all vendors
            </p>
          </div>
        </div>
        <div className="rounded-sm border border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchOrders}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-900 dark:text-dark-text">My Orders</h1>
          <p className="text-xs text-slate-600 dark:text-dark-textMuted">
            Track and manage your orders from all vendors
          </p>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#FF9900] focus:outline-none dark:border-dark-border dark:bg-dark-bg dark:text-dark-text"
        >
          <option value="">All Orders</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="rounded-sm border border-[#c8c8c8] bg-white dark:bg-dark-bgLight dark:border-dark-border p-6 text-center">
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">No orders found</p>
            <Button
              className="mt-3 bg-[#FF9900] text-white hover:bg-[#FF9900]/90"
              onClick={() => navigate("/search")}
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="cursor-pointer rounded-sm border border-[#c8c8c8] bg-white dark:bg-dark-bgLight dark:border-dark-border p-4 shadow-sm transition-shadow hover:shadow-md"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-dark-text">
                      {order.orderNumber}
                    </span>
                    <Badge className={statusColors[order.status]}>
                      {order.status}
                    </Badge>
                    <Badge className={paymentStatusColors[order.paymentStatus]}>
                      {order.paymentStatus}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                    {order.items.length} item{order.items.length > 1 ? "s" : ""}{" "}
                    •{" "}
                    <span className="font-medium text-slate-900 dark:text-dark-text">
                      KSh {order.total.toLocaleString()}
                    </span>
                  </p>
                </div>
                {order.trackingNumber && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-dark-textMuted">Tracking</p>
                    <p className="text-xs font-medium text-slate-700 dark:text-dark-text">
                      {order.trackingNumber}
                    </p>
                  </div>
                )}
              </div>

              {/* Order Items Preview */}
              <div className="mt-3 flex items-center gap-2 overflow-hidden">
                {order.items.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-[10px] text-slate-500 dark:bg-slate-800 dark:text-dark-textMuted"
                  >
                    {item.product?.name.substring(0, 15)}...
                  </div>
                ))}
                {order.items.length > 3 && (
                  <span className="text-xs text-slate-500 dark:text-dark-textMuted">
                    +{order.items.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-sm bg-white dark:bg-dark-bgLight p-6 shadow-lg max-h-[90vh] overflow-y-auto border border-transparent dark:border-dark-border">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
                  {selectedOrder.orderNumber}
                </h2>
                <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                  Placed on{" "}
                  {new Date(selectedOrder.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-500 dark:text-dark-textMuted hover:text-slate-700 dark:hover:text-dark-text"
              >
                ✕
              </button>
            </div>

            {/* Status */}
            <div className="mb-4 flex gap-2">
              <Badge className={statusColors[selectedOrder.status]}>
                {selectedOrder.status}
              </Badge>
              <Badge
                className={paymentStatusColors[selectedOrder.paymentStatus]}
              >
                {selectedOrder.paymentStatus}
              </Badge>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-slate-900 dark:text-dark-text">Items</h3>
              <div className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 rounded-sm border border-[#e8e8e8] dark:border-dark-border p-3"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-slate-100 text-xs text-slate-500 dark:bg-slate-800 dark:text-dark-textMuted">
                      IMG
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-900 dark:text-dark-text">
                        {item.product?.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                        {item.product?.vendor.companyName}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-dark-textMuted">
                        Qty: {item.quantity} • KSh{" "}
                        {Number(item.price).toLocaleString()}
                      </p>
                      {item.fitmentVehicle && (
                        <p className="text-[10px] text-slate-500 dark:text-dark-textMuted">
                          Fits: {item.fitmentVehicle}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="mb-4">
              <h3 className="mb-2 text-sm font-medium text-slate-900 dark:text-dark-text">
                Shipping Address
              </h3>
              <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                {selectedOrder.shippingAddress.firstName}{" "}
                {selectedOrder.shippingAddress.lastName}
              </p>
              <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                {selectedOrder.shippingAddress.street}
              </p>
              <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                {selectedOrder.shippingAddress.city},{" "}
                {selectedOrder.shippingAddress.state}{" "}
                {selectedOrder.shippingAddress.zipCode}
              </p>
            </div>

            {/* Order Summary */}
            <div className="rounded-sm bg-slate-50 dark:bg-dark-bg p-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-dark-textMuted">Subtotal</span>
                <span className="text-slate-900 dark:text-dark-text">
                  KSh {selectedOrder.subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-dark-textMuted">Shipping</span>
                <span className="text-slate-900 dark:text-dark-text">
                  KSh {selectedOrder.shipping.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 dark:text-dark-textMuted">Tax</span>
                <span className="text-slate-900 dark:text-dark-text">
                  KSh {selectedOrder.tax.toLocaleString()}
                </span>
              </div>
              <div className="mt-2 flex justify-between border-t border-slate-200 dark:border-dark-border pt-2 text-sm font-semibold">
                <span className="text-slate-900 dark:text-dark-text">Total</span>
                <span className="text-slate-900 dark:text-dark-text">
                  KSh {selectedOrder.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              {selectedOrder.status === "DELIVERED" && (
                <Button className="bg-[#FF9900] text-white hover:bg-[#FF9900]/90">
                  Buy Again
                </Button>
              )}
              {(selectedOrder.status === "OUT_FOR_DELIVERY" ||
                selectedOrder.status === "SHIPPED") &&
                selectedOrder.trackingNumber && (
                  <Button
                    className="bg-[#FF9900] text-white hover:bg-[#FF9900]/90"
                    onClick={() =>
                      navigate(`/tracking/${selectedOrder.trackingNumber}`)
                    }
                  >
                    Track Order
                  </Button>
                )}
              {selectedOrder.status === "PENDING" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  Cancel Order
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
