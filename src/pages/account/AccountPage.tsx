import { Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";

export function AccountPage() {
  const navigate = useNavigate();
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
          <Route index element={<AccountOverview />} />
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

function AccountOverview() {
  return (
    <div className="space-y-2">
      <h1 className="text-sm font-semibold text-slate-900">Account overview</h1>
      <p className="text-[11px] text-slate-600">
        This area will be populated with profile info and shortcuts to active
        orders and saved vehicles from your API.
      </p>
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
