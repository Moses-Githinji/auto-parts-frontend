import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";

export function AdminEarningsPage() {
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
            <select className="rounded-sm border border-[#c8c8c8] dark:border-dark-border px-3 py-1.5 text-xs focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>This year</option>
            </select>
            <button className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#f3f3f3] dark:bg-dark-bg">
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Total Commission Earned</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">
              KSh 842,500
            </p>
            <p className="mt-1 text-[10px] text-green-600">
              ↑ 15% vs last period
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Avg Commission Rate</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">8.5%</p>
            <p className="mt-1 text-[10px] text-slate-600 dark:text-dark-textMuted">
              Variable by product category
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Total Orders (Commissions)</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">9,912</p>
            <p className="mt-1 text-[10px] text-green-600">
              ↑ 12% vs last period
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Pending Payouts</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">
              KSh 125,300
            </p>
            <p className="mt-1 text-[10px] text-amber-600">
              45 vendors pending
            </p>
          </div>
        </section>

        {/* Commission Breakdown */}
        <section className="mb-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-dark-text">
              Commission by Category
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-dark-textMuted">Brakes</span>
                  <span className="font-medium text-slate-900 dark:text-dark-text">
                    KSh 245,000
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#2b579a]"
                    style={{ width: "29%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-dark-textMuted">Engine Parts</span>
                  <span className="font-medium text-slate-900 dark:text-dark-text">
                    KSh 198,500
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#5c8a3d]"
                    style={{ width: "24%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-dark-textMuted">Suspension</span>
                  <span className="font-medium text-slate-900 dark:text-dark-text">
                    KSh 156,800
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#c8c8c8]"
                    style={{ width: "19%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-dark-textMuted">Electrical</span>
                  <span className="font-medium text-slate-900 dark:text-dark-text">
                    KSh 142,200
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#e8a849]"
                    style={{ width: "17%" }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-dark-textMuted">Other Parts</span>
                  <span className="font-medium text-slate-900 dark:text-dark-text">
                    KSh 100,000
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-[#7c7c7c]"
                    style={{ width: "12%" }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-dark-text">
              Commission Rate Tiers
            </h3>
            <table className="w-full text-xs">
              <thead className="bg-[#f3f3f3] dark:bg-dark-bg">
                <tr className="border-b border-[#c8c8c8] dark:border-dark-border">
                  <th className="px-3 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                    Category
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                    Rate
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                    Range
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#e8e8e8]">
                  <td className="px-3 py-2 text-slate-900 dark:text-dark-text">Premium Parts</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-dark-text">10%</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-dark-textMuted">All items</td>
                </tr>
                <tr className="border-b border-[#e8e8e8]">
                  <td className="px-3 py-2 text-slate-900 dark:text-dark-text">Brakes</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-dark-text">8%</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-dark-textMuted">All items</td>
                </tr>
                <tr className="border-b border-[#e8e8e8]">
                  <td className="px-3 py-2 text-slate-900 dark:text-dark-text">Engine Parts</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-dark-text">9%</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-dark-textMuted">All items</td>
                </tr>
                <tr className="border-b border-[#e8e8e8]">
                  <td className="px-3 py-2 text-slate-900 dark:text-dark-text">Regular Parts</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-dark-text">7%</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-dark-textMuted">
                    Items under KSh 5,000
                  </td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-slate-900 dark:text-dark-text">Bulk Orders</td>
                  <td className="px-3 py-2 text-slate-700 dark:text-dark-text">5%</td>
                  <td className="px-3 py-2 text-slate-500 dark:text-dark-textMuted">
                    Orders above KSh 50,000
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Commissions */}
        <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-dark-text">
            Recent Commission Transactions
          </h3>
          <table className="w-full text-xs">
            <thead className="bg-[#f3f3f3] dark:bg-dark-bg">
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
              <tr className="border-b border-[#e8e8e8]">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-dark-text">
                  #ORD-12345
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-dark-text">MotorParts KE</td>
                <td className="px-4 py-3 text-slate-700 dark:text-dark-text">KSh 45,000</td>
                <td className="px-4 py-3 font-medium text-green-600">
                  KSh 4,050
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-dark-textMuted">9%</td>
                <td className="px-4 py-3 text-slate-500 dark:text-dark-textMuted">2024-01-15</td>
              </tr>
              <tr className="border-b border-[#e8e8e8]">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-dark-text">
                  #ORD-12344
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-dark-text">AutoCare Plus</td>
                <td className="px-4 py-3 text-slate-700 dark:text-dark-text">KSh 12,500</td>
                <td className="px-4 py-3 font-medium text-green-600">
                  KSh 1,000
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-dark-textMuted">8%</td>
                <td className="px-4 py-3 text-slate-500 dark:text-dark-textMuted">2024-01-15</td>
              </tr>
              <tr className="border-b border-[#e8e8e8]">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-dark-text">
                  #ORD-12343
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-dark-text">SparePro Ltd</td>
                <td className="px-4 py-3 text-slate-700 dark:text-dark-text">KSh 28,000</td>
                <td className="px-4 py-3 font-medium text-green-600">
                  KSh 2,240
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-dark-textMuted">8%</td>
                <td className="px-4 py-3 text-slate-500 dark:text-dark-textMuted">2024-01-14</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-dark-text">
                  #ORD-12342
                </td>
                <td className="px-4 py-3 text-slate-700 dark:text-dark-text">MotorParts KE</td>
                <td className="px-4 py-3 text-slate-700 dark:text-dark-text">KSh 8,500</td>
                <td className="px-4 py-3 font-medium text-green-600">
                  KSh 595
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-dark-textMuted">7%</td>
                <td className="px-4 py-3 text-slate-500 dark:text-dark-textMuted">2024-01-14</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </BackofficeLayout>
  );
}
