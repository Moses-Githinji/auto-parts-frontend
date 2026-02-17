import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useOrderStore } from "../../stores/orderStore";
import { 
  Search, 
  Trash2, 
  XCircle, 
  Package, 
  ChevronRight, 
  AlertCircle,
  ShoppingBag,
  CreditCard,
  Truck,
  Clock
} from "lucide-react";
import type {
  Order,
  OrderStatus,
  PaymentStatus,
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
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200",
  PAID: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200",
  REFUNDED: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200",
};

type FilterTab = "ALL" | "PENDING" | "PAID" | "SHIPPED" | "CANCELLED";

export function AccountOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { orders, fetchOrders, cancelOrder, deleteOrder, isLoading, error } = useOrderStore();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Handle auto-opening order from query param
  useEffect(() => {
    if (!isLoading && orders.length > 0) {
      const params = new URLSearchParams(location.search);
      const orderId = params.get("id") || params.get("open");
      if (orderId) {
        const order = orders.find(o => o.id === orderId);
        if (order) {
          setSelectedOrder(order);
        }
      }
    }
  }, [isLoading, orders, location.search]);

  const handleCancelOrder = async (orderId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone and items will be restocked.")) {
      return;
    }

    try {
      await cancelOrder(orderId);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to cancel order");
    }
  };

  const handleDeleteOrder = async (orderId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm("Are you sure you want to permanently delete this order from your history?")) {
      return;
    }

    try {
      await deleteOrder(orderId);
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete order");
    }
  };

  const filteredOrders = useMemo(() => {
    let result = orders;

    // Filter by tab
    if (activeTab === "PENDING") {
      result = result.filter(o => o.status === "PENDING" || o.status === "CONFIRMED");
    } else if (activeTab === "PAID") {
      result = result.filter(o => o.paymentStatus === "PAID");
    } else if (activeTab === "SHIPPED") {
      result = result.filter(o => o.status === "SHIPPED" || o.status === "OUT_FOR_DELIVERY" || o.status === "DELIVERED");
    } else if (activeTab === "CANCELLED") {
      result = result.filter(o => o.status === "CANCELLED");
    }

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.orderNumber.toLowerCase().includes(q) || 
        o.items?.some(item => item.product?.name.toLowerCase().includes(q))
      );
    }

    return result.filter(Boolean);
  }, [orders, activeTab, searchQuery]);

  const tabs: { label: string; value: FilterTab; icon: any }[] = [
    { label: "All Orders", value: "ALL", icon: ShoppingBag },
    { label: "Pending", value: "PENDING", icon: Clock },
    { label: "Paid", value: "PAID", icon: CreditCard },
    { label: "Transit & Done", value: "SHIPPED", icon: Truck },
    { label: "Cancelled", value: "CANCELLED", icon: XCircle },
  ];

  if (isLoading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-pulse">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#FF9900] border-t-transparent mb-4"></div>
        <p className="text-sm font-medium text-slate-500">Loading your orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-dark-text">Purchase History</h1>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            Review your orders, track shipments, and manage returns.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="space-y-4">
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-hide border-b border-slate-200 dark:border-dark-border">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium transition-colors relative ${
                  isActive 
                    ? "text-[#FF9900]" 
                    : "text-slate-500 hover:text-slate-700 dark:text-dark-textMuted dark:hover:text-dark-text"
                }`}
              >
                <Icon size={16} />
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF9900]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order # or product name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#FF9900] focus:outline-none focus:ring-2 focus:ring-[#FF9900]/10 dark:border-dark-border dark:bg-dark-bgLight dark:text-dark-text transition-shadow"
          />
        </div>
      </div>

      {error && !isLoading && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4 flex items-center gap-3">
          <AlertCircle className="text-red-600 h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">Something went wrong</p>
            <p className="text-xs text-red-700 dark:text-red-300">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchOrders()}>Retry</Button>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 dark:border-dark-border py-12 text-center bg-slate-50/50 dark:bg-dark-bg/50">
            <ShoppingBag size={48} className="text-slate-300 mb-4" />
            <p className="text-base font-semibold text-slate-900 dark:text-dark-text">No orders found</p>
            <p className="mt-1 text-sm text-slate-500 max-w-xs px-4">
              We couldn't find any orders matching your criteria. Try adjusting your search or filters.
            </p>
            <Button
              className="mt-6 bg-[#FF9900] text-white hover:bg-[#FF9900]/90 px-6"
              onClick={() => navigate("/search")}
            >
              Discover Products
            </Button>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-[#FF9900]/30 hover:shadow-md dark:border-dark-border dark:bg-dark-bgLight"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-dark-text uppercase tracking-tight">
                      Order #{order.orderNumber.substring(0, 12)}...
                    </span>
                    <Badge variant="outline" className={`${statusColors[order.status]} border-none font-bold text-[10px] py-0.5 px-2 rounded-full`}>
                      {order.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-dark-textMuted">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Package size={12} />
                      {order.items?.length || 0} {(order.items?.length || 0) === 1 ? "Item" : "Items"}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-dark-text text-sm ml-2">
                      KSh {order.total.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                   {order.status === "CANCELLED" ? (
                     <Button
                       variant="ghost"
                       size="sm"
                       className="text-slate-400 hover:text-red-600 hover:bg-red-50 p-2 h-9 w-9 rounded-full"
                       onClick={(e) => handleDeleteOrder(order.id, e)}
                       title="Delete from history"
                     >
                       <Trash2 size={16} />
                     </Button>
                   ) : (
                    <div className={`text-[10px] font-bold px-2 py-1 rounded border ${paymentStatusColors[order.paymentStatus]}`}>
                      {order.paymentStatus}
                    </div>
                   )}
                   <ChevronRight size={18} className="text-slate-300 group-hover:text-[#FF9900] transition-colors" />
                </div>
              </div>

              {/* Items Preview */}
              <div className="mt-4 flex flex-col gap-3 pt-4 border-t border-slate-50 dark:border-dark-border">
                {order.items?.slice(0, 2).map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded bg-slate-100 dark:bg-dark-bg text-slate-400 overflow-hidden">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package size={16} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-xs font-medium text-slate-900 dark:text-dark-text truncate">
                         {item.product?.name}
                       </p>
                       <p className="text-[10px] text-slate-500 dark:text-dark-textMuted">
                         KSh {Number(item.price).toLocaleString()} × {item.quantity}
                       </p>
                    </div>
                  </div>
                ))}
                {(order.items?.length || 0) > 2 && (
                  <p className="text-[10px] font-semibold text-[#FF9900] hover:underline">
                    View {(order.items?.length || 0) - 2} more items...
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modern Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white dark:bg-dark-bgLight shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-bg/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-dark-text">
                  Order Summary
                </h2>
                <p className="text-[11px] font-mono text-slate-500 uppercase">
                  ID: {selectedOrder.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="h-8 w-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-dark-bg transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Order Info Bar */}
              <div className="grid grid-cols-3 gap-2 text-center bg-slate-50 dark:bg-dark-bg rounded-xl p-3">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Status</p>
                  <p className={`text-xs font-bold ${statusColors[selectedOrder.status]} bg-transparent`}>
                    {selectedOrder.status.replace(/_/g, " ")}
                  </p>
                </div>
                <div className="space-y-1 border-x border-slate-200 dark:border-dark-border">
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Payment</p>
                  <p className={`text-xs font-bold ${paymentStatusColors[selectedOrder.paymentStatus]} border-none bg-transparent`}>
                    {selectedOrder.paymentStatus}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] uppercase text-slate-500 font-bold">Placed On</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-dark-text">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-dark-text">
                  <Package size={16} className="text-[#FF9900]" />
                  Items ({selectedOrder.items?.length || 0})
                </div>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 p-3 rounded-xl border border-slate-100 dark:border-dark-border bg-white dark:bg-dark-bg/30"
                    >
                      <div className="h-16 w-16 flex-shrink-0 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-dark-bg overflow-hidden">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.product?.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="text-slate-300" size={24} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-dark-text leading-tight">
                          {item.product?.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-dark-textMuted mt-1">
                          Vendor: <span className="font-semibold text-slate-700 dark:text-dark-text">{item.product?.vendor.companyName}</span>
                        </p>
                        <div className="mt-2 flex items-center justify-between">
                           <span className="text-xs font-medium text-slate-600 dark:text-dark-textMuted">
                             Qty: {item.quantity} × KSh {Number(item.price).toLocaleString()}
                           </span>
                           <span className="text-sm font-bold text-slate-900 dark:text-dark-text">
                             KSh {(item.quantity * Number(item.price)).toLocaleString()}
                           </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Details & Summaries */}
              <div className="grid gap-4 sm:grid-cols-2">
                 <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-bg space-y-2">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 tracking-wider">
                      <Truck size={14} />
                      Delivery Address
                    </h4>
                    <div className="text-[11px] text-slate-700 dark:text-dark-text leading-relaxed">
                       <p className="font-bold">{selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}</p>
                       <p>{selectedOrder.shippingAddress.phone}</p>
                       <p>{selectedOrder.shippingAddress.street}</p>
                       <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</p>
                    </div>
                 </div>

                 <div className="p-4 rounded-xl bg-[#232F3E] text-white space-y-3">
                    <h4 className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400 tracking-wider">
                      <CreditCard size={14} />
                      Order Totals
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Subtotal</span>
                        <span>KSh {selectedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Shipping</span>
                        <span>KSh {selectedOrder.shipping.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-base font-bold text-[#FF9900] pt-2 border-t border-slate-700">
                        <span>Total (KES)</span>
                        <span>KSh {selectedOrder.total.toLocaleString()}</span>
                      </div>
                    </div>
                 </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 dark:bg-dark-bg flex flex-col sm:flex-row gap-2">
              {(selectedOrder.status === "PENDING" || selectedOrder.status === "CONFIRMED") && (
                <Button
                  variant="outline"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 dark:border-red-900/30"
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                  disabled={isLoading}
                >
                  {isLoading ? "Cancelling..." : "Cancel Order"}
                </Button>
              )}
              {selectedOrder.status === "CANCELLED" && (
                <Button
                  variant="outline"
                  className="w-full text-slate-600 dark:text-dark-textMuted"
                  onClick={(e) => handleDeleteOrder(selectedOrder.id, e)}
                  disabled={isLoading}
                >
                  <Trash2 size={16} className="mr-2" />
                  Remove from History
                </Button>
              )}
              {selectedOrder.status === "DELIVERED" && (
                 <Button className="w-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90">
                   <ShoppingBag size={16} className="mr-2" />
                   Buy These Items Again
                 </Button>
              )}
              {selectedOrder.trackingNumber && (
                <Button 
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => navigate(`/tracking/${selectedOrder.trackingNumber}`)}
                >
                  <Truck size={16} className="mr-2" />
                  Track Delivery
                </Button>
              )}
              <Button 
                variant="outline" 
                className="w-full sm:w-auto"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
