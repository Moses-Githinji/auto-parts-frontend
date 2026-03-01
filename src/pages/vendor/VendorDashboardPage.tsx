import { useEffect, useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { useAuthStore } from "../../stores/authStore";
import { useOrderStore } from "../../stores/orderStore";
import { format } from "date-fns";
import { Tag, TrendingUp, Package, Loader2, AlertTriangle } from "lucide-react";
import type { OrderAnalytics } from "../../types/order";
import { useNavigate } from "react-router-dom";
import { useProductStore } from "../../stores/productStore";

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
  const { fetchOrderAnalytics, fetchOrders, orders, isLoading } = useOrderStore();
  const { products, fetchProducts } = useProductStore();
  const [analyticsData, setAnalyticsData] = useState<OrderAnalytics | null>(null);

  const vendorNavItems = [
    { label: "Dashboard", to: "/vendor" },
    { label: "Orders", to: "/vendor/orders" },
    { label: "Catalog", to: "/vendor/catalog" },
    { label: "Analytics", to: "/vendor/analytics" },
    { label: "Earnings", to: "/vendor/earnings" },
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
        } catch (err) {
          console.error("Failed to load dashboard data:", err);
        }
      };
      loadDashboardData();
    }
  }, [user?.id, fetchOrderAnalytics, fetchOrders, fetchProducts]);

  const recentOrders = orders.slice(0, 5);
  const a = analyticsData?.analytics;
  const lowStockItems = products.filter(p => p.stock <= 5);

  return (
    <BackofficeLayout title="Vendor Portal" navItems={vendorNavItems}>
      <div className="p-6">
        <VendorPromotionBadge />

        {lowStockItems.length > 0 && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-900 dark:text-red-200">
                  Low Stock Alert ({lowStockItems.length} items)
                </h3>
                <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                  You have {lowStockItems.length} products with 5 or fewer items in stock.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lowStockItems.slice(0, 3).map(item => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/vendor/catalog?search=${encodeURIComponent(item.partNumber)}`)}
                      className="inline-flex items-center rounded-md bg-white dark:bg-dark-base px-2.5 py-1.5 text-xs font-medium text-red-700 dark:text-red-400 shadow-sm ring-1 ring-inset ring-red-200 hover:bg-slate-50 transition-colors"
                    >
                      Restock {item.name} ({item.stock} left)
                    </button>
                  ))}
                  {lowStockItems.length > 3 && (
                    <button
                      onClick={() => navigate("/vendor/catalog")}
                      className="inline-flex items-center rounded-md bg-transparent px-2.5 py-1.5 text-xs font-medium text-red-700 hover:text-red-800 underline underline-offset-2"
                    >
                      View all
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">
            Vendor Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            Overview of orders, catalog, and performance metrics.
          </p>
        </div>

        {isLoading && !analyticsData ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#2b579a]" />
          </div>
        ) : (
          <>
            <section className="grid gap-4 md:grid-cols-3">
              <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
                <p className="text-xs text-slate-600 dark:text-dark-textMuted">Total Revenue (30d)</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-dark-text">
                  KSh {(a?.totalRevenue || 0).toLocaleString()}
                </p>
              </div>
              <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
                <p className="text-xs text-slate-600 dark:text-dark-textMuted">Total Orders (30d)</p>
                <p className="mt-2 text-2xl font-semibold text-emerald-600">
                  {a?.totalOrders || 0}
                </p>
              </div>
              <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
                <p className="text-xs text-slate-600 dark:text-dark-textMuted">Average Order Value</p>
                <p className="mt-2 text-2xl font-semibold text-[#2b579a]">
                  KSh {(a?.averageOrderValue || 0).toLocaleString()}
                </p>
              </div>
            </section>

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
                    a.salesOverTime.slice(-7).map((entry, idx) => (
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
          </>
        )}
      </div>
    </BackofficeLayout>
  );
}
