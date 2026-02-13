import { useEffect, useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";
import { apiClient } from "../../lib/apiClient";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Loader2, DollarSign, TrendingUp, TrendingDown, Download } from "lucide-react";

interface FinancialSummary {
  totalRevenue: number;
  platformCommissions: number;
  vendorPayoutsPending: number;
  vendorPayoutsCompleted: number;
  netPlatformEarnings: number;
  breakdown: {
    mpesa: { count: number; amount: number };
    stripe: { count: number; amount: number };
  };
}

interface Transaction {
  id: string;
  orderNumber: string;
  vendorName: string;
  amount: number;
  commission: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

interface VendorPayout {
  id: string;
  vendorName: string;
  amount: number;
  commission: number;
  netAmount: number;
  orderCount: number;
  status: "PENDING" | "COMPLETED";
  createdAt: string;
  paidAt?: string;
}

export function AdminFinancesPage() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vendorPayouts, setVendorPayouts] = useState<VendorPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"transactions" | "payouts">("transactions");

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [summaryRes, transactionsRes, payoutsRes] = await Promise.all([
        apiClient.get<FinancialSummary>("/api/admin/finances/summary"),
        apiClient.get<{ transactions: Transaction[] }>("/api/admin/finances/transactions"),
        apiClient.get<{
          pendingPayouts: any[];
          completedPayouts: any[];
        }>("/api/admin/finances/payouts"),
      ]);

      setSummary(summaryRes);
      setTransactions(transactionsRes.transactions);

      // Merge pending and completed payouts for the table
      const formattedPayouts: VendorPayout[] = [
        ...payoutsRes.pendingPayouts.map((p) => ({
          id: `pending-${p.vendorId}`,
          vendorName: p.vendorName,
          amount: p.amount,
          commission: 0, // Backend pending agg doesn't explicitly send commission, defaulting
          netAmount: p.amount,
          orderCount: p.orderCount,
          status: "PENDING" as const,
          createdAt: new Date().toISOString(), // No created date for agg
        })),
        ...payoutsRes.completedPayouts.map((p) => ({
          id: p.id,
          vendorName: p.vendorName,
          amount: p.amount, // This is net amount in backend
          commission: 0,
          netAmount: p.amount,
          orderCount: 0, // Not in completed payout list from backend
          status: "COMPLETED" as const,
          createdAt: p.date,
          paidAt: p.date,
        })),
      ];

      setVendorPayouts(formattedPayouts);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load financial data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ["Order", "Vendor", "Amount", "Commission", "Payment Method", "Status", "Date"],
      ...transactions.map((t) => [
        t.orderNumber,
        t.vendorName,
        t.amount,
        t.commission,
        t.paymentMethod,
        t.status,
        new Date(t.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finances-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  if (isLoading && !summary) {
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-dark-text">Financial Overview</h1>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">
              Complete financial tracking and vendor payouts
            </p>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                Total Revenue
              </span>
            </div>
            <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              KES {summary.totalRevenue.toLocaleString()}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Before commissions & payouts
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-gradient-to-br from-[#FF9900]/10 to-[#FF9900]/20 p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-[#FF9900]" />
              <span className="text-sm font-medium text-slate-700 dark:text-dark-text">
                Platform Commissions
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-dark-text">
              KES {summary.platformCommissions.toLocaleString()}
            </p>
            <p className="text-xs text-slate-600 dark:text-dark-textMuted mt-1">
              Earned from all sales
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900 dark:text-green-200">
                Net Platform Earnings
              </span>
            </div>
            <p className="text-3xl font-bold text-green-900 dark:text-green-100">
              KES {summary.netPlatformEarnings.toLocaleString()}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              Revenue - Vendor Payouts
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-dark-text">
                Vendor Payouts Pending
              </span>
            </div>
            <p className="text-3xl font-bold text-yellow-600">
              KES {summary.vendorPayoutsPending.toLocaleString()}
            </p>
            <p className="text-xs text-slate-600 dark:text-dark-textMuted mt-1">
              Awaiting delivery confirmation
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-6">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-slate-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-dark-text">
                Vendor Payouts Completed
              </span>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-dark-text">
              KES {summary.vendorPayoutsCompleted.toLocaleString()}
            </p>
            <p className="text-xs text-slate-600 dark:text-dark-textMuted mt-1">
              Already paid to vendors
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium text-slate-700 dark:text-dark-text">
                Payment Method Breakdown
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-dark-textMuted">M-Pesa</span>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-dark-text">
                    KES {summary.breakdown.mpesa.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-dark-textMuted">
                    {summary.breakdown.mpesa.count} transactions
                  </p>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-dark-textMuted">Stripe</span>
                <div className="text-right">
                  <p className="font-semibold text-slate-900 dark:text-dark-text">
                    KES {summary.breakdown.stripe.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-dark-textMuted">
                    {summary.breakdown.stripe.count} transactions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Financial Flow Diagram */}
      <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text mb-4">
          Financial Flow
        </h2>
        <div className="flex items-center justify-between text-sm">
          <div className="text-center">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted mb-1">Total Revenue</p>
            <p className="text-lg font-bold text-blue-600">
              {summary ? `KES ${summary.totalRevenue.toLocaleString()}` : "-"}
            </p>
          </div>
          <div className="text-2xl text-slate-400">→</div>
          <div className="text-center">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted mb-1">Vendor Earnings</p>
            <p className="text-lg font-bold text-slate-900 dark:text-dark-text">
              {summary
                ? `KES ${(summary.vendorPayoutsPending + summary.vendorPayoutsCompleted).toLocaleString()}`
                : "-"}
            </p>
          </div>
          <div className="text-2xl text-slate-400">+</div>
          <div className="text-center">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted mb-1">Platform Commission</p>
            <p className="text-lg font-bold text-[#FF9900]">
              {summary ? `KES ${summary.platformCommissions.toLocaleString()}` : "-"}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-dark-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "transactions"
                ? "border-[#FF9900] text-[#FF9900]"
                : "border-transparent text-slate-600 dark:text-dark-textMuted hover:text-slate-900 dark:hover:text-dark-text"
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "payouts"
                ? "border-[#FF9900] text-[#FF9900]"
                : "border-transparent text-slate-600 dark:text-dark-textMuted hover:text-slate-900 dark:hover:text-dark-text"
            }`}
          >
            Vendor Payouts
          </button>
        </div>
      </div>

      {/* Transactions Tab */}
      {activeTab === "transactions" && (
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-bg border-b border-slate-200 dark:border-dark-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Order</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Vendor</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Commission</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Payment</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-dark-textMuted">
                      No transactions yet
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-dark-bg">
                      <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-dark-text">
                        {transaction.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-dark-text">
                        {transaction.vendorName}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-dark-text">
                        KES {transaction.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#FF9900]">
                        KES {transaction.commission.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="capitalize">
                          {transaction.paymentMethod}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{transaction.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted">
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-bg border-b border-slate-200 dark:border-dark-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Vendor</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Commission</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Net Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Orders</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                {vendorPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-dark-textMuted">
                      No vendor payouts yet
                    </td>
                  </tr>
                ) : (
                  vendorPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-50 dark:hover:bg-dark-bg">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-dark-text">
                        {payout.vendorName}
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-dark-text">
                        KES {payout.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-red-600">
                        -KES {payout.commission.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-green-600">
                        KES {payout.netAmount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-dark-text">
                        {payout.orderCount} orders
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={
                            payout.status === "COMPLETED"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-yellow-50 text-yellow-700 border-yellow-200"
                          }
                        >
                          {payout.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted">
                        {payout.paidAt
                          ? new Date(payout.paidAt).toLocaleDateString()
                          : new Date(payout.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
    </BackofficeLayout>
  );
}
