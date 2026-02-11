import { create } from "zustand";
import apiClient from "../lib/apiClient";
import type {
  BlogPost,
  BlogPostListResponse,
  CreateBlogPostRequest,
  UpdateBlogPostRequest,
  BlogCategory,
  BlogCategoriesResponse,
  BlogPostResponse,
} from "../types/blog";

interface BlogState {
  // Posts State
  posts: BlogPost[];
  currentPost: BlogPost | null;
  isLoadingPosts: boolean;
  postsError: string | null;
  postsPagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };

  // Categories State
  categories: BlogCategory[];
  isLoadingCategories: boolean;
  categoriesError: string | null;

  // Actions
  fetchPosts: (search?: string, page?: number, category?: string, tag?: string) => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  createPost: (data: CreateBlogPostRequest) => Promise<BlogPost>;
  updatePost: (id: string, data: UpdateBlogPostRequest) => Promise<BlogPost>;
  deletePost: (id: string) => Promise<void>;
  fetchCategories: () => Promise<void>;
  clearCurrentPost: () => void;
  clearError: () => void;
}

export const useBlogStore = create<BlogState>((set) => ({
  posts: [],
  currentPost: null,
  isLoadingPosts: false,
  postsError: null,
  postsPagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  categories: [],
  isLoadingCategories: false,
  categoriesError: null,

  fetchPosts: async (search = "", page = 1, category = "", tag = "") => {
    set({ isLoadingPosts: true, postsError: null });
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("limit", String(20));
      if (search) {
        params.append("search", search);
      }
      if (category) {
        params.append("category", category);
      }
      if (tag) {
        params.append("tag", tag);
      }

      const response = await apiClient.get<BlogPostListResponse>(
        `/api/blog/posts?${params.toString()}`
      );
      
      console.log("Blog API Response (List):", response);

      set({
        posts: response.posts,
        postsPagination: {
          page,
          limit: 20,
          total: response.total,
          pages: Math.ceil(response.total / 20),
        },
        isLoadingPosts: false,
      });
    } catch (error) {
      set({
        postsError:
          error instanceof Error ? error.message : "Failed to fetch blog posts",
        isLoadingPosts: false,
      });
    }
  },

  fetchPost: async (id) => {
    set({ isLoadingPosts: true, postsError: null });
    try {
      const response = await apiClient.get<BlogPostResponse>(`/api/blog/posts/${id}`);
      console.log("Blog API Response (Single):", response);
      if (response && response.post) {
        set({
          currentPost: response.post,
          isLoadingPosts: false,
        });
      } else {
        // Fallback for flat structure or empty response
        set({
          currentPost: response as unknown as BlogPost, // if it was flat
          isLoadingPosts: false,
        });
      }
    } catch (error) {
      set({
        postsError:
          error instanceof Error ? error.message : "Failed to fetch blog post",
        isLoadingPosts: false,
      });
    }
  },

  createPost: async (data) => {
    set({ isLoadingPosts: true, postsError: null });
    try {
      const response = await apiClient.post<BlogPost>("/api/blog/posts", data);
      set((state) => ({
        posts: [response, ...state.posts],
        isLoadingPosts: false,
      }));
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create blog post";
      set({
        postsError: message,
        isLoadingPosts: false,
      });
      throw new Error(message);
    }
  },

  updatePost: async (id, data) => {
    set({ isLoadingPosts: true, postsError: null });
    try {
      const response = await apiClient.put<BlogPost>(
        `/api/blog/posts/${id}`,
        data
      );
      set((state) => ({
        posts: state.posts.map((p) => (p.id === id ? response : p)),
        currentPost:
          state.currentPost?.id === id ? response : state.currentPost,
        isLoadingPosts: false,
      }));
      return response;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update blog post";
      set({
        postsError: message,
        isLoadingPosts: false,
      });
      throw new Error(message);
    }
  },

  deletePost: async (id) => {
    set({ isLoadingPosts: true, postsError: null });
    try {
      await apiClient.delete(`/api/blog/posts/${id}`);
      set((state) => ({
        posts: state.posts.filter((p) => p.id !== id),
        isLoadingPosts: false,
      }));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete blog post";
      set({
        postsError: message,
        isLoadingPosts: false,
      });
      throw new Error(message);
    }
  },

  fetchCategories: async () => {
    set({ isLoadingCategories: true, categoriesError: null });
    try {
      const response = await apiClient.get<BlogCategoriesResponse>(
        "/api/blog/categories"
      );
      set({
        categories: response.categories,
        isLoadingCategories: false,
      });
    } catch (error) {
      set({
        categoriesError:
          error instanceof Error
            ? error.message
            : "Failed to fetch blog categories",
        isLoadingCategories: false,
      });
    }
  },

  clearCurrentPost: () => set({ currentPost: null }),
  clearError: () => set({ postsError: null, categoriesError: null }),
}));
