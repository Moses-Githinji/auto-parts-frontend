import { useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "out_of_stock";
  image?: string;
}

export function VendorCatalogPage() {
  const vendorNavItems = [
    { label: "Dashboard", to: "/vendor" },
    { label: "Orders", to: "/vendor/orders" },
    { label: "Catalog", to: "/vendor/catalog" },
    { label: "Analytics", to: "/vendor/analytics" },
    { label: "Settings", to: "/vendor/settings" },
  ];

  const [products] = useState<Product[]>([
    {
      id: "1",
      name: "Ceramic Brake Pads",
      sku: "BP-001-CER",
      category: "Brakes",
      price: 2500,
      stock: 45,
      status: "active",
    },
    {
      id: "2",
      name: "Premium Oil Filter",
      sku: "OF-002-PREM",
      category: "Engine",
      price: 850,
      stock: 120,
      status: "active",
    },
    {
      id: "3",
      name: "Spark Plug Set",
      sku: "SP-003-SET",
      category: "Engine",
      price: 1200,
      stock: 0,
      status: "out_of_stock",
    },
    {
      id: "4",
      name: "Suspension Kit",
      sku: "SK-004-KIT",
      category: "Suspension",
      price: 8500,
      stock: 8,
      status: "active",
    },
    {
      id: "5",
      name: "Alternator 12V",
      sku: "ALT-005-12V",
      category: "Electrical",
      price: 12500,
      stock: 3,
      status: "draft",
    },
  ]);

  const handleAddProduct = () => {
    // Placeholder for add product functionality
    alert("Add Product functionality would open a modal or navigate to a form");
  };

  return (
    <BackofficeLayout title="Vendor Portal" navItems={vendorNavItems}>
      <div className="p-6">
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
              {products.filter((p) => p.status === "active").length}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Low Stock</p>
            <p className="mt-1 text-2xl font-semibold text-amber-600">
              {products.filter((p) => p.stock > 0 && p.stock < 10).length}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Out of Stock</p>
            <p className="mt-1 text-2xl font-semibold text-red-600">
              {products.filter((p) => p.stock === 0).length}
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
            <option value="brakes">Brakes</option>
            <option value="engine">Engine Parts</option>
            <option value="suspension">Suspension</option>
            <option value="electrical">Electrical</option>
          </select>
          <select className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Products Table */}
        <div className="rounded-sm border border-[#c8c8c8]">
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
                      <div className="h-10 w-10 rounded-sm bg-slate-200" />
                      <p className="font-medium text-slate-900">
                        {product.name}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{product.sku}</td>
                  <td className="px-4 py-3 text-slate-700">
                    {product.category}
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
                        product.status === "active"
                          ? "bg-green-100 text-green-700"
                          : product.status === "draft"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.status === "out_of_stock"
                        ? "Out of Stock"
                        : product.status.charAt(0).toUpperCase() +
                          product.status.slice(1)}
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
        </div>
      </div>
    </BackofficeLayout>
  );
}
