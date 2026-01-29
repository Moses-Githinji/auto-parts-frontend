import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Star,
  Check,
  Truck,
  Shield,
  MapPin,
  Share2,
  Heart,
  ZoomIn,
} from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useCartStore } from "../stores/cartStore";
import { useProductStore } from "../stores/productStore";

const productImages = ["🔧", "🚗", "⚙️", "📦"];

// Mock data for enhanced product display
const MOCK_PRODUCT_DETAILS = {
  rating: 4.8,
  reviewCount: 234,
  inStock: true,
  deliveryInfo: "Order within 2 hrs for delivery tomorrow",
  vendor: {
    name: "Nairobi Genuine Parts",
    rating: 4.8,
    location: "Industrial Area, Nairobi",
    sla: "98% on-time delivery",
  },
  fitment: [
    {
      vehicle: "Toyota Hilux Vigo 2.5D/3.0D (KUN25, KUN26)",
      year: "2005-2015",
      confidence: 0.96,
    },
    { vehicle: "Toyota Fortuner 3.0D", year: "2005-2015", confidence: 0.9 },
    { vehicle: "Toyota Innova 2.5D", year: "2008-2015", confidence: 0.85 },
  ],
  interchange: [
    { part: "NIBK PN1234", type: "Equivalent", confidence: "High" },
    { part: "Bosch 0986AB2034", type: "Compatible", confidence: "Medium" },
    { part: "Akebono ACT890", type: "Alternative", confidence: "Medium" },
  ],
  bullets: [
    "Premium ceramic formulation for superior stopping power",
    "Low dust formula keeps wheels cleaner",
    "Shimmed for quiet operation",
    "Meets or exceeds OEM specifications",
    "Ideal for both city and highway driving",
  ],
};

