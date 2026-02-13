import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { apiClient } from "../lib/apiClient";
import { Button } from "../components/ui/button";
import { Loader2, CheckCircle2, AlertCircle, Package, Calendar } from "lucide-react";
import { toast } from "sonner";

interface OrderDetails {
  id: string;
  orderNumber: string;
  status: string;
  deliveredAt: string | null;
  confirmationDeadline: string | null;
  daysUntilAutoConfirm: number;
  vendorName: string;
  totalAmount: number;
  items: Array<{
    id: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
}

export function OrderConfirmationPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showIssueForm, setShowIssueForm] = useState(false);
  const [issueDescription, setIssueDescription] = useState("");

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiClient.get<OrderDetails>(`/api/orders/${orderId}`);
      setOrder(response);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelivery = async () => {
    try {
      setIsSubmitting(true);
      await apiClient.post(`/api/orders/${orderId}/confirm-delivery`);
      toast.success("Delivery confirmed! Vendor will receive payment shortly.");
      navigate("/orders");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to confirm delivery");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReportIssue = async () => {
    if (!issueDescription.trim()) {
      toast.error("Please describe the issue");
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post(`/api/orders/${orderId}/report-issue`, {
        description: issueDescription,
      });
      toast.success("Issue reported. Our support team will contact you shortly.");
      navigate("/orders");
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to report issue");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF9900]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-8">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-16 w-16 text-red-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-2">
              Order Not Found
            </h2>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted mb-4">
              {error || "We couldn't find this order"}
            </p>
            <Button onClick={() => navigate("/orders")}>View All Orders</Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if order is eligible for confirmation
  const isDelivered = order.status === "DELIVERED" || order.status === "PENDING_CONFIRMATION";
  const isAlreadyConfirmed = order.status === "CONFIRMED" || order.status === "COMPLETED";

  if (!isDelivered) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-8">
          <div className="flex flex-col items-center text-center">
            <Package className="h-16 w-16 text-blue-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-2">
              Order Not Yet Delivered
            </h2>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted mb-4">
              You can confirm delivery once your order has been delivered
            </p>
            <Button onClick={() => navigate(`/orders/${orderId}`)}>View Order Details</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isAlreadyConfirmed) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 p-8">
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-2">
              Delivery Already Confirmed
            </h2>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted mb-4">
              You have already confirmed this delivery
            </p>
            <Button onClick={() => navigate(`/orders/${orderId}`)}>View Order Details</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-dark-text">
          Confirm Delivery
        </h1>
        <p className="text-sm text-slate-600 dark:text-dark-textMuted">
          Order #{order.orderNumber}
        </p>
      </div>

      {/* Order Summary */}
      <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Package className="h-5 w-5 text-[#FF9900]" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
            Order Summary
          </h2>
        </div>

        <div className="space-y-3 mb-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <div>
                <p className="font-medium text-slate-900 dark:text-dark-text">
                  {item.productName}
                </p>
                <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-medium text-slate-900 dark:text-dark-text">
                KES {(item.price * item.quantity).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-200 dark:border-dark-border pt-3">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-900 dark:text-dark-text">Total</span>
            <span className="font-bold text-[#FF9900]">
              KES {order.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-border">
          <p className="text-sm text-slate-600 dark:text-dark-textMuted">
            <strong>Vendor:</strong> {order.vendorName}
          </p>
          {order.deliveredAt && (
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">
              <strong>Delivered:</strong>{" "}
              {new Date(order.deliveredAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Confirmation Period Info */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-6 mb-6">
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              14-Day Confirmation Period
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
              You have <strong>{order.daysUntilAutoConfirm} days</strong> remaining to
              confirm this delivery or report any issues.
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              {order.confirmationDeadline && (
                <>
                  Auto-confirmation date:{" "}
                  {new Date(order.confirmationDeadline).toLocaleDateString()}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Action Section */}
      {!showIssueForm ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-6">
            <h3 className="font-semibold text-slate-900 dark:text-dark-text mb-3">
              Did you receive your order in good condition?
            </h3>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted mb-4">
              By confirming delivery, you acknowledge that you received all items in
              satisfactory condition. The vendor will receive payment once confirmed.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
                onClick={handleConfirmDelivery}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Confirm Delivery
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => setShowIssueForm(true)}
                disabled={isSubmitting}
              >
                <AlertCircle className="mr-2 h-4 w-4" />
                Report an Issue
              </Button>
            </div>
          </div>

          <div className="text-center">
            <Button variant="ghost" onClick={() => navigate("/orders")}>
              Back to Orders
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-6">
          <h3 className="font-semibold text-slate-900 dark:text-dark-text mb-3">
            Report an Issue
          </h3>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted mb-4">
            Please describe the issue with your order. Our support team will review and
            contact you shortly.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-dark-text mb-2">
              Issue Description *
            </label>
            <textarea
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-dark-border bg-white dark:bg-dark-bg p-3 text-sm text-slate-900 dark:text-dark-text focus:border-[#FF9900] focus:outline-none focus:ring-2 focus:ring-[#FF9900]/20"
              rows={5}
              placeholder="Describe the issue (e.g., missing items, damaged products, wrong items received...)"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              className="flex-1 bg-red-600 text-white hover:bg-red-700"
              onClick={handleReportIssue}
              disabled={isSubmitting || !issueDescription.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Issue Report"
              )}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowIssueForm(false);
                setIssueDescription("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Important Notice */}
      <div className="mt-6 rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bg p-4">
        <h4 className="text-sm font-semibold text-slate-900 dark:text-dark-text mb-2">
          Important Information
        </h4>
        <ul className="text-xs text-slate-600 dark:text-dark-textMuted space-y-1 list-disc list-inside">
          <li>
            If you don't take action within {order.daysUntilAutoConfirm} days, delivery
            will be automatically confirmed
          </li>
          <li>Once confirmed, vendor payment will be processed immediately</li>
          <li>
            Reporting an issue will hold the payment until the matter is resolved
          </li>
          <li>
            For urgent issues, please contact support at support@autoparts.com
          </li>
        </ul>
      </div>
    </div>
  );
}
