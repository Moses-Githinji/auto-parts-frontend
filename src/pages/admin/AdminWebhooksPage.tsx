import { useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

export function AdminWebhooksPage() {
  const [webhooks] = useState([
    {
      id: "wh_1",
      name: "Order Created",
      url: "https://api.example.com/webhooks/orders",
      events: ["order.created"],
      active: true,
      lastTriggered: "2024-01-15T10:30:00Z",
      successRate: 98.5,
    },
    {
      id: "wh_2",
      name: "Payment Received",
      url: "https://api.example.com/webhooks/payments",
      events: ["payment.received", "payment.completed"],
      active: true,
      lastTriggered: "2024-01-15T09:45:00Z",
      successRate: 100,
    },
    {
      id: "wh_3",
      name: "Delivery Update",
      url: "https://api.example.com/webhooks/delivery",
      events: ["delivery.shipped", "delivery.delivered", "delivery.failed"],
      active: true,
      lastTriggered: "2024-01-15T11:00:00Z",
      successRate: 95.2,
    },
    {
      id: "wh_4",
      name: "Vendor Registration",
      url: "https://api.example.com/webhooks/vendors",
      events: ["vendor.registered"],
      active: false,
      lastTriggered: "2024-01-14T15:20:00Z",
      successRate: 88.9,
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 dark:text-dark-text">Webhooks</h1>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            Configure webhook endpoints to receive real-time event
            notifications.
          </p>
        </div>
        <Button
          className="bg-[#2b579a] text-white hover:bg-[#2b579a]/90"
          onClick={() => setIsCreating(true)}
        >
          Add Webhook
        </Button>
      </div>

      {/* Key Metrics */}
      <section className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
          <p className="text-xs text-slate-600 dark:text-dark-textMuted">Total Webhooks</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">
            {webhooks.length}
          </p>
        </div>
        <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
          <p className="text-xs text-slate-600 dark:text-dark-textMuted">Active Webhooks</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">
            {webhooks.filter((w) => w.active).length}
          </p>
        </div>
        <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
          <p className="text-xs text-slate-600 dark:text-dark-textMuted">Avg Success Rate</p>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {(
              webhooks.reduce((acc, w) => acc + w.successRate, 0) /
              webhooks.length
            ).toFixed(1)}
            %
          </p>
        </div>
        <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
          <p className="text-xs text-slate-600 dark:text-dark-textMuted">Total Requests (24h)</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-dark-text">1,234</p>
        </div>
      </section>

      {/* Webhooks List */}
      <div className="rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight shadow-sm">
        <div className="border-b border-[#c8c8c8] dark:border-dark-border px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-dark-text">
            Configured Webhooks
          </h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#f3f3f3] dark:bg-dark-bg">
            <tr className="border-b border-[#c8c8c8] dark:border-dark-border">
              <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">
                Name
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">
                URL
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">
                Events
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">
                Success Rate
              </th>
              <th className="px-4 py-3 text-left font-medium text-slate-700 dark:text-dark-text">
                Last Triggered
              </th>
              <th className="px-4 py-3 text-right font-medium text-slate-700 dark:text-dark-text">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {webhooks.map((webhook) => (
              <tr key={webhook.id} className="border-t border-[#e8e8e8]">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-dark-text">
                  {webhook.name}
                </td>
                <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                  {webhook.url}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {webhook.events.map((event) => (
                      <Badge key={event} className="text-[10px]">
                        {event}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {webhook.active ? (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-700 dark:text-dark-text">
                      Inactive
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={
                      webhook.successRate >= 95
                        ? "text-green-600"
                        : webhook.successRate >= 80
                          ? "text-amber-600"
                          : "text-red-600"
                    }
                  >
                    {webhook.successRate}%
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted">
                  {webhook.lastTriggered
                    ? new Date(webhook.lastTriggered).toLocaleString()
                    : "Never"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm">
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Webhook Modal (placeholder) */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-lg rounded-lg bg-white dark:bg-dark-bgLight p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-dark-text">
              Create New Webhook
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Order Notifications"
                  className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border px-3 py-2 text-sm focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                  URL
                </label>
                <input
                  type="url"
                  placeholder="https://your-server.com/webhook"
                  className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border px-3 py-2 text-sm focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700 dark:text-dark-text">
                  Events
                </label>
                <select className="w-full rounded-sm border border-[#c8c8c8] dark:border-dark-border px-3 py-2 text-sm focus:border-[#2b579a] dark:focus:border-dark-primary focus:outline-none">
                  <option value="">Select events...</option>
                  <option value="order.created">order.created</option>
                  <option value="order.updated">order.updated</option>
                  <option value="order.cancelled">order.cancelled</option>
                  <option value="payment.received">payment.received</option>
                  <option value="payment.completed">payment.completed</option>
                  <option value="delivery.shipped">delivery.shipped</option>
                  <option value="delivery.delivered">delivery.delivered</option>
                  <option value="vendor.registered">vendor.registered</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
                <Button className="bg-[#2b579a] text-white hover:bg-[#2b579a]/90">
                  Create Webhook
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Deliveries */}
      <div className="mt-6 rounded-sm border border-[#c8c8c8] dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-dark-text">
          Recent Webhook Deliveries
        </h3>
        <table className="w-full text-xs">
          <thead className="bg-[#f3f3f3] dark:bg-dark-bg">
            <tr className="border-b border-[#c8c8c8] dark:border-dark-border">
              <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                Webhook
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                Event
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                Status
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                Response
              </th>
              <th className="px-4 py-2 text-left font-medium text-slate-700 dark:text-dark-text">
                Time
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-[#e8e8e8]">
              <td className="px-4 py-2 text-slate-900 dark:text-dark-text">Order Created</td>
              <td className="px-4 py-2 text-slate-600 dark:text-dark-textMuted">order.created</td>
              <td className="px-4 py-2">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">200 OK</Badge>
              </td>
              <td className="px-4 py-2 text-slate-500 dark:text-dark-textMuted">45ms</td>
              <td className="px-4 py-2 text-slate-500 dark:text-dark-textMuted">2024-01-15 11:30:00</td>
            </tr>
            <tr className="border-b border-[#e8e8e8]">
              <td className="px-4 py-2 text-slate-900 dark:text-dark-text">Payment Received</td>
              <td className="px-4 py-2 text-slate-600 dark:text-dark-textMuted">payment.received</td>
              <td className="px-4 py-2">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">200 OK</Badge>
              </td>
              <td className="px-4 py-2 text-slate-500 dark:text-dark-textMuted">32ms</td>
              <td className="px-4 py-2 text-slate-500 dark:text-dark-textMuted">2024-01-15 11:25:00</td>
            </tr>
            <tr className="border-b border-[#e8e8e8]">
              <td className="px-4 py-2 text-slate-900 dark:text-dark-text">Delivery Update</td>
              <td className="px-4 py-2 text-slate-600 dark:text-dark-textMuted">delivery.delivered</td>
              <td className="px-4 py-2">
                <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">500 Error</Badge>
              </td>
              <td className="px-4 py-2 text-slate-500 dark:text-dark-textMuted">1200ms</td>
              <td className="px-4 py-2 text-slate-500 dark:text-dark-textMuted">2024-01-15 11:20:00</td>
            </tr>
            <tr>
              <td className="px-4 py-2 text-slate-900 dark:text-dark-text">Order Created</td>
              <td className="px-4 py-2 text-slate-600 dark:text-dark-textMuted">order.created</td>
              <td className="px-4 py-2">
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">200 OK</Badge>
              </td>
              <td className="px-4 py-2 text-slate-500 dark:text-dark-textMuted">48ms</td>
              <td className="px-4 py-2 text-slate-500 dark:text-dark-textMuted">2024-01-15 11:15:00</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
