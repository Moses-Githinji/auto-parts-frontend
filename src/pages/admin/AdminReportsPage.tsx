import { BackofficeLayout } from "../../layout/BackofficeLayout";

export function AdminReportsPage() {
  const navItems = [
    { label: "Dashboard", to: "/admin" },
    { label: "Vendors", to: "/admin/vendors" },
    { label: "Catalog", to: "/admin/catalog" },
    { label: "Disputes", to: "/admin/disputes" },
    { label: "Reports", to: "/admin/reports" },
  ];

  return (
    <BackofficeLayout title="Admin Console" navItems={navItems}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
            <p className="text-sm text-slate-600">
              Analytics and performance reports.
            </p>
          </div>
          <div className="flex gap-2">
            <select className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
            </select>
            <button className="rounded-sm border border-[#c8c8c8] bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#f3f3f3]">
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Total Revenue</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              KSh 4.2M
            </p>
            <p className="mt-1 text-[10px] text-green-600">
              ↑ 12% vs last period
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Total Orders</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">1,234</p>
            <p className="mt-1 text-[10px] text-green-600">
              ↑ 8% vs last period
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Active Vendors</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">45</p>
            <p className="mt-1 text-[10px] text-green-600">
              ↑ 5 new this month
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Customer Satisfaction</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">4.5/5</p>
            <p className="mt-1 text-[10px] text-green-600">
              ↑ 0.2 vs last period
            </p>
          </div>
        </section>

        {/* Charts Section */}
        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Revenue by Category
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Brakes</span>
                  <span className="font-medium text-slate-900">KSh 1.2M</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#2b579a]"
                    style={{ width: "35%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Engine Parts</span>
                  <span className="font-medium text-slate-900">KSh 980K</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#5c8a3d]"
                    style={{ width: "28%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Suspension</span>
                  <span className="font-medium text-slate-900">KSh 750K</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#c8c8c8]"
                    style={{ width: "22%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">Electrical</span>
                  <span className="font-medium text-slate-900">KSh 450K</span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#e8a849]"
                    style={{ width: "13%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Orders by Status
            </h3>
            <div className="flex items-center justify-center">
              <div className="flex gap-6 text-xs">
                <div className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-lg font-semibold text-green-700">
                    65%
                  </div>
                  <p className="mt-2 text-slate-600">Delivered</p>
                </div>
                <div className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
                    20%
                  </div>
                  <p className="mt-2 text-slate-600">Shipped</p>
                </div>
                <div className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-lg font-semibold text-amber-700">
                    10%
                  </div>
                  <p className="mt-2 text-slate-600">Processing</p>
                </div>
                <div className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-lg font-semibold text-red-700">
                    5%
                  </div>
                  <p className="mt-2 text-slate-600">Cancelled</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Top Vendors */}
        <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Top Performing Vendors
          </h3>
          <table className="w-full text-xs">
            <thead className="bg-[#f3f3f3]">
              <tr className="border-b border-[#c8c8c8]">
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Rank
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Vendor
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Orders
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Revenue
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Rating
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#e8e8e8]">
                <td className="px-4 py-3">
                  <span className="font-semibold text-amber-500">1</span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  MotorParts KE
                </td>
                <td className="px-4 py-3 text-slate-700">456</td>
                <td className="px-4 py-3 text-slate-700">KSh 1.2M</td>
                <td className="px-4 py-3 text-green-600">4.8 ★</td>
              </tr>
              <tr className="border-b border-[#e8e8e8]">
                <td className="px-4 py-3">
                  <span className="font-semibold text-slate-400">2</span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  AutoCare Plus
                </td>
                <td className="px-4 py-3 text-slate-700">312</td>
                <td className="px-4 py-3 text-slate-700">KSh 890K</td>
                <td className="px-4 py-3 text-green-600">4.6 ★</td>
              </tr>
              <tr>
                <td className="px-4 py-3">
                  <span className="font-semibold text-amber-700">3</span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  SparePro Ltd
                </td>
                <td className="px-4 py-3 text-slate-700">234</td>
                <td className="px-4 py-3 text-slate-700">KSh 650K</td>
                <td className="px-4 py-3 text-green-600">4.4 ★</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </BackofficeLayout>
  );
}
