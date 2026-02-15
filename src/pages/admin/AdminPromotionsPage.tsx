import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Plus, Edit, Trash2, Tag, Users, Percent, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../../components/ui/dialog";
import { apiClient } from "../../lib/apiClient";
import type { CommissionPromotion } from "../../types/vendor";

type PromotionFormData = Omit<CommissionPromotion, "id" | "_count">;

export function AdminPromotionsPage() {
  const [promotions, setPromotions] = useState<CommissionPromotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<CommissionPromotion | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<PromotionFormData>({
    defaultValues: {
      isActive: true,
      discountType: "PERCENTAGE",
      startDate: new Date().toISOString().split('T')[0],
    }
  });

  const discountType = watch("discountType");

  const fetchPromotions = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<CommissionPromotion[]>("/api/promotions");
      setPromotions(response);
    } catch (error) {
      console.error("Failed to fetch promotions", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const onSubmit = async (data: PromotionFormData) => {
    try {
      if (editingPromotion) {
        await apiClient.put(`/api/promotions/${editingPromotion.id}`, data);
      } else {
        await apiClient.post("/api/promotions", data);
      }
      setIsModalOpen(false);
      reset();
      setEditingPromotion(null);
      fetchPromotions();
    } catch (error) {
      console.error("Failed to save promotion", error);
    }
  };

  const handleEdit = (promotion: CommissionPromotion) => {
    setEditingPromotion(promotion);
    setValue("name", promotion.name);
    setValue("description", promotion.description);
    setValue("discountType", promotion.discountType);
    setValue("discountValue", promotion.discountValue);
    setValue("startDate", promotion.startDate.split('T')[0]);
    setValue("endDate", promotion.endDate ? promotion.endDate.split('T')[0] : undefined);
    setValue("maxVendors", promotion.maxVendors);
    setValue("isActive", promotion.isActive);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promotion?")) return;
    try {
      await apiClient.delete(`/api/promotions/${id}`);
      fetchPromotions();
    } catch (error) {
      console.error("Failed to delete promotion", error);
    }
  };

  const handleCreate = () => {
    setEditingPromotion(null);
    reset({
      isActive: true,
      discountType: "PERCENTAGE",
      startDate: new Date().toISOString().split('T')[0],
    });
    setIsModalOpen(true);
  };

  return (
    <BackofficeLayout title="Commission Promotions" menuItems={ADMIN_MENU_ITEMS}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Promotions</h1>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">Manage commission discounts for vendors.</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleCreate} className="gap-2 bg-[#FF9900] text-[#131921] hover:bg-[#F7CA00]">
                <Plus className="h-4 w-4" /> New Promotion
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingPromotion ? "Edit Promotion" : "Create New Promotion"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">Name</label>
                  <Input {...register("name", { required: "Name is required" })} placeholder="e.g. First 100 Vendors" />
                  {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
                </div>
                
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">Description</label>
                  <Input {...register("description")} placeholder="Internal notes" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">Discount Type</label>
                    <select
                      {...register("discountType")}
                      className="h-10 w-full rounded-md border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bgLight px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900]"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED_AMOUNT">Fixed Amount (KES)</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">Value</label>
                    <div className="relative">
                      <Input 
                        type="number" 
                        step="0.01"
                        {...register("discountValue", { required: "Value is required", min: 0 })} 
                        className="pl-8"
                      />
                      <div className="absolute left-2.5 top-2.5 text-slate-500">
                        {discountType === "PERCENTAGE" ? <Percent className="h-4 w-4" /> : <DollarSign className="h-4 w-4" />}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">Start Date</label>
                    <Input type="date" {...register("startDate", { required: "Start date is required" })} />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">End Date (Optional)</label>
                    <Input type="date" {...register("endDate")} />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">Max Vendors (Optional)</label>
                  <Input type="number" {...register("maxVendors", { min: 1 })} placeholder="e.g. 100" />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    {...register("isActive")}
                    className="h-4 w-4 rounded border-gray-300 text-[#FF9900] focus:ring-[#FF9900]"
                  />
                  <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-dark-text">Active</label>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="bg-[#FF9900] text-[#131921] hover:bg-[#F7CA00]">Save Promotion</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Promotions List */}
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight shadow-sm">
          {isLoading ? (
             <div className="p-8 text-center text-slate-500">Loading promotions...</div>
          ) : promotions?.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
              <Tag className="mb-2 h-10 w-10 opacity-20" />
              <p>No promotions found</p>
              <Button variant="ghost" onClick={handleCreate}>Create your first promotion</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-dark-bg border-b border-slate-200 dark:border-dark-border text-slate-600 dark:text-dark-textMuted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Discount</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Usage</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-border">
                  {promotions?.map((promo) => (
                    <tr key={promo.id} className="hover:bg-slate-50 dark:hover:bg-dark-bg/50">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-dark-text">
                        {promo.name}
                        {promo.description && <p className="text-xs text-slate-500 font-normal">{promo.description}</p>}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted">
                        <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 font-mono text-xs font-bold text-slate-700 dark:bg-dark-bg dark:text-dark-text">
                          {promo.discountType === "PERCENTAGE" ? `${promo.discountValue}%` : `KES ${promo.discountValue}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-dark-textMuted">
                        <div className="flex flex-col">
                          <span>Start: {format(new Date(promo.startDate), "MMM d, yyyy")}</span>
                          {promo.endDate && <span>End: {format(new Date(promo.endDate), "MMM d, yyyy")}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600 dark:text-dark-textMuted">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{promo._count?.vendorPromotions || 0}</span>
                          {promo.maxVendors && <span className="text-slate-400">/ {promo.maxVendors}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          promo.isActive 
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                            : "bg-slate-100 text-slate-600 dark:bg-dark-bg dark:text-slate-400"
                        }`}>
                          {promo.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 group" onClick={() => handleEdit(promo)}>
                            <Edit className="h-4.5 w-4.5 text-slate-500 group-hover:text-blue-600 transition-colors" />
                          </Button>
                          <Button variant="outline" size="sm" className="h-9 w-9 p-0 border-slate-200 hover:border-red-300 hover:bg-red-50/50 group" onClick={() => handleDelete(promo.id)}>
                            <Trash2 className="h-4.5 w-4.5 text-slate-500 group-hover:text-red-600 transition-colors" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </BackofficeLayout>
  );
}
