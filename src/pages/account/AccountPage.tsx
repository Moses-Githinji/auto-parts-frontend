import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useAuthStore } from "../../stores/authStore";
import { apiClient } from "../../lib/apiClient";
import { AccountOrders } from "./AccountOrders";
import { AccountGarage } from "./AccountGarage";
import { AccountAddresses } from "./AccountAddresses";
import { EditProfileModal } from "../../components/account/EditProfileModal";

interface UserStats {
  activeOrders: number;
  savedVehicles: number;
  savedAddresses: number;
}

export function AccountPage() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, fetchProfile, logout } = useAuthStore();
  const [stats, setStats] = useState<UserStats>({
    activeOrders: 0,
    savedVehicles: 0,
    savedAddresses: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        setStatsError(null);

        // Fetch all stats in parallel
        const [ordersRes, vehiclesRes, addressesRes] = await Promise.allSettled(
          [
            apiClient.get<{ orders: unknown[] }>("/api/orders"),
            apiClient.get<{ vehicles: unknown[] }>("/api/users/vehicles"),
            apiClient.get<{ addresses: unknown[] }>("/api/users/addresses"),
          ]
        );

        setStats({
          activeOrders:
            ordersRes.status === "fulfilled"
              ? (
                  (ordersRes.value.orders || []) as Array<{ status: string }>
                ).filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status))
                  .length
              : 0,
          savedVehicles:
            vehiclesRes.status === "fulfilled"
              ? (vehiclesRes.value.vehicles || []).length
              : 0,
          savedAddresses:
            addressesRes.status === "fulfilled"
              ? (addressesRes.value.addresses || []).length
              : 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        setStatsError("Failed to load some stats");
        // Set default zeros on error
        setStats({
          activeOrders: 0,
          savedVehicles: 0,
          savedAddresses: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const isLoading = !!(authLoading || (user && statsLoading));

  return (
    <div className="grid gap-4 md:grid-cols-[200px,1fr] text-xs">
      <nav className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-dark-textMuted">
          Account
        </p>
        <div className="space-y-1">
          <SideNavButton
            label="Overview"
            onClick={() => navigate("/account")}
            isActive={
              !window.location.pathname.includes("/orders") &&
              !window.location.pathname.includes("/garage") &&
              !window.location.pathname.includes("/addresses")
            }
          />
          <SideNavButton
            label="Orders"
            onClick={() => navigate("/account/orders")}
            isActive={window.location.pathname.includes("/orders")}
          />
          <SideNavButton
            label="My garage"
            onClick={() => navigate("/account/garage")}
            isActive={window.location.pathname.includes("/garage")}
          />
          <SideNavButton
            label="Addresses"
            onClick={() => navigate("/account/addresses")}
            isActive={window.location.pathname.includes("/addresses")}
          />
          <SideNavButton label="Logout" onClick={handleLogout} />
        </div>
      </nav>
      <section>
        {window.location.pathname === "/account" && (
          <AccountOverview
            user={user}
            isLoading={isLoading}
            stats={stats}
            statsError={statsError}
          />
        )}
        {window.location.pathname.includes("/orders") && <AccountOrders />}
        {window.location.pathname.includes("/garage") && <AccountGarage />}
        {window.location.pathname.includes("/addresses") && (
          <AccountAddresses />
        )}
        <Outlet />
      </section>
    </div>
  );
}

function SideNavButton({
  label,
  onClick,
  isActive,
}: {
  label: string;
  onClick: () => void;
  isActive?: boolean;
}) {
  return (
    <Button
      variant={isActive ? "subtle" : "ghost"}
      size="sm"
      className={`w-full justify-start rounded-sm px-2 text-[11px] font-normal ${
        isActive
          ? "bg-[#FF9900]/10 text-[#FF9900] dark:bg-dark-surface dark:text-amber-400 hover:bg-[#FF9900]/20 dark:hover:bg-dark-surface"
          : "text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5"
      }`}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

function AccountOverview({
  user,
  isLoading,
  stats,
  statsError,
}: {
  user: any;
  isLoading: boolean;
  stats: UserStats;
  statsError: string | null;
}) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h1 className="text-sm font-semibold text-slate-900 dark:text-dark-text">
          Account overview
        </h1>
        <div className="flex items-center justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-[#FF9900] border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-sm font-semibold text-slate-900 dark:text-dark-text">Account overview</h1>

      {user ? (
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-100 dark:border-dark-border bg-[#FF9900] text-lg font-bold text-white overflow-hidden">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                (user as { firstName?: string }).firstName?.charAt(0) ||
                (user as { email?: string }).email?.charAt(0) ||
                "U"
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-dark-text">
                {(user as { firstName?: string }).firstName}{" "}
                {(user as { lastName?: string }).lastName}
              </p>
              <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                {(user as { email?: string }).email}
              </p>
              {(user as { phone?: string }).phone && (
                <p className="text-xs text-slate-600 dark:text-dark-textMuted mt-0.5">
                  {(user as { phone?: string }).phone}
                </p>
              )}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs"
              onClick={() => setIsEditModalOpen(true)}
            >
              Edit Profile
            </Button>
          </div>
          
          <EditProfileModal 
            isOpen={isEditModalOpen} 
            onClose={() => setIsEditModalOpen(false)} 
            user={user as any} 
          />

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-md bg-slate-50 dark:bg-dark-base p-3">
              <p className="text-xs text-slate-600 dark:text-dark-textMuted font-medium mb-1">Active Orders</p>
              <p className="text-lg font-bold text-slate-900 dark:text-dark-text">
                {stats.activeOrders}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 dark:bg-dark-base p-3">
              <p className="text-xs text-slate-600 dark:text-dark-textMuted font-medium mb-1">Saved Vehicles</p>
              <p className="text-lg font-bold text-slate-900 dark:text-dark-text">
                {stats.savedVehicles}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 dark:bg-dark-base p-3">
              <p className="text-xs text-slate-600 dark:text-dark-textMuted font-medium mb-1">Saved Addresses</p>
              <p className="text-lg font-bold text-slate-900 dark:text-dark-text">
                {stats.savedAddresses}
              </p>
            </div>
          </div>

          {(user.vehicleType || user.vehiclePlateNumber) && (
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-border">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Primary Vehicle</p>
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-dark-base p-3 rounded-md">
                <div className="p-2 bg-white dark:bg-dark-surface rounded-md border border-slate-200 dark:border-dark-border">
                  <svg className="w-5 h-5 text-[#FF9900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-dark-text">
                    {user.vehicleType || "Unnamed Vehicle"}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-dark-textMuted">
                    {user.vehiclePlateNumber || "No plate number"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {statsError && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">{statsError}</p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-base p-4">
          <p className="mb-3 text-sm text-slate-600 dark:text-dark-textMuted">
            Sign in to view your account details, orders, and saved vehicles.
          </p>
          <Button onClick={() => (window.location.href = "/login")}>
            Sign In
          </Button>
        </div>
      )}
    </div>
  );
}
