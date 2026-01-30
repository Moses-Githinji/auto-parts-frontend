import { BackofficeLayout } from "../../layout/BackofficeLayout";

export function VendorAnalyticsPage() {
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
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Analytics</h1>
            <p className="text-sm text-slate-600">
              Track your store performance and insights.
            </p>
          </div>
          <select className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>This year</option>
          </select>
        </div>

        {/* Key Metrics */}
        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Total Sales</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              KSh 1.2M
            </p>
            <p className="mt-1 text-[10px] text-green-600">
              ↑ 15% vs last period
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Total Orders</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">156</p>
            <p className="mt-1 text-[10px] text-green-600">
              ↑ 8% vs last period
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Average Order Value</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              KSh 7,692
            </p>
            <p className="mt-1 text-[10px] text-green-600">
              ↑ 5% vs last period
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Conversion Rate</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">3.2%</p>
            <p className="mt-1 text-[10px] text-amber-600">
              ↓ 0.3% vs last period
            </p>
          </div>
        </section>

        {/* Charts Section */}
        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Sales Over Time
            </h3>
            <div className="space-y-2">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                <div key={day} className="flex items-center gap-2">
                  <span className="w-8 text-xs text-slate-600">{day}</span>
                  <div className="flex-1 rounded bg-slate-100">
                    <div
                      className="h-6 rounded bg-[#2b579a]"
                      style={{ width: `${Math.random() * 80 + 20}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-xs text-slate-700">
                    KSh {(Math.random() * 50000 + 10000).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Top Selling Products
            </h3>
            <div className="space-y-3">
              {[
                {
                  name: "Ceramic Brake Pads",
                  sales: 45,
                  revenue: "KSh 112,500",
                },
                {
                  name: "Premium Oil Filter",
                  sales: 38,
                  revenue: "KSh 32,300",
                },
                { name: "Suspension Kit", sales: 12, revenue: "KSh 102,000" },
                { name: "Alternator 12V", sales: 8, revenue: "KSh 100,000" },
              ].map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-900">
                      {product.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {product.sales} sales
                    </p>
                  </div>
                  <span className="text-xs font-medium text-green-600">
                    {product.revenue}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Performance Metrics */}
        <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Performance Metrics
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-sm border border-[#e8e8e8] p-4">
              <p className="text-xs text-slate-600">On-time Delivery Rate</p>
              <p className="mt-2 text-2xl font-semibold text-green-600">98%</p>
              <p className="mt-1 text-[10px] text-slate-500">
                Target: 95% | Score: Excellent
              </p>
            </div>
            <div className="rounded-sm border border-[#e8e8e8] p-4">
              <p className="text-xs text-slate-600">Customer Rating</p>
              <p className="mt-2 text-2xl font-semibold text-amber-500">
                4.6 ★
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                Based on 234 reviews
              </p>
            </div>
            <div className="rounded-sm border border-[#e8e8e8] p-4">
              <p className="text-xs text-slate-600">Return Rate</p>
              <p className="mt-2 text-2xl font-semibold text-amber-600">2.1%</p>
              <p className="mt-1 text-[10px] text-slate-500">
                Target: &lt;3% | Score: Good
              </p>
            </div>
          </div>
        </div>
      </div>
    </BackofficeLayout>
  );
}
