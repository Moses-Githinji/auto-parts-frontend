import { useEffect, useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { useAuthStore } from "../../stores/authStore";
import { useOrderStore } from "../../stores/orderStore";
import { format } from "date-fns";
import { Package, Loader2, AlertTriangle, ShieldCheck, Tag, TrendingUp, XCircle, AlertCircle, Activity } from "lucide-react";
import type { OrderAnalytics } from "../../types/order";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../stores/productStore";
import { useVendorStore } from "../../stores/vendorStore";
import { ProtectedPayoutBadge } from "../../components/vendor/ProtectedPayoutBadge";
import { VendorHealthCard } from "../../components/vendor/VendorHealthCard";
import { cn } from "../../lib/cn";

function VendorPromotionBadge() {
  const { user } = useAuthStore();
  const promotions = (user as any)?.promotions; 
  const activePromo = promotions?.[0];

  if (!activePromo) return null;

  const isPercentage = activePromo.promotion.discountType === "PERCENTAGE";
  const value = Number(activePromo.promotion.discountValue);
  const text = isPercentage ? `${value}% OFF Commission` : `KES ${value} OFF Commission`;

  return (
    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
      <Tag className="h-4 w-4" />
      <span>{text}</span>
      <span className="ml-1 text-xs text-green-600 dark:text-green-500">
        (Expires {format(new Date(activePromo.expiresAt), "MMM d, yyyy")})
      </span>
    </div>
  );
}

export function VendorDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { fetchOrderAnalytics, fetchOrders, orders, isLoading: ordersLoading } = useOrderStore();
  const { products, fetchProducts } = useProductStore();
  const { stats: vendorStats, fetchDashboardStats, isLoading: vendorLoading } = useVendorStore();
  const [analyticsData, setAnalyticsData] = useState<OrderAnalytics | null>(null);

  const vendorNavItems = [
    { label: "Dashboard", to: "/vendor" },
    { label: "Orders", to: "/vendor/orders" },
    { label: "Catalog", to: "/vendor/catalog" },
    { label: "Analytics", to: "/vendor/analytics" },
    { label: "Earnings", to: "/vendor/earnings" },
    { label: "Referrals", to: "/vendor/referrals" },
    { label: "Settings", to: "/vendor/settings" },
    { label: "Suggestions", to: "/vendor/suggestions" },
  ];

  useEffect(() => {
    if (user?.id) {
      const loadDashboardData = async () => {
        try {
          // Fetch analytics for last 30 days
          const analytics = await fetchOrderAnalytics(user.id, { duration: "30d" });
          setAnalyticsData(analytics);
          
          // Fetch recent orders
          await fetchOrders({ vendorId: user.id, limit: 5 });
          
          // Fetch overall products to check for low stock
          await fetchProducts({ vendorId: user.id, limit: 100 });

          // Fetch vendor health stats
          await fetchDashboardStats();
        } catch (err) {
          console.error("Failed to load dashboard data:", err);
        }
      };
      loadDashboardData();
    }
  }, [user?.id, fetchOrderAnalytics, fetchOrders, fetchProducts, fetchDashboardStats]);

  const recentOrders = orders.slice(0, 5);
  const a = analyticsData?.analytics;
  const lowStockItems = products.filter(p => p.stock <= 5);

  return (
    <BackofficeLayout title="Vendor Portal" navItems={vendorNavItems}>
      <div className="p-6">
        {/* Risk Alerts */}
        {vendorStats?.health?.riskAlert && (
          <div className={cn(
            "mb-6 flex items-start gap-3 rounded-lg border p-4 shadow-sm",
            vendorStats.health.riskAlert.type === 'CRITICAL' 
              ? "border-red-200 bg-red-50 text-red-900 dark:bg-red-900/20 dark:text-red-200"
              : "border-amber-200 bg-amber-50 text-amber-900 dark:bg-amber-900/20 dark:text-amber-200"
          )}>
            {vendorStats.health.riskAlert.type === 'CRITICAL' 
              ? <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              : <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
            }
            <div className="flex-1">
              <h4 className="text-sm font-bold uppercase tracking-wider">
                {vendorStats.health.riskAlert.type} Account Risk Alert
              </h4>
              <p className="mt-1 text-sm leading-relaxed">
                {vendorStats.health.riskAlert.message}
              </p>
              <button 
                onClick={() => navigate("/vendor/settings")}
                className="mt-3 text-xs font-semibold underline underline-offset-4 hover:opacity-80"
              >
                Resolve issues now &rarr;
              </button>
            </div>
          </div>
        )}

        <VendorPromotionBadge />

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">
            Vendor Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            Overview of orders, catalog, and performance metrics.
          </p>
        </div>

        {/* Main Content Area */}
        {((ordersLoading || vendorLoading) && !analyticsData) ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#2b579a]" />
          </div>
        ) : (
          <div className="space-y-6 p-4">
            {/* Low Stock Alert - Integrated before the grid */}
            {lowStockItems.length > 0 && (
              <div className="rounded-lg border border-red-200 bg-red-50/50 dark:bg-red-900/10 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-red-900 dark:text-red-200">
                        Inventory Action Required
                      </h3>
                      <button 
                        onClick={() => navigate("/vendor/catalog")}
                        className="text-[10px] font-bold uppercase tracking-wider text-red-700 hover:underline"
                      >
                        View Catalog &rarr;
                      </button>
                    </div>
                    <p className="mt-0.5 text-xs text-red-700 dark:text-red-300">
                      {lowStockItems.length} products are running low on stock (5 or fewer items remaining).
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {lowStockItems.slice(0, 4).map(item => (
                        <button
                          key={item.id}
                          onClick={() => navigate(`/vendor/catalog?search=${encodeURIComponent(item.partNumber)}`)}
                          className="inline-flex items-center rounded-lg bg-white dark:bg-dark-base px-2.5 py-1.5 text-[10px] font-semibold text-red-800 shadow-sm ring-1 ring-inset ring-red-100 hover:bg-red-50 transition-all active:scale-95"
                        >
                          {item.name} ({item.stock})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Left Column: Health Card */}
              <div className="lg:col-span-1">
                {vendorLoading ? (
                  <div className="h-[200px] w-full animate-pulse rounded-xl bg-slate-100 dark:bg-dark-base border border-slate-200 dark:border-dark-border flex items-center justify-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Loading Health...</span>
                  </div>
                ) : vendorStats?.health ? (
                  <VendorHealthCard health={vendorStats.health} />
                ) : (
                  <div className="flex h-full min-h-[180px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/30 p-6 text-center dark:border-dark-border dark:bg-dark-base">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-dark-surface">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text">Health Analysis Pending</h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-dark-textMuted max-w-[200px]">
                      We're analyzing your recent activity. Complete 5 orders to unlock your Health Badge and faster payouts.
                    </p>
                    <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      <Activity className="h-3 w-3" />
                      Calculated daily at midnight
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Key Stats */}
              <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
                <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <p className="text-xs text-slate-600 dark:text-dark-textMuted">Total Revenue (30d)</p>
                    <ProtectedPayoutBadge showText={false} />
                  </div>
                  <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-dark-text">
                    KSh {(a?.totalRevenue || 0).toLocaleString()}
                  </p>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-50/50 dark:bg-blue-900/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none" />
                </div>
                <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
                  <p className="text-xs text-slate-600 dark:text-dark-textMuted">Total Orders (30d)</p>
                  <p className="mt-2 text-2xl font-semibold text-emerald-600">
                    {a?.totalOrders || 0}
                  </p>
                </div>
                <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm col-span-full">
                  <p className="text-xs text-slate-600 dark:text-dark-textMuted">Average Order Value</p>
                  <p className="mt-2 text-2xl font-semibold text-[#2b579a]">
                    KSh {(a?.averageOrderValue || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50/50 dark:bg-blue-900/20 p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    Your Payouts are Protected
                  </h3>
                  <p className="mt-1 text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    All successfully delivered orders are subject to a 14-day customer protection period. 
                    Once confirmed, funds are moved to your withdrawable balance. Every transaction is covered by the 
                    SakaParts GIT Risk Pool, protecting you against shipping damage claims.
                  </p>
                </div>
              </div>
            </div>

            <section className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-dark-text">
                  Recent Orders
                </h2>
                <div className="space-y-2">
                  {recentOrders.length > 0 ? (
                    recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 dark:border-dark-border last:border-0">
                        <span className="text-slate-700 dark:text-dark-text">#{order.orderNumber} - {order.customerName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          order.status === 'PENDING' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          order.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">No recent orders</p>
                  )}
                </div>
              </div>

              <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
                <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-dark-text">
                  Sales Trends (Last 7 Days)
                </h2>
                <div className="space-y-2">
                  {a?.salesOverTime && a.salesOverTime.slice(-7).length > 0 ? (
                    a.salesOverTime.slice(-7).map((entry: { date: string; amount: number }, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-12 text-[10px] text-slate-500 font-mono">
                          {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                        <div className="flex-1 h-3 bg-slate-100 dark:bg-dark-base rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#2b579a]" 
                            style={{ width: `${Math.min(100, (entry.amount / (a.totalRevenue || 1)) * 500)}%` }}
                          />
                        </div>
                        <span className="w-16 text-right text-[10px] font-medium">
                          {entry.amount.toLocaleString()}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 py-4 text-center">No trend data available</p>
                  )}
                </div>
              </div>
            </section>

            <section className="mt-6">
              <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
                <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-dark-text">
                  Performance Summary
                </h3>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Growth</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-dark-text">+12.5%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                      <Package size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Fulfillment</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-dark-text">98.2%</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase">Rating</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-dark-text">4.8 ★</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
