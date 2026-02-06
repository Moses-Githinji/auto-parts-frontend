import { useEffect, useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { useOrderStore } from "../../stores/orderStore";
import { OrderDetailsDrawer } from "./OrderDetailsDrawer";
import { ProcessOrderModal } from "./ProcessOrderModal";
import type { Order, OrderStatus } from "../../types/order";

export function VendorOrdersPage() {
  const vendorNavItems = [
    { label: "Dashboard", to: "/vendor" },
    { label: "Orders", to: "/vendor/orders" },
    { label: "Catalog", to: "/vendor/catalog" },
    { label: "Analytics", to: "/vendor/analytics" },
    { label: "Settings", to: "/vendor/settings" },
  ];

  const {
    orders,
    isLoading,
    error,
    fetchOrders,
    updateOrderStatus,
    sendOrderNotification,
  } = useOrderStore();

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleProcessOrder = async (
    orderId: string,
    status: OrderStatus,
    data?: Record<string, unknown>
  ) => {
    try {
      await updateOrderStatus(orderId, status, data);

      // Send notification email when order is out for delivery
      if (status === "OUT_FOR_DELIVERY") {
        try {
          await sendOrderNotification(orderId, "out_for_delivery");
        } catch (notifyErr) {
          console.error("Failed to send notification email:", notifyErr);
        }
      }

      fetchOrders();
    } catch (err) {
      console.error("Failed to update order status:", err);
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const openProcessModal = (order: Order) => {
    setSelectedOrder(order);
    setIsProcessModalOpen(true);
  };

  const openReportIssue = (order: Order) => {
    // TODO: Implement report issue flow
    console.log("Report issue for order:", order.id);
    alert(
      `Report issue feature for order ${order.orderNumber} would open here. This will alert SYSTEM_ADMIN and the customer.`
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700";
      case "PROCESSING":
        return "bg-purple-100 text-purple-700";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-700";
      case "OUT_FOR_DELIVERY":
        return "bg-cyan-100 text-cyan-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  // Filter orders based on search and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <BackofficeLayout title="Vendor Portal" navItems={vendorNavItems}>
      {isLoading ? (
        <div className="flex items-center justify-center p-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2b579a] border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="p-6 text-center">
          <p className="text-red-600">Error: {error}</p>
          <button
            onClick={() => fetchOrders()}
            className="mt-4 rounded-sm bg-[#2b579a] px-4 py-2 text-xs text-white hover:bg-[#1e3f7a]"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">Orders</h1>
              <p className="text-sm text-slate-600">
                Manage and fulfill customer orders.
              </p>
            </div>
          </div>

          {/* Stats */}
          <section className="mb-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-600">Pending</p>
              <p className="mt-1 text-2xl font-semibold text-amber-600">
                {orders.filter((o) => o.status === "PENDING").length}
              </p>
            </div>
            <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-600">Processing</p>
              <p className="mt-1 text-2xl font-semibold text-blue-600">
                {
                  orders.filter(
                    (o) => o.status === "CONFIRMED" || o.status === "PROCESSING"
                  ).length
                }
              </p>
            </div>
            <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-600">Shipped</p>
              <p className="mt-1 text-2xl font-semibold text-indigo-600">
                {orders.filter((o) => o.status === "SHIPPED").length}
              </p>
            </div>
            <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
              <p className="text-xs text-slate-600">Total Revenue</p>
              <p className="mt-1 text-2xl font-semibold text-green-600">
                KSh{" "}
                {orders
                  .reduce((sum, o) => sum + Number(o.total || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </section>

          {/* Filters */}
          <div className="mb-4 flex gap-3">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
            >
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <button
              onClick={() => fetchOrders()}
              className="rounded-sm border border-[#c8c8c8] bg-white px-3 py-1.5 text-xs hover:bg-[#f3f3f3]"
            >
              Refresh
            </button>
          </div>

          {/* Orders Table */}
          <div className="rounded-sm border border-[#c8c8c8]">
            <table className="w-full text-xs">
              <thead className="bg-[#f3f3f3]">
                <tr className="border-b border-[#c8c8c8]">
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Order ID
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Customer
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Items
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Total
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[#e8e8e8] hover:bg-[#f8f8f8]"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {order.customerName}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {order.items?.length || 0}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      KSh {Number(order.total || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusColor(order.status)}`}
                      >
                        {formatStatus(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openOrderDetails(order)}
                          className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-[10px] hover:bg-[#f3f3f3]"
                        >
                          View
                        </button>
                        {(order.status === "PENDING" ||
                          order.status === "CONFIRMED") && (
                          <button
                            onClick={() => openProcessModal(order)}
                            className="rounded-sm bg-[#2b579a] px-2 py-0.5 text-[10px] text-white hover:bg-[#1e3f7a]"
                          >
                            Process
                          </button>
                        )}
                        {order.status === "PROCESSING" && (
                          <button
                            onClick={() => openProcessModal(order)}
                            className="rounded-sm bg-[#2b579a] px-2 py-0.5 text-[10px] text-white hover:bg-[#1e3f7a]"
                          >
                            Ship
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Drawer */}
      <OrderDetailsDrawer
        order={selectedOrder}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onProcess={openProcessModal}
        onReportIssue={openReportIssue}
      />

      {/* Process Order Modal */}
      <ProcessOrderModal
        order={selectedOrder}
        isOpen={isProcessModalOpen}
        onClose={() => setIsProcessModalOpen(false)}
        onStatusUpdate={handleProcessOrder}
      />
    </BackofficeLayout>
  );
}
