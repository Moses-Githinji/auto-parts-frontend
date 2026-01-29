export type ProductStatus = "ACTIVE" | "INACTIVE";
export type ProductCondition = "NEW" | "USED" | "REFURBISHED";

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  partNumber: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  brand?: string;
  condition: ProductCondition;
  images: string[];
  specifications: Record<string, string>;
  status: ProductStatus;
  views: number;
  ordersCount: number;
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  page?: number;
  limit?: number;
}

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface FeaturedProductsResponse {
  products: Product[];
}

export interface CategoriesResponse {
  categories: Array<{
    name: string;
    count: number;
  }>;
}

export interface BrandsResponse {
  brands: Array<{
    name: string;
    count: number;
  }>;
}

export interface CreateProductRequest {
  name: string;
  partNumber: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  brand?: string;
  condition?: ProductCondition;
  images?: string[];
  specifications?: Record<string, string>;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  status?: ProductStatus;
}
