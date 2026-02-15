import { useState } from "react";
import type { Order } from "../../types/order";
import { VendorEarningsDisplay } from "../../components/commission/VendorEarningsDisplay";

interface OrderDetailsDrawerProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onProcess: (order: Order) => void;
  onReportIssue: (order: Order) => void;
}

export function OrderDetailsDrawer({
  order,
  isOpen,
  onClose,
  onProcess,
  onReportIssue,
}: OrderDetailsDrawerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !order) return null;

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "PROCESSING":
        return "bg-purple-100 text-purple-700";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-700";
      case "OUT_FOR_DELIVERY":
        return "bg-cyan-100 text-cyan-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "CANCELLED":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-xl bg-white dark:bg-dark-bgLight shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
              Order #{order.orderNumber}
            </h2>
            <p className="text-sm text-slate-500 dark:text-dark-textMuted">
              Created {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}
            >
              {formatStatus(order.status)}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                order.paymentStatus === "PAID"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
              }`}
            >
              {formatStatus(order.paymentStatus)}
            </span>
          </div>

          {/* Customer Snapshot */}
          <section>
            <h3 className="text-sm font-medium text-slate-900 mb-3">
              Customer
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-dark-textMuted">Name</span>
                <span className="text-sm font-medium text-slate-900 dark:text-dark-text">
                  {order.customerName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-dark-textMuted">Email</span>
                <span className="text-sm font-medium text-slate-900 dark:text-dark-text">
                  {order.customerEmail}
                </span>
              </div>
              {order.customerPhone && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-dark-textMuted">Phone</span>
                  <a
                    href={`tel:${order.customerPhone}`}
                    className="text-sm font-medium text-[#2b579a] hover:underline"
                  >
                    {order.customerPhone}
                  </a>
                </div>
              )}
            </div>
          </section>

          {/* Shipping Address */}
          <section>
            <h3 className="text-sm font-medium text-slate-900 mb-3">
              Shipping Address
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-slate-900 font-medium">
                {order.shippingAddress.firstName}{" "}
                {order.shippingAddress.lastName}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                {order.shippingAddress.street}
              </p>
              <p className="text-sm text-slate-600 dark:text-dark-textMuted">
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.zipCode}
              </p>
              <button
                onClick={() =>
                  copyToClipboard(
                    `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}\n${order.shippingAddress.street}\n${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`,
                    "address"
                  )
                }
                className="mt-3 text-xs text-[#2b579a] hover:underline flex items-center gap-1"
              >
                {copiedField === "address" ? (
                  <>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    Copy for courier
                  </>
                )}
              </button>
            </div>
          </section>

          {/* Items Breakdown */}
          <section>
            <h3 className="text-sm font-medium text-slate-900 mb-3">Items</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-dark-textMuted">
                      Part
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-slate-600 dark:text-dark-textMuted">
                      SKU
                    </th>
                    <th className="px-4 py-2 text-center font-medium text-slate-600 dark:text-dark-textMuted">
                      Qty
                    </th>
                    <th className="px-4 py-2 text-right font-medium text-slate-600 dark:text-dark-textMuted">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t border-gray-200">
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-dark-text">
                          {item.product?.name || "Unknown Product"}
                        </p>
                        {item.product?.specifications?.Volume && (
                          <p className="text-xs text-slate-500 mt-0.5">
                            {item.product.specifications.Volume}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600 dark:text-dark-textMuted">
                        {item.product?.partNumber || "N/A"}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600 dark:text-dark-textMuted">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-dark-text">
                        KSh {Number(item.price || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr className="border-t border-gray-200">
                    <td
                      colSpan={3}
                      className="px-4 py-2 text-right text-sm text-slate-600 dark:text-dark-textMuted"
                    >
                      Subtotal
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-slate-900 dark:text-dark-text">
                      KSh {Number(order.subtotal).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-2 text-right text-sm text-slate-600 dark:text-dark-textMuted"
                    >
                      Shipping
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-slate-900 dark:text-dark-text">
                      KSh {Number(order.shipping).toLocaleString()}
                    </td>
                  </tr>
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-2 text-right text-sm text-slate-600 dark:text-dark-textMuted"
                    >
                      Tax
                    </td>
                    <td className="px-4 py-2 text-right text-sm font-medium text-slate-900 dark:text-dark-text">
                      KSh {Number(order.tax).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="border-t border-gray-200">
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-dark-text"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-dark-text">
                      KSh {Number(order.total).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          {/* Vendor Earnings Display */}
          {(() => {
            const commissionRate = 0.08;
            const vatRate = 0.16;
            const commissionBase = Number(order.subtotal);
            const marketplaceFee = commissionBase * commissionRate;
            const vatAmount = marketplaceFee * vatRate;
            const vendorPayout = commissionBase - marketplaceFee - vatAmount;
            return (
              <VendorEarningsDisplay
                orderAmount={commissionBase}
                marketplaceFee={marketplaceFee}
                vatAmount={vatAmount}
                vendorPayout={vendorPayout}
                isCollapsible={true}
              />
            );
          })()}

          {/* Audit Trail */}
          <section>
            <h3 className="text-sm font-medium text-slate-900 mb-3">
              Order History
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500"></div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-dark-text">
                    Order Placed
                  </p>
                  <p className="text-xs text-slate-500 dark:text-dark-textMuted">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
              {order.trackingNumber && (
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-dark-text">
                      Shipped
                    </p>
                    <p className="text-xs text-slate-500 dark:text-dark-textMuted">
                      Tracking: {order.trackingNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="border-t border-gray-200 px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => onReportIssue(order)}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Report Issue
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-sm border border-gray-300 rounded-sm hover:bg-gray-50"
            >
              Print Packing Slip
            </button>
            {(order.status === "PENDING" || order.status === "CONFIRMED") && (
              <button
                onClick={() => {
                  onProcess(order);
                  onClose();
                }}
                className="px-4 py-2 text-sm bg-[#2b579a] text-white rounded-sm hover:bg-[#1e3f7a]"
              >
                Process Order
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
