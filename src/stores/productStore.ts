import { create } from "zustand";
import apiClient from "../lib/apiClient";
import type {
  Product,
  ProductFilters,
  ProductListResponse,
  FeaturedProductsResponse,
  CategoriesResponse,
  BrandsResponse,
  CreateProductRequest,
  UpdateProductRequest,
} from "../types/product";

interface ProductState {
  products: Product[];
  featuredProducts: Product[];
  categories: Array<{ name: string; count: number }>;
  brands: Array<{ name: string; count: number }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  currentProduct: Product | null;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchFeaturedProducts: (limit?: number) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchBrands: () => Promise<void>;
  fetchProduct: (id: string) => Promise<void>;
  createProduct: (data: CreateProductRequest) => Promise<Product>;
  updateProduct: (id: string, data: UpdateProductRequest) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  setFilters: (filters: ProductFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  featuredProducts: [],
  categories: [],
  brands: [],
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  currentProduct: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchProducts: async (filters = {}) => {
    set({ isLoading: true, error: null });
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, String(value));
        }
      });

      const response = await apiClient.get<ProductListResponse>(
        `/api/products?${params.toString()}`,
      );
      set({
        products: response.products,
        pagination: response.pagination,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch products",
        isLoading: false,
      });
    }
  },

  fetchFeaturedProducts: async (limit = 10) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<FeaturedProductsResponse>(
        `/api/products/featured/list?limit=${limit}`,
      );
      set({ featuredProducts: response.products, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch featured products",
        isLoading: false,
      });
    }
  },

  fetchCategories: async () => {
    try {
      const response = await apiClient.get<CategoriesResponse>(
        "/api/products/categories/list",
      );
      set({ categories: response.categories });
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  },

  fetchBrands: async () => {
    try {
      const response = await apiClient.get<BrandsResponse>(
        "/api/products/brands/list",
      );
      set({ brands: response.brands });
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  },

  fetchProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.get<{ product: Product }>(
        `/api/products/${id}`,
      );
      set({ currentProduct: response.product, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to fetch product",
        isLoading: false,
      });
    }
  },

  createProduct: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.post<{ product: Product }>(
        "/api/products",
        data,
      );
      set((state) => ({
        products: [response.product, ...state.products],
        isLoading: false,
      }));
      return response.product;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to create product",
        isLoading: false,
      });
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.put<{ product: Product }>(
        `/api/products/${id}`,
        data,
      );
      set((state) => ({
        products: state.products.map((p) =>
          p.id === id ? response.product : p,
        ),
        currentProduct:
          state.currentProduct?.id === id
            ? response.product
            : state.currentProduct,
        isLoading: false,
      }));
      return response.product;
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to update product",
        isLoading: false,
      });
      throw error;
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.delete(`/api/products/${id}`);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Failed to delete product",
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
  clearError: () => set({ error: null }),
}));
