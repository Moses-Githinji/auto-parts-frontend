import { BackofficeLayout } from "../../layout/BackofficeLayout";

export function AdminDashboardPage() {
  const adminNavItems = [
    { label: "Dashboard", to: "/admin" },
    { label: "Vendors", to: "/admin/vendors" },
    { label: "Disputes", to: "/admin/disputes" },
    { label: "Reports", to: "/admin/reports" },
  ];

  return (
    <BackofficeLayout title="Admin Console" navItems={adminNavItems}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">
            Admin Console
          </h1>
          <p className="text-sm text-slate-600">
            Monitor vendor onboarding, catalog moderation, and trust & safety.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Vendors pending KYC</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">5</p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">
              Catalog changes awaiting review
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">12</p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-600">Open disputes</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">3</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              Recent Activity
            </h2>
            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                New vendor registration: AutoCare Plus
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Catalog update pending: Brake Pads v2
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Dispute opened: Order #1234
              </li>
            </ul>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              System Health
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">API Status</span>
                <span className="font-medium text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Database</span>
                <span className="font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Active Users</span>
                <span className="font-medium text-slate-900">1,234</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </BackofficeLayout>
  );
}
