import { useState, useEffect } from "react";
import type { User } from "../../types";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../ui/button";
import { uploadToCloudinary } from "../../utils/cloudinaryService";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export function EditProfileModal({ isOpen, onClose, user }: EditProfileModalProps) {
  const { updateProfile, isLoading, error, clearError } = useAuthStore();
  const [formData, setFormData] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone || "",
    avatarUrl: user.avatarUrl || "",
    vehicleType: user.vehicleType || "",
    vehiclePlateNumber: user.vehiclePlateNumber || "",
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || "",
        avatarUrl: user.avatarUrl || "",
        vehicleType: user.vehicleType || "",
        vehiclePlateNumber: user.vehiclePlateNumber || "",
      });
      clearError();
    }
  }, [isOpen, user, clearError]);

  if (!isOpen) return null;

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file);
      if (url) {
        setFormData(prev => ({ ...prev, avatarUrl: url }));
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      onClose();
    } catch (err) {
      // Error is handled by the store and displayed below
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div 
          className="bg-white dark:bg-dark-surface w-full max-w-md rounded-lg shadow-xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-dark-text">Edit Profile</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400">
                {error}
              </div>
            )}
            
            <div className="flex flex-col items-center space-y-2 pb-4">
              <label className="relative cursor-pointer group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-slate-100 dark:border-dark-border bg-slate-50 dark:bg-dark-base flex items-center justify-center">
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-slate-300 dark:text-dark-textMuted">
                      {formData.firstName.charAt(0)}
                    </span>
                  )}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity rounded-full">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploading} />
              </label>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Change Photo</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-dark-text">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent dark:bg-dark-base dark:text-dark-text"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-dark-text">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent dark:bg-dark-base dark:text-dark-text"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-dark-text">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+254 XXX XXXXXX"
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent dark:bg-dark-base dark:text-dark-text"
              />
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-dark-border">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Vehicle Details (Optional)</p>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-dark-text">Vehicle Model</label>
                  <input
                    type="text"
                    value={formData.vehicleType}
                    onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                    placeholder="e.g. Toyota Corolla 2018"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent dark:bg-dark-base dark:text-dark-text"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700 dark:text-dark-text">Plate Number</label>
                  <input
                    type="text"
                    value={formData.vehiclePlateNumber}
                    onChange={e => setFormData({ ...formData, vehiclePlateNumber: e.target.value })}
                    placeholder="e.g. KAA 123A"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#FF9900] focus:border-transparent dark:bg-dark-base dark:text-dark-text"
                  />
                </div>
              </div>
            </div>
            
            <div className="pt-4 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-[#FF9900] hover:bg-[#e68a00] text-white">
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
