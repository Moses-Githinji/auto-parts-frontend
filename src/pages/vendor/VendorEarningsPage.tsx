import { useEffect, useState } from "react";
import { useEarningsStore } from "../../stores/earningsStore";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Loader2, DollarSign, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export function VendorEarningsPage() {
  const {
    totalEarnings,
    pendingEarnings,
    confirmedEarnings,
    paidEarnings,
    heldEarnings,
    earnings,
    payoutHistory,
    isLoading,
    error,
    fetchEarnings,
    fetchPayoutHistory,
  } = useEarningsStore();

  const [activeTab, setActiveTab] = useState<"earnings" | "payouts">("earnings");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchEarnings();
    fetchPayoutHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_DELIVERY":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending Delivery</Badge>;
      case "PENDING_CONFIRMATION":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Awaiting Confirmation</Badge>;
      case "CONFIRMED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Confirmed</Badge>;
      case "PAID_OUT":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Paid Out</Badge>;
      case "HELD":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Held</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredEarnings = statusFilter === "all" 
    ? earnings 
    : earnings.filter(e => e.status === statusFilter);

  if (isLoading && earnings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-dark-text">My Earnings</h1>
        <p className="text-sm text-slate-600 dark:text-dark-textMuted">
          Track your earnings from confirmed deliveries
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-dark-textMuted">
              Total Earnings
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-dark-text">
            KES {totalEarnings.toLocaleString()}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-dark-textMuted">
              Pending
            </span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">
            KES {pendingEarnings.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 dark:text-dark-textMuted mt-1">
            Awaiting delivery confirmation
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-dark-textMuted">
              Confirmed
            </span>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            KES {confirmedEarnings.toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 dark:text-dark-textMuted mt-1">
            Ready for payout
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-dark-textMuted">
              Paid Out
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            KES {paidEarnings.toLocaleString()}
          </p>
        </div>
      </div>

      {heldEarnings > 0 && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <div>
              <p className="font-semibold text-red-900 dark:text-red-200">
                KES {heldEarnings.toLocaleString()} Held
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                Some earnings are on hold due to customer disputes. Please contact support for details.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-dark-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("earnings")}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "earnings"
                ? "border-[#FF9900] text-[#FF9900]"
                : "border-transparent text-slate-600 dark:text-dark-textMuted hover:text-slate-900 dark:hover:text-dark-text"
            }`}
          >
            Earnings Breakdown
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "payouts"
                ? "border-[#FF9900] text-[#FF9900]"
                : "border-transparent text-slate-600 dark:text-dark-textMuted hover:text-slate-900 dark:hover:text-dark-text"
            }`}
          >
            Payout History
          </button>
        </div>
      </div>

      {/* Earnings Tab */}
      {activeTab === "earnings" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "PENDING_DELIVERY" ? "default" : "outline"}
              onClick={() => setStatusFilter("PENDING_DELIVERY")}
            >
              Pending Delivery
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "PENDING_CONFIRMATION" ? "default" : "outline"}
              onClick={() => setStatusFilter("PENDING_CONFIRMATION")}
            >
              Awaiting Confirmation
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "CONFIRMED" ? "default" : "outline"}
              onClick={() => setStatusFilter("CONFIRMED")}
            >
              Confirmed
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "PAID_OUT" ? "default" : "outline"}
              onClick={() => setStatusFilter("PAID_OUT")}
            >
              Paid Out
            </Button>
          </div>

          {/* Earnings Table */}
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-dark-bg border-b border-slate-200 dark:border-dark-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Order</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Commission</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Net Earning</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Payment</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                  {filteredEarnings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-dark-textMuted">
                        No earnings found
                      </td>
                    </tr>
                  ) : (
                    filteredEarnings.map((earning) => (
                      <tr key={earning.id} className="hover:bg-slate-50 dark:hover:bg-dark-bg">
                        <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-dark-text">
                          {earning.orderNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-900 dark:text-dark-text">
                          {earning.customerName}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-dark-text">
                          KES {earning.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-red-600">
                          -KES {earning.commission.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600">
                          KES {earning.netEarning.toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="capitalize">
                            {earning.paymentMethod === "mpesa" ? "M-Pesa" : "Card"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(earning.status)}
                          {earning.status === "PENDING_CONFIRMATION" && earning.daysUntilAutoConfirm && (
                            <p className="text-xs text-slate-500 dark:text-dark-textMuted mt-1">
                              Auto-confirm in {earning.daysUntilAutoConfirm} days
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted">
                          {new Date(earning.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payouts Tab */}
      {activeTab === "payouts" && (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-dark-bg border-b border-slate-200 dark:border-dark-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Reference</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Commission</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Net Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Orders</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Method</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                  {payoutHistory.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500 dark:text-dark-textMuted">
                        No payout history yet
                      </td>
                    </tr>
                  ) : (
                    payoutHistory.map((payout) => (
                      <tr key={payout.id} className="hover:bg-slate-50 dark:hover:bg-dark-bg">
                        <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-dark-text">
                          {payout.referenceNumber}
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
                        <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted capitalize">
                          {payout.paymentMethod}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted">
                          {new Date(payout.paidAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
