import { Outlet } from "react-router-dom";
import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";

export function AdminIntegrationsPage() {
  return (
    <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Integrations</h1>
          <p className="text-sm text-slate-600">
            Configure webhooks, payment gateways, and notification services.
          </p>
        </div>
        <Outlet />
      </div>
    </BackofficeLayout>
  );
}
