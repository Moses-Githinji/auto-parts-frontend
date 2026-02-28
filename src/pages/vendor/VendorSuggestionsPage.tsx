import { useEffect, useState, useCallback } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { useAuthStore } from "../../stores/authStore";
import { useSuggestionStore } from "../../stores/suggestionStore";
import { Button } from "../../components/ui/button";
import type { Suggestion, SuggestionStatus } from "../../types/suggestion";
import {
  SUGGESTION_STATUS_CONFIG,
  SUGGESTION_CATEGORIES,
} from "../../types/suggestion";
import {
  ThumbsUp,
  Plus,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  MessageSquare,
} from "lucide-react";

const VENDOR_NAV = [
  { label: "Dashboard", to: "/vendor" },
  { label: "Orders", to: "/vendor/orders" },
  { label: "Catalog", to: "/vendor/catalog" },
  { label: "Analytics", to: "/vendor/analytics" },
  { label: "Earnings", to: "/vendor/earnings" },
  { label: "Settings", to: "/vendor/settings" },
  { label: "Suggestions", to: "/vendor/suggestions" },
];

function StatusBadge({ status }: { status: SuggestionStatus }) {
  const cfg = SUGGESTION_STATUS_CONFIG[status];
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function SuggestionCard({
  suggestion,
  currentVendorId,
  onVote,
}: {
  suggestion: Suggestion;
  currentVendorId: string | undefined;
  onVote: (s: Suggestion) => void;
}) {
  const isOwn = suggestion.vendor.id === currentVendorId;
  const truncated =
    suggestion.description.length > 150
      ? suggestion.description.slice(0, 150) + "…"
      : suggestion.description;

  return (
    <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-4 shadow-sm flex gap-4">
      {/* Vote block */}
      <div className="flex flex-col items-center gap-1 w-14 flex-shrink-0">
        <span className="text-2xl font-bold text-slate-900 dark:text-dark-text">
          {suggestion.voteCount}
        </span>
        <span className="text-[10px] text-slate-500 dark:text-dark-textMuted">votes</span>
        {!isOwn && (
          <button
            onClick={() => onVote(suggestion)}
            title={suggestion.hasVoted ? "Withdraw vote" : "Upvote"}
            className={`mt-1 flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition-colors ${
              suggestion.hasVoted
                ? "bg-[#FF9900] text-white hover:bg-[#FF9900]/80"
                : "border border-slate-300 dark:border-dark-border text-slate-600 dark:text-dark-textMuted hover:border-[#FF9900] hover:text-[#FF9900]"
            }`}
          >
            <ThumbsUp className="h-3 w-3" />
            {suggestion.hasVoted ? "Voted" : "Vote"}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text">
            {suggestion.title}
          </h3>
          <StatusBadge status={suggestion.status} />
          {suggestion.category && (
            <span className="rounded-full bg-slate-100 dark:bg-dark-base px-2 py-0.5 text-[10px] text-slate-600 dark:text-dark-textMuted">
              {suggestion.category}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600 dark:text-dark-textMuted leading-relaxed">
          {truncated}
        </p>
        {suggestion.adminNotes && suggestion.status !== "OPEN" && (
          <div className="mt-2 rounded border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 text-xs text-blue-800 dark:text-blue-300">
            <span className="font-semibold">Admin note: </span>
            {suggestion.adminNotes}
          </div>
        )}
        <p className="mt-2 text-[10px] text-slate-400 dark:text-dark-textMuted">
          By {suggestion.vendor.companyName} ·{" "}
          {new Date(suggestion.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

function NewSuggestionModal({
  onClose,
  onSubmit,
  isSubmitting,
}: {
  onClose: () => void;
  onSubmit: (title: string, description: string, category: string) => Promise<void>;
  isSubmitting: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (title.trim().length < 5) {
      setError("Title must be at least 5 characters.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }
    try {
      await onSubmit(title.trim(), description.trim(), category);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to submit suggestion.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-lg rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-dark-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-[#FF9900]" />
            <h2 className="text-sm font-semibold text-slate-900 dark:text-dark-text">
              Submit a Feature Suggestion
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-dark-text"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="e.g. Bulk CSV import for products"
              className="h-10 w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-base px-3 text-sm dark:text-dark-text focus:border-[#FF9900] focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
            />
            <p className="mt-0.5 text-right text-[10px] text-slate-400">
              {title.length}/200
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
              rows={5}
              placeholder="Describe the feature and why it would be valuable…"
              className="w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-base px-3 py-2 text-sm dark:text-dark-text focus:border-[#FF9900] focus:outline-none focus:ring-1 focus:ring-[#FF9900] resize-none"
            />
            <p className="mt-0.5 text-right text-[10px] text-slate-400">
              {description.length}/5000
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
              Category <span className="text-slate-400">(optional)</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-base px-3 text-sm dark:text-dark-text focus:border-[#FF9900] focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
            >
              <option value="">Select a category…</option>
              {SUGGESTION_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded border border-red-200 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-700 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="submit"
              disabled={isSubmitting}
              className="bg-[#FF9900] text-white hover:bg-[#FF9900]/90"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit Suggestion"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function VendorSuggestionsPage() {
  const { user } = useAuthStore();
  const {
    suggestions,
    pagination,
    isLoading,
    isSubmitting,
    error,
    fetchSuggestions,
    submitSuggestion,
    toggleVote,
    clearError,
  } = useSuggestionStore();

  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    category: "",
    page: 1,
  });

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

  async function handleVote(suggestion: Suggestion) {
    try {
      await toggleVote(suggestion.id, !!suggestion.hasVoted);
    } catch {
      showToast("error", "Failed to update vote. Please try again.");
    }
  }

  async function handleSubmit(title: string, description: string, category: string) {
    await submitSuggestion({ title, description, category: category || undefined });
    showToast("success", "Suggestion submitted successfully!");
  }

  return (
    <BackofficeLayout title="Vendor Portal" navItems={VENDOR_NAV}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-[#FF9900]" />
            <div>
              <h1 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
                Feature Suggestions
              </h1>
              <p className="text-xs text-slate-500 dark:text-dark-textMuted">
                Suggest features and vote on what matters most to you
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="bg-[#FF9900] text-white hover:bg-[#FF9900]/90 flex-shrink-0"
            onClick={() => setShowModal(true)}
          >
            <Plus className="mr-1 h-4 w-4" />
            New Suggestion
          </Button>
        </div>

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
            {(Object.keys(SUGGESTION_STATUS_CONFIG) as SuggestionStatus[]).map(
              (s) => (
                <option key={s} value={s}>
                  {SUGGESTION_STATUS_CONFIG[s].label}
                </option>
              )
            )}
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

        {/* List */}
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center gap-3 rounded-sm border border-dashed border-slate-300 dark:border-dark-border text-center">
            <Lightbulb className="h-10 w-10 text-slate-300" />
            <p className="text-sm text-slate-500 dark:text-dark-textMuted">
              No suggestions yet.{" "}
              <button
                className="text-[#FF9900] hover:underline font-medium"
                onClick={() => setShowModal(true)}
              >
                Be the first to suggest something!
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <SuggestionCard
                key={s.id}
                suggestion={s}
                currentVendorId={user?.id}
                onVote={handleVote}
              />
            ))}
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

      {/* Modal */}
      {showModal && (
        <NewSuggestionModal
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
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
