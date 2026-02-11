import { useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { DELIVERY_MENU_ITEMS } from "../../layout/deliveryMenuConfig";

interface DeliveryHistoryItem {
  id: string;
  trackingId: string;
  date: string;
  status: "DELIVERED" | "FAILED" | "RETURNED";
  customerName: string;
  address: string;
  earnings: number;
}

export function DeliveryHistoryPage() {
  const [history] = useState<DeliveryHistoryItem[]>([
    {
      id: "HIST-001",
      trackingId: "TRK-882-X91",
      date: "2024-03-10",
      status: "DELIVERED",
      customerName: "Alice Johnson",
      address: "Kilimani, Nairobi",
      earnings: 450,
    },
    {
      id: "HIST-002",
      trackingId: "TRK-921-B22",
      date: "2024-03-09",
      status: "DELIVERED",
      customerName: "Bob Smith",
      address: "Lavington, Nairobi",
      earnings: 500,
    },
    {
      id: "HIST-003",
      trackingId: "TRK-112-C33",
      date: "2024-03-09",
      status: "FAILED",
      customerName: "Charlie Brown",
      address: "CBD, Nairobi",
      earnings: 0,
    },
  ]);

  const [periodFilter, setPeriodFilter] = useState("this_week");

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "FAILED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "RETURNED":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  // Calculate summary stats
  const totalEarnings = history.reduce((sum, item) => sum + item.earnings, 0);
  const deliveredCount = history.filter((h) => h.status === "DELIVERED").length;
  const failedCount = history.filter((h) => h.status === "FAILED").length;

  return (
    <BackofficeLayout title="Delivery Portal" menuItems={DELIVERY_MENU_ITEMS}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">
            Delivery History
          </h1>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            View your past delivery records.
          </p>
        </div>

        {/* Stats */}
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Delivered</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">{deliveredCount}</p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Failed</p>
            <p className="mt-1 text-2xl font-semibold text-red-600">{failedCount}</p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Total Earnings</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">
              KSh {totalEarnings.toLocaleString()}
            </p>
          </div>
        </section>

        {/* Filters */}
        <div className="mb-4 flex gap-3">
          <select
            value={periodFilter}
            onChange={(e) => setPeriodFilter(e.target.value)}
            className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight px-3 py-1.5 text-xs text-slate-700 dark:text-dark-text focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
          >
            <option value="this_week">This Week</option>
            <option value="last_week">Last Week</option>
            <option value="this_month">This Month</option>
          </select>
          <button className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight px-3 py-1.5 text-xs text-slate-700 dark:text-dark-text hover:bg-[#f3f3f3] dark:hover:bg-dark-bg">
            Refresh
          </button>
        </div>

        {/* History Table */}
        <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border">
          <table className="w-full text-xs">
            <thead className="bg-[#f3f3f3] dark:bg-dark-bg">
              <tr className="border-b border-[#c8c8c8] dark:border-dark-border">
                <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                  Tracking ID
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                  Date
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                  Customer
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                  Address
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                  Earnings
                </th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[#e8e8e8] dark:border-dark-border hover:bg-[#f8f8f8] dark:hover:bg-dark-bg"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-dark-text">
                    {item.trackingId}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-dark-text">
                    {item.date}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-dark-text">
                    {item.customerName}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-dark-text">
                    {item.address}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeClass(item.status)}`}>
                      {formatStatus(item.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-dark-text">
                    {item.earnings > 0 ? `+ KSh ${item.earnings}` : "—"}
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-dark-textMuted">
                    No delivery history found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </BackofficeLayout>
  );
}
