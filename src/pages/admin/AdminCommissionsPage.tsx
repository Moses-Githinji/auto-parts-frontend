import { useEffect, useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";
import { useCommissionStore } from "../../stores/commissionStore";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Loader2, Download, Search, TrendingUp } from "lucide-react";
import { Input } from "../../components/ui/input";

export function AdminCommissionsPage() {
  const {
    totalCommissions,
    commissionsByVendor,
    recentCommissions,
    isLoadingConfigs,
    configError,
    fetchCommissions,
  } = useCommissionStore();

  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<"week" | "month" | "year" | "all">("month");

  useEffect(() => {
    fetchCommissions(dateRange);
  }, [dateRange]);

  const filteredVendors = commissionsByVendor.filter((vendor) =>
    vendor.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExport = () => {
    // TODO: Implement CSV export
    const csv = [
      ["Vendor", "Total Sales", "Commission Rate", "Commission Earned", "Orders"],
      ...filteredVendors.map((v) => [
        v.vendorName,
        v.totalSales,
        `${v.commissionRate}%`,
        v.commissionEarned,
        v.orderCount,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commissions-${dateRange}-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (isLoadingConfigs && commissionsByVendor.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
      </div>
    );
  }

  return (
    <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
      <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-dark-text">Platform Commissions</h1>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            Track commissions earned from vendor sales
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      {configError && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{configError}</p>
        </div>
      )}

      {/* Summary Card */}
      <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-gradient-to-br from-[#FF9900]/10 to-[#FF9900]/5 p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="rounded-full bg-[#FF9900] p-2">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-dark-textMuted">
              Total Platform Commissions
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-dark-text">
              KES {totalCommissions.toLocaleString()}
            </p>
          </div>
        </div>
        <p className="text-xs text-slate-500 dark:text-dark-textMuted">
          Earned from {commissionsByVendor.reduce((sum, v) => sum + v.orderCount, 0)} orders across{" "}
          {commissionsByVendor.length} vendors
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={dateRange === "week" ? "default" : "outline"}
          onClick={() => setDateRange("week")}
        >
          This Week
        </Button>
        <Button
          size="sm"
          variant={dateRange === "month" ? "default" : "outline"}
          onClick={() => setDateRange("month")}
        >
          This Month
        </Button>
        <Button
          size="sm"
          variant={dateRange === "year" ? "default" : "outline"}
          onClick={() => setDateRange("year")}
        >
          This Year
        </Button>
        <Button
          size="sm"
          variant={dateRange === "all" ? "default" : "outline"}
          onClick={() => setDateRange("all")}
        >
          All Time
        </Button>
      </div>

      {/* Commission by Vendor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
            Commission by Vendor
          </h2>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search vendors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-bg border-b border-slate-200 dark:border-dark-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Vendor</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Total Sales</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Commission Rate</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Commission Earned</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                {filteredVendors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-dark-textMuted">
                      {searchTerm ? "No vendors found" : "No commission data yet"}
                    </td>
                  </tr>
                ) : (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.vendorId} className="hover:bg-slate-50 dark:hover:bg-dark-bg">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-dark-text">
                        {vendor.vendorName}
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-dark-text">
                        KES {vendor.totalSales.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{vendor.commissionRate}%</Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#FF9900]">
                        KES {vendor.commissionEarned.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted">
                        {vendor.orderCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent Commissions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
          Recent Commissions
        </h2>

        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-bg border-b border-slate-200 dark:border-dark-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Order</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Vendor</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Order Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Rate</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Commission</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                {recentCommissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 dark:text-dark-textMuted">
                      No recent commissions
                    </td>
                  </tr>
                ) : (
                  recentCommissions.map((commission) => (
                    <tr key={commission.id} className="hover:bg-slate-50 dark:hover:bg-dark-bg">
                      <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-dark-text">
                        {commission.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-dark-text">
                        {commission.vendorName}
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-dark-text">
                        KES {commission.orderAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{commission.commissionRate}%</Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#FF9900]">
                        KES {commission.commissionAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted">
                        {new Date(commission.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    </BackofficeLayout>
  );
}
