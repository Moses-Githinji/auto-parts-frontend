import { useState, useEffect } from "react";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { Alert } from "../../components/ui/Alert";
import type { NotificationType } from "../../stores/notificationStore";
import { useAuthStore } from "../../stores/authStore";
import { isValidInternationalPhone, formatToInternational } from "../../utils/validation";
import { Loader2, ShieldCheck, Activity, Award, Calendar, AlertCircle } from "lucide-react";
import { useVendorStore } from "../../stores/vendorStore";
import { VendorHealthBadge } from "../../components/vendor/VendorHealthBadge";

const COMMON_BANKS = [
  { code: "011", name: "First Bank of Nigeria" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "044", name: "Access Bank" },
  { code: "033", name: "United Bank For Africa" },
  { code: "057", name: "Zenith Bank" },
  { code: "mpesa", name: "M-Pesa (Kenya)" },
  { code: "equity", name: "Equity Bank (Kenya)" },
  { code: "kcb", name: "KCB Bank (Kenya)" },
];

export function VendorSettingsPage() {
  const { user, updateProfile, isLoading: authLoading } = useAuthStore();
  const { profile: vendorProfile, fetchVendorProfile, isLoading: vendorLoading } = useVendorStore();
  
  const vendorNavItems = [
    { label: "Dashboard", to: "/vendor" },
    { label: "Orders", to: "/vendor/orders" },
    { label: "Catalog", to: "/vendor/catalog" },
    { label: "Analytics", to: "/vendor/analytics" },
    { label: "Settings", to: "/vendor/settings" },
  ];

  // Form states
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  
  // Bank states
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountName, setAccountName] = useState("");

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailDisputes: true,
    emailMarketing: false,
  });

  // Alert state
  const [alert, setAlert] = useState<{
    type: NotificationType;
    title: string;
  } | null>(null);

  // Initialize from user
  useEffect(() => {
    if (user) {
      const v = user as any;
      setShopName(v.companyName || "");
      setEmail(v.email || "");
      setPhone(v.phone || "");
      setAddress(v.address || "");
      
      setAccountNumber(v.accountNumber || "");
      setBankCode(v.bankCode || "");
      setAccountName(v.accountName || "");
      
      // Fetch latest vendor profile with health stats
      fetchVendorProfile();
    }
  }, [user, fetchVendorProfile]);

  const handleSave = async () => {
    setAlert(null);

    if (phone && !isValidInternationalPhone(phone)) {
      setAlert({ 
        type: "error", 
        title: "Invalid phone number. Please use international format (e.g., +254 7...)" 
      });
      return;
    }

    try {
      const formattedPhone = phone ? formatToInternational(phone) : phone;
      if (formattedPhone) setPhone(formattedPhone);

      await updateProfile({
        companyName: shopName,
        phone: formattedPhone,
        address,
        accountNumber,
        bankCode,
        accountName,
      });

      setAlert({ type: "success", title: "Settings saved successfully!" });
    } catch (err: any) {
      setAlert({ 
        type: "error", 
        title: err.message || "Failed to save settings" 
      });
    }
  };

  return (
    <BackofficeLayout title="Vendor Portal" navItems={vendorNavItems}>
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Settings</h1>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">
              Manage your store settings and banking preferences.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={authLoading}
            className="flex items-center gap-2 rounded-sm bg-[#2b579a] px-6 py-2 text-xs font-medium text-white hover:bg-[#1e3f7a] disabled:opacity-50"
          >
            {authLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            Save All Changes
          </button>
        </div>

        {/* Health Summary Banner */}
        {vendorProfile?.uiConfig && (
          <div 
            style={{ backgroundColor: vendorProfile.uiConfig.bg + '30', borderColor: vendorProfile.uiConfig.color + '20' }}
            className="mb-6 flex items-center justify-between rounded-xl border p-4 shadow-sm"
          >
            <div className="flex items-center gap-4">
              <div 
                style={{ backgroundColor: vendorProfile.uiConfig.bg, color: vendorProfile.uiConfig.color }}
                className="flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-sm"
              >
                {vendorProfile.uiConfig.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-dark-text">
                    {vendorProfile.uiConfig.label}
                  </h2>
                  <VendorHealthBadge uiConfig={vendorProfile.uiConfig} showIcon={false} />
                </div>
                <p className="text-sm text-slate-600 dark:text-dark-textMuted">
                  {vendorProfile.uiConfig.description}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Risk Score (90d)</p>
              <p className="text-xl font-bold text-slate-900 dark:text-dark-text">
                {((vendorProfile.stats?.riskScore || 0) * 100).toFixed(2)}%
              </p>
            </div>
          </div>
        )}

        {/* Success/Error Alert */}
        {alert && (
          <Alert
            type={alert.type}
            title={alert.title}
            onDismiss={() => setAlert(null)}
            className="mb-6"
          />
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Vendor Health & Performance */}
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm col-span-full">
            <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-dark-text flex items-center gap-2">
              <Activity className="h-4 w-4 text-blue-600" />
              Vendor Health & Performance Details
            </h2>
            
            {vendorLoading ? (
              <div className="flex py-8 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Award className="h-3 w-3" /> Current Badge
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-dark-text">
                    {vendorProfile?.stats?.badge || "N/A"}
                  </p>
                  <p className="text-[10px] text-slate-500">Tiered based on reliability</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Payout Hold
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-dark-text">
                    {vendorProfile?.stats?.payoutDays === 0 ? "Instant" : `${vendorProfile?.stats?.payoutDays} Days`}
                  </p>
                  <p className="text-[10px] text-slate-500">Security hold period</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Activity className="h-3 w-3" /> 90-Day Orders
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-dark-text">
                    {vendorProfile?.stats?.totalOrders90Days || 0}
                  </p>
                  <p className="text-[10px] text-slate-500">Successful deliveries</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 text-red-500" /> 90-Day Disputes
                  </p>
                  <p className="text-sm font-bold text-red-600">
                    {vendorProfile?.stats?.totalDisputes90Days || 0}
                  </p>
                  <p className="text-[10px] text-slate-500">Claims raised by customers</p>
                </div>
              </div>
            )}

            <div className="mt-6 border-t border-slate-100 dark:border-dark-border pt-4">
              <h3 className="text-xs font-semibold text-slate-800 dark:text-dark-text mb-2">How it works</h3>
              <p className="text-[11px] text-slate-600 dark:text-dark-textMuted leading-relaxed">
                Your **Risk Score** is the ratio of disputes to delivered orders. Lowering your score unlocks higher tiers like **Platinum Pro**, which provides instant payouts. Ratings are updated every midnight.
              </p>
            </div>
          </div>

          {/* Shop Information */}
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-dark-text">
              Shop Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                  Shop Name
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border px-3 py-1.5 text-xs focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                  Email (Contact)
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-slate-50 dark:bg-dark-base px-3 py-1.5 text-xs text-slate-500 outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                  Phone
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border px-3 py-1.5 text-xs focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                  Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border px-3 py-1.5 text-xs focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Bank Account Settings */}
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-dark-text">
                Bank Account Settings
              </h2>
              {(user as any)?.paystackRecipientCode && (
                <div className="flex items-center gap-1 text-[10px] font-medium text-green-600">
                  <ShieldCheck className="h-3 w-3" />
                  Verified Recipient
                </div>
              )}
            </div>
            <p className="mb-4 text-[11px] text-slate-500 dark:text-dark-textMuted leading-relaxed">
              Required for automated payouts. Funds are settled daily after the 14-day mandatory cooling-off period.
            </p>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                  Bank Name
                </label>
                <select
                  value={bankCode}
                  onChange={(e) => setBankCode(e.target.value)}
                  className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border px-3 py-1.5 text-xs focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none bg-white dark:bg-dark-surface"
                >
                  <option value="">Select a bank</option>
                  {COMMON_BANKS.map(bank => (
                    <option key={bank.code} value={bank.code}>{bank.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                  Account Number
                </label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter 10-digit account number"
                  className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border px-3 py-1.5 text-xs focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                  Account Name
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  placeholder="Enter name as it appears on bank statement"
                  className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border px-3 py-1.5 text-xs focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-dark-text">
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
                  className="h-4 w-4 rounded border-[#c8c8c8] dark:border-dark-border"
                />
                <span className="text-xs text-slate-700 dark:text-dark-text">
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
                  className="h-4 w-4 rounded border-[#c8c8c8] dark:border-dark-border"
                />
                <span className="text-xs text-slate-700 dark:text-dark-text">
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
                  className="h-4 w-4 rounded border-[#c8c8c8] dark:border-dark-border"
                />
                <span className="text-xs text-slate-700 dark:text-dark-text">
                  Marketing and promotional emails
                </span>
              </label>
            </div>
          </div>

          {/* Account Status */}
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-surface p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold text-slate-900 dark:text-dark-text">
              Account Status
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-dark-textMuted">Account Type</span>
                <span className="text-xs font-medium text-slate-900 dark:text-dark-text">
                  Verified Vendor
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-dark-textMuted">KYC Status</span>
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">
                  Approved
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-dark-textMuted">Member Since</span>
                <span className="text-xs font-medium text-slate-900 dark:text-dark-text">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 dark:text-dark-textMuted">Debt Balance</span>
                <span className={`text-xs font-semibold ${((user as any)?.debtBalance > 0) ? "text-red-600" : "text-green-600"}`}>
                  KES {((user as any)?.debtBalance || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </BackofficeLayout>
  );
}
