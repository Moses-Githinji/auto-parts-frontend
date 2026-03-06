import { useEffect } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";
import { useFinanceStore } from "../../stores/financeStore";
import { Badge } from "../../components/ui/badge";
import { Loader2 } from "lucide-react";

export function AdminAuditLogsPage() {
  const { auditLogs, isLoadingLogs, logError, fetchAuditLogs } = useFinanceStore();

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);


  const getActionBadge = (action: string) => {
    const isNegative = action.includes("DISPUTE_OPEN") || action.includes("REFUND");
    const isPositive = action.includes("INVEST") || action.includes("RESOLVE");
    
    return (
      <Badge 
        variant="outline" 
        className={`text-[10px] font-bold tracking-tight px-1.5 py-0 ${
          isPositive ? "bg-green-50 text-green-700 border-green-200" :
          isNegative ? "bg-red-50 text-red-700 border-red-200" :
          "bg-slate-50 text-slate-700 border-slate-200"
        }`}
      >
        {action.replace(/_/g, " ")}
      </Badge>
    );
  };

  return (
    <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Financial Audit Logs</h1>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            A permanent trail of all financial actions within the marketplace.
          </p>
        </div>

        {logError && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {logError}
          </div>
        )}

        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-dark-base border-b border-slate-200 dark:border-dark-border">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Timestamp</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Action Type</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Performance/Entity</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Amount</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Admin/Actor</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dark-border">
                {isLoadingLogs ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#FF9900]" />
                    </td>
                  </tr>
                ) : auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      No audit logs recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[9px] font-bold">
                            {log.actorType}
                          </Badge>
                          {getActionBadge(log.action)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold">{log.entityType}</p>
                        <span className="font-mono text-[10px] text-slate-500">
                          {log.entityId}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1">
                          {log.oldValue && (
                            <div className="text-[10px] text-slate-400 line-through truncate max-w-[150px]">
                              {JSON.stringify(log.oldValue)}
                            </div>
                          )}
                          {log.newValue && (
                            <div className="text-[10px] text-blue-600 truncate max-w-[150px]">
                              {JSON.stringify(log.newValue)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          {log.actorId}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-slate-600 italic max-w-xs truncate" title={log.reason || (log as any).note}>
                          {log.reason || (log as any).note || "---"}
                        </p>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </BackofficeLayout>
  );
}
