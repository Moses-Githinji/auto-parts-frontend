import { useState, useEffect, type FormEvent } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { apiClient } from "../../lib/apiClient";
import type { Vendor, VendorStatus } from "../../types/vendor";

interface VendorFormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  description: string;
  status: VendorStatus;
  sendCredentialsEmail: boolean;
}

const initialFormData: VendorFormData = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  description: "",
  status: "PENDING",
  sendCredentialsEmail: true,
};

export function AdminVendorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newVendor, setNewVendor] = useState<VendorFormData>(initialFormData);
  const [editVendor, setEditVendor] = useState<VendorFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  const navItems = [
    { label: "Dashboard", to: "/admin" },
    { label: "Vendors", to: "/admin/vendors" },
    { label: "Disputes", to: "/admin/disputes" },
    { label: "Reports", to: "/admin/reports" },
  ];

  // Fetch vendors from backend
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ vendors: Vendor[] }>(
        "/api/admin/vendors",
      );
      setVendors(response.vendors || []);
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      setError(
        axiosError.response?.data?.error ||
          axiosError.message ||
          "Failed to fetch vendors",
      );
      console.error("Error fetching vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVendor = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload: Record<string, unknown> = {
        email: newVendor.email,
        companyName: newVendor.companyName,
        contactName: newVendor.contactName || undefined,
        phone: newVendor.phone || undefined,
        address: newVendor.address || undefined,
        city: newVendor.city || undefined,
        state: newVendor.state || undefined,
        zipCode: newVendor.zipCode || undefined,
        description: newVendor.description || undefined,
        status: newVendor.status,
        sendCredentialsEmail: newVendor.sendCredentialsEmail,
      };

      await apiClient.post("/api/admin/vendors", payload);

      setSuccessMessage(
        `Vendor "${newVendor.companyName}" created successfully!`,
      );

      // Reset form
      setNewVendor(initialFormData);
      setIsModalOpen(false);

      // Refresh vendor list
      await fetchVendors();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.message ||
        "Failed to create vendor";
      setError(errorMessage);
      console.error("Error creating vendor:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewVendor = async (vendorId: string) => {
    try {
      await apiClient.patch(`/api/admin/vendors/${vendorId}`, {
        status: "ACTIVE",
      });
      setSuccessMessage(`Vendor ${vendorId} has been approved!`);
      await fetchVendors();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      setError(
        axiosError.response?.data?.error ||
          axiosError.message ||
          "Failed to approve vendor",
      );
    }
  };

  const handleEditSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) return;

    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        companyName: editVendor.companyName,
        contactName: editVendor.contactName || undefined,
        phone: editVendor.phone || undefined,
        address: editVendor.address || undefined,
        city: editVendor.city || undefined,
        state: editVendor.state || undefined,
        zipCode: editVendor.zipCode || undefined,
        description: editVendor.description || undefined,
        status: editVendor.status,
      };

      await apiClient.put(`/api/admin/vendors/${selectedVendor.id}`, payload);

      setSuccessMessage(
        `Vendor "${editVendor.companyName}" updated successfully!`,
      );

      setEditModalOpen(false);
      setSelectedVendor(null);

      // Refresh vendor list
      await fetchVendors();
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      const errorMessage =
        axiosError.response?.data?.error ||
        axiosError.message ||
        "Failed to update vendor";
      setError(errorMessage);
      console.error("Error updating vendor:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewVendor = (vendorId: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (vendor) {
      setSelectedVendor(vendor);
      setViewModalOpen(true);
    }
  };

  const handleEditVendor = (vendorId: string) => {
    const vendor = vendors.find((v) => v.id === vendorId);
    if (vendor) {
      setSelectedVendor(vendor);
      setEditVendor({
        companyName: vendor.companyName,
        contactName: vendor.contactName || "",
        email: vendor.email,
        phone: vendor.phone || "",
        address: vendor.address || "",
        city: vendor.city || "",
        state: vendor.state || "",
        zipCode: vendor.zipCode || "",
        description: vendor.description || "",
        status: vendor.status,
        sendCredentialsEmail: false,
      });
      setEditModalOpen(true);
    }
  };

  const getStatusBadgeClass = (status: VendorStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "INACTIVE":
        return "bg-gray-100 text-gray-700";
      case "SUSPENDED":
        return "bg-red-100 text-red-700";
      case "PENDING":
        return "bg-amber-100 text-amber-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status: VendorStatus) => {
    switch (status) {
      case "ACTIVE":
        return "Active";
      case "INACTIVE":
        return "Inactive";
      case "SUSPENDED":
        return "Suspended";
      case "PENDING":
        return "Pending KYC";
      default:
        return status.charAt(0) + status.slice(1).toLowerCase();
    }
  };

  // Filter vendors based on search and status
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      searchQuery === "" ||
      vendor.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "" || vendor.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <BackofficeLayout title="Admin Console" navItems={navItems}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Vendors</h1>
            <p className="text-sm text-slate-600">
              Manage vendor accounts and KYC verification.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a]"
          >
            Add Vendor
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 rounded-sm bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-sm bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending KYC</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <button
            onClick={fetchVendors}
            className="rounded-sm border border-[#c8c8c8] bg-white px-3 py-1.5 text-xs hover:bg-[#f3f3f3]"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-slate-500">
            Loading vendors...
          </div>
        ) : error && vendors.length === 0 ? (
          <div className="py-8 text-center text-sm text-red-500">
            {error}
            <button
              onClick={fetchVendors}
              className="ml-2 text-[#2b579a] hover:underline"
            >
              Retry
            </button>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">
            No vendors found.
          </div>
        ) : (
          <>
            {/* Vendors Table */}
            <div className="rounded-sm border border-[#c8c8c8]">
              <table className="w-full text-xs">
                <thead className="bg-[#f3f3f3]">
                  <tr className="border-b border-[#c8c8c8]">
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Vendor
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Contact
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Rating
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Joined
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="border-b border-[#e8e8e8] hover:bg-[#f8f8f8]"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                            {vendor.companyName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {vendor.companyName}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              ID: {vendor.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-slate-700">{vendor.email}</p>
                        <p className="text-[10px] text-slate-500">
                          {vendor.phone || "No phone"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeClass(
                            vendor.status,
                          )}`}
                        >
                          {getStatusLabel(vendor.status)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {typeof vendor.rating === "number" &&
                        vendor.rating > 0 ? (
                          <span>
                            {vendor.rating.toFixed(1)} ({vendor.totalReviews})
                          </span>
                        ) : (
                          <span className="text-slate-400">No ratings</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {new Date(vendor.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          },
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {vendor.status === "PENDING" ? (
                            <button
                              onClick={() => handleReviewVendor(vendor.id)}
                              className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-[10px] hover:bg-[#f3f3f3]"
                            >
                              Review
                            </button>
                          ) : (
                            <button
                              onClick={() => handleViewVendor(vendor.id)}
                              className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-[10px] hover:bg-[#f3f3f3]"
                            >
                              View
                            </button>
                          )}
                          <button
                            onClick={() => handleEditVendor(vendor.id)}
                            className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-[10px] hover:bg-[#f3f3f3]"
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Showing 1-{filteredVendors.length} of {vendors.length} vendors
              </span>
              <div className="flex gap-1">
                <button className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-xs hover:bg-[#f3f3f3]">
                  Previous
                </button>
                <button className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-xs hover:bg-[#f3f3f3]">
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        {/* Add Vendor Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-sm bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Add New Vendor
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmitVendor} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newVendor.companyName}
                    onChange={(e) =>
                      setNewVendor({
                        ...newVendor,
                        companyName: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={newVendor.contactName}
                    onChange={(e) =>
                      setNewVendor({
                        ...newVendor,
                        contactName: e.target.value,
                      })
                    }
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter contact person name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newVendor.email}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, email: e.target.value })
                    }
                    required
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={newVendor.phone}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, phone: e.target.value })
                    }
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newVendor.address}
                    onChange={(e) =>
                      setNewVendor({ ...newVendor, address: e.target.value })
                    }
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      City
                    </label>
                    <input
                      type="text"
                      value={newVendor.city}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, city: e.target.value })
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      State/County
                    </label>
                    <input
                      type="text"
                      value={newVendor.state}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, state: e.target.value })
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={newVendor.zipCode}
                      onChange={(e) =>
                        setNewVendor({ ...newVendor, zipCode: e.target.value })
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                      placeholder="Enter zip code"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Status
                    </label>
                    <select
                      value={newVendor.status}
                      onChange={(e) =>
                        setNewVendor({
                          ...newVendor,
                          status: e.target.value as VendorStatus,
                        })
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={newVendor.description}
                    onChange={(e) =>
                      setNewVendor({
                        ...newVendor,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter vendor description"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendCredentials"
                    checked={newVendor.sendCredentialsEmail}
                    onChange={(e) =>
                      setNewVendor({
                        ...newVendor,
                        sendCredentialsEmail: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#c8c8c8] text-[#2b579a] focus:ring-[#2b579a]"
                  />
                  <label
                    htmlFor="sendCredentials"
                    className="text-xs text-slate-700"
                  >
                    Send credentials email to vendor
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-sm border border-[#c8c8c8] bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#f3f3f3]"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a] disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Vendor"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* View Vendor Modal */}
        {viewModalOpen && selectedVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-sm bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Vendor Details
                </h2>
                <button
                  onClick={() => {
                    setViewModalOpen(false);
                    setSelectedVendor(null);
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 border-b border-[#c8c8c8] pb-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#2b579a] text-xl font-bold text-white">
                    {selectedVendor.companyName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      {selectedVendor.companyName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      ID: {selectedVendor.id}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeClass(
                        selectedVendor.status,
                      )}`}
                    >
                      {getStatusLabel(selectedVendor.status)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Email
                    </label>
                    <p className="text-sm text-slate-900">
                      {selectedVendor.email}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Phone
                    </label>
                    <p className="text-sm text-slate-900">
                      {selectedVendor.phone || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Contact Name
                    </label>
                    <p className="text-sm text-slate-900">
                      {selectedVendor.contactName || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Rating
                    </label>
                    <p className="text-sm text-slate-900">
                      {typeof selectedVendor.rating === "number" &&
                      selectedVendor.rating > 0
                        ? `${selectedVendor.rating.toFixed(1)} (${selectedVendor.totalReviews} reviews)`
                        : "No ratings yet"}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      City
                    </label>
                    <p className="text-sm text-slate-900">
                      {selectedVendor.city || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      State/County
                    </label>
                    <p className="text-sm text-slate-900">
                      {selectedVendor.state || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Address
                    </label>
                    <p className="text-sm text-slate-900">
                      {selectedVendor.address || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      Zip Code
                    </label>
                    <p className="text-sm text-slate-900">
                      {selectedVendor.zipCode || "Not provided"}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Description
                  </label>
                  <p className="text-sm text-slate-900">
                    {selectedVendor.description || "No description provided"}
                  </p>
                </div>

                <div className="border-t border-[#c8c8c8] pt-4">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>
                      Created:{" "}
                      {new Date(selectedVendor.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                    <span>
                      Last Updated:{" "}
                      {new Date(selectedVendor.updatedAt).toLocaleDateString(
                        "en-US",
                        {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    onClick={() => {
                      setViewModalOpen(false);
                      setSelectedVendor(null);
                    }}
                    className="rounded-sm border border-[#c8c8c8] bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#f3f3f3]"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setViewModalOpen(false);
                      handleEditVendor(selectedVendor.id);
                    }}
                    className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a]"
                  >
                    Edit Vendor
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Vendor Modal */}
        {editModalOpen && selectedVendor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-sm bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900">
                  Edit Vendor
                </h2>
                <button
                  onClick={() => {
                    setEditModalOpen(false);
                    setSelectedVendor(null);
                  }}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editVendor.companyName}
                    onChange={(e) =>
                      setEditVendor({
                        ...editVendor,
                        companyName: e.target.value,
                      })
                    }
                    required
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter company name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={editVendor.contactName}
                    onChange={(e) =>
                      setEditVendor({
                        ...editVendor,
                        contactName: e.target.value,
                      })
                    }
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter contact person name"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={editVendor.email}
                    disabled
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs bg-gray-100 text-slate-500 cursor-not-allowed"
                    placeholder="Enter email address"
                  />
                  <p className="mt-1 text-[10px] text-slate-500">
                    Email cannot be changed
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editVendor.phone}
                    onChange={(e) =>
                      setEditVendor({ ...editVendor, phone: e.target.value })
                    }
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Address
                  </label>
                  <input
                    type="text"
                    value={editVendor.address}
                    onChange={(e) =>
                      setEditVendor({ ...editVendor, address: e.target.value })
                    }
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter street address"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      City
                    </label>
                    <input
                      type="text"
                      value={editVendor.city}
                      onChange={(e) =>
                        setEditVendor({ ...editVendor, city: e.target.value })
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                      placeholder="Enter city"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      State/County
                    </label>
                    <input
                      type="text"
                      value={editVendor.state}
                      onChange={(e) =>
                        setEditVendor({ ...editVendor, state: e.target.value })
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                      placeholder="Enter state"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Zip Code
                    </label>
                    <input
                      type="text"
                      value={editVendor.zipCode}
                      onChange={(e) =>
                        setEditVendor({
                          ...editVendor,
                          zipCode: e.target.value,
                        })
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                      placeholder="Enter zip code"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Status
                    </label>
                    <select
                      value={editVendor.status}
                      onChange={(e) =>
                        setEditVendor({
                          ...editVendor,
                          status: e.target.value as VendorStatus,
                        })
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACTIVE">Active</option>
                      <option value="INACTIVE">Inactive</option>
                      <option value="SUSPENDED">Suspended</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={editVendor.description}
                    onChange={(e) =>
                      setEditVendor({
                        ...editVendor,
                        description: e.target.value,
                      })
                    }
                    rows={2}
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="Enter vendor description"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setEditModalOpen(false);
                      setSelectedVendor(null);
                    }}
                    className="rounded-sm border border-[#c8c8c8] bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#f3f3f3]"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a] disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save Changes"}
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
