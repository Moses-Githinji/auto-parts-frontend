import { useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";

interface Order {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  date: string;
}

export function VendorOrdersPage() {
  const vendorNavItems = [
    { label: "Dashboard", to: "/vendor" },
    { label: "Orders", to: "/vendor/orders" },
    { label: "Catalog", to: "/vendor/catalog" },
    { label: "Analytics", to: "/vendor/analytics" },
    { label: "Settings", to: "/vendor/settings" },
  ];

  const [orders] = useState<Order[]>([
    {
      id: "ORD-2024-001",
      customer: "John Doe",
      items: 3,
      total: 7500,
      status: "pending",
      date: "Jan 30, 2024",
    },
    {
      id: "ORD-2024-002",
      customer: "Jane Smith",
      items: 1,
      total: 2500,
      status: "processing",
      date: "Jan 29, 2024",
    },
    {
      id: "ORD-2024-003",
      customer: "Bob Wilson",
      items: 5,
      total: 12500,
      status: "shipped",
      date: "Jan 28, 2024",
    },
    {
      id: "ORD-2024-004",
      customer: "Alice Johnson",
      items: 2,
      total: 4500,
      status: "delivered",
      date: "Jan 27, 2024",
    },
    {
      id: "ORD-2024-005",
      customer: "Charlie Brown",
      items: 1,
      total: 1200,
      status: "cancelled",
      date: "Jan 26, 2024",
    },
  ]);

  const handleProcessOrder = (orderId: string) => {
    alert(`Processing order ${orderId}`);
  };

  const handleShipOrder = (orderId: string) => {
    alert(`Shipping order ${orderId}`);
  };

  return (
    <BackofficeLayout title="Vendor Portal" navItems={vendorNavItems}>
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
            <p className="text-xs text-slate-600">Pending Orders</p>
            <p className="mt-1 text-2xl font-semibold text-amber-600">
              {orders.filter((o) => o.status === "pending").length}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Processing</p>
            <p className="mt-1 text-2xl font-semibold text-blue-600">
              {orders.filter((o) => o.status === "processing").length}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Shipped Today</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {orders.filter((o) => o.status === "shipped").length}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Total Revenue</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              KSh {orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
            </p>
          </div>
        </section>

        {/* Filters */}
        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search orders..."
            className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
          />
          <select className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none">
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#e8e8e8] hover:bg-[#f8f8f8]"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">
                    {order.id}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{order.customer}</td>
                  <td className="px-4 py-3 text-slate-700">{order.items}</td>
                  <td className="px-4 py-3 text-slate-700">
                    KSh {order.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{order.date}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        order.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : order.status === "processing"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "shipped"
                              ? "bg-purple-100 text-purple-700"
                              : order.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-[10px] hover:bg-[#f3f3f3]">
                        View
                      </button>
                      {order.status === "pending" && (
                        <button
                          onClick={() => handleProcessOrder(order.id)}
                          className="rounded-sm bg-[#2b579a] px-2 py-0.5 text-[10px] text-white hover:bg-[#1e3f7a]"
                        >
                          Process
                        </button>
                      )}
                      {order.status === "processing" && (
                        <button
                          onClick={() => handleShipOrder(order.id)}
                          className="rounded-sm bg-[#2b579a] px-2 py-0.5 text-[10px] text-white hover:bg-[#1e3f7a]"
                        >
                          Ship
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </BackofficeLayout>
  );
}
