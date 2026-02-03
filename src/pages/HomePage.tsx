import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Car,
  Wrench,
  Shield,
  Truck,
  Star,
  TrendingUp,
  // Zap,
  CheckCircle,
  Clock,
  // ArrowRight,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useCartStore } from "../stores/cartStore";
import { useProductStore } from "../stores/productStore";

const DEFAULT_VENDOR = {
  vendorId: "nairobi-genuine",
  vendorName: "Nairobi Genuine Parts",
};

export function HomePage() {
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const {
    featuredProducts,
    brands,
    categories,
    isLoading,
    error,
    fetchFeaturedProducts,
    fetchCategories,
    fetchBrands,
    clearError,
  } = useProductStore();

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  useEffect(() => {
    clearError();
    fetchFeaturedProducts(10);
    fetchCategories();
    fetchBrands();
  }, [fetchFeaturedProducts, fetchCategories, fetchBrands, clearError]);

  const deals = [
    { title: "Free delivery", subtitle: "Orders over KES 5,000", icon: Truck },
    { title: "Same-day pickup", subtitle: "Nairobi vendors", icon: Clock },
    { title: "Verified parts", subtitle: "QR code check", icon: Shield },
  ];

  const promotionalBanners = [
    {
      title: "Rainy Season Essentials",
      subtitle: "Wipers, filters & batteries – up to 25% off",
      badge: "Limited time",
      bg: "bg-blue-50",
      onClick: () => navigate("/search?q=rainy+season"),
    },
    {
      title: "Toyota Hilux Service Kit",
      subtitle: "Oil + air + fuel filter combo",
      badge: "Save KES 1,800",
      bg: "bg-amber-50",
      onClick: () => navigate("/search?q=hilux+service+kit"),
    },
    {
      title: "Free Delivery Nationwide",
      subtitle: "On orders over KES 8,000 this week",
      badge: "Promo",
      bg: "bg-green-50",
      onClick: () => navigate("/search"),
    },
  ];

  function handleAddToCart(product: {
    id: string;
    name: string;
    price: number;
  }) {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      vendorId: DEFAULT_VENDOR.vendorId,
      vendorName: DEFAULT_VENDOR.vendorName,
    });
  }

  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-800">
          <p className="font-medium">Failed to load content</p>
          <p className="mt-1 text-sm">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              clearError();
              fetchFeaturedProducts(10);
              fetchCategories();
              fetchBrands();
            }}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && !error && (
        <div className="flex items-center justify-center py-8">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF9900] border-t-transparent"></div>
        </div>
      )}

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-lg bg-gradient-to-r from-[#131921] via-[#232F3E] to-[#131921] p-6 text-white md:p-10">
        <div className="relative z-10 max-w-2xl">
          <Badge className="mb-3 bg-[#FF9900] text-[#131921]">
            Kenya's #1 Auto Parts Marketplace
          </Badge>
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">
            Find Genuine Parts for Your Vehicle
          </h1>
          <p className="mb-6 text-sm text-slate-200 md:text-base">
            Search by part number, vehicle make/model, or browse categories.
            Compare prices from verified vendors across Kenya with accurate
            fitment data.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              size="lg"
              className="bg-[#F7CA00] text-[#131921] hover:bg-[#F7CA00]/90"
              onClick={() => navigate("/search")}
            >
              Start Shopping
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-slate-500 text-slate-900 hover:border-transparent hover:bg-slate-700 hover:text-white"
              onClick={() => navigate("/account/garage")}
            >
              My Garage
            </Button>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#232F3E]/50 to-transparent" />
      </section>

      {/* Featured Products from Backend */}
      {featuredProducts.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#FF9900]" />
              <h2 className="text-lg font-semibold text-slate-900">
                Featured Products
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/search")}
            >
              See more
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {featuredProducts
              .slice(0, 8)
              // Deduplicate by product ID to prevent duplicates
              .filter(
                (product, index, self) =>
                  index === self.findIndex((p) => p.id === product.id)
              )
              .map((product) => (
                <div
                  key={product.id}
                  className="group cursor-pointer rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-[#FF9900] hover:shadow-lg"
                  onClick={() => navigate(`/parts/${product.id}`)}
                >
                  <div className="mb-2 flex h-48 items-center justify-center rounded-md bg-slate-100 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="text-4xl">🔧</span>
                    )}
                  </div>
                  <p className="mb-1 text-[10px] font-mono text-slate-500">
                    {product.partNumber}
                  </p>
                  <h3 className="mb-1 text-sm font-semibold text-slate-900 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="mb-2 text-xs text-slate-600">
                    {product.brand || "Unknown brand"}
                  </p>
                  <div className="mb-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(product.rating || 0)
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                    <span className="ml-1 text-[10px] text-slate-600">
                      ({product.rating?.toFixed(1) || "No rating"})
                    </span>
                  </div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900">
                      KES {product.price.toLocaleString()}
                    </span>
                    {product.stock > 0 ? (
                      <Badge className="bg-green-100 text-green-700 text-[10px]">
                        In Stock
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 text-[10px]">
                        Out of Stock
                      </Badge>
                    )}
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-[#F7CA00] text-[#131921] hover:bg-[#F7CA00]/90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    disabled={product.stock <= 0}
                  >
                    {product.stock > 0 ? "Add to cart" : "Out of Stock"}
                  </Button>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Promotional Banners */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {promotionalBanners.map((promo, i) => (
          <div
            key={i}
            className={`cursor-pointer rounded-lg ${promo.bg} p-6 transition hover:shadow-md`}
            onClick={promo.onClick}
          >
            <Badge className="mb-2 bg-red-700 text-white">{promo.badge}</Badge>
            <h3 className="mb-1 text-lg font-semibold">{promo.title}</h3>
            <p className="text-sm text-slate-700">{promo.subtitle}</p>
            <Button variant="ghost" className="mt-3 p-0 text-sky-600">
              Shop now →
            </Button>
          </div>
        ))}
      </section>

      {/* Vehicle Selector Widget */}
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Car className="h-5 w-5 text-[#FF9900]" />
          <h2 className="text-lg font-semibold text-slate-900">
            Find Parts for Your Vehicle
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Make
            </label>
            <select
              value={selectedMake}
              onChange={(e) => setSelectedMake(e.target.value)}
              className="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm focus:border-[#FF9900] focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20"
            >
              <option value="">Select make</option>
              <option value="toyota">Toyota</option>
              <option value="nissan">Nissan</option>
              <option value="mazda">Mazda</option>
              <option value="honda">Honda</option>
              <option value="isuzu">Isuzu</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={!selectedMake}
              className="h-10 w-full rounded-sm border border-slate-300 bg-white px-3 text-sm disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#FF9900] focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20"
            >
              <option value="">Select model</option>
              {selectedMake === "toyota" && (
                <>
                  <option value="hilux">Hilux</option>
                  <option value="landcruiser">Land Cruiser</option>
                  <option value="corolla">Corolla</option>
                  <option value="rav4">RAV4</option>
                </>
              )}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              Year
            </label>
            <Input
              type="number"
              placeholder="e.g. 2015"
              className="h-10 rounded-sm"
              min="1990"
              max="2025"
            />
          </div>
          <div className="flex items-end">
            <Button
              className="h-10 w-full rounded-sm bg-[#F7CA00] text-[#131921] hover:bg-[#F7CA00]/90"
              onClick={() => navigate("/search")}
            >
              Find Parts
            </Button>
          </div>
        </div>
      </section>

      {/* Categories from Backend */}
      {categories.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Shop by Category
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/search")}
            >
              View all
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <button
                key={category.name}
                onClick={() =>
                  navigate(
                    `/search?category=${encodeURIComponent(category.name)}`
                  )
                }
                className="group rounded-lg border border-slate-200 bg-white p-4 text-left transition-all hover:border-[#FF9900] hover:shadow-md"
              >
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900">
                  {category.name}
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  {category.count} parts
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Brands from Backend */}
      {brands.length > 0 && (
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">
              Trusted Brands
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/search")}
            >
              View all brands
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-6">
            {brands.slice(0, 12).map((brand) => (
              <button
                key={brand.name}
                onClick={() =>
                  navigate(`/search?brand=${encodeURIComponent(brand.name)}`)
                }
                className="group flex flex-col items-center rounded-lg border border-slate-200 bg-white p-4 text-center transition hover:border-[#FF9900] hover:shadow-md"
              >
                <div className="mb-2 h-16 w-16 rounded-full bg-slate-100 text-3xl flex items-center justify-center">
                  {brand.name.charAt(0)}
                </div>
                <h3 className="text-sm font-semibold">{brand.name}</h3>
                <p className="text-xs text-slate-500">{brand.count} parts</p>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Deals & Benefits */}
      <section className="grid gap-4 md:grid-cols-3">
        {deals.map((deal) => {
          const Icon = deal.icon;
          return (
            <div
              key={deal.title}
              className="flex items-start gap-3 rounded-lg border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4"
            >
              <div className="rounded-full bg-[#F7CA00]/20 p-2">
                <Icon className="h-5 w-5 text-[#FF9900]" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{deal.title}</h3>
                <p className="text-xs text-slate-600">{deal.subtitle}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Trust & Security */}
      <section className="rounded-lg border border-slate-200 bg-[#EAEDED] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900">
            Why Shop with Us?
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Verified Vendors
              </p>
              <p className="text-xs text-slate-600">
                All vendors pass KYC checks
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Accurate Fitment
              </p>
              <p className="text-xs text-slate-600">
                Vehicle-specific compatibility
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Nationwide Delivery
              </p>
              <p className="text-xs text-slate-600">
                Fast shipping across Kenya
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Best Prices
              </p>
              <p className="text-xs text-slate-600">Compare multiple vendors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Searches */}
      <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Popular Searches
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Brake pads Toyota Hilux",
            "Oil filter Nissan Navara",
            "Shock absorber Mazda Demio",
            "Air filter Honda CR-V",
            "Spark plugs",
            "Timing belt",
            "Radiator",
            "Battery",
          ].map((term) => (
            <button
              key={term}
              onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-xs text-slate-700 transition-colors hover:border-[#FF9900] hover:bg-slate-50 hover:text-[#131921]"
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* Blog Posts Section */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Blog Posts</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/blog")}>
            View all
          </Button>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <p className="text-sm text-slate-600">No blog posts currently.</p>
        </div>
      </section>
    </div>
  );
}
