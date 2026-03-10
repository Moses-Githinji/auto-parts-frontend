import { useEffect, useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";
import { useFinanceStore } from "../../stores/financeStore";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Loader2, AlertCircle, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "../../components/ui/dialog";
import { Textarea } from "../../components/ui/textarea";

export function AdminDisputesPage() {
  const { 
    disputes, 
    isLoadingDisputes, 
    disputeError, 
    fetchDisputes, 
    resolveDispute 
  } = useFinanceStore();

  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [resolutionType, setResolutionType] = useState<"VENDOR" | "CUSTOMER" | null>(null);
  const [resolutionNote, setResolutionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleResolve = async () => {
    if (!selectedDispute || !resolutionType || !resolutionNote) return;

    setIsSubmitting(true);
    try {
      await resolveDispute(selectedDispute.id, {
        resolution: resolutionType,
        resolutionNote: resolutionNote,
        returnCost: 0
      });
      setSelectedDispute(null);
      setResolutionNote("");
      setResolutionType(null);
    } catch (err) {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Open</Badge>;
      case "UNDER_REVIEW":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Under Review</Badge>;
      case "RESOLVED":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Resolved</Badge>;
      case "REFUNDED":
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Refunded</Badge>;
      case "CLOSED":
        return <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Disputes</h1>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">
              Manage and resolve customer-vendor disputes.
            </p>
          </div>
          <Button variant="outline" onClick={() => fetchDisputes()}>
            Refresh List
          </Button>
        </div>

        {disputeError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-700">{disputeError}</p>
          </div>
        )}

        {/* Stats */}
        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Open Disputes</p>
            <p className="mt-1 text-2xl font-semibold text-red-600">
              {disputes.filter(d => d.status === "OPEN").length}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Under Review</p>
            <p className="mt-1 text-2xl font-semibold text-amber-600">
              {disputes.filter(d => d.status === "UNDER_REVIEW").length}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Resolved (Total)</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {disputes.filter(d => d.status === "RESOLVED").length}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Total Claims</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">
              {disputes.length}
            </p>
          </div>
        </section>

        {/* Disputes List */}
        <div className="space-y-4">
          {isLoadingDisputes && disputes.length === 0 ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
            </div>
          ) : disputes.length === 0 ? (
            <div className="rounded-sm border border-dashed border-[#c8c8c8] p-12 text-center text-slate-500">
              No disputes found.
            </div>
          ) : (
            disputes.map((dispute) => (
              <div key={dispute.id} className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-5 shadow-sm hover:border-[#2b579a] transition-colors">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 dark:text-dark-text">
                        {dispute.orderNumber}
                      </h3>
                      {getStatusBadge(dispute.status)}
                      {dispute.resolution && (
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {dispute.resolution === "CUSTOMER" ? "Refunded" : "Vendor Paid"}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium text-slate-800 dark:text-dark-text">
                        Reason: <span className="font-normal text-slate-600 dark:text-dark-textMuted">{dispute.reason}</span>
                      </p>
                      <p className="text-sm font-medium text-slate-800 dark:text-dark-text">
                        Claim Amount: <span className="font-semibold text-red-600">KES {(dispute.amount ?? 0).toLocaleString()}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-2 border-t border-slate-100 dark:border-dark-border mt-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Customer</span>
                        <span className="text-xs font-semibold">{dispute.customerName}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Vendor</span>
                        <span className="text-xs font-semibold">{dispute.vendorName}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider">Opened On</span>
                        <span className="text-xs font-semibold">{new Date(dispute.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDispute(dispute)}
                      className="text-xs"
                    >
                      {dispute.status === "RESOLVED" ? "View Details" : "Resolve Dispute"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Resolution Dialog */}
      <Dialog open={!!selectedDispute} onOpenChange={() => setSelectedDispute(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Dispute - {selectedDispute?.orderNumber}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-blue-50 p-3 flex gap-3 text-xs text-blue-800">
              <Info className="h-4 w-4 shrink-0" />
              <div className="space-y-1">
                <p>
                  Resolving in favor of the customer will trigger an automatic refund for Paystack payments. 
                  Resolving in favor of the vendor will release the funds to them.
                </p>
                {resolutionType === "CUSTOMER" && (
                  <div className="mt-2 font-semibold">
                    {selectedDispute?.paymentMethod === "mpesa" ? (
                      <p className="text-red-700">⚠️ Note: This order was paid via M-Pesa. Manual refund is required via the M-Pesa Portal.</p>
                    ) : (
                      <p className="text-green-700">✅ This will trigger an automated refund via Paystack.</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {selectedDispute?.status !== "RESOLVED" ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Outcome</label>
                  <div className="flex gap-4">
                    <button
                      onClick={() => setResolutionType("CUSTOMER")}
                      className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        resolutionType === "CUSTOMER" 
                        ? "border-green-600 bg-green-50" 
                        : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <CheckCircle2 className={`h-6 w-6 ${resolutionType === "CUSTOMER" ? "text-green-600" : "text-slate-400"}`} />
                      <span className="text-xs font-bold">Refund Customer</span>
                    </button>
                    <button
                      onClick={() => setResolutionType("VENDOR")}
                      className={`flex-1 flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                        resolutionType === "VENDOR" 
                        ? "border-blue-600 bg-blue-50" 
                        : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <ShieldCheck className={`h-6 w-6 ${resolutionType === "VENDOR" ? "text-blue-600" : "text-slate-400"}`} />
                      <span className="text-xs font-bold">Pay Vendor</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Resolution Note</label>
                  <Textarea 
                    placeholder="Enter final decision details..."
                    value={resolutionNote}
                    onChange={(e) => setResolutionNote(e.target.value)}
                    className="h-24"
                  />
                  <p className="text-[10px] text-slate-500 italic">This note will be visible to both customer and vendor.</p>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-700 font-bold">
                  <CheckCircle2 className="h-5 w-5" />
                  Resolved: Favored {selectedDispute.resolution}
                </div>
                <div className="p-3 bg-slate-50 rounded border text-sm">
                  <p className="font-medium mb-1">Resolution Note:</p>
                  <p className="text-slate-600">{selectedDispute.resolutionNote}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedDispute(null)}>
              Close
            </Button>
            {selectedDispute?.status !== "RESOLVED" && (
              <Button 
                onClick={handleResolve} 
                disabled={!resolutionType || !resolutionNote || isSubmitting}
                className="bg-[#2b579a] hover:bg-[#1e3f7a]"
              >
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Final Decision
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BackofficeLayout>
  );
}
