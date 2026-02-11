import { BackofficeLayout } from "../../layout/BackofficeLayout";

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
