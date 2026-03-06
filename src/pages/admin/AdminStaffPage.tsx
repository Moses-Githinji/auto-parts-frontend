import { useEffect, useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";
import { useStaffStore } from "../../stores/staffStore";
import { usePermissions } from "../../hooks/usePermissions";
import { 
  UserPlus, 
  Shield, 
  Mail, 
  Phone, 
  Edit2, 
  Trash2, 
  XCircle,
  Loader2,
  AlertCircle
} from "lucide-react";
import { Badge } from "../../components/ui/badge";
import { cn } from "../../lib/cn";

const ALL_PERMISSIONS = [
  { key: "view_stats", label: "View Stats", description: "Access to Dashboard Stats" },
  { key: "manage_vendors", label: "Manage Vendors", description: "Edit, Suspend, Restore, or Delete Vendors" },
  { key: "view_vendors", label: "View Vendors", description: "View vendor lists and profiles" },
  { key: "manage_riders", label: "Manage Riders", description: "Add/Update/Remove delivery riders" },
  { key: "view_riders", label: "View Riders", description: "View list of delivery riders" },
  { key: "view_logs", label: "View Logs", description: "View global system audit logs" },
  { key: "view_commissions", label: "View Commissions", description: "Access to Commission Dashboard" },
  { key: "view_finances", label: "View Finances", description: "Access to Finance/Revenue Summary" },
  { key: "manage_staff", label: "Manage Staff", description: "Create and manage other Staff members" },
  { key: "manage_payouts", label: "Manage Payouts", description: "Approve or process vendor payouts" },
];

export function AdminStaffPage() {
  const { staff, isLoading, isSubmitting, error, fetchStaff, createStaff, updateStaff, deleteStaff } = useStaffStore();
  const { hasPermission } = usePermissions();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any>(null);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    permissions: [] as string[],
  });

  useEffect(() => {
    if (hasPermission("manage_staff")) {
      fetchStaff();
    }
  }, [fetchStaff, hasPermission]);

  const handleOpenModal = (staffMember: any = null) => {
    if (staffMember) {
      setEditingStaff(staffMember);
      setFormData({
        email: staffMember.email,
        firstName: staffMember.firstName,
        lastName: staffMember.lastName,
        phone: staffMember.phone || "",
        password: "", // Don't show password for editing
        permissions: staffMember.permissions || [],
      });
    } else {
      setEditingStaff(null);
      setFormData({
        email: "",
        firstName: "",
        lastName: "",
        phone: "",
        password: "",
        permissions: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleTogglePermission = (permissionKey: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionKey)
        ? prev.permissions.filter(k => k !== permissionKey)
        : [...prev.permissions, permissionKey]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingStaff) {
        // Remove password if empty
        const updateData = { ...formData };
        if (!updateData.password) delete (updateData as any).password;
        await updateStaff(editingStaff.id, updateData as any);
      } else {
        await createStaff(formData as any);
      }
      setIsModalOpen(false);
    } catch (err) {
      // Error handled by store
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this staff member? This is a soft delete.")) {
      await deleteStaff(id);
    }
  };

  if (!hasPermission("manage_staff")) {
    return (
      <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
        <div className="flex h-[60vh] flex-col items-center justify-center p-6 text-center">
          <Shield className="h-12 w-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-900">Access Denied</h2>
          <p className="mt-2 text-slate-600">You don't have permission to manage staff members.</p>
        </div>
      </BackofficeLayout>
    );
  }

  return (
    <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Staff Management</h1>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">
              Manage sub-admins and their granular access permissions.
            </p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 rounded-sm bg-[#2b579a] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e3f7a] self-start"
          >
            <UserPlus className="h-4 w-4" />
            Add Staff Member
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {isLoading && staff.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#2b579a]" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <div key={member.id} className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-5 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-dark-base flex items-center justify-center text-slate-600 dark:text-dark-text font-bold">
                      {member.firstName?.[0]}{member.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-dark-text">
                        {member.firstName} {member.lastName}
                      </h3>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {member.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => handleOpenModal(member)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => handleDelete(member.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-dark-textMuted">
                    <Mail className="h-3.5 w-3.5" />
                    {member.email}
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-dark-textMuted">
                      <Phone className="h-3.5 w-3.5" />
                      {member.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-dark-textMuted">
                    <Shield className="h-3.5 w-3.5" />
                    <span className="font-semibold">{member.permissions?.length || 0} Permissions</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {(member.permissions || []).slice(0, 3).map(p => (
                    <Badge key={p} variant="outline" className="text-[9px] bg-slate-50 dark:bg-dark-base border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-text">
                      {p.replace(/_/g, " ")}
                    </Badge>
                  ))}
                  {(member.permissions?.length || 0) > 3 && (
                    <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-600 border-blue-100">
                      +{member.permissions.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200 dark:border-dark-border flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  {editingStaff ? "Edit Staff Member" : "Add New Staff Member"}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500">First Name</label>
                    <input
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      className="w-full rounded-sm border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-base px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500">Last Name</label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      className="w-full rounded-sm border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-base px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full rounded-sm border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-base px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase text-slate-500">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full rounded-sm border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-base px-3 py-2 text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  {!editingStaff && (
                    <div className="space-y-1.5 col-span-full">
                      <label className="text-xs font-semibold uppercase text-slate-500">Password</label>
                      <input
                        type="password"
                        required={!editingStaff}
                        value={formData.password}
                        onChange={e => setFormData({...formData, password: e.target.value})}
                        className="w-full rounded-sm border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-base px-3 py-2 text-sm focus:border-blue-500 outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-semibold uppercase text-slate-500">Permissions</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {ALL_PERMISSIONS.map(permission => (
                      <label 
                        key={permission.key}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          formData.permissions.includes(permission.key)
                            ? "border-blue-200 bg-blue-50 dark:bg-blue-900/10"
                            : "border-slate-200 dark:border-dark-border hover:bg-slate-50"
                        )}
                      >
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={formData.permissions.includes(permission.key)}
                          onChange={() => handleTogglePermission(permission.key)}
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-dark-text">{permission.label}</p>
                          <p className="text-[10px] text-slate-500">{permission.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2 rounded-sm bg-[#2b579a] px-6 py-2 text-sm font-medium text-white hover:bg-[#1e3f7a] disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                    {editingStaff ? "Save Changes" : "Create Staff Member"}
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
