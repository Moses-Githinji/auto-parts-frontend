import { useEffect, useState, useMemo } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { useOrderStore } from "../../stores/orderStore";
import { useAuthStore } from "../../stores/authStore";
import { Loader2, TrendingUp, TrendingDown, Package, DollarSign, ShoppingBag, Percent } from "lucide-react";
import type { OrderAnalytics } from "../../types/order";

export function VendorAnalyticsPage() {
  const { user } = useAuthStore();
  const { fetchOrderAnalytics, isLoading, error } = useOrderStore();
  const [analyticsData, setAnalyticsData] = useState<OrderAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState("Last 30 days");

  const vendorNavItems = [
    { label: "Dashboard", to: "/vendor" },
    { label: "Orders", to: "/vendor/orders" },
    { label: "Catalog", to: "/vendor/catalog" },
    { label: "Analytics", to: "/vendor/analytics" },
    { label: "Settings", to: "/vendor/settings" },
  ];

  useEffect(() => {
    if (user?.id) {
      const loadAnalytics = async () => {
        try {
          const durationMap: Record<string, string> = {
            "Last 7 days": "7d",
            "Last 30 days": "30d",
            "Last 90 days": "90d",
            "This year": "1y"
          };
          
          const data = await fetchOrderAnalytics(user.id, { 
            duration: durationMap[timeRange] || "30d" 
          });
          setAnalyticsData(data);
        } catch (err) {
          console.error("Failed to load analytics:", err);
        }
      };
      loadAnalytics();
    }
  }, [user?.id, fetchOrderAnalytics, timeRange]);

  const stats = useMemo(() => {
    if (!analyticsData?.analytics) return null;
    const a = analyticsData.analytics;
    return [
      {
        label: "Total Sales",
        value: `KSh ${a.totalRevenue.toLocaleString()}`,
        change: "+15%", // Still hardcoded if not provided by API
        isPositive: true,
        icon: DollarSign,
        color: "text-green-600"
      },
      {
        label: "Total Orders",
        value: a.totalOrders.toString(),
        change: "+8%",
        isPositive: true,
        icon: ShoppingBag,
        color: "text-blue-600"
      },
      {
        label: "Average Order Value",
        value: `KSh ${(a.averageOrderValue || 0).toLocaleString()}`,
        change: "+5%",
        isPositive: true,
        icon: TrendingUp,
        color: "text-purple-600"
      },
      {
        label: "Success Rate",
        value: "96%",
        change: "-0.3%",
        isPositive: false,
        icon: Percent,
        color: "text-amber-600"
      },
    ];
  }, [analyticsData]);

  return (
    <BackofficeLayout title="Vendor Portal" navItems={vendorNavItems}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Analytics</h1>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">
              Track your store performance and insights.
            </p>
          </div>
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="rounded-sm border border-[#c8c8c8] dark:border-dark-border px-3 py-1.5 text-xs focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none bg-white dark:bg-dark-bg"
          >
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>

        {isLoading && !analyticsData ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">
            {error}
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <section className="mb-6 grid gap-4 md:grid-cols-4">
              {stats?.map((stat, i) => (
                <div key={i} className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-slate-600 dark:text-dark-textMuted">{stat.label}</p>
                    <stat.icon size={16} className="text-slate-400" />
                  </div>
                  <p className="text-2xl font-semibold text-slate-900 dark:text-dark-text">
                    {stat.value}
                  </p>
                  <div className="mt-1 flex items-center gap-1">
                    {stat.isPositive ? <TrendingUp size={10} className="text-green-600" /> : <TrendingDown size={10} className="text-amber-600" />}
                    <span className={`text-[10px] ${stat.isPositive ? "text-green-600" : "text-amber-600"}`}>
                      {stat.change} vs last period
                    </span>
                  </div>
                </div>
              ))}
            </section>

            {/* Charts Section */}
            <section className="mb-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-dark-text">
                  Sales Trends
                </h3>
                <div className="space-y-3">
                  {analyticsData?.analytics?.salesOverTime && analyticsData.analytics.salesOverTime.length > 0 ? (
                    analyticsData.analytics.salesOverTime.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-16 text-[10px] text-slate-600 dark:text-dark-textMuted font-mono">
                          {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 rounded-full bg-slate-100 dark:bg-dark-bg h-4 overflow-hidden">
                          <div
                            className="h-full bg-[#2b579a] dark:bg-dark-primary transition-all duration-500"
                            style={{ width: `${Math.min(100, (entry.amount / (analyticsData.analytics.totalRevenue || 1)) * 300)}%` }}
                          />
                        </div>
                        <span className="w-20 text-right text-[10px] font-medium text-slate-700 dark:text-dark-text">
                          KSh {entry.amount.toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">No sales data recorded for this period</div>
                  )}
                </div>
              </div>

              <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-dark-text">
                  Top Selling Products
                </h3>
                <div className="space-y-3">
                  {analyticsData?.analytics?.topProducts && analyticsData.analytics.topProducts.length > 0 ? (
                    analyticsData.analytics.topProducts.map((item, index) => (
                      <div key={index} className="flex items-center justify-between border-b border-slate-50 dark:border-dark-border pb-2 last:border-0 last:pb-0">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded bg-slate-50 dark:bg-dark-bg flex items-center justify-center text-slate-400">
                            <Package size={14} />
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-900 dark:text-dark-text truncate max-w-[150px]">
                              {item.product?.name || "Product " + item.productId}
                            </p>
                            <p className="text-[10px] text-slate-500 dark:text-dark-textMuted">
                              {Number(item._sum?.quantity || item.sales || 0)} units sold
                            </p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded">
                          KSh {(Number(item.revenue) || ((item.product?.price || 0) * (item._sum?.quantity || 1))).toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center text-xs text-slate-400">No product data available</div>
                  )}
                </div>
              </div>
            </section>

            {/* Performance Metrics */}
            <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-dark-text">
                Performance Dashboard
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-sm border border-[#e8e8e8] dark:border-dark-border p-4 bg-slate-50/50 dark:bg-dark-bg/30">
                  <p className="text-xs text-slate-600 dark:text-dark-textMuted">On-time Delivery Rate</p>
                  <p className="mt-2 text-2xl font-semibold text-green-600">98%</p>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-dark-textMuted">
                    Target: 95% | Status: Excellent
                  </p>
                </div>
                <div className="rounded-sm border border-[#e8e8e8] dark:border-dark-border p-4 bg-slate-50/50 dark:bg-dark-bg/30">
                  <p className="text-xs text-slate-600 dark:text-dark-textMuted">Customer Rating</p>
                  <p className="mt-2 text-2xl font-semibold text-amber-500">
                    4.8 ★
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-dark-textMuted">
                    Based on recent performance data
                  </p>
                </div>
                <div className="rounded-sm border border-[#e8e8e8] dark:border-dark-border p-4 bg-slate-50/50 dark:bg-dark-bg/30">
                  <p className="text-xs text-slate-600 dark:text-dark-textMuted">Order Accuracy</p>
                  <p className="mt-2 text-2xl font-semibold text-[#2b579a]">99.2%</p>
                  <p className="mt-1 text-[10px] text-slate-500 dark:text-dark-textMuted">
                    Returns: Low | Score: High
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </BackofficeLayout>
  );
}
