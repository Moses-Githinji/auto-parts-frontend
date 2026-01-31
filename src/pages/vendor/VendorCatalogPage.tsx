import { useState, useEffect } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { apiClient } from "../../lib/apiClient";
import {
  uploadMultipleToCloudinary,
  getOptimizedImageUrl,
} from "../../utils/cloudinaryService";
import type {
  Product,
  CreateProductRequest,
  ProductCondition,
} from "../../types/product";

interface ProductFormData {
  name: string;
  partNumber: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  condition: ProductCondition;
  specifications: { key: string; value: string }[];
}

const initialFormData: ProductFormData = {
  name: "",
  partNumber: "",
  description: "",
  price: 0,
  stock: 0,
  category: "",
  brand: "",
  condition: "NEW",
  specifications: [{ key: "", value: "" }],
};

const categories = [
  "Brakes",
  "Engine",
  "Suspension",
  "Electrical",
  "Body",
  "Interior",
  "Exhaust",
  "Fuel System",
  "Cooling System",
  "Steering",
  "Transmission",
  "Wheels & Tires",
];

const conditions: ProductCondition[] = ["NEW", "USED", "REFURBISHED"];

export function VendorCatalogPage() {
  const vendorNavItems = [
    { label: "Dashboard", to: "/vendor" },
    { label: "Orders", to: "/vendor/orders" },
    { label: "Catalog", to: "/vendor/catalog" },
    { label: "Analytics", to: "/vendor/analytics" },
    { label: "Settings", to: "/vendor/settings" },
  ];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState<ProductFormData>(initialFormData);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch products from backend
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ products: Product[] }>(
        "/api/products/vendor",
      );
      setProducts(response.products);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = () => {
    setFormData(initialFormData);
    setSelectedImages([]);
    setImagePreviews([]);
    setError(null);
    setSuccess(null);
    setShowAddModal(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "price" || name === "stock" ? Number(value) : value,
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages((prev) => [...prev, ...files]);

      // Create preview URLs
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSpecificationChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index] = { ...newSpecs[index], [field]: value };
    setFormData((prev) => ({ ...prev, specifications: newSpecs }));
  };

  const addSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { key: "", value: "" }],
    }));
  };

  const removeSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // Upload images first if any selected
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        setUploadingImages(true);
        setUploadProgress(0);

        imageUrls = await uploadMultipleToCloudinary(selectedImages);

        setUploadProgress(100);
        setUploadingImages(false);
      }

      const payload: CreateProductRequest = {
        name: formData.name,
        partNumber: formData.partNumber,
        description: formData.description || undefined,
        price: formData.price,
        stock: formData.stock,
        category: formData.category || undefined,
        brand: formData.brand || undefined,
        condition: formData.condition,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        specifications: formData.specifications
          .filter((s) => s.key && s.value)
          .reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {}),
      };

      const response = await apiClient.post<{ product: Product }>(
        "/api/products",
        payload,
      );
      const newProduct = response.product;

      setProducts((prev) => [...prev, newProduct]);
      setSuccess("Product added successfully!");
      setShowAddModal(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add product";
      setError(message);
    } finally {
      setSubmitting(false);
      setUploadingImages(false);
      setUploadProgress(null);
    }
  };

  const activeProducts = products.filter((p) => p.status === "ACTIVE").length;
  const lowStockProducts = products.filter(
    (p) => p.stock > 0 && p.stock < 10,
  ).length;
  const outOfStockProducts = products.filter((p) => p.stock === 0).length;

  return (
    <BackofficeLayout title="Vendor Portal" navItems={vendorNavItems}>
      <div className="p-6">
        {/* Success Message */}
        {success && (
          <div className="mb-4 rounded-sm bg-green-50 p-3 text-xs text-green-600">
            {success}
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Product Catalog
            </h1>
            <p className="text-sm text-slate-600">
              Manage your products and inventory.
            </p>
          </div>
          <button
            onClick={handleAddProduct}
            className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a]"
          >
            Add Product
          </button>
        </div>

        {/* Stats */}
        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Total Products</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">
              {products.length}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Active Products</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {activeProducts}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Low Stock</p>
            <p className="mt-1 text-2xl font-semibold text-amber-600">
              {lowStockProducts}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Out of Stock</p>
            <p className="mt-1 text-2xl font-semibold text-red-600">
              {outOfStockProducts}
            </p>
          </div>
        </section>

        {/* Filters */}
        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search products..."
            className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
          />
          <select className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none">
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat.toLowerCase()}>
                {cat}
              </option>
            ))}
          </select>
          <select className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          <button
            onClick={fetchProducts}
            className="rounded-sm border border-[#c8c8c8] bg-white px-3 py-1.5 text-xs hover:bg-[#f3f3f3]"
          >
            Refresh
          </button>
        </div>

        {/* Products Table */}
        <div className="rounded-sm border border-[#c8c8c8]">
          {loading ? (
            <div className="p-8 text-center text-sm text-slate-600">
              Loading products...
            </div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-600">
              No products found.
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-[#f3f3f3]">
                <tr className="border-b border-[#c8c8c8]">
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Product
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    SKU
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Category
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Price
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Stock
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-[#e8e8e8] hover:bg-[#f8f8f8]"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={getOptimizedImageUrl(product.images[0], {
                              width: 40,
                              height: 40,
                            })}
                            alt={product.name}
                            className="h-10 w-10 rounded-sm object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-sm bg-slate-200" />
                        )}
                        <div>
                          <p className="font-medium text-slate-900">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {product.brand}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {product.partNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {product.category || "-"}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      KSh {product.price.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          product.stock === 0
                            ? "text-red-600"
                            : product.stock < 10
                              ? "text-amber-600"
                              : "text-slate-700"
                        }
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                          product.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {product.status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-[10px] hover:bg-[#f3f3f3]">
                          Edit
                        </button>
                        <button className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-[10px] hover:bg-[#f3f3f3]">
                          View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-sm bg-white p-6 shadow-lg">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Add New Product
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 rounded-sm bg-red-50 p-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                      placeholder="Enter product name"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Part Number *
                    </label>
                    <input
                      type="text"
                      name="partNumber"
                      value={formData.partNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                      placeholder="e.g., BP-001-CER"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Describe your product..."
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Price (KES) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Stock Quantity *
                    </label>
                    <input
                      type="number"
                      name="stock"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Condition
                    </label>
                    <select
                      name="condition"
                      value={formData.condition}
                      onChange={handleInputChange}
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                    >
                      {conditions.map((c) => (
                        <option key={c} value={c}>
                          {c.charAt(0) + c.slice(1).toLowerCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Brand
                    </label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>

                {/* Product Images */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Product Images
                  </label>
                  <p className="mb-2 text-[10px] text-slate-500">
                    Upload multiple images (front, back, OEM stamp, etc.)
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-sm border border-dashed border-[#c8c8c8] bg-slate-50 hover:bg-slate-100">
                      <svg
                        className="h-6 w-6 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span className="mt-1 text-[10px] text-slate-500">
                        Add Image
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </label>
                    {imagePreviews.map((preview, index) => (
                      <div
                        key={index}
                        className="relative h-20 w-20 overflow-hidden rounded-sm border border-[#e8e8e8]"
                      >
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center bg-red-500 text-white hover:bg-red-600"
                        >
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  {uploadingImages && (
                    <div className="mt-2">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className="h-full bg-[#2b579a] transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] text-slate-500">
                        Uploading images... {uploadProgress}%
                      </p>
                    </div>
                  )}
                </div>

                {/* Specifications */}
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-xs font-medium text-slate-700">
                      Specifications
                    </label>
                    <button
                      type="button"
                      onClick={addSpecification}
                      className="text-xs text-[#2b579a] hover:underline"
                    >
                      + Add Specification
                    </button>
                  </div>
                  {formData.specifications.map((spec, index) => (
                    <div key={index} className="mb-2 flex gap-2">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) =>
                          handleSpecificationChange(
                            index,
                            "key",
                            e.target.value,
                          )
                        }
                        placeholder="Key (e.g., Material)"
                        className="flex-1 rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) =>
                          handleSpecificationChange(
                            index,
                            "value",
                            e.target.value,
                          )
                        }
                        placeholder="Value (e.g., Ceramic)"
                        className="flex-1 rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                      />
                      {formData.specifications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSpecification(index)}
                          className="rounded-sm border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 hover:bg-red-100"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="rounded-sm border border-[#c8c8c8] bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-[#f3f3f3]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || uploadingImages}
                    className="rounded-sm bg-[#2b579a] px-4 py-2 text-xs font-medium text-white hover:bg-[#1e3f7a] disabled:opacity-50"
                  >
                    {submitting || uploadingImages
                      ? "Uploading..."
                      : "Add Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </BackofficeLayout>
  );
}
