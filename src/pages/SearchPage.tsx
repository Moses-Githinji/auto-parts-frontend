import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { useCartStore } from "../stores/cartStore";
import { useProductStore } from "../stores/productStore";

const MOCK_LISTING = {
  partNumber: "04465-0K390",
  partName: "Front Brake Pad Set – Hilux Vigo",
  vendorId: "search-vendor-1",
  vendorName: "Nairobi Genuine Parts",
  unitPrice: 7500,
  currency: "KES",
};

export function SearchPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const q = params.get("q") ?? "";
  const category = params.get("cat") ?? "";
  const brand = params.get("brand") ?? "";
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

  useEffect(() => {
    clearError();
    clearFilters();

    // Build filters from URL params
    const filters: Record<string, string> = {};
    if (q) filters.search = q;
    if (category) filters.category = category;
    if (brand) filters.brand = brand;

    if (Object.keys(filters).length > 0) {
      setFilters(filters);
      fetchProducts(filters);
    } else {
      fetchProducts();
    }
  }, [q, category, brand, fetchProducts, setFilters, clearFilters, clearError]);

  function handleAddToCart() {
    addItem({
      productId: "mock-product-id",
      name: MOCK_LISTING.partName,
      price: MOCK_LISTING.unitPrice,
      quantity: 1,
      vendorId: MOCK_LISTING.vendorId,
      vendorName: MOCK_LISTING.vendorName,
    });
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

  return (
    <div className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center"
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
        <div className="flex flex-wrap gap-2 text-xs text-slate-700">
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF9900] border-t-transparent"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-sm text-red-600">
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
          <h2 className="text-sm font-semibold text-slate-900">
            Search Results ({products.length} products)
          </h2>
          <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
            {products.map((product) => (
              <article
                key={product.id}
                className="grid gap-3 bg-white p-3 md:grid-cols-[2fr,1.5fr]"
              >
                <div className="space-y-1">
                  <p className="text-xs font-mono text-slate-500">
                    OEM {product.partNumber}
                  </p>
                  <h3 className="text-sm font-semibold text-slate-900">
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-600">
                    {product.description?.slice(0, 100) ||
                      "No description available"}
                  </p>
                  <div className="flex flex-wrap gap-1 text-[11px] text-slate-600">
                    <Badge variant="success">In Stock ({product.stock})</Badge>
                    {product.brand && (
                      <Badge variant="outline">{product.brand}</Badge>
                    )}
                    {product.category && (
                      <Badge variant="outline">{product.category}</Badge>
                    )}
                  </div>
                </div>
                <div className="flex flex-col justify-between gap-2 rounded-md bg-slate-50 p-3 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">
                      KES {product.price.toLocaleString()}
                    </p>
                    <p className="text-slate-600">
                      {product.brand || "Unknown brand"}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Condition: {product.condition}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/parts/${product.partNumber}`)}
                    >
                      View details
                    </Button>
                    <Button size="sm" onClick={handleAddToCart}>
                      Add to cart
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
          <h2 className="text-sm font-semibold text-slate-900">
            Search results
          </h2>
          <div className="rounded-md border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
            <p className="mb-2">No products found matching your criteria.</p>
            <p>Try adjusting your search or filters.</p>
          </div>
        </section>
      )}

      {/* Mock Search Results (when no store data) */}
      {!isLoading && products.length === 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold text-slate-900">
            Search results (demo)
          </h2>
          <p className="text-xs text-slate-600">
            This screen will call your existing search endpoint and rank by
            exact part match, fitment confidence, vendor SLA, and price.
          </p>
          <div className="divide-y divide-slate-100 rounded-md border border-slate-200">
            <article className="grid gap-3 bg-white p-3 md:grid-cols-[2fr,1.5fr]">
              <div className="space-y-1">
                <p className="text-xs font-mono text-slate-500">
                  OEM {MOCK_LISTING.partNumber}
                </p>
                <h3 className="text-sm font-semibold text-slate-900">
                  {MOCK_LISTING.partName}
                </h3>
                <p className="text-xs text-slate-600">
                  Fits Toyota Hilux Vigo 2.5/3.0D (KUN25, KUN26) 2005–2015. High
                  confidence fitment.
                </p>
                <div className="flex flex-wrap gap-1 text-[11px] text-slate-600">
                  <Badge variant="success">Fitment 0.96</Badge>
                  <Badge variant="outline">Interchange: NIBK PN1234</Badge>
                </div>
              </div>
              <div className="flex flex-col justify-between gap-2 rounded-md bg-slate-50 p-3 text-xs">
                <div>
                  <p className="font-semibold text-slate-900">
                    From KES {MOCK_LISTING.unitPrice.toLocaleString()}
                  </p>
                  <p className="text-slate-600">3 vendor offers • Nairobi</p>
                  <p className="text-[11px] text-slate-500">
                    Fastest delivery: Tomorrow by 5pm
                  </p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`/parts/${MOCK_LISTING.partNumber}`)
                    }
                  >
                    View offers
                  </Button>
                  <Button size="sm" onClick={handleAddToCart}>
                    Add to cart
                  </Button>
                </div>
              </div>
            </article>
          </div>
        </section>
      )}
    </div>
  );
}
