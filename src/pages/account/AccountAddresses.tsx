import { useEffect, useState } from "react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { apiClient } from "../../lib/apiClient";
import { notify } from "../../stores/notificationStore";
import type { Address, CreateAddressRequest } from "../../types/user";

const counties = [
  "Nairobi County",
  "Mombasa County",
  "Kisumu County",
  "Nakuru County",
  "Eldoret",
  "Kericho County",
  "Kiambu County",
  "Machakos County",
  "Kajiado County",
  "Kilifi County",
];

export function AccountAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState<CreateAddressRequest>({
    type: "home",
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "Kenya",
    isDefault: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ addresses: Address[] }>(
        "/api/users/addresses"
      );
      setAddresses(response.addresses || []);
    } catch (err) {
      const axiosError = err as {
        response?: { data?: { error?: string } };
        message?: string;
      };
      setError(
        axiosError.response?.data?.error ||
          axiosError.message ||
          "Failed to fetch addresses"
      );
      console.error("Error fetching addresses:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (
      formData.street &&
      formData.city &&
      formData.state &&
      formData.zipCode
    ) {
      try {
        await apiClient.post("/api/users/addresses", formData);
        await fetchAddresses();
        resetForm();
        notify.success("Address added", "Your new address has been saved");
      } catch (err) {
        console.error("Error adding address:", err);
        notify.error("Failed to add address", "Please try again");
      }
    }
  };

  const handleUpdateAddress = async () => {
    if (
      editingAddress &&
      formData.street &&
      formData.city &&
      formData.state &&
      formData.zipCode
    ) {
      try {
        await apiClient.put(
          `/api/users/addresses/${editingAddress.id}`,
          formData
        );
        await fetchAddresses();
        resetForm();
        notify.success("Address updated", "Your address has been updated");
      } catch (err) {
        console.error("Error updating address:", err);
        notify.error("Failed to update address", "Please try again");
      }
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await apiClient.delete(`/api/users/addresses/${id}`);
      notify.success("Address deleted", "Your address has been removed");
    } catch (err) {
      console.error("Error deleting address:", err);
      notify.error("Failed to delete address", "Please try again");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await apiClient.patch(`/api/users/addresses/${id}`, { isDefault: true });
      notify.success(
        "Default address set",
        "Your default address has been updated"
      );
    } catch (err) {
      console.error("Error setting default address:", err);
      notify.error("Failed to set default address", "Please try again");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "home",
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Kenya",
      isDefault: false,
    });
    setIsAddingAddress(false);
    setEditingAddress(null);
  };

  const startEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type || "home",
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country || "Kenya",
      isDefault: address.isDefault,
    });
    setIsAddingAddress(true);
  };

  const typeLabels: Record<string, string> = {
    home: "Home",
    work: "Work",
    other: "Other",
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-dark-text">
              My Addresses
            </h1>
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">
              Manage your shipping and billing addresses
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF9900] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-sm font-semibold text-slate-900 dark:text-dark-text">
              My Addresses
            </h1>
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">
              Manage your shipping and billing addresses
            </p>
          </div>
        </div>
        <div className="rounded-sm border border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={fetchAddresses}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-slate-900 dark:text-dark-text">My Addresses</h1>
          <p className="text-xs text-slate-600 dark:text-dark-textMuted">
            Manage your shipping and billing addresses
          </p>
        </div>
        <Button
          className="bg-[#FF9900] text-white hover:bg-[#FF9900]/90"
          onClick={() => setIsAddingAddress(true)}
        >
          Add Address
        </Button>
      </div>

      {/* Addresses Grid */}
      {addresses.length === 0 ? (
        <div className="rounded-sm border border-[#c8c8c8] bg-white dark:bg-dark-bgLight p-6 text-center">
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">No addresses saved yet</p>
          <Button
            className="mt-3 bg-[#FF9900] text-white hover:bg-[#FF9900]/90"
            onClick={() => setIsAddingAddress(true)}
          >
            Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`rounded-sm border bg-white dark:bg-dark-bgLight p-4 shadow-sm ${
                address.isDefault
                  ? "border-[#FF9900] ring-1 ring-[#FF9900]"
                  : "border-[#c8c8c8]"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-dark-text">
                      {typeLabels[address.type || "home"]}
                    </span>
                    {address.isDefault && (
                      <Badge className="bg-[#FF9900] text-white">Default</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-dark-textMuted">{address.street}</p>
                  <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                    {address.city}, {address.state} {address.zipCode}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-dark-textMuted">{address.country}</p>
                </div>
                <div className="flex gap-1">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-[10px]"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-[10px]"
                    onClick={() => startEdit(address)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                    onClick={() => handleDeleteAddress(address.id)}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-3 flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() =>
                    (window.location.href = `/checkout?addressId=${address.id}`)
                  }
                >
                  Use for Checkout
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Address Modal */}
      {isAddingAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-sm bg-white dark:bg-dark-bgLight p-6 shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <button
                onClick={resetForm}
                className="text-slate-500 dark:text-dark-textMuted hover:text-slate-700 dark:text-dark-text"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                  Address Type
                </label>
                <div className="flex gap-2">
                  {["home", "work", "other"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          type: type as "home" | "work" | "other",
                        })
                      }
                      className={`flex-1 rounded-sm border px-3 py-2 text-xs transition-colors ${
                        formData.type === type
                          ? "border-[#FF9900] bg-[#FF9900]/10 text-[#FF9900]"
                          : "border-[#c8c8c8] text-slate-700 hover:bg-slate-50 dark:hover:bg-dark-bg"
                      }`}
                    >
                      {typeLabels[type]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                  Street Address <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  placeholder="Enter street address"
                  className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#FF9900] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                    City <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="City"
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#FF9900] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                    County/State <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#FF9900] focus:outline-none"
                  >
                    <option value="">Select County</option>
                    {counties.map((county) => (
                      <option key={county} value={county}>
                        {county}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                    Zip Code <span className="text-red-500 dark:text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) =>
                      setFormData({ ...formData, zipCode: e.target.value })
                    }
                    placeholder="Zip Code"
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#FF9900] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                    Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    placeholder="Country"
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#FF9900] focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="setDefault"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-[#c8c8c8] text-[#FF9900] focus:ring-[#FF9900]"
                />
                <label htmlFor="setDefault" className="text-xs text-slate-700 dark:text-dark-text">
                  Set as default address
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button
                  className="bg-[#FF9900] text-white hover:bg-[#FF9900]/90"
                  onClick={
                    editingAddress ? handleUpdateAddress : handleAddAddress
                  }
                  disabled={
                    !formData.street ||
                    !formData.city ||
                    !formData.state ||
                    !formData.zipCode
                  }
                >
                  {editingAddress ? "Save Changes" : "Add Address"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="rounded-sm bg-blue-50 p-4">
        <h3 className="text-xs font-semibold text-blue-900">
          Why add multiple addresses?
        </h3>
        <ul className="mt-2 space-y-1 text-xs text-blue-800">
          <li>• Save time during checkout by selecting saved addresses</li>
          <li>• Have orders delivered to home, work, or other locations</li>
          <li>• Manage billing and shipping addresses separately</li>
        </ul>
      </div>
    </div>
  );
}
