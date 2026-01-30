import { useState } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";

export function VendorSettingsPage() {
  const vendorNavItems = [
    { label: "Dashboard", to: "/vendor" },
    { label: "Orders", to: "/vendor/orders" },
    { label: "Catalog", to: "/vendor/catalog" },
    { label: "Analytics", to: "/vendor/analytics" },
    { label: "Settings", to: "/vendor/settings" },
  ];

  const [shopName, setShopName] = useState("AutoCare Plus");
  const [email, setEmail] = useState("contact@autocareplus.com");
  const [phone, setPhone] = useState("+254 712 345 678");
  const [address, setAddress] = useState("Nairobi, Kenya");
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailDisputes: true,
    emailMarketing: false,
  });

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  return (
    <BackofficeLayout title="Vendor Portal" navItems={vendorNavItems}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-600">
            Manage your store settings and preferences.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Shop Information */}
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Shop Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Notifications
            </h2>
            <div className="space-y-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifications.emailOrders}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      emailOrders: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-[#c8c8c8]"
                />
                <span className="text-xs text-slate-700">
                  Email notifications for new orders
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifications.emailDisputes}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      emailDisputes: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-[#c8c8c8]"
                />
                <span className="text-xs text-slate-700">
                  Email notifications for disputes
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={notifications.emailMarketing}
                  onChange={(e) =>
                    setNotifications({
                      ...notifications,
                      emailMarketing: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded border-[#c8c8c8]"
                />
                <span className="text-xs text-slate-700">
                  Marketing and promotional emails
                </span>
              </label>
            </div>
          </div>

          {/* Security */}
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Security
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Current Password
                </label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full rounded-sm border border-[#c8c8c8] px-3 py-1.5 text-xs focus:border-[#2b579a] focus:outline-none"
                />
              </div>
              <button className="rounded-sm border border-[#c8c8c8] bg-white px-4 py-1.5 text-xs font-medium text-slate-700 hover:bg-[#f3f3f3]">
                Change Password
              </button>
            </div>
          </div>

          {/* Account Status */}
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900">
              Account Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Account Type</span>
                <span className="text-xs font-medium text-slate-900">
                  Verified Vendor
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">KYC Status</span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                  Approved
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Member Since</span>
                <span className="text-xs font-medium text-slate-900">
                  Dec 10, 2023
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Last Active</span>
                <span className="text-xs font-medium text-slate-900">
                  Today, 10:30 AM
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className="rounded-sm bg-[#2b579a] px-6 py-2 text-xs font-medium text-white hover:bg-[#1e3f7a]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </BackofficeLayout>
  );
}
