import { useEffect, useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";
import { apiClient } from "../../lib/apiClient";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useFinanceStore } from "../../stores/financeStore";
import { 
  Loader2, 
  DollarSign,
  TrendingUp,
  Download, 
  ShieldCheck, 
  PlusCircle, 
  AlertTriangle
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";

interface FinancialSummary {
  totalRevenue: number;
  platformCommissions: number;
  vendorPayoutsPending: number;
  vendorPayoutsCompleted: number;
  netPlatformEarnings: number;
  breakdown: {
    mpesa: { count: number; amount: number };
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
  vendorId?: string;
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
  const { 
    poolHealth, 
    fetchPoolHealth, 
    investPoolFunds 
  } = useFinanceStore();

  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [vendorPayouts, setVendorPayouts] = useState<VendorPayout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"transactions" | "payouts">("transactions");
  
  // Invest Modal State
  const [isInvestModalOpen, setIsInvestModalOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState("");
  const [investSource, setInvestSource] = useState("EXTERNAL");
  const [isInvesting, setIsInvesting] = useState(false);

  useEffect(() => {
    fetchFinancialData();
    fetchPoolHealth();
  }, [fetchPoolHealth]);

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

      const formattedPayouts: VendorPayout[] = [
        ...payoutsRes.pendingPayouts.map((p) => ({
          id: `pending-${p.vendorId}`,
          vendorId: p.vendorId,
          vendorName: p.vendorName,
          amount: p.amount,
          commission: 0,
          netAmount: p.amount,
          orderCount: p.orderCount,
          status: "PENDING" as const,
          createdAt: new Date().toISOString(),
        })),
        ...payoutsRes.completedPayouts.map((p) => ({
          id: p.id,
          vendorName: p.vendorName,
          amount: p.amount,
          commission: 0,
          netAmount: p.amount,
          orderCount: 0,
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

  const handleInvest = async () => {
    const amount = parseFloat(investAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsInvesting(true);
    try {
      await investPoolFunds({
        amount,
        source: investSource as any,
        note: `Manual investment via Admin Dashboard from ${investSource}`
      });
      setIsInvestModalOpen(false);
      setInvestAmount("");
    } catch (err) {
      // Error handled by store
    } finally {
      setIsInvesting(false);
    }
  };

  const handlePayVendor = async (vendorId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await apiClient.post(`/api/admin/finances/payouts/${vendorId}`);
      await fetchFinancialData();
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to process payout");
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
              Complete financial tracking and pool management
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsInvestModalOpen(true)} className="gap-2 bg-green-600 hover:bg-green-700">
              <PlusCircle className="h-4 w-4" />
              Invest Funds
            </Button>
            <Button onClick={handleExport} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4 font-normal">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* GIT Protection Pool Health */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            GIT Protection Pool Health
          </h2>
          {poolHealth && (
            <Badge variant="outline" className={poolHealth.healthStatus === 'GOOD' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}>
              Status: {poolHealth.healthStatus}
            </Badge>
          )}
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Collected Funds (Risk Pooling)</p>
            <p className="mt-2 text-xl font-bold text-slate-900 dark:text-dark-text">
              KES {(poolHealth?.totalPoolFunds ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
             <p className="text-xs text-slate-500 font-medium">Claims Paid</p>
            <p className="mt-2 text-xl font-bold text-red-600">
              KES {(poolHealth?.claimsPaid ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">External Investment</p>
            <p className="mt-2 text-xl font-bold text-blue-600">
              KES {(poolHealth?.investments ?? 0).toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
            <p className="text-xs text-slate-500 font-medium">Current Liquidity</p>
            <p className="mt-2 text-xl font-bold text-green-600">
              KES {(poolHealth?.liquidity ?? 0).toLocaleString()}
            </p>
          </div>
        </div>
      </section>

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
              KES {(summary.totalRevenue ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
              Gross marketplace flow
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
              KES {(summary.platformCommissions ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-slate-600 dark:text-dark-textMuted mt-1">
              Base marketplace fee earned
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
              KES {(summary.netPlatformEarnings ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-green-700 dark:text-green-300 mt-1">
              (Gross - Vendor Share)
            </p>
          </div>
        </div>
      )}

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

      {activeTab === "transactions" && (
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-base border-b border-slate-200 dark:border-dark-border">
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
                    <tr key={transaction.id} className="hover:bg-slate-50 dark:hover:bg-dark-base">
                      <td className="px-4 py-3 font-mono text-xs text-slate-900 dark:text-dark-text">
                        {transaction.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-900 dark:text-dark-text">
                        {transaction.vendorName}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-dark-text">
                        KES {(transaction.amount ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#FF9900]">
                        KES {(transaction.commission ?? 0).toLocaleString()}
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

      {activeTab === "payouts" && (
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-base border-b border-slate-200 dark:border-dark-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Vendor</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Commission</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Net Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Orders</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Date</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-dark-text">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                {vendorPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-slate-500 dark:text-dark-textMuted">
                      No vendor payouts yet
                    </td>
                  </tr>
                ) : (
                  vendorPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-slate-50 dark:hover:bg-dark-base">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-dark-text">
                        {payout.vendorName}
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
                      <td className="px-4 py-3 text-right">
                        {payout.status === "PENDING" && payout.vendorId && (
                          <Button 
                            size="sm" 
                            onClick={async () => await handlePayVendor(payout.vendorId!)}
                            disabled={isLoading}
                          >
                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pay Vendor"}
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invest Modal */}
      <Dialog open={isInvestModalOpen} onOpenChange={setIsInvestModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invest Funds into GIT Protection Pool</DialogTitle>
            <DialogDescription>
              Add external liquidity to the risk pool to maintain health and ensure payout safety.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Investment Amount (KES)</label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Funding Source</label>
              <select 
                className="w-full flex h-10 border border-slate-200 px-3 py-2 text-sm rounded-md"
                value={investSource}
                onChange={(e) => setInvestSource(e.target.value)}
              >
                <option value="EXTERNAL">External Capital</option>
                <option value="PLATFORM_PROFITS">Platform Profits</option>
                <option value="RESERVE_FUND">Reserve Fund</option>
              </select>
            </div>

            <div className="flex gap-2 p-3 bg-amber-50 rounded-lg text-xs text-amber-800">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <p>This action will immediately reflect in the pool's liquidity and is recorded in audit logs.</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvestModalOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleInvest} 
              disabled={isInvesting || !investAmount}
              className="bg-green-600 hover:bg-green-700"
            >
              {isInvesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Investment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </BackofficeLayout>
  );
}
