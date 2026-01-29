import { useEffect } from "react";
import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useAuthStore } from "../../stores/authStore";

export function AccountPage() {
  const navigate = useNavigate();
  const { user, isLoading, fetchProfile } = useAuthStore();

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return (
    <div className="grid gap-4 md:grid-cols-[200px,1fr] text-xs">
      <nav className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Account
        </p>
        <div className="space-y-1">
          <SideNavButton
            label="Overview"
            onClick={() => navigate("/account")}
          />
          <SideNavButton
            label="Orders"
            onClick={() => navigate("/account/orders")}
          />
          <SideNavButton
            label="My garage"
            onClick={() => navigate("/account/garage")}
          />
          <SideNavButton
            label="Addresses"
            onClick={() => navigate("/account/addresses")}
          />
        </div>
      </nav>
      <section>
        <Routes>
          <Route
            index
            element={<AccountOverview user={user} isLoading={isLoading} />}
          />
          <Route path="orders" element={<AccountOrders />} />
          <Route path="garage" element={<AccountGarage />} />
          <Route path="addresses" element={<AccountAddresses />} />
        </Routes>
        <Outlet />
      </section>
    </div>
  );
}

function SideNavButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start rounded-sm px-2 text-[11px] font-normal"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}

function AccountOverview({
  user,
  isLoading,
}: {
  user: any;
  isLoading: boolean;
}) {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <h1 className="text-sm font-semibold text-slate-900">
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
      <h1 className="text-sm font-semibold text-slate-900">Account overview</h1>

      {user ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#FF9900] text-lg font-bold text-[#131921]">
              {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
            </div>
            <div>
              <p className="font-semibold text-slate-900">
                {user.name || "User"}
              </p>
              <p className="text-xs text-slate-600">{user.email}</p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-600">Active Orders</p>
              <p className="text-lg font-semibold text-slate-900">0</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-600">Saved Vehicles</p>
              <p className="text-lg font-semibold text-slate-900">1</p>
            </div>
            <div className="rounded-md bg-slate-50 p-3">
              <p className="text-xs text-slate-600">Saved Addresses</p>
              <p className="text-lg font-semibold text-slate-900">1</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-sm text-slate-600">
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

function AccountOrders() {
  return (
    <div className="space-y-2">
      <h1 className="text-sm font-semibold text-slate-900">Orders</h1>
      <p className="text-[11px] text-slate-600">
        List and detail views of multi-vendor orders, backed by your existing
        order APIs.
      </p>
    </div>
  );
}

function AccountGarage() {
  return (
    <div className="space-y-2">
      <h1 className="text-sm font-semibold text-slate-900">My garage</h1>
      <p className="text-[11px] text-slate-600">
        Buyers can save vehicles (make, model, year, engine) for quick fitment
        filtering across the marketplace.
      </p>
    </div>
  );
}

function AccountAddresses() {
  return (
    <div className="space-y-2">
      <h1 className="text-sm font-semibold text-slate-900">Addresses</h1>
      <p className="text-[11px] text-slate-600">
        Shipping and billing addresses linked to the account, mapped to Kenyan
        counties and cities.
      </p>
    </div>
  );
}
