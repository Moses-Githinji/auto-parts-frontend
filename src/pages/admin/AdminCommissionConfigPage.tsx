import { useEffect, useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";
import { useCommissionStore } from "../../stores/commissionStore";
import { CommissionRulesLegend } from "../../components/commission/CommissionRulesLegend";
import { cn } from "../../lib/cn";
import type {
  CommissionConfig,
  UpdateCommissionConfigRequest,
  CreateCommissionConfigRequest,
} from "../../types/commission";

// Mock data for demonstration
const mockConfigs: CommissionConfig[] = [
  {
    id: "1",
    name: "Brakes Category",
    categorySlug: "brakes",
    commissionRate: 8,
    minFee: 50,
    maxFee: 2000,
    ruleType: "STANDARD",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "2",
    name: "Engine Parts Category",
    categorySlug: "engine",
    commissionRate: 9,
    minFee: 75,
    maxFee: 2500,
    ruleType: "FLOOR",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "3",
    name: "Premium Parts Category",
    categorySlug: "premium",
    commissionRate: 10,
    minFee: 100,
    maxFee: 5000,
    ruleType: "CAP",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "4",
    name: "Suspension Category",
    categorySlug: "suspension",
    commissionRate: 8,
    minFee: 50,
    maxFee: 2000,
    ruleType: "STANDARD",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
  {
    id: "5",
    name: "Electrical Category",
    categorySlug: "electrical",
    commissionRate: 8,
    minFee: 50,
    maxFee: 1500,
    ruleType: "STANDARD",
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T00:00:00Z",
  },
];

export function AdminCommissionConfigPage() {
  const {
    configs,
    isLoadingConfigs,
    configError,
    fetchConfigs,
    updateConfig,
    deleteConfig,
    createConfig,
  } = useCommissionStore();

  // Use mock data if no real data
  const displayConfigs = (configs || []).length > 0 ? configs : mockConfigs;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<UpdateCommissionConfigRequest>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showLegend, setShowLegend] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState<CreateCommissionConfigRequest>({
    name: "",
    slug: "",
    commissionRate: 10,
    minFee: 50,
    maxFee: 15000,
    ruleType: "STANDARD",
  });
  const [addFormErrors, setAddFormErrors] = useState<Record<string, string>>(
    {}
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchConfigs(searchQuery);
  }, [fetchConfigs, searchQuery]);

  const validateAddForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!addForm.name.trim()) {
      errors.name = "Name is required";
    }
    if (!addForm.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(addForm.slug)) {
      errors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens";
    }
    if (
      addForm.commissionRate !== undefined &&
      (addForm.commissionRate < 0 || addForm.commissionRate > 100)
    ) {
      errors.commissionRate = "Rate must be between 0 and 100";
    }
    if (addForm.minFee !== undefined && addForm.minFee < 0) {
      errors.minFee = "Minimum fee cannot be negative";
    }
    if (
      addForm.maxFee !== undefined &&
      addForm.minFee !== undefined &&
      addForm.maxFee < addForm.minFee
    ) {
      errors.maxFee =
        "Maximum fee must be greater than or equal to minimum fee";
    }

    setAddFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateAddForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createConfig(addForm);
      setShowAddModal(false);
      setAddForm({
        name: "",
        slug: "",
        commissionRate: 10,
        minFee: 50,
        maxFee: 15000,
        ruleType: "STANDARD",
      });
      setSuccessMessage("Commission config created successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Failed to create config:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (config: CommissionConfig) => {
    setEditingId(config.id);
    setEditForm({
      commissionRate: config.commissionRate,
      minFee: config.minFee,
      maxFee: config.maxFee,
      ruleType: config.ruleType,
      isActive: config.isActive,
    });
  };

  const handleSave = async (id: string) => {
    try {
      await updateConfig(id, editForm);
      setEditingId(null);
      setSuccessMessage("Commission config updated successfully!");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Failed to update config:", error);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this commission config?")) {
      try {
        await deleteConfig(id);
        setSuccessMessage("Commission config deleted successfully!");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (error) {
        console.error("Failed to delete config:", error);
      }
    }
  };

  const handleToggleActive = async (config: CommissionConfig) => {
    try {
      await updateConfig(config.id, { isActive: !config.isActive });
      setSuccessMessage(
        `Config ${config.isActive ? "deactivated" : "activated"} successfully!`
      );
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (error) {
      console.error("Failed to toggle config:", error);
    }
  };

  const handleNameChange = (value: string) => {
    setAddForm((prev) => ({
      ...prev,
      name: value,
      slug: value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim(),
    }));
  };

  const filteredConfigs = displayConfigs.filter(
    (config) =>
      config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.categorySlug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
      <div className="p-6">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 rounded-sm bg-green-50 p-3 text-xs text-green-600">
            {successMessage}
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              Commission Settings
            </h1>
            <p className="text-sm text-slate-600">
              Configure marketplace commission rates and rules by category.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="rounded-sm border border-[#c8c8c8] bg-white px-3 py-1.5 text-xs text-slate-700 hover:bg-[#f3f3f3]"
            >
              {showLegend ? "Hide Rules" : "Show Rules"}
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-sm bg-[#2b579a] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a]"
            >
              Add New Config
            </button>
          </div>
        </div>

        {/* Rules Legend */}
        {showLegend && (
          <div className="mb-6">
            <CommissionRulesLegend variant="card" showExamples={true} />
          </div>
        )}

        {/* Search */}
        <div className="mb-4 flex gap-3">
          <input
            type="text"
            placeholder="Search by category name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
          />
          <select className="rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Error Message */}
        {configError && (
          <div className="mb-4 rounded-sm bg-red-50 p-3 text-xs text-red-600">
            {configError}
          </div>
        )}

        {/* Configs Table */}
        <div className="rounded-sm border border-[#c8c8c8] bg-white">
          {isLoadingConfigs ? (
            <div className="p-8 text-center text-sm text-slate-600">
              Loading commission configs...
            </div>
          ) : filteredConfigs.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-600">
              No commission configs found.
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-[#f3f3f3]">
                <tr className="border-b border-[#c8c8c8]">
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Category
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Rate (%)
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Min Fee
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Max Fee
                  </th>
                  <th className="px-4 py-2 text-left font-medium text-slate-700">
                    Rule Type
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
                {filteredConfigs.map((config) => (
                  <tr
                    key={config.id}
                    className="border-b border-[#e8e8e8] hover:bg-[#f8f8f8]"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-slate-900">
                          {config.name}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {config.categorySlug}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {editingId === config.id ? (
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="100"
                          value={
                            editForm.commissionRate ?? config.commissionRate
                          }
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              commissionRate: parseFloat(e.target.value),
                            })
                          }
                          className="w-20 rounded-sm border border-[#c8c8c8] px-2 py-1 text-xs focus:border-[#2b579a] focus:outline-none"
                        />
                      ) : (
                        <span className="font-medium text-slate-900">
                          {config.commissionRate}%
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === config.id ? (
                        <input
                          type="number"
                          min="0"
                          value={editForm.minFee ?? config.minFee}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              minFee: parseFloat(e.target.value),
                            })
                          }
                          className="w-20 rounded-sm border border-[#c8c8c8] px-2 py-1 text-xs focus:border-[#2b579a] focus:outline-none"
                        />
                      ) : (
                        <span className="text-slate-700">
                          KSh {config.minFee.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === config.id ? (
                        <input
                          type="number"
                          min="0"
                          value={editForm.maxFee ?? config.maxFee}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              maxFee: parseFloat(e.target.value),
                            })
                          }
                          className="w-20 rounded-sm border border-[#c8c8c8] px-2 py-1 text-xs focus:border-[#2b579a] focus:outline-none"
                        />
                      ) : (
                        <span className="text-slate-700">
                          KSh {config.maxFee.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === config.id ? (
                        <select
                          value={editForm.ruleType ?? config.ruleType}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              ruleType: e.target.value as any,
                            })
                          }
                          className="w-28 rounded-sm border border-[#c8c8c8] px-2 py-1 text-xs focus:border-[#2b579a] focus:outline-none"
                        >
                          <option value="STANDARD">STANDARD</option>
                          <option value="FLOOR">FLOOR</option>
                          <option value="CAP">CAP</option>
                        </select>
                      ) : (
                        <span
                          className={cn(
                            "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium",
                            config.ruleType === "STANDARD" &&
                              "bg-blue-100 text-blue-700",
                            config.ruleType === "FLOOR" &&
                              "bg-amber-100 text-amber-700",
                            config.ruleType === "CAP" &&
                              "bg-purple-100 text-purple-700"
                          )}
                        >
                          {config.ruleType}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === config.id ? (
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={editForm.isActive ?? config.isActive}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                isActive: e.target.checked,
                              })
                            }
                            className="h-3 w-3 rounded border-gray-300"
                          />
                          <span className="text-xs text-slate-600">Active</span>
                        </label>
                      ) : (
                        <button
                          onClick={() => handleToggleActive(config)}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[10px] font-medium",
                            config.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-500"
                          )}
                        >
                          {config.isActive ? "Active" : "Inactive"}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {editingId === config.id ? (
                          <>
                            <button
                              onClick={() => handleSave(config.id)}
                              className="rounded-sm bg-green-600 px-2 py-0.5 text-[10px] text-white hover:bg-green-700"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancel}
                              className="rounded-sm border border-[#c8c8c8] bg-white px-2 py-0.5 text-[10px] text-slate-700 hover:bg-[#f3f3f3]"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(config)}
                              className="rounded-sm border border-[#c8c8c8] px-2 py-0.5 text-[10px] hover:bg-[#f3f3f3]"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(config.id)}
                              className="rounded-sm bg-red-600 px-2 py-0.5 text-[10px] text-white hover:bg-red-700"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Config Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="w-full max-w-md rounded-sm bg-white p-6 shadow-lg max-h-[90vh] overflow-y-auto">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">
                  Add New Commission Config
                </h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addForm.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="e.g., Oil Filters"
                  />
                  {addFormErrors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {addFormErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={addForm.slug}
                    onChange={(e) =>
                      setAddForm((prev) => ({ ...prev, slug: e.target.value }))
                    }
                    className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                    placeholder="e.g., oil-filters"
                  />
                  {addFormErrors.slug && (
                    <p className="mt-1 text-xs text-red-600">
                      {addFormErrors.slug}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Commission Rate (%){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      value={addForm.commissionRate}
                      onChange={(e) =>
                        setAddForm((prev) => ({
                          ...prev,
                          commissionRate: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                    />
                    {addFormErrors.commissionRate && (
                      <p className="mt-1 text-xs text-red-600">
                        {addFormErrors.commissionRate}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Rule Type
                    </label>
                    <select
                      value={addForm.ruleType}
                      onChange={(e) =>
                        setAddForm((prev) => ({
                          ...prev,
                          ruleType: e.target.value as
                            | "STANDARD"
                            | "FLOOR"
                            | "CAP",
                        }))
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                    >
                      <option value="STANDARD">STANDARD</option>
                      <option value="FLOOR">FLOOR (Min)</option>
                      <option value="CAP">CAP (Max)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Min Fee (KSh)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={addForm.minFee}
                      onChange={(e) =>
                        setAddForm((prev) => ({
                          ...prev,
                          minFee: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                    />
                    {addFormErrors.minFee && (
                      <p className="mt-1 text-xs text-red-600">
                        {addFormErrors.minFee}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-700">
                      Max Fee (KSh)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={addForm.maxFee}
                      onChange={(e) =>
                        setAddForm((prev) => ({
                          ...prev,
                          maxFee: parseFloat(e.target.value),
                        }))
                      }
                      className="w-full rounded-sm border border-[#c8c8c8] px-3 py-2 text-xs focus:border-[#2b579a] focus:outline-none"
                    />
                    {addFormErrors.maxFee && (
                      <p className="mt-1 text-xs text-red-600">
                        {addFormErrors.maxFee}
                      </p>
                    )}
                  </div>
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
                    disabled={isSubmitting}
                    className="rounded-sm bg-[#2b579a] px-4 py-2 text-xs font-medium text-white hover:bg-[#1e3f7a] disabled:opacity-50"
                  >
                    {isSubmitting ? "Creating..." : "Create Config"}
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
