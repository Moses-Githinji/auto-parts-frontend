export type SuggestionStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "PLANNED"
  | "COMPLETED"
  | "REJECTED";

export interface SuggestionVendor {
  id: string;
  companyName: string;
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  category: string | null;
  status: SuggestionStatus;
  voteCount: number;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  vendor: SuggestionVendor;
  hasVoted?: boolean;
}

export interface SuggestionPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateSuggestionPayload {
  title: string;
  description: string;
  category?: string;
}

export interface UpdateSuggestionStatusPayload {
  status: SuggestionStatus;
  adminNotes?: string;
}

export interface SuggestionsListResponse {
  suggestions: Suggestion[];
  pagination: SuggestionPagination;
}

export const SUGGESTION_STATUS_CONFIG: Record<
  SuggestionStatus,
  { label: string; className: string }
> = {
  OPEN: {
    label: "Open",
    className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  },
  UNDER_REVIEW: {
    label: "Under Review",
    className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  PLANNED: {
    label: "Planned ✓",
    className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  },
  COMPLETED: {
    label: "Completed ✓",
    className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export const SUGGESTION_CATEGORIES = [
  "Inventory",
  "Payments",
  "Orders",
  "Reports",
  "Platform",
  "Other",
];
