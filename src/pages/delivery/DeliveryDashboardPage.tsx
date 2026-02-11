import { BackofficeLayout } from "../../layout/BackofficeLayout";
import { DELIVERY_MENU_ITEMS } from "../../layout/deliveryMenuConfig";
import { useAuthStore } from "../../stores/authStore";

export function DeliveryDashboardPage() {
  const { user } = useAuthStore();

  // Mock data for demo purposes
  const stats = {
    todayDeliveries: 12,
    completed: 8,
    pending: 4,
    earnings: 4500,
  };

  const recentActivities = [
    { id: 1, message: "Delivered order #1234 to Westlands", time: "10 min ago", status: "success" },
    { id: 2, message: "Picked up order #1235 from vendor", time: "25 min ago", status: "success" },
    { id: 3, message: "Out for delivery - Order #1236", time: "1 hr ago", status: "pending" },
  ];

  return (
    <BackofficeLayout title="Delivery Portal" menuItems={DELIVERY_MENU_ITEMS}>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">
            Delivery Dashboard
          </h1>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            Welcome back, {user?.firstName}! Here's your delivery overview for today.
          </p>
        </div>

        {/* Stats Grid */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Today's Tasks</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-dark-text">
              {stats.todayDeliveries}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Completed</p>
            <p className="mt-2 text-3xl font-semibold text-green-600">
              {stats.completed}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Pending</p>
            <p className="mt-2 text-3xl font-semibold text-amber-600">
              {stats.pending}
            </p>
          </div>
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <p className="text-xs text-slate-600 dark:text-dark-textMuted">Today's Earnings</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-dark-text">
              KSh {stats.earnings.toLocaleString()}
            </p>
          </div>
        </section>

        {/* Two Column Layout */}
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {/* Active Assignment */}
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-dark-text">
              Current Assignment
            </h2>
            <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-slate-50 dark:bg-dark-bg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-[#2b579a] dark:text-blue-400">
                  DEL-12345
                </span>
                <span className="rounded-full bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                  OUT FOR DELIVERY
                </span>
              </div>
              <p className="text-sm font-medium text-slate-900 dark:text-dark-text mb-1">
                Westlands, Nairobi
              </p>
              <p className="text-xs text-slate-600 dark:text-dark-textMuted mb-3">
                Customer: John Doe
              </p>
              <div className="flex gap-2">
                <button className="flex-1 rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-dark-text hover:bg-[#f3f3f3] dark:hover:bg-dark-bg">
                  Call Customer
                </button>
                <a
                  href="/delivery/active"
                  className="flex-1 text-center rounded-sm bg-[#2b579a] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#1e3f7a]"
                >
                  View Details
                </a>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-dark-text">
              Recent Activity
            </h2>
            <ul className="space-y-2">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex items-start gap-2">
                  <span className={`h-2 w-2 rounded-full mt-1.5 ${
                    activity.status === "success" ? "bg-green-500" : "bg-amber-500"
                  }`} />
                  <div>
                    <p className="text-xs text-slate-700 dark:text-dark-text">
                      {activity.message}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-dark-textMuted">
                      {activity.time}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold text-slate-900 dark:text-dark-text">
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <a
              href="/delivery/scan"
              className="flex items-center gap-3 rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm hover:bg-[#f8f8f8] dark:hover:bg-dark-bg"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-[#2b579a]/10 dark:bg-[#2b579a]/20">
                <svg className="h-4 w-4 text-[#2b579a] dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-900 dark:text-dark-text">Scan QR</p>
                <p className="text-[10px] text-slate-600 dark:text-dark-textMuted">Scan package codes</p>
              </div>
            </a>
            <a
              href="/delivery/active"
              className="flex items-center gap-3 rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm hover:bg-[#f8f8f8] dark:hover:bg-dark-bg"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-amber-100 dark:bg-amber-900/20">
                <svg className="h-4 w-4 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-900 dark:text-dark-text">Active Tasks</p>
                <p className="text-[10px] text-slate-600 dark:text-dark-textMuted">View assignments</p>
              </div>
            </a>
            <a
              href="/delivery/history"
              className="flex items-center gap-3 rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm hover:bg-[#f8f8f8] dark:hover:bg-dark-bg"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-green-100 dark:bg-green-900/20">
                <svg className="h-4 w-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-900 dark:text-dark-text">History</p>
                <p className="text-[10px] text-slate-600 dark:text-dark-textMuted">Past deliveries</p>
              </div>
            </a>
            <a
              href="/delivery/scan"
              className="flex items-center gap-3 rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm hover:bg-[#f8f8f8] dark:hover:bg-dark-bg"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-slate-100 dark:bg-dark-bg">
                <svg className="h-4 w-4 text-slate-600 dark:text-dark-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-900 dark:text-dark-text">Profile</p>
                <p className="text-[10px] text-slate-600 dark:text-dark-textMuted">Account settings</p>
              </div>
            </a>
          </div>
        </section>
      </div>
    </BackofficeLayout>
  );
}
