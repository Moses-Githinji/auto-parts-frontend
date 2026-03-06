import { useEffect, useState } from "react";
import { useEarningsStore } from "../../stores/earningsStore";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, DollarSign, Loader2, ShieldCheck, Info } from "lucide-react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ProtectedPayoutBadge } from "../../components/vendor/ProtectedPayoutBadge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "../../components/ui/dialog";

// Define vendorNavItems as a separate constant
const vendorNavItems = [
  { label: "Dashboard", to: "/vendor" },
  { label: "Orders", to: "/vendor/orders" },
  { label: "Catalog", to: "/vendor/catalog" },
  { label: "Analytics", to: "/vendor/analytics" },
  { label: "Earnings", to: "/vendor/earnings" },
  { label: "Referrals", to: "/vendor/referrals" },
  { label: "Settings", to: "/vendor/settings" },
  { label: "Suggestions", to: "/vendor/suggestions" },
];

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
  const [selectedEarning, setSelectedEarning] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchEarnings();
    fetchPayoutHistory();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Processing (14d Hold)</Badge>;
      case "WITHDRAWABLE":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Withdrawable</Badge>;
      case "PROCESSING_PAYMENT":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Processing Payment</Badge>;
      case "PAID":
      case "PAID_OUT":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Paid to Bank</Badge>;
      case "DISPUTED":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Disputed</Badge>;
      case "HELD":
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Held</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredEarnings = statusFilter === "all" 
    ? earnings 
    : statusFilter === "REFERRAL"
    ? earnings.filter(e => e.type === "REFERRAL")
    : earnings.filter(e => e.status === statusFilter);

  if (isLoading && earnings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
      </div>
    );
  }

  return (
    <BackofficeLayout title="Vendor Portal" navItems={vendorNavItems}>
      <div className="space-y-6 p-4">
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
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-slate-600 dark:text-dark-textMuted">
                Total Earnings
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-dark-text">
              KES {(totalEarnings ?? 0).toLocaleString()}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-slate-600 dark:text-dark-textMuted">
                Pending
              </span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              KES {(pendingEarnings ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 dark:text-dark-textMuted mt-1">
              Awaiting delivery confirmation
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 text-pretty leading-relaxed">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-slate-600 dark:text-dark-textMuted">
                Withdrawable
              </span>
            </div>
          <p className="text-2xl font-bold text-blue-600">
            KES {(confirmedEarnings ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 dark:text-dark-textMuted mt-1">
            Available for instant payout
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-slate-600 dark:text-dark-textMuted">
              Already Paid
            </span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            KES {(paidEarnings ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-slate-500 dark:text-dark-textMuted mt-1">
            Transferred to your bank
          </p>
        </div>
      </div>

      {/* Debt Recovery Section */}
      {((useAuthStore.getState().user as any)?.debtBalance > 0) && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/10 p-5">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-red-100 p-2">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-red-900 dark:text-red-200">
                Outstanding Debt: KES {((useAuthStore.getState().user as any)?.debtBalance || 0).toLocaleString()}
              </h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                Your account has an outstanding liability from previous claims or disputes. 
                <span className="font-semibold italic"> Automatic Recovery: </span> 50% of all your future earnings will be automatically 
                deducted until this debt is cleared.
              </p>
            </div>
          </div>
        </div>
      )}


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

      {/* Order Protection Info */}
      <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-blue-100 bg-white dark:bg-dark-surface shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full shrink-0">
            <ShieldCheck className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ProtectedPayoutBadge showText={true} />
            </div>
            <p className="text-xs text-slate-600 dark:text-dark-textMuted max-w-2xl leading-relaxed">
              All orders listed below are fully protected. Our collective risk pool covers return logistics and shipping damages, 
              ensuring your business is shielded from sudden losses during the 14-day protection period.
            </p>
          </div>
        </div>
        <div className="hidden md:block">
          <div 
            className="text-[10px] text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md cursor-help"
            title="Every transaction is covered by the GIT Risk Pool fee."
          >
            Learn More
          </div>
        </div>
      </div>

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
              variant={statusFilter === "PENDING" ? "default" : "outline"}
              onClick={() => setStatusFilter("PENDING")}
            >
              14-Day Hold
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "DISPUTED" ? "default" : "outline"}
              onClick={() => setStatusFilter("DISPUTED")}
            >
              Disputed
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "WITHDRAWABLE" ? "default" : "outline"}
              onClick={() => setStatusFilter("WITHDRAWABLE")}
            >
              Withdrawable
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "PAID" ? "default" : "outline"}
              onClick={() => setStatusFilter("PAID")}
            >
              Paid
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "REFERRAL" ? "default" : "outline"}
              onClick={() => setStatusFilter("REFERRAL")}
            >
              Referrals
            </Button>
          </div>

          {/* Earnings Table */}
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-dark-base border-b border-slate-200 dark:border-dark-border">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Order</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Customer</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">
                      <div className="flex items-center gap-1">
                        Commission & Fee
                        <span 
                          className="flex items-center cursor-help" 
                          title="Marketplace Fee & GIT Risk Pool: This includes the platform commission and the non-refundable GIT protection fee."
                        >
                          <Info className="h-3 w-3 text-slate-400" />
                        </span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Net Earning</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Payment</th>
                    <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">
                      <div className="flex items-center gap-1">
                        Status
                        <span 
                          className="flex items-center cursor-help" 
                          title="Orders move to Confirmed status after a 14-day hold period."
                        >
                          <Info className="h-3 w-3 text-slate-400" />
                        </span>
                      </div>
                    </th>
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
                      <tr key={earning.id} className="hover:bg-slate-50 dark:hover:bg-dark-base">
                        <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-dark-text">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="flex items-center gap-2">
                              <span className="text-slate-900 dark:text-dark-text font-bold">#{earning.orderNumber || earning.id.slice(0, 8)}</span>
                              <button 
                                onClick={() => {
                                  setSelectedEarning(earning);
                                  setIsModalOpen(true);
                                }}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-dark-border rounded-full transition-colors text-slate-400 hover:text-[#FF9900]"
                                title="View Details"
                              >
                                <Info className="h-3 w-3" />
                              </button>
                            </span>
                            {earning.type === "REFERRAL" && (
                              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-[9px] px-1 py-0 h-auto">
                                REFERRAL BONUS
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-900 dark:text-dark-text">
                          {earning.type === "REFERRAL" ? <span className="text-slate-500 italic">Referred Vendor</span> : earning.customerName}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900 dark:text-dark-text">
                          KES {(earning.amount ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-red-600">
                          -KES {(earning.commission ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600">
                          KES {(earning.netEarning ?? 0).toLocaleString()}
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
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 dark:bg-dark-base border-b border-slate-200 dark:border-dark-border">
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
                      <tr key={payout.id} className="hover:bg-slate-50 dark:hover:bg-dark-base">
                        <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-dark-text">
                          {payout.referenceNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-900 dark:text-dark-text">
                          KES {(payout.amount ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-red-600">
                          -KES {(payout.commission ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-semibold text-green-600">
                          KES {(payout.netAmount ?? 0).toLocaleString()}
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
    
    {/* Earning Details Modal */}
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Earning Details</DialogTitle>
          <DialogDescription>
            Detailed breakdown for Order #{selectedEarning?.orderNumber}
          </DialogDescription>
        </DialogHeader>

        {selectedEarning && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <p className="text-slate-500 font-medium">Order ID</p>
                <p className="font-mono text-xs">{selectedEarning.id}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 font-medium">Customer</p>
                <p>{selectedEarning.type === "REFERRAL" ? "N/A (Referral)" : selectedEarning.customerName}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 font-medium">Subtotal</p>
                <p className="font-bold">KES {(selectedEarning.amount ?? 0).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 font-medium">Marketplace Commission (8.5%)</p>
                <p className="text-red-600">-KES {(selectedEarning.commission - (selectedEarning.amount * 0.015)).toLocaleString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-slate-500 font-medium">GIT Risk Fee (1.5%)</p>
                <p className="text-red-600">-KES {(selectedEarning.amount * 0.015).toLocaleString()}</p>
              </div>
              <div className="space-y-1 col-span-2 border-t pt-2 mt-2">
                <p className="text-slate-500 font-medium text-center text-xs uppercase tracking-wider">Final Payout</p>
                <p className="text-2xl font-bold text-green-600 text-center">
                  KES {(selectedEarning.netEarning ?? 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-dark-base p-3 space-y-2 border border-slate-100 dark:border-dark-border">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Status:</span>
                <span className="font-medium capitalize">{selectedEarning.status.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-medium capitalize">{selectedEarning.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Created At:</span>
                <span className="font-medium">{new Date(selectedEarning.createdAt).toLocaleString()}</span>
              </div>
              {selectedEarning.deliveredAt && (
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Delivered At:</span>
                  <span className="font-medium">{new Date(selectedEarning.deliveredAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {selectedEarning.status === "PENDING" && (
              <div className="flex gap-2 p-3 bg-amber-50 rounded-lg text-[11px] text-amber-800 border border-amber-100">
                <Clock className="h-4 w-4 shrink-0" />
                <p>This earning is currently in the 14-day hold period to ensure customer satisfaction before being withdrawable.</p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsModalOpen(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </BackofficeLayout>
  );
}
