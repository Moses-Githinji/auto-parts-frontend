import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { Badge } from "../../components/ui/badge";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";

export function AdminDeliveryReportsPage() {
  return (
    <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Delivery Reports
            </h1>
            <p className="text-sm text-slate-600">
              Track and analyze delivery performance across all orders.
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
            <p className="text-xs text-slate-600">Total Deliveries</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">12,456</p>
            <p className="mt-1 text-[10px] text-green-600">
              ↑ 18% vs last period
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">On-Time Delivery Rate</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">94.5%</p>
            <p className="mt-1 text-[10px] text-green-600">
              ↑ 2.3% vs last period
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Avg Delivery Time</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              2.4 days
            </p>
            <p className="mt-1 text-[10px] text-green-600">
              ↓ 0.3 days vs last period
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Failed Deliveries</p>
            <p className="mt-1 text-2xl font-semibold text-amber-600">234</p>
            <p className="mt-1 text-[10px] text-amber-600">
              1.9% of total deliveries
            </p>
          </div>
        </section>

        {/* Delivery Status Breakdown */}
        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Deliveries by Status
            </h3>
            <div className="flex items-center justify-center">
              <div className="flex gap-6 text-xs">
                <div className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-lg font-semibold text-green-700">
                    78%
                  </div>
                  <p className="mt-2 text-slate-600">Delivered</p>
                </div>
                <div className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
                    12%
                  </div>
                  <p className="mt-2 text-slate-600">In Transit</p>
                </div>
                <div className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-lg font-semibold text-amber-700">
                    6%
                  </div>
                  <p className="mt-2 text-slate-600">Pending</p>
                </div>
                <div className="text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-lg font-semibold text-red-700">
                    4%
                  </div>
                  <p className="mt-2 text-slate-600">Failed</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              Delivery Partners Performance
            </h3>
            <table className="w-full text-xs">
              <thead className="bg-[#f3f3f3]">
                <tr className="border-b border-[#c8c8c8]">
                  <th className="px-3 py-2 text-left font-medium text-slate-700">
                    Partner
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">
                    Deliveries
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700">
                    On-Time
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#e8e8e8]">
                  <td className="px-3 py-2 text-slate-900">G4S Logistics</td>
                  <td className="px-3 py-2 text-slate-700">5,234</td>
                  <td className="px-3 py-2 text-green-600">96%</td>
                </tr>
                <tr className="border-b border-[#e8e8e8]">
                  <td className="px-3 py-2 text-slate-900">
                    Faster Deliveries
                  </td>
                  <td className="px-3 py-2 text-slate-700">3,456</td>
                  <td className="px-3 py-2 text-green-600">94%</td>
                </tr>
                <tr className="border-b border-[#e8e8e8]">
                  <td className="px-3 py-2 text-slate-900">Nairobi Express</td>
                  <td className="px-3 py-2 text-slate-700">2,345</td>
                  <td className="px-3 py-2 text-green-600">92%</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-slate-900">Self Pickup</td>
                  <td className="px-3 py-2 text-slate-700">1,421</td>
                  <td className="px-3 py-2 text-slate-500">N/A</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Deliveries */}
        <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Recent Delivery Updates
          </h3>
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
                  Partner
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Status
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Est. Delivery
                </th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">
                  Actual
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#e8e8e8]">
                <td className="px-4 py-3 font-medium text-slate-900">
                  #ORD-12345
                </td>
                <td className="px-4 py-3 text-slate-700">John Doe</td>
                <td className="px-4 py-3 text-slate-700">G4S Logistics</td>
                <td className="px-4 py-3">
                  <Badge className="bg-green-100 text-green-700">
                    Delivered
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-500">2024-01-15</td>
                <td className="px-4 py-3 text-slate-500">2024-01-14</td>
              </tr>
              <tr className="border-b border-[#e8e8e8]">
                <td className="px-4 py-3 font-medium text-slate-900">
                  #ORD-12344
                </td>
                <td className="px-4 py-3 text-slate-700">Jane Smith</td>
                <td className="px-4 py-3 text-slate-700">Faster Deliveries</td>
                <td className="px-4 py-3">
                  <Badge className="bg-blue-100 text-blue-700">
                    In Transit
                  </Badge>
                </td>
                <td className="px-4 py-3 text-slate-500">2024-01-16</td>
                <td className="px-4 py-3 text-slate-500">-</td>
              </tr>
              <tr className="border-b border-[#e8e8e8]">
                <td className="px-4 py-3 font-medium text-slate-900">
                  #ORD-12343
                </td>
                <td className="px-4 py-3 text-slate-700">Mike Johnson</td>
                <td className="px-4 py-3 text-slate-700">Nairobi Express</td>
                <td className="px-4 py-3">
                  <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                </td>
                <td className="px-4 py-3 text-slate-500">2024-01-17</td>
                <td className="px-4 py-3 text-slate-500">-</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900">
                  #ORD-12342
                </td>
                <td className="px-4 py-3 text-slate-700">Sarah Williams</td>
                <td className="px-4 py-3 text-slate-700">G4S Logistics</td>
                <td className="px-4 py-3">
                  <Badge className="bg-red-100 text-red-700">Failed</Badge>
                </td>
                <td className="px-4 py-3 text-slate-500">2024-01-14</td>
                <td className="px-4 py-3 text-slate-500">-</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </BackofficeLayout>
  );
}
