import { useEffect, useState } from "react";

import { useNavigate, Link } from "react-router-dom";
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
import { useBlogStore } from "../stores/blogStore";
import API_CONFIG from "../config/api";
import { format } from "date-fns";

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
  
  const { 
    posts: blogPosts, 
    fetchPosts: fetchBlogPosts,
    isLoadingPosts: isLoadingBlogPosts 
  } = useBlogStore();

  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [customMake, setCustomMake] = useState("");
  const [customModel, setCustomModel] = useState("");
  const [vehicleMakes, setVehicleMakes] = useState<
    { id: string; name: string }[]
  >([]);
  const [vehicleModels, setVehicleModels] = useState<
    { id: string; name: string }[]
  >([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);

  useEffect(() => {
    clearError();
    fetchFeaturedProducts(10);
    fetchCategories();
    fetchBrands();
    fetchVehicleMakes();
    fetchBlogPosts("", 1); // Fetch page 1 of blog posts
  }, [fetchFeaturedProducts, fetchCategories, fetchBrands, fetchBlogPosts, clearError]);

  // Fetch vehicle makes on initial load
  const fetchVehicleMakes = async () => {
    try {
      const response = await fetch(`${API_CONFIG.baseURL}/api/vehicles/makes`);
      if (response.ok) {
        const data = await response.json();
        setVehicleMakes(data);
      }
    } catch (error) {
      console.error("Error fetching vehicle makes:", error);
    }
  };

  // Get effective values (custom input takes precedence over dropdown)
  const effectiveMake = customMake || selectedMake;
  const effectiveModel = customModel || selectedModel;

  // Fetch models when make changes
  useEffect(() => {
    // Skip fetching if using custom make (no API for custom makes)
    if (!effectiveMake) {
      setVehicleModels([]);
      setSelectedModel("");
      setCustomModel("");
      return;
    }

    // If custom make is entered, don't fetch models from API
    if (customMake) {
      setVehicleModels([]);
      setSelectedModel("");
      return;
    }

    const fetchModels = async () => {
      setIsLoadingModels(true);
      try {
        const response = await fetch(
          `${API_CONFIG.baseURL}/api/vehicles/models?make=${effectiveMake}`
        );
        if (response.ok) {
          const data = await response.json();
          setVehicleModels(data);
        }
      } catch (error) {
        console.error("Error fetching vehicle models:", error);
      } finally {
        setIsLoadingModels(false);
      }
    };

    fetchModels();
    setSelectedModel(""); // Reset model when make changes
    setCustomModel(""); // Reset custom model when make changes
  }, [effectiveMake, customMake]);

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
      bg: "bg-blue-50 dark:bg-blue-900/20",
      onClick: () => navigate("/search?q=rainy+season"),
    },
    {
      title: "Toyota Hilux Service Kit",
      subtitle: "Oil + air + fuel filter combo",
      badge: "Save KES 1,800",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      onClick: () => navigate("/search?q=hilux+service+kit"),
    },
    {
      title: "Free Delivery Nationwide",
      subtitle: "On orders over KES 8,000 this week",
      badge: "Promo",
      bg: "bg-green-50 dark:bg-green-900/20",
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
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-6 text-center text-red-800">
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
              <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
                  className="group cursor-pointer rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 transition-all hover:border-[#FF9900] hover:shadow-lg"
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
                  <p className="mb-1 text-xs font-mono text-slate-500 dark:text-dark-textMuted">
                    {product.partNumber}
                  </p>
                  <h3 className="mb-1 text-sm font-semibold text-slate-900 dark:text-dark-text line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="mb-2 text-xs text-slate-600 dark:text-dark-textMuted">
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
                    <span className="ml-1 text-xs text-slate-600 dark:text-dark-textMuted">
                      ({product.rating?.toFixed(1) || "No rating"})
                    </span>
                  </div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-dark-text">
                      KES {product.price.toLocaleString()}
                    </span>
                    {product.stock > 0 ? (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        In Stock
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700 text-xs">
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
      <div className="dark:bg-dark-bgLight">
        <p className="text-center text-xl font-semibold dark:text-dark-text">Hot Deals</p>
      </div>
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {promotionalBanners.map((promo, i) => (
          <div
            key={i}
            className={`cursor-pointer rounded-lg ${promo.bg} p-6 transition hover:shadow-md`}
            onClick={promo.onClick}
          >
            <Badge className="mb-2 bg-red-700 dark:text-gray-600 text-gray-800">{promo.badge}</Badge>
            <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-dark-text">{promo.title}</h3>
            <p className="text-sm text-slate-700 dark:text-dark-textMuted">{promo.subtitle}</p>
            <Button variant="ghost" className="mt-3 p-0 text-sky-600 dark:text-sky-400">
              Shop now →
            </Button>
          </div>
        ))}
      </section>

      {/* Vehicle Selector Widget */}
      <section className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Car className="h-5 w-5 text-[#FF9900]" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
            Find Parts for Your Vehicle
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {/* Make Selector with Custom Input Option */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
              Make
            </label>
            <div className="relative">
              <select
                value={selectedMake}
                onChange={(e) => {
                  setSelectedMake(e.target.value);
                  setCustomMake(""); // Clear custom input when selecting from dropdown
                }}
                className="h-10 w-full rounded-sm border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bgLight px-3 text-sm dark:text-dark-text focus:border-[#FF9900] focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 pr-8"
              >
                <option value="">Select or type make</option>
                {vehicleMakes.map((make) => (
                  <option key={make.id} value={make.id}>
                    {make.name}
                  </option>
                ))}
              </select>
              {selectedMake && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomMake(selectedMake);
                    setSelectedMake("");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#FF9900] hover:underline"
                  title="Type custom make instead"
                >
                  Edit
                </button>
              )}
            </div>
            {(selectedMake || customMake) && (
              <input
                type="text"
                value={customMake}
                onChange={(e) => {
                  setCustomMake(e.target.value);
                  setSelectedMake(""); // Clear dropdown when typing custom
                }}
                placeholder="Not among the options, type it here..."
                className="mt-1 h-8 w-full rounded-sm border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bgLight px-2 text-xs dark:text-dark-text focus:border-[#FF9900] focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
              />
            )}
          </div>

          {/* Model Selector with Custom Input Option */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
              Model
            </label>
            <div className="relative">
              <select
                value={selectedModel}
                onChange={(e) => {
                  setSelectedModel(e.target.value);
                  setCustomModel(""); // Clear custom input when selecting from dropdown
                }}
                disabled={Boolean(
                  !effectiveMake || isLoadingModels || !!customMake
                )}
                className="h-10 w-full rounded-sm border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bgLight px-3 text-sm dark:text-dark-text disabled:bg-slate-100 dark:disabled:bg-dark-bg disabled:text-slate-400 dark:disabled:text-dark-textMuted focus:border-[#FF9900] focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20 pr-8"
              >
                <option value="">
                  {isLoadingModels
                    ? "Loading..."
                    : customMake
                      ? "Enter model below"
                      : "Select or type model"}
                </option>
                {vehicleModels.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name}
                  </option>
                ))}
              </select>
              {selectedModel && !customMake && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomModel(selectedModel);
                    setSelectedModel("");
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#FF9900] hover:underline"
                  title="Type custom model instead"
                >
                  Edit
                </button>
              )}
            </div>
            {(!selectedModel || customModel) && effectiveMake && (
              <input
                type="text"
                value={customModel}
                onChange={(e) => {
                  setCustomModel(e.target.value);
                  setSelectedModel(""); // Clear dropdown when typing custom
                }}
                placeholder="Not among the options, type it here..."
                className="mt-1 h-8 w-full rounded-sm border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bgLight px-2 text-xs dark:text-dark-text focus:border-[#FF9900] focus:outline-none focus:ring-1 focus:ring-[#FF9900]"
              />
            )}
          </div>

          {/* Year Input */}
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
              Year
            </label>
            <Input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              placeholder="e.g. 2015"
              className="h-10 rounded-sm"
              min="1990"
              max={new Date().getFullYear()}
            />
          </div>

          {/* Search Button */}
          <div className="flex items-end">
            <Button
              className="h-10 w-full rounded-sm bg-[#F7CA00] text-[#131921] hover:bg-[#F7CA00]/90"
              onClick={() => {
                console.log("Button clicked, effective values:", {
                  effectiveMake,
                  effectiveModel,
                  selectedYear,
                });
                if (effectiveMake && effectiveModel) {
                  const url = `/search?make=${encodeURIComponent(effectiveMake)}&model=${encodeURIComponent(effectiveModel)}&year=${encodeURIComponent(selectedYear)}`;
                  console.log("Navigating to:", url);
                  // Use window.location for more reliable URL updates
                  window.location.href = url;
                } else {
                  console.warn("Missing required values:", {
                    effectiveMake: effectiveMake || "(empty)",
                    effectiveModel: effectiveModel || "(empty)",
                  });
                }
              }}
              disabled={!effectiveMake || !effectiveModel}
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
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
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
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {categories.slice(0, 8).map((category) => (
              <button
                key={category.name}
                onClick={() =>
                  navigate(
                    `/search?category=${encodeURIComponent(category.name)}`
                  )
                }
                className="group rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 text-left transition-all hover:border-[#FF9900] hover:shadow-md"
              >
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-800">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-dark-text">
                  {category.name}
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-dark-textMuted">
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
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
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
                className="group flex flex-col items-center rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 text-center transition hover:border-[#FF9900] hover:shadow-md"
              >
                <div className="mb-2 h-16 w-16 rounded-full bg-slate-100 dark:bg-dark-bg text-3xl flex items-center justify-center dark:text-dark-text">
                  {brand.name.charAt(0)}
                </div>
                <h3 className="text-sm font-semibold dark:text-dark-text">{brand.name}</h3>
                <p className="text-xs text-slate-500 dark:text-dark-textMuted">{brand.count} parts</p>
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
              className="flex items-start gap-3 rounded-lg border border-slate-200 dark:border-dark-border bg-gradient-to-br from-white to-slate-50 dark:from-dark-bgLight dark:to-dark-bg p-4"
            >
              <div className="rounded-full bg-[#F7CA00]/20 p-2">
                <Icon className="h-5 w-5 text-[#FF9900]" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-dark-text">{deal.title}</h3>
                <p className="text-xs text-slate-600 dark:text-dark-textMuted">{deal.subtitle}</p>
              </div>
            </div>
          );
        })}
      </section>

      {/* Trust & Security */}
      <section className="rounded-lg border border-slate-200 dark:border-dark-border bg-[#EAEDED] dark:bg-dark-bgLight p-6">
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
            Why Shop with Us?
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-dark-text">
                Verified Vendors
              </p>
              <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                All vendors pass KYC checks
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-dark-text">
                Accurate Fitment
              </p>
              <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                Vehicle-specific compatibility
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-dark-text">
                Nationwide Delivery
              </p>
              <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                Fast shipping across Kenya
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="h-5 w-5 shrink-0 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-dark-text">
                Best Prices
              </p>
              <p className="text-xs text-slate-600 dark:text-dark-textMuted">Compare multiple vendors</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Searches */}
      <section className="p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-dark-text">
          Popular Searches
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            "Brake pads Toyota Hilux",
            "Oil filter Nissan Navarra",
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
              className="rounded-full border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bgLight px-3 py-1 text-xs text-slate-700 dark:text-dark-text transition-colors hover:border-[#FF9900] hover:bg-slate-50 dark:hover:bg-dark-bg hover:text-[#131921] dark:hover:text-[#FF9900]"
            >
              {term}
            </button>
          ))}
        </div>
      </section>

      {/* Blog Posts Section */}
      <section className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">Latest from our Blog</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate("/blog")}>
            View all
          </Button>
        </div>
        
        {isLoadingBlogPosts ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight overflow-hidden">
                <div className="h-48 w-full animate-pulse bg-slate-200 dark:bg-dark-bg"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-slate-200 dark:bg-dark-bg"></div>
                  <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200 dark:bg-dark-bg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : blogPosts.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-3">
            {blogPosts.slice(0, 3).map((post) => (
              <article 
                key={post.id} 
                className="flex flex-col rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight overflow-hidden transition-shadow hover:shadow-md"
              >
                <Link to={`/blog/${post.slug}`} state={{ id: post.id }} className="group relative block h-48 overflow-hidden bg-slate-100 dark:bg-dark-bg">
                  {post.featuredImage ? (
                    <img 
                      src={post.featuredImage} 
                      alt={post.title} 
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400 dark:text-dark-textMuted">
                      <span className="text-4xl">📰</span>
                    </div>
                  )}
                  {post.category && (
                    <span className="absolute left-4 top-4 rounded bg-[#FF9900] px-2 py-1 text-xs font-bold text-[#131921]">
                      {post.category.name}
                    </span>
                  )}
                </Link>
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-3 flex items-center gap-4 text-xs text-slate-500 dark:text-dark-textMuted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "Draft"}
                    </span>
                  </div>
                  <Link to={`/blog/${post.slug}`} state={{ id: post.id }} className="mb-2 block">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-dark-text transition-colors hover:text-[#FF9900] dark:hover:text-[#FF9900] line-clamp-2">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="mb-4 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-dark-textMuted">
                    {post.excerpt || "No excerpt available."}
                  </p>
                  <Link 
                    to={`/blog/${post.slug}`}
                    state={{ id: post.id }}
                    className="text-sm font-semibold text-[#FF9900] hover:underline"
                  >
                    Read Article →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-8 text-center">
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">No blog posts currently.</p>
          </div>
        )}
      </section>
    </div>
  );
}
