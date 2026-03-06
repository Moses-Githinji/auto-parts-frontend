import { useEffect, useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";
import { useCommissionStore } from "../../stores/commissionStore";
import { Loader2, AlertCircle } from "lucide-react";

export function AdminEarningsPage() {
  const { 
    totalCommissions, 
    recentCommissions, 
    fetchCommissions, 
    isLoadingConfigs: isLoading, 
    configError: error 
  } = useCommissionStore();
  
  const [dateRange, setDateRange] = useState("month");

  useEffect(() => {
    fetchCommissions(dateRange);
  }, [fetchCommissions, dateRange]);

  return (
    <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Earnings</h1>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">
              Platform commission reports and revenue analytics.
            </p>
          </div>
          <div className="flex gap-2">
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-sm border border-[#c8c8c8] dark:border-dark-border px-3 py-1.5 text-xs focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none bg-white dark:bg-dark-surface"
            >
              <option value="7days">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="90days">Last 90 days</option>
              <option value="year">This year</option>
            </select>
            <button className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#f3f3f3] dark:hover:bg-dark-base dark:text-dark-text">
              Export
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 rounded-sm border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Key Metrics */}
        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm relative overflow-hidden">
            {isLoading && <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-100 dark:bg-dark-border animate-pulse" />}
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Total Commission Earned</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">
              KES {totalCommissions.toLocaleString()}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              Across all categories
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Avg Commission Rate</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">8.5%</p>
            <p className="mt-1 text-[10px] text-slate-600 dark:text-dark-textMuted">
              Variable by product category
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Status</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">Live</p>
            <p className="mt-1 text-[10px] text-slate-600 dark:text-dark-textMuted">
              Connected to backend
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Recent Activity</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">
              {recentCommissions.length}
            </p>
            <p className="mt-1 text-[10px] text-slate-600 dark:text-dark-textMuted">
              Transactions in period
            </p>
          </div>
        </section>

        {/* Status indicator for Admin */}
        {!isLoading && totalCommissions === 0 && recentCommissions.length === 0 && (
          <section className="mb-6 rounded-sm border border-slate-100 bg-slate-50/50 p-6 text-center dark:border-dark-border dark:bg-dark-base/50">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-surface">
              <AlertCircle className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-dark-text">No data to display</h3>
            <p className="mx-auto mt-2 max-w-xs text-xs text-slate-500 dark:text-dark-textMuted leading-relaxed">
              Platform revenue metrics will appear here once orders are processed through the gateway.
            </p>
          </section>
        )}

        {/* Recent Commissions */}
        <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-dark-text">
            Recent Commission Transactions
          </h3>
          <table className="w-full text-xs">
            <thead className="bg-[#f3f3f3] dark:bg-dark-base">
              <tr className="border-b border-[#c8c8c8] dark:border-dark-border">
                <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                  Order ID
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                  Vendor
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                  Order Amount
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                  Commission
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                  Rate
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading && recentCommissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-[#FF9900]" />
                      <span>Fetching commission data...</span>
                    </div>
                  </td>
                </tr>
              ) : recentCommissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">
                    No commission transactions found for this period.
                  </td>
                </tr>
              ) : (
                recentCommissions.map((comm) => (
                  <tr key={comm.id} className="border-b border-[#e8e8e8] dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-base transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-dark-text">
                      #{comm.orderNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-dark-text">{comm.vendorName}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-dark-text">KSh {comm.orderAmount.toLocaleString()}</td>
                    <td className="px-4 py-3 font-medium text-green-600 dark:text-green-500">
                      KSh {comm.commissionAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-dark-textMuted">{comm.commissionRate}%</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-dark-textMuted">
                      {new Date(comm.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </BackofficeLayout>
  );
}
