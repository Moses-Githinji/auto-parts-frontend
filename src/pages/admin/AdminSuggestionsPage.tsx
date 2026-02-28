import { useEffect, useState, useCallback } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";
import { useSuggestionStore } from "../../stores/suggestionStore";
import { Button } from "../../components/ui/button";
import type { Suggestion, SuggestionStatus } from "../../types/suggestion";
import {
  SUGGESTION_STATUS_CONFIG,
  SUGGESTION_CATEGORIES,
} from "../../types/suggestion";
import {
  Loader2,
  Trash2,
  Edit,
  X,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  MessageSquare,
} from "lucide-react";

function StatusBadge({ status }: { status: SuggestionStatus }) {
  const cfg = SUGGESTION_STATUS_CONFIG[status];
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function UpdateStatusModal({
  suggestion,
  onClose,
  onSave,
}: {
  suggestion: Suggestion;
  onClose: () => void;
  onSave: (status: SuggestionStatus, notes: string) => Promise<void>;
}) {
  const [status, setStatus] = useState<SuggestionStatus>(suggestion.status);
  const [notes, setNotes] = useState(suggestion.adminNotes || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSave() {
    setIsSaving(true);
    setError("");
    try {
      await onSave(status, notes);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-border px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-dark-text">
            Update Status
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-dark-textMuted mb-1 font-medium truncate">
              "{suggestion.title}"
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as SuggestionStatus)}
              className="h-10 w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-base px-3 text-sm dark:text-dark-text focus:border-[#FF9900] focus:outline-none"
            >
              {(Object.keys(SUGGESTION_STATUS_CONFIG) as SuggestionStatus[]).map((s) => (
                <option key={s} value={s}>
                  {SUGGESTION_STATUS_CONFIG[s].label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
              Admin Notes{" "}
              <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="Add a note to explain the decision…"
              className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-base px-3 py-2 text-sm dark:text-dark-text focus:border-[#FF9900] focus:outline-none resize-none"
            />
            <p className="mt-0.5 text-right text-[10px] text-slate-400">
              {notes.length}/2000
            </p>
          </div>
          {error && (
            <p className="text-xs text-red-600 dark:text-red-400">{error}</p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#FF9900] text-white hover:bg-[#FF9900]/90"
            >
              {isSaving ? (
                <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Saving…</>
              ) : (
                "Save"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({
  onClose,
  onConfirm,
}: {
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleConfirm() {
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch {
      setIsDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xl p-6">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-dark-text mb-2">
          Delete Suggestion?
        </h2>
        <p className="text-xs text-slate-600 dark:text-dark-textMuted mb-5">
          This action cannot be undone. All votes on this suggestion will also be deleted.
        </p>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? (
              <><Loader2 className="mr-1 h-3 w-3 animate-spin" />Deleting…</>
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdminSuggestionsPage() {
  const {
    suggestions,
    pagination,
    isLoading,
    error,
    fetchSuggestions,
    updateStatus,
    deleteSuggestion,
    clearError,
  } = useSuggestionStore();

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    page: 1,
  });
  const [editTarget, setEditTarget] = useState<Suggestion | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Suggestion | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(() => {
    fetchSuggestions({
      page: filters.page,
      limit: 20,
      search: filters.search || undefined,
      status: filters.status || undefined,
      category: filters.category || undefined,
    });
  }, [filters, fetchSuggestions]);

  useEffect(() => {
    load();
  }, [load]);

  function showToast(type: "success" | "error", text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleUpdateStatus(status: SuggestionStatus, notes: string) {
    if (!editTarget) return;
    await updateStatus(editTarget.id, status, notes || undefined);
    showToast("success", "Status updated successfully.");
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteSuggestion(deleteTarget.id);
    showToast("success", "Suggestion deleted.");
  }

  // Analytics from current results
  const totalOpen = suggestions.filter((s) => s.status === "OPEN").length;
  const totalPlanned = suggestions.filter((s) => s.status === "PLANNED").length;

  return (
    <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-[#FF9900]" />
          <div>
            <h1 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
              Vendor Suggestions
            </h1>
            <p className="text-xs text-slate-500 dark:text-dark-textMuted">
              Review and triage feature requests from vendors
            </p>
          </div>
        </div>

        {/* Analytics cards */}
        <section className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-dark-textMuted">Total (this page)</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">
              {pagination.total}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-dark-textMuted">Open</p>
            <p className="mt-1 text-2xl font-semibold text-blue-600">{totalOpen}</p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm">
            <p className="text-xs text-slate-500 dark:text-dark-textMuted">Planned</p>
            <p className="mt-1 text-2xl font-semibold text-purple-600">{totalPlanned}</p>
          </div>
        </section>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search suggestions…"
            value={filters.search}
            onChange={(e) =>
              setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))
            }
            className="h-9 flex-1 min-w-[160px] rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 text-sm dark:text-dark-text focus:border-[#FF9900] focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
          />
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))
            }
            className="h-9 rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 text-sm dark:text-dark-text focus:border-[#FF9900] focus:outline-none"
          >
            <option value="">All Statuses</option>
            {(Object.keys(SUGGESTION_STATUS_CONFIG) as SuggestionStatus[]).map((s) => (
              <option key={s} value={s}>
                {SUGGESTION_STATUS_CONFIG[s].label}
              </option>
            ))}
          </select>
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((f) => ({ ...f, category: e.target.value, page: 1 }))
            }
            className="h-9 rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-surface px-3 text-sm dark:text-dark-text focus:border-[#FF9900] focus:outline-none"
          >
            <option value="">All Categories</option>
            {SUGGESTION_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 flex items-center justify-between rounded border border-red-200 bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400">
            {error}
            <button onClick={clearError}>
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-sm border border-dashed border-slate-300 dark:border-dark-border text-sm text-slate-500 dark:text-dark-textMuted">
            No suggestions found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-sm border border-[#c8c8c8] dark:border-dark-border">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-[#c8c8c8] dark:border-dark-border bg-slate-50 dark:bg-dark-base text-left text-slate-600 dark:text-dark-textMuted">
                  <th className="px-4 py-3 font-semibold">Title</th>
                  <th className="px-4 py-3 font-semibold">Submitted By</th>
                  <th className="px-4 py-3 font-semibold">Category</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">
                    <ThumbsUp className="inline h-3 w-3 mr-1" />
                    Votes
                  </th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface last:border-0 hover:bg-slate-50 dark:hover:bg-dark-base transition-colors"
                  >
                    <td className="px-4 py-3 max-w-[240px]">
                      <p className="font-medium text-slate-900 dark:text-dark-text line-clamp-1">
                        {s.title}
                      </p>
                      {s.adminNotes && (
                        <p className="mt-0.5 text-[10px] text-blue-600 dark:text-blue-400 line-clamp-1">
                          Note: {s.adminNotes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted whitespace-nowrap">
                      {s.vendor.companyName}
                    </td>
                    <td className="px-4 py-3">
                      {s.category ? (
                        <span className="rounded-full bg-slate-100 dark:bg-dark-base px-2 py-0.5 text-[10px] text-slate-600 dark:text-dark-textMuted">
                          {s.category}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-dark-text">
                      {s.voteCount}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-dark-textMuted">
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditTarget(s)}
                          title="Update status"
                          className="rounded p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 transition-colors"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(s)}
                          title="Delete"
                          className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              disabled={filters.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: f.page - 1 }))}
              className="disabled:opacity-40 rounded-md border border-slate-300 dark:border-dark-border p-1.5 hover:bg-slate-50 dark:hover:bg-dark-base"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm text-slate-600 dark:text-dark-textMuted">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              disabled={filters.page >= pagination.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: f.page + 1 }))}
              className="disabled:opacity-40 rounded-md border border-slate-300 dark:border-dark-border p-1.5 hover:bg-slate-50 dark:hover:bg-dark-base"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {/* Status update modal */}
      {editTarget && (
        <UpdateStatusModal
          suggestion={editTarget}
          onClose={() => setEditTarget(null)}
          onSave={handleUpdateStatus}
        />
      )}

      {/* Delete confirm modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
        />
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.text}
          <button onClick={() => setToast(null)}>
            <X className="h-4 w-4 opacity-70 hover:opacity-100" />
          </button>
        </div>
      )}
    </BackofficeLayout>
  );
}
