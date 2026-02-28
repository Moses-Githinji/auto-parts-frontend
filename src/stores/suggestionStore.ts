import { create } from "zustand";
import apiClient from "../lib/apiClient";
import type {
  Suggestion,
  SuggestionPagination,
  CreateSuggestionPayload,
  SuggestionStatus,
  SuggestionsListResponse,
} from "../types/suggestion";

interface FetchParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  search?: string;
}

interface SuggestionState {
  suggestions: Suggestion[];
  pagination: SuggestionPagination;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;

  fetchSuggestions: (params?: FetchParams) => Promise<void>;
  submitSuggestion: (payload: CreateSuggestionPayload) => Promise<Suggestion>;
  toggleVote: (suggestionId: string, hasVoted: boolean) => Promise<void>;
  updateStatus: (
    id: string,
    status: SuggestionStatus,
    adminNotes?: string
  ) => Promise<void>;
  deleteSuggestion: (id: string) => Promise<void>;
  clearError: () => void;
}

const DEFAULT_PAGINATION: SuggestionPagination = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
};

export const useSuggestionStore = create<SuggestionState>((set, get) => ({
  suggestions: [],
  pagination: DEFAULT_PAGINATION,
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchSuggestions: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const query = new URLSearchParams();
      if (params.page) query.set("page", String(params.page));
      if (params.limit) query.set("limit", String(params.limit));
      if (params.status) query.set("status", params.status);
      if (params.category) query.set("category", params.category);
      if (params.search) query.set("search", params.search);

      const response = await apiClient.get<SuggestionsListResponse>(
        `/api/suggestions?${query.toString()}`
      );
      set({
        suggestions: response.suggestions,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "Failed to fetch suggestions",
        isLoading: false,
      });
    }
  },

  submitSuggestion: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await apiClient.post<{ suggestion: Suggestion }>(
        "/api/suggestions",
        payload
      );
      const newSuggestion = response.suggestion;
      set((state) => ({
        suggestions: [newSuggestion, ...state.suggestions],
        isSubmitting: false,
      }));
      return newSuggestion;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit suggestion";
      set({ error: message, isSubmitting: false });
      throw new Error(message);
    }
  },

  toggleVote: async (suggestionId, hasVoted) => {
    // Optimistic update
    set((state) => ({
      suggestions: state.suggestions.map((s) =>
        s.id === suggestionId
          ? {
              ...s,
              hasVoted: !hasVoted,
              voteCount: hasVoted ? s.voteCount - 1 : s.voteCount + 1,
            }
          : s
      ),
    }));

    try {
      const method = hasVoted ? "delete" : "post";
      await apiClient[method](`/api/suggestions/${suggestionId}/vote`);
    } catch (err) {
      // Revert on failure
      set((state) => ({
        suggestions: state.suggestions.map((s) =>
          s.id === suggestionId
            ? {
                ...s,
                hasVoted: hasVoted,
                voteCount: hasVoted ? s.voteCount + 1 : s.voteCount - 1,
              }
            : s
        ),
      }));
      throw err;
    }
  },

  updateStatus: async (id, status, adminNotes) => {
    const response = await apiClient.patch<{ suggestion: Suggestion }>(
      `/api/suggestions/${id}/status`,
      { status, adminNotes }
    );
    const updated = response.suggestion;
    set((state) => ({
      suggestions: state.suggestions.map((s) =>
        s.id === id ? { ...s, ...updated } : s
      ),
    }));
  },

  deleteSuggestion: async (id) => {
    // Optimistic removal
    const prev = get().suggestions;
    set((state) => ({
      suggestions: state.suggestions.filter((s) => s.id !== id),
    }));
    try {
      await apiClient.delete(`/api/suggestions/${id}`);
    } catch (err) {
      // Revert
      set({ suggestions: prev });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
