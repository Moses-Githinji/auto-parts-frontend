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
  ArrowLeft,
  Package,
  Calendar,
  Tag,
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useCartStore } from "../../stores/cartStore";
import { useProductStore } from "../../stores/productStore";
import type { ProductCondition } from "../../types/product";

// Default placeholder images for products without images
const PLACEHOLDER_IMAGES = [
  "https://placehold.co/600x600/e2e8f0/64748b?text=No+Image",
];

// Helper function to get condition badge color
function getConditionColor(condition: ProductCondition): string {
  switch (condition) {
    case "NEW":
      return "bg-green-100 text-green-700";
    case "USED":
      return "bg-amber-100 text-amber-700";
    case "REFURBISHED":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

// Helper function to format condition text
function formatCondition(condition: ProductCondition): string {
  return condition.charAt(0) + condition.slice(1).toLowerCase();
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((s) => s.addItem);
  const { currentProduct, isLoading, error, fetchProduct, clearError } =
    useProductStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    clearError();
    if (id) {
      fetchProduct(id);
    }
  }, [id, fetchProduct, clearError]);

  // Reset selected image when product changes
  useEffect(() => {
    setSelectedImage(0);
    setQuantity(1);
  }, [currentProduct?.id]);

  function handleAddToCart() {
    if (!currentProduct) return;
    addItem({
      productId: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      quantity,
      vendorId: currentProduct.vendorId,
      vendorName: "Vendor Store", // This could be enhanced with vendor store name
    });
  }

  function handleBuyNow() {
    handleAddToCart();
    navigate("/checkout");
  }

  function handleShare() {
    if (navigator.share && currentProduct) {
      navigator.share({
        title: currentProduct.name,
        text: `Check out ${currentProduct.name} - KES ${currentProduct.price.toLocaleString()}`,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FF9900] border-t-transparent"></div>
          <p className="text-sm text-slate-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center">
          <p className="mb-4 text-red-700">{error}</p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => id && fetchProduct(id)} variant="outline">
              Try Again
            </Button>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (!currentProduct) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center">
          <Package className="mx-auto mb-4 h-16 w-16 text-slate-300" />
          <h2 className="mb-2 text-xl font-semibold text-slate-900">
            Product Not Found
          </h2>
          <p className="mb-6 text-slate-600">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <div className="flex justify-center gap-3">
            <Button onClick={() => navigate("/search")} variant="outline">
              Browse Products
            </Button>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </div>
      </div>
    );
  }

  const inStock = currentProduct.stock > 0;
  const images =
    currentProduct.images && currentProduct.images.length > 0
      ? currentProduct.images
      : PLACEHOLDER_IMAGES;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-600">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 hover:text-sky-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <span className="text-slate-400">/</span>
        <button onClick={() => navigate("/")} className="hover:text-sky-600">
          Home
        </button>
        <span className="text-slate-400">/</span>
        {currentProduct.category && (
          <>
            <button
              onClick={() => navigate("/search")}
              className="hover:text-sky-600"
            >
              {currentProduct.category}
            </button>
            <span className="text-slate-400">/</span>
          </>
        )}
        <span className="truncate text-slate-900">
          {currentProduct.partNumber}
        </span>
      </nav>

      {/* Amazon-style 3-column layout for desktop */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Left Column: Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="aspect-square">
              <img
                src={images[selectedImage]}
                alt={currentProduct.name}
                className="h-full w-full object-contain p-4"
              />
            </div>
            {/* Zoom button */}
            <button className="absolute right-3 top-3 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white">
              <ZoomIn className="h-4 w-4 text-slate-600" />
            </button>
            {/* Condition badge */}
            <Badge
              className={`absolute left-3 top-3 ${getConditionColor(
                currentProduct.condition,
              )}`}
            >
              {formatCondition(currentProduct.condition)}
            </Badge>
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                    selectedImage === i
                      ? "border-[#FF9900]"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${currentProduct.name} - ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Share & Save Actions */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-sky-600"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>
            <button className="flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-red-500">
              <Heart className="h-4 w-4" />
              Save
            </button>
          </div>
        </div>

        {/* Center Column: Product Info */}
        <div className="space-y-5">
          {/* Title & Part Number */}
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {currentProduct.name}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <p className="text-sm font-mono text-slate-500">
                Part #: {currentProduct.partNumber}
              </p>
              {currentProduct.brand && (
                <Badge variant="outline" className="text-xs">
                  {currentProduct.brand}
                </Badge>
              )}
            </div>
          </div>

          {/* Rating & Views */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.floor(currentProduct.rating || 0)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
              <span className="ml-1 text-sm text-slate-600">
                {currentProduct.rating?.toFixed(1) || "No ratings"}
              </span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-600">
              {currentProduct.views.toLocaleString()} views
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-sm text-slate-600">
              {currentProduct.ordersCount} sold
            </span>
          </div>

          {/* Price */}
          <div className="border-y border-slate-200 py-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">
                KES {currentProduct.price.toLocaleString()}
              </span>
              {currentProduct.condition !== "NEW" && (
                <Badge className="bg-amber-100 text-amber-700">
                  {formatCondition(currentProduct.condition)}
                </Badge>
              )}
            </div>
          </div>

          {/* Description */}
          {currentProduct.description && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-slate-900">
                Description
              </h3>
              <p className="text-sm leading-relaxed text-slate-600">
                {currentProduct.description}
              </p>
            </div>
          )}

          {/* Stock Status */}
          <div
            className={`rounded-lg p-4 ${
              inStock ? "bg-green-50" : "bg-red-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Check
                className={`h-5 w-5 ${
                  inStock ? "text-green-600" : "text-red-600"
                }`}
              />
              <span
                className={`font-medium ${
                  inStock ? "text-green-800" : "text-red-800"
                }`}
              >
                {inStock
                  ? `In Stock (${currentProduct.stock} available)`
                  : "Out of Stock"}
              </span>
            </div>
            {inStock && currentProduct.stock < 10 && (
              <p className="mt-1 text-xs text-amber-700">
                Low stock - order soon!
              </p>
            )}
          </div>

          {/* Technical Specifications */}
          {currentProduct.specifications &&
            Object.keys(currentProduct.specifications).length > 0 && (
              <div className="rounded-lg border border-slate-200 bg-white p-4">
                <h3 className="mb-3 text-sm font-semibold text-slate-900">
                  Technical Specifications
                </h3>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between border-b border-slate-100 py-2">
                    <dt className="text-slate-600">Brand</dt>
                    <dd className="font-medium text-slate-900">
                      {currentProduct.brand || "N/A"}
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-2">
                    <dt className="text-slate-600">Condition</dt>
                    <dd className="font-medium text-slate-900">
                      {formatCondition(currentProduct.condition)}
                    </dd>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 py-2">
                    <dt className="text-slate-600">Category</dt>
                    <dd className="font-medium text-slate-900">
                      {currentProduct.category || "N/A"}
                    </dd>
                  </div>
                  {Object.entries(currentProduct.specifications).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex justify-between border-b border-slate-100 py-2 last:border-0"
                      >
                        <dt className="text-slate-600">
                          {key.charAt(0).toUpperCase() + key.slice(1)}
                        </dt>
                        <dd className="font-medium text-slate-900">{value}</dd>
                      </div>
                    ),
                  )}
                </dl>
              </div>
            )}

          {/* Product Info */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Product Information
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Tag className="h-4 w-4" />
                <span>Product ID: {currentProduct.id}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="h-4 w-4" />
                <span>
                  Added:{" "}
                  {new Date(currentProduct.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Package className="h-4 w-4" />
                <span>
                  Last Updated:{" "}
                  {new Date(currentProduct.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Buy Box */}
        <div className="space-y-4">
          <div className="sticky top-4 space-y-4">
            {/* Purchase Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-slate-900">
                  KES {currentProduct.price.toLocaleString()}
                </span>
                {inStock ? (
                  <Badge className="ml-2 bg-green-100 text-green-700">
                    In Stock
                  </Badge>
                ) : (
                  <Badge className="ml-2 bg-red-100 text-red-700">
                    Out of Stock
                  </Badge>
                )}
              </div>

              {/* Delivery Info */}
              <div className="mb-4 space-y-2 text-sm">
                <div className="flex items-start gap-2 text-slate-700">
                  <Truck className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p>Free delivery available</p>
                    <p className="text-xs text-slate-500">
                      On orders above KES 5,000
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <div>
                    <p>Delivered from Nairobi</p>
                    <p className="text-xs text-slate-500">
                      Estimated 1-3 business days
                    </p>
                  </div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Quantity
                </label>
                <select
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  disabled={!inStock}
                  className="h-10 w-full rounded-md border border-slate-300 px-3 text-sm focus:border-[#FF9900] focus:outline-none focus:ring-1 focus:ring-[#FF9900] disabled:bg-slate-100"
                >
                  {Array.from(
                    { length: Math.min(currentProduct.stock || 0, 10) },
                    (_, i) => i + 1,
                  ).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>

              {/* Add to Cart Button */}
              <Button
                className="mb-3 h-12 w-full rounded-md bg-[#F7CA00] text-[#131921] hover:bg-[#F7CA00]/90 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleAddToCart}
                disabled={!inStock}
              >
                Add to Cart
              </Button>

              {/* Buy Now Button */}
              <Button
                variant="outline"
                className="mb-4 h-12 w-full rounded-md border-[#F7CA00] bg-[#F7CA00]/30 text-[#131921] hover:bg-[#F7CA00]/50 disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleBuyNow}
                disabled={!inStock}
              >
                Buy Now
              </Button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Authentic</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-4 w-4 text-green-600" />
                  <span>Fast</span>
                </div>
              </div>
            </div>

            {/* Vendor Card */}
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">
                Sold by
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-slate-900">Vendor Store</p>
                  <p className="text-xs text-slate-500">
                    Vendor ID: {currentProduct.vendorId}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span>4.5</span>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span>98% positive</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-sm"
                  onClick={() => navigate("/search")}
                >
                  View All Products
                </Button>
              </div>
            </div>

            {/* Return Policy */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 p-1.5">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    30-Day Return Policy
                  </p>
                  <p className="text-xs text-slate-600">
                    Return or exchange within 30 days of delivery
                  </p>
                </div>
              </div>
            </div>

            {/* Warranty */}
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 p-1.5">
                  <Shield className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Warranty Protected
                  </p>
                  <p className="text-xs text-slate-600">
                    {currentProduct.condition === "NEW"
                      ? "Manufacturer warranty included"
                      : "Seller warranty may apply"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
