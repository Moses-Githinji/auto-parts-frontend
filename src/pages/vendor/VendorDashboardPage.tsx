import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { useAuthStore } from "../../stores/authStore";
import { format } from "date-fns";
import { Tag } from "lucide-react";

function VendorPromotionBadge() {
  const { user } = useAuthStore();
  // We need to cast or guard because user might not be a Vendor (though this page is protected)
  // and we just added 'promotions' to the interface.
  // Ideally, useAuthStore should return a typed user based on role, but for now we check safely.
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
  const vendorNavItems = [
    { label: "Dashboard", to: "/vendor" },
    { label: "Orders", to: "/vendor/orders" },
    { label: "Catalog", to: "/vendor/catalog" },
    { label: "Analytics", to: "/vendor/analytics" },
    { label: "Settings", to: "/vendor/settings" },
  ];

  return (
    <BackofficeLayout title="Vendor Portal" navItems={vendorNavItems}>
      <div className="p-6">
        <VendorPromotionBadge />
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">
            Vendor Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            Overview of orders, catalog, and SLA metrics.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Orders to fulfill today</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-dark-text">3</p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">On-time shipment rate</p>
            <p className="mt-2 text-3xl font-semibold text-emerald-600">98%</p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Cancellation rate</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">1.2%</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-dark-text">
              Recent Orders
            </h2>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-dark-textMuted">
              <li className="flex items-center justify-between">
                <span>#1234 - John Doe</span>
                <span className="text-amber-600">Pending</span>
              </li>
              <li className="flex items-center justify-between">
                <span>#1235 - Jane Smith</span>
                <span className="text-green-600">Shipped</span>
              </li>
              <li className="flex items-center justify-between">
                <span>#1236 - Bob Wilson</span>
                <span className="text-slate-500 dark:text-dark-textMuted">Delivered</span>
              </li>
            </ul>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-dark-text">
              Product Performance
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-dark-textMuted">Total Products</span>
                <span className="font-medium text-slate-900 dark:text-dark-text">45</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-dark-textMuted">Low Stock Items</span>
                <span className="font-medium text-amber-600">3</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-dark-textMuted">Total Sales (MTD)</span>
                <span className="font-medium text-green-600">$12,450</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </BackofficeLayout>
  );
}
