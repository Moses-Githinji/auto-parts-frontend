import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useAuthStore } from "../../stores/authStore";
import { apiClient } from "../../lib/apiClient";
import { AccountOrders } from "./AccountOrders";
import { AccountGarage } from "./AccountGarage";
import { AccountAddresses } from "./AccountAddresses";

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
          ? "bg-[#FF9900]/10 text-[#FF9900] dark:bg-dark-bgLight dark:text-amber-400 hover:bg-[#FF9900]/20 dark:hover:bg-dark-bgLight"
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
  user: unknown;
  isLoading: boolean;
  stats: UserStats;
  statsError: string | null;
}) {
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
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF9900] text-lg font-bold text-white">
              {(user as { firstName?: string }).firstName?.charAt(0) ||
                (user as { email?: string }).email?.charAt(0) ||
                "U"}
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-dark-text">
                {(user as { firstName?: string }).firstName}{" "}
                {(user as { lastName?: string }).lastName}
              </p>
              <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                {(user as { email?: string }).email}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-md bg-slate-50 dark:bg-dark-bg p-3">
              <p className="text-xs text-slate-600 dark:text-dark-textMuted">Active Orders</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-dark-text">
                {stats.activeOrders}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 dark:bg-dark-bg p-3">
              <p className="text-xs text-slate-600 dark:text-dark-textMuted">Saved Vehicles</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-dark-text">
                {stats.savedVehicles}
              </p>
            </div>
            <div className="rounded-md bg-slate-50 dark:bg-dark-bg p-3">
              <p className="text-xs text-slate-600 dark:text-dark-textMuted">Saved Addresses</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-dark-text">
                {stats.savedAddresses}
              </p>
            </div>
          </div>

          {statsError && (
            <p className="mt-2 text-xs text-amber-600 dark:text-amber-500">{statsError}</p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg p-4">
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
