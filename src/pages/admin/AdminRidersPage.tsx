import { useState, useEffect, type FormEvent } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";
import { apiClient } from "../../lib/apiClient";
import type { User, UserStatus } from "../../types/user";

// Define a specific interface for the form data, separate from the User type
interface RiderFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  vehicleType: string;
  plateNumber: string;
  status: UserStatus;
  sendCredentialsEmail: boolean;
}

const initialFormData: RiderFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  vehicleType: "Motorbike",
  plateNumber: "",
  status: "ACTIVE",
  sendCredentialsEmail: true,
};

export function AdminRidersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [riders, setRiders] = useState<(User & { vehicleType?: string; plateNumber?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [newRider, setNewRider] = useState<RiderFormData>(initialFormData);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Fetch riders from backend
  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get<{ riders: (User & { vehicleType?: string; plateNumber?: string })[] }>("/api/admin/riders");
      setRiders(response.riders || []);
      
    } catch (err: unknown) {
      console.error("Error fetching riders:", err);
      setError("Failed to fetch riders. Please try again.");
      setRiders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRider = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const payload = {
        ...newRider,
        role: "RIDER",
      };

      await apiClient.post("/api/admin/riders", payload);

      setSuccessMessage(
        `Rider "${newRider.firstName} ${newRider.lastName}" created successfully!`
      );

      // Reset form
      setNewRider(initialFormData);
      setIsModalOpen(false);

      // Refresh list
      fetchRiders();

    } catch (err: unknown) {
      console.error("Error creating rider:", err);
      setError("Failed to create rider. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRider = async (id: string) => {
    if (!confirm("Are you sure you want to delete this rider? This action cannot be undone.")) {
      return;
    }

    try {
      setDeletingId(id);
      setError(null);
      
      await apiClient.delete(`/api/admin/riders/${id}`);
      
      setSuccessMessage("Rider deleted successfully!");
      
      // Remove from local list
      setRiders(riders.filter(r => r.id !== id));
      
    } catch (err: unknown) {
      console.error("Error deleting rider:", err);
      setError("Failed to delete rider. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadgeClass = (status: UserStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "INACTIVE":
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
      case "SUSPENDED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "DELETED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  // Filter riders based on search and status
  const filteredRiders = riders.filter((rider) => {
    const matchesSearch =
      searchQuery === "" ||
      rider.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rider.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rider.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "" || rider.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Delivery Fleet</h1>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">
              Manage delivery riders and their credentials.
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a]"
          >
            Add New Rider
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 rounded-sm bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded-sm bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search riders..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight px-3 py-1.5 text-xs text-slate-900 dark:text-dark-text focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none placeholder:text-slate-400"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight px-3 py-1.5 text-xs focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none text-slate-900 dark:text-dark-text"
          >
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
          <button
            onClick={fetchRiders}
            className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight px-3 py-1.5 text-xs text-slate-700 dark:text-dark-text hover:bg-[#f3f3f3] dark:hover:bg-dark-bg"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-sm text-slate-500 dark:text-dark-textMuted">
            Loading riders...
          </div>
        ) : riders.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-sm border border-dashed border-slate-300 dark:border-dark-border bg-slate-50 dark:bg-dark-bg p-12">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 dark:bg-dark-bgLight">
              <svg className="h-8 w-8 text-slate-400 dark:text-dark-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-sm font-medium text-slate-900 dark:text-dark-text">No riders found</h3>
            <p className="mb-4 text-xs text-slate-500 dark:text-dark-textMuted">
              Get started by adding your first delivery rider to the fleet.
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a]"
            >
              Add First Rider
            </button>
          </div>
        ) : (
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border">
            <table className="w-full text-xs">
              <thead className="bg-[#f3f3f3] dark:bg-dark-bg">
                <tr className="border-b border-[#c8c8c8] dark:border-dark-border">
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                    Rider
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                    Contact
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                    Status
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                    Vehicle
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                    Joined
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-textMuted">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRiders.map((rider) => (
                  <tr
                    key={rider.id}
                    className="border-b border-[#e8e8e8] dark:border-dark-border hover:bg-[#f8f8f8] dark:hover:bg-dark-bg"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-s-sm font-semiboldlate-200 text text-slate-700 dark:bg-dark-bgLight dark:text-dark-text">
                          {rider.firstName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 dark:text-dark-text">
                            {rider.firstName} {rider.lastName}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-dark-textMuted">
                            ID: {rider.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700 dark:text-dark-text">{rider.email}</p>
                      <p className="text-[10px] text-slate-500 dark:text-dark-textMuted">
                        {rider.phone || "No phone"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getStatusBadgeClass(
                          rider.status
                        )}`}
                      >
                        {rider.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-dark-text">
                        <p>{rider.vehicleType || "N/A"}</p>
                        <p className="text-[10px] text-slate-500 dark:text-dark-textMuted">{rider.plateNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-dark-text">
                      {new Date(rider.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          className="rounded-sm border border-[#c8c8c8] dark:border-dark-border px-2 py-0.5 text-[10px] text-slate-700 dark:text-dark-text hover:bg-[#f3f3f3] dark:hover:bg-dark-bg"
                        >
                          View
                        </button>
                        <button
                          className="rounded-sm border border-[#c8c8c8] dark:border-dark-border px-2 py-0.5 text-[10px] text-slate-700 dark:text-dark-text hover:bg-[#f3f3f3] dark:hover:bg-dark-bg"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteRider(rider.id)}
                          disabled={deletingId === rider.id}
                          className="rounded-sm border border-red-200 dark:border-red-800 px-2 py-0.5 text-[10px] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                        >
                          {deletingId === rider.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Rider Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-lg rounded-sm bg-white dark:bg-dark-bgLight p-6 shadow-lg border border-transparent dark:border-dark-border">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-dark-text">
                  Add New Rider
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-500 dark:text-dark-textMuted hover:text-slate-700 dark:hover:text-dark-text"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleSubmitRider} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-textMuted">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={newRider.firstName}
                        onChange={(e) =>
                        setNewRider({ ...newRider, firstName: e.target.value })
                        }
                        required
                        className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bg px-3 py-1.5 text-xs text-slate-900 dark:text-dark-text focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                    />
                    </div>
                    <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-textMuted">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={newRider.lastName}
                        onChange={(e) =>
                        setNewRider({ ...newRider, lastName: e.target.value })
                        }
                        required
                        className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bg px-3 py-1.5 text-xs text-slate-900 dark:text-dark-text focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                    />
                    </div>
                </div>
                
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-textMuted">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newRider.email}
                    onChange={(e) =>
                      setNewRider({ ...newRider, email: e.target.value })
                    }
                    required
                    className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bg px-3 py-1.5 text-xs text-slate-900 dark:text-dark-text focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-textMuted">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newRider.phone}
                    onChange={(e) =>
                      setNewRider({ ...newRider, phone: e.target.value })
                    }
                    required
                    className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bg px-3 py-1.5 text-xs text-slate-900 dark:text-dark-text focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-textMuted">
                            Vehicle Type
                        </label>
                        <select
                            value={newRider.vehicleType}
                            onChange={(e) => setNewRider({ ...newRider, vehicleType: e.target.value })}
                            className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bg px-3 py-1.5 text-xs text-slate-900 dark:text-dark-text focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                        >
                            <option value="Motorbike">Motorbike</option>
                            <option value="Van">Van</option>
                            <option value="Pickup Truck">Pickup Truck</option>
                            <option value="Bicycle">Bicycle</option>
                        </select>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-textMuted">
                            Plate Number
                        </label>
                        <input
                            type="text"
                            value={newRider.plateNumber}
                            onChange={(e) => setNewRider({ ...newRider, plateNumber: e.target.value })}
                            className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bg px-3 py-1.5 text-xs text-slate-900 dark:text-dark-text focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-textMuted">
                    Status
                  </label>
                  <select
                    value={newRider.status}
                    onChange={(e) =>
                      setNewRider({
                        ...newRider,
                        status: e.target.value as UserStatus,
                      })
                    }
                    className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bg px-3 py-1.5 text-xs text-slate-900 dark:text-dark-text focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sendCredentials"
                    checked={newRider.sendCredentialsEmail}
                    onChange={(e) =>
                      setNewRider({
                        ...newRider,
                        sendCredentialsEmail: e.target.checked,
                      })
                    }
                    className="h-4 w-4 rounded border-[#c8c8c8] text-[#2b579a] focus:ring-[#2b579a]"
                  />
                  <label
                    htmlFor="sendCredentials"
                    className="text-xs text-slate-700 dark:text-dark-textMuted"
                  >
                    Send login credentials to rider via email
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bg px-4 py-1.5 text-xs font-medium text-slate-700 dark:text-dark-text hover:bg-[#f3f3f3] dark:hover:bg-dark-bgLight"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a] disabled:opacity-50"
                    disabled={submitting}
                  >
                    {submitting ? "Creating..." : "Create Rider"}
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
