import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useCartStore } from "../stores/cartStore";
import { useProductStore } from "../stores/productStore";
import type { Product } from "../types/product";

export function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") ?? "";
  const category = params.get("cat") ?? "";
  const brand = params.get("brand") ?? "";
  const make = params.get("make") ?? "";
  const model = params.get("model") ?? "";
  const year = params.get("year") ?? "";
  const addItem = useCartStore((s) => s.addItem);
  const {
    products,
    isLoading,
    error,
    fetchProducts,
    setFilters,
    clearFilters,
    clearError,
  } = useProductStore();

  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    clearError();
    clearFilters();

    // Build filters from URL params
    const filters: Record<string, string> = {};
    if (q) filters.search = q;
    if (category) filters.category = category;
    if (brand) filters.brand = brand;
    if (make) filters.make = make;
    if (model) filters.model = model;
    if (year) filters.year = year;

    if (Object.keys(filters).length > 0) {
      setFilters(filters);
      fetchProducts(filters);
    } else {
      fetchProducts();
    }
  }, [
    q,
    category,
    brand,
    make,
    model,
    year,
    fetchProducts,
    setFilters,
    clearFilters,
    clearError,
  ]);

  async function handleAddToCart(product: Product) {
    setAddingProductId(product.id);
    setCartMessage(null);

    try {
      await addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        vendorId: product.vendorId || "unknown-vendor",
        vendorName: product.brand || "Auto Parts Store",
      });
      setCartMessage({
        type: "success",
        text: `${product.name} added to cart!`,
      });
      setTimeout(() => setCartMessage(null), 3000);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to add to cart";
      setCartMessage({ type: "error", text: errorMsg });
    } finally {
      setAddingProductId(null);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const nextQ = (formData.get("q") as string) ?? "";
    navigate(`/search?q=${encodeURIComponent(nextQ)}`);
  }

  // Build active filters list
  const activeFilters = [];
  if (q) activeFilters.push({ label: q, type: "search" });
  if (category) activeFilters.push({ label: category, type: "category" });
  if (brand) activeFilters.push({ label: brand, type: "brand" });
  if (make || model || year) {
    const vehicleLabel = [make, model, year].filter(Boolean).join(" ");
    activeFilters.push({ label: vehicleLabel, type: "vehicle" });
  }

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-md border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg p-3 md:flex-row md:items-center"
      >
        <Input
          name="q"
          defaultValue={q}
          placeholder="Search by part number, part name, or vehicle..."
        />
        <div className="flex gap-2 md:justify-end">
          <Button type="submit" size="sm">
            Search
          </Button>
        </div>
      </form>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs text-slate-700 dark:text-dark-text">
          <span className="font-semibold">Active filters:</span>
          {activeFilters.map((filter, i) => (
            <Badge key={i} variant="outline">
              {filter.label}
            </Badge>
          ))}
          <button
            onClick={() => navigate("/search")}
            className="text-sky-600 hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Cart Message */}
      {cartMessage && (
        <div
          className={`rounded-lg p-3 text-sm ${cartMessage.type === "success" ? "bg-green-50 dark:bg-green-900/20 text-green-700 border border-green-200" : "bg-red-50 dark:bg-red-900/20 text-red-700 border border-red-200"}`}
        >
          {cartMessage.text}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF9900] border-t-transparent"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4 text-center text-sm text-red-600">
          <p>Error: {error}</p>
          <button
            onClick={() => fetchProducts()}
            className="mt-2 text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Products from Store */}
      {!isLoading && !error && products.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-dark-text">
            Search Results ({products.length} products)
          </h2>
          <div className="divide-y divide-slate-100 rounded-md border border-slate-200 dark:border-dark-border">
            {products.map((product) => (
              <article
                key={product.id}
                className="grid gap-3 bg-white dark:bg-dark-bgLight p-3 md:grid-cols-[2fr,1.5fr]"
              >
                <div className="space-y-1">
                  <p className="text-xs font-mono text-slate-500 dark:text-dark-textMuted">
                    OEM {product.partNumber}
                  </p>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                    {product.description?.slice(0, 100) ||
                      "No description available"}
                  </p>
                  <div className="flex flex-wrap gap-1 text-[11px] text-slate-600 dark:text-dark-textMuted">
                    <Badge variant="success">In Stock ({product.stock})</Badge>
                    {product.brand && (
                      <Badge variant="outline">{product.brand}</Badge>
                    )}
                    {product.category && (
                      <Badge variant="outline">{product.category}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-2 rounded-md bg-slate-50 dark:bg-dark-bg p-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-dark-text">
                      KES {product.price.toLocaleString()}
                    </p>
                    <p className="text-slate-600 dark:text-dark-textMuted">
                      {product.brand || "Unknown brand"}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-dark-textMuted">
                      Condition: {product.condition}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/parts/${product.id}`)}
                    >
                      View details
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                      disabled={addingProductId === product.id}
                    >
                      {addingProductId === product.id
                        ? "Adding..."
                        : "Add to cart"}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* No Results */}
      {!isLoading && !error && products.length === 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-dark-text">
            Search results
          </h2>
          <div className="rounded-md border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-8 text-center text-sm text-slate-600 dark:text-dark-textMuted">
            <p className="mb-2">No products found matching your criteria.</p>
            <p>Try adjusting your search or filters.</p>
          </div>
        </section>
      )}
    </div>
  );
}
