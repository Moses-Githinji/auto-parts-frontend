import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { ADMIN_MENU_ITEMS } from "../../layout/adminMenuConfig";

export function AdminDashboardPage() {
  return (
    <BackofficeLayout title="Admin Console" menuItems={ADMIN_MENU_ITEMS}>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">
            Admin Console
          </h1>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            Monitor vendor onboarding, catalog moderation, and trust &amp; safety.
          </p>
        </div>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Vendors pending KYC</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-dark-text">5</p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">
              Catalog changes awaiting review
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-dark-text">12</p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Open disputes</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">3</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-dark-text">
              Recent Activity
            </h2>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-dark-textMuted">
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
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-dark-text">
              System Health
            </h2>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-dark-textMuted">API Status</span>
                <span className="font-medium text-green-600">Operational</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-dark-textMuted">Database</span>
                <span className="font-medium text-green-600">Healthy</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-dark-textMuted">Active Users</span>
                <span className="font-medium text-slate-900 dark:text-dark-text">1,234</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </BackofficeLayout>
  );
}
