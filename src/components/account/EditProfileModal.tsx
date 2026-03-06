import { useState, useEffect } from "react";
import type { User } from "../../types";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "../ui/button";

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
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || "",
      });
      clearError();
    }
  }, [isOpen, user, clearError]);

  if (!isOpen) return null;

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