export function PartDetailPage() {
  const { partNumber } = useParams<{ partNumber: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const { currentProduct, isLoading, error, fetchProduct, clearError } =
    useProductStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    clearError();
    if (partNumber) {
      fetchProduct(partNumber);
    }
  }, [partNumber, fetchProduct, clearError]);

  function handleAddToCart() {
    if (!currentProduct) return;
    addItem({
      productId: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      quantity,
      vendorId: currentProduct.vendorId,
      vendorName: MOCK_PRODUCT_DETAILS.vendor.name,
    });
  }

  function handleBuyNow() {
    handleAddToCart();
    navigate("/checkout");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#FF9900] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 text-center py-16">
        <p className="text-red-600">Error: {error}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (!currentProduct) {
    return (
      <div className="space-y-4 text-center py-16">
        <p className="text-slate-600">Product not found</p>
        <Button onClick={() => navigate("/search")}>Browse Products</Button>
      </div>
    );
  }

  const inStock = currentProduct.stock > 0;

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-600">
        <button onClick={() => navigate(-1)} className="hover:text-sky-600">
          Back to search
        </button>
        <span className="mx-2">/</span>
        <span>{currentProduct.category || "Brake System"}</span>
        <span className="mx-2">/</span>
        <span>{currentProduct.partNumber}</span>
      </nav>

      {/* Amazon-style 3-column layout for desktop */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Visuals */}
        <div className="space-y-3">
          {/* Main Image */}
          <div className="relative rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex aspect-square items-center justify-center text-8xl">
              {productImages[selectedImage]}
            </div>
            {/* Zoom button */}
            <button className="absolute right-2 top-2 rounded-full bg-slate-100 p-2 hover:bg-slate-200">
              <ZoomIn className="h-4 w-4 text-slate-600" />
            </button>
          </div>

          {/* Thumbnail Gallery */}
          <div className="flex gap-2">
            {productImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setSelectedImage(i)}
                className={`h-16 w-16 rounded-md border-2 p-1 ${
                  selectedImage === i
                    ? "border-[#FF9900]"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex h-full items-center justify-center text-2xl">
                  {img}
                </div>
              </button>
            ))}
          </div>

          {/* Share & Save */}
          <div className="flex gap-3 pt-2">
            <button className="flex items-center gap-1 text-xs text-slate-600 hover:text-sky-600">
              <Share2 className="h-3 w-3" /> Share
            </button>
            <button className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-500">
              <Heart className="h-3 w-3" /> Save
            </button>
          </div>
        </div>

        {/* Center Column: Info */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {currentProduct.name}
            </h1>
            <p className="mt-1 text-xs font-mono text-slate-500">
              Part #: {currentProduct.partNumber}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.floor(MOCK_PRODUCT_DETAILS.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <button className="text-xs text-sky-600 hover:underline">
                {MOCK_PRODUCT_DETAILS.reviewCount} ratings
              </button>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-1.5">
            <Badge className="bg-[#FF9900] text-[#131921]">Best Seller</Badge>
            <Badge variant="outline">OEM Genuine</Badge>
            <Badge variant="outline">{currentProduct.brand || "Unknown"}</Badge>
          </div>

          {/* Price */}
          <div className="border-b border-slate-200 pb-3">
            <span className="text-2xl font-bold text-slate-900">
              KES {currentProduct.price.toLocaleString()}
            </span>
          </div>

          {/* Fitment Check Box */}
          <div className="rounded-lg border border-slate-200 bg-green-50 p-4">
            <div className="flex items-start gap-2">
              <Check className="h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-semibold text-green-800">
                  Fits your 2018 Toyota Hilux
                </p>
                <p className="mt-1 text-xs text-green-700">
                  This part is confirmed to fit your vehicle based on your
                  garage.
                </p>
                <button className="mt-2 text-xs font-medium text-green-800 hover:underline">
                  Change vehicle
                </button>
              </div>
            </div>
          </div>

          {/* Fitment Table */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              Vehicle Fitment
            </h3>
            <div className="space-y-2">
              {MOCK_PRODUCT_DETAILS.fitment.map((fit, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm text-slate-900">{fit.vehicle}</p>
                    <p className="text-xs text-slate-500">{fit.year}</p>
                  </div>
                  <Badge
                    className={
                      fit.confidence >= 0.9
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }
                  >
                    {Math.round(fit.confidence * 100)}% match
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Interchangeability */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              Interchangeable Parts
            </h3>
            <div className="space-y-2">
              {MOCK_PRODUCT_DETAILS.interchange.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-slate-400" />
                    <span className="text-sm text-slate-700">{item.part}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {item.type}
                    </Badge>
                  </div>
                  <Badge
                    className={
                      item.confidence === "High"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }
                  >
                    {item.confidence} confidence
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              Technical Specifications
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 py-1">
                <dt className="text-slate-600">Brand</dt>
                <dd className="font-medium text-slate-900">
                  {currentProduct.brand || "Unknown"}
                </dd>
              </div>
              <div className="flex justify-between border-b border-slate-100 py-1">
                <dt className="text-slate-600">Condition</dt>
                <dd className="font-medium text-slate-900">
                  {currentProduct.condition}
                </dd>
              </div>
              {Object.entries(currentProduct.specifications || {})
                .slice(0, 4)
                .map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between border-b border-slate-100 py-1"
                  >
                    <dt className="text-slate-600">{key}</dt>
                    <dd className="font-medium text-slate-900">{value}</dd>
                  </div>
                ))}
            </dl>
          </div>

          {/* Product Bullets */}
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              Key Features
            </h3>
            <ul className="space-y-1 text-sm text-slate-700">
              {MOCK_PRODUCT_DETAILS.bullets.map((bullet, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Buy Box */}
        <div className="space-y-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            {/* Price */}
            <div className="mb-3">
              <span className="text-2xl font-bold text-slate-900">
                KES {currentProduct.price.toLocaleString()}
              </span>
            </div>

            {/* Delivery */}
            <div className="mb-4 space-y-1 text-xs">
              <div className="flex items-center gap-1 text-slate-700">
                <Truck className="h-3.5 w-3.5" />
                <span>{MOCK_PRODUCT_DETAILS.deliveryInfo}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-700">
                <MapPin className="h-3.5 w-3.5" />
                <span>Ships from Nairobi</span>
              </div>
            </div>

            {/* Stock Status */}
            <div className="mb-4">
              {inStock ? (
                <Badge className="bg-green-100 text-green-700">
                  In Stock ({currentProduct.stock} available)
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700">Out of Stock</Badge>
              )}
            </div>

            {/* Quantity */}
            <div className="mb-4">
              <label className="mb-1 block text-xs font-medium text-slate-700">
                Quantity
              </label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="h-9 w-24 rounded-sm border border-slate-300 px-2 text-sm focus:border-[#FF9900] focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            {/* Add to Cart Button */}
            <Button
              className="mb-2 h-10 w-full rounded-sm bg-[#F7CA00] text-[#131921] hover:bg-[#F7CA00]/90"
              onClick={handleAddToCart}
              disabled={!inStock}
            >
              Add to Cart
            </Button>

            {/* Buy Now Button */}
            <Button
              variant="outline"
              className="mb-4 h-10 w-full rounded-sm border-[#F7CA00] bg-[#F7CA00]/30 text-[#131921] hover:bg-[#F7CA00]/50"
              onClick={handleBuyNow}
              disabled={!inStock}
            >
              Buy Now
            </Button>

            {/* Trust indicators */}
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <Shield className="h-3.5 w-3.5 text-green-600" />
                <span>Secure payment</span>
              </div>
              <div className="flex items-center gap-1">
                <Truck className="h-3.5 w-3.5 text-slate-600" />
                <span>Fast delivery</span>
              </div>
            </div>
          </div>

          {/* Vendor Card */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              Sold by
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">
                    {MOCK_PRODUCT_DETAILS.vendor.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {MOCK_PRODUCT_DETAILS.vendor.location}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-600">
                <div className="flex items-center gap-0.5">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>{MOCK_PRODUCT_DETAILS.vendor.rating}</span>
                </div>
                <div className="flex items-center gap-0.5">
                  <Truck className="h-3.5 w-3.5" />
                  <span>{MOCK_PRODUCT_DETAILS.vendor.sla}</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 w-full text-xs"
                onClick={() => navigate("/account")}
              >
                Visit Store
              </Button>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">
              Delivery Options
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-600">Same-day pickup</span>
                <span className="font-medium text-slate-900">Free</span>
              </div>
              <div className="flex items-center justify-between border-b border-slate-100 py-2">
                <span className="text-slate-600">Nairobi delivery</span>
                <span className="font-medium text-slate-900">KES 200</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-600">Nationwide (2-3 days)</span>
                <span className="font-medium text-slate-900">KES 500</span>
              </div>
            </div>
          </div>

          {/* Return Policy */}
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start gap-2">
              <div className="rounded-full bg-green-100 p-1">
                <Check className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">
                  30-Day Returns
                </p>
                <p className="text-xs text-slate-600">
                  Easy returns within 30 days of delivery
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
