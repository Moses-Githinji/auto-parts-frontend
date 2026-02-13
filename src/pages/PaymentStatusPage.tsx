import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usePaymentStore } from "../stores/paymentStore";
import { Button } from "../components/ui/button";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";

export function PaymentStatusPage() {
  const { transactionId } = useParams<{ transactionId: string }>();
  const navigate = useNavigate();
  const { paymentStatus, startPolling, stopPolling, isPolling } = usePaymentStore();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    if (!transactionId) {
      navigate("/");
      return;
    }

    // Start polling for payment status
    startPolling(transactionId, (status) => {
      // Polling complete callback
      if (status.status === "PAID") {
        // Payment successful
        setTimeout(() => {
          navigate(`/orders/${status.orderGroup?.id}`);
        }, 3000);
      } else if (status.status === "FAILED") {
        // Payment failed
        setTimeoutReached(true);
      }
    });

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [transactionId]);

  if (!paymentStatus && isPolling) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-8">
          <div className="flex flex-col items-center text-center">
            <Loader2 className="h-16 w-16 animate-spin text-[#FF9900] mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-2">
              Loading Payment Status...
            </h2>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted">
              Please wait while we check your payment status
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!paymentStatus) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-8">
          <div className="flex flex-col items-center text-center">
            <XCircle className="h-16 w-16 text-red-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-2">
              Payment Not Found
            </h2>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted mb-4">
              We couldn't find this payment transaction
            </p>
            <Button onClick={() => navigate("/")}>Return Home</Button>
          </div>
        </div>
      </div>
    );
  }

  // Pending status
  if (paymentStatus.status === "PENDING" && !timeoutReached) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <Clock className="h-16 w-16 text-blue-600" />
              <div className="absolute -top-1 -right-1">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-2">
              {paymentStatus.provider === "mpesa" 
                ? "Check Your Phone" 
                : "Processing Payment"}
            </h2>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted mb-6">
              {paymentStatus.provider === "mpesa"
                ? "Please enter your M-Pesa PIN to complete the payment"
                : "Your payment is being processed. Please wait..."}
            </p>

            <div className="w-full rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-dark-textMuted">Transaction ID</span>
                <span className="font-mono text-slate-900 dark:text-dark-text">
                  {paymentStatus.transactionId}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-dark-textMuted">Amount</span>
                <span className="font-semibold text-slate-900 dark:text-dark-text">
                  KES {paymentStatus.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-dark-textMuted">Payment Method</span>
                <span className="font-medium text-slate-900 dark:text-dark-text capitalize">
                  {paymentStatus.provider === "mpesa" ? "M-Pesa" : "Card"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-dark-textMuted">
              <Loader2 className="h-3 w-3 animate-spin" />
              Waiting for payment confirmation...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success status
  if (paymentStatus.status === "PAID") {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 p-8">
          <div className="flex flex-col items-center text-center">
            <CheckCircle2 className="h-16 w-16 text-green-600 mb-4" />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-2">
              Payment Successful!
            </h2>
            <p className="text-sm text-slate-600 dark:text-dark-textMuted mb-6">
              Your order has been confirmed and is being processed
            </p>

            <div className="w-full rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-dark-textMuted">Order Number</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-dark-text">
                  {paymentStatus.orderGroup?.orderNumber}
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-slate-600 dark:text-dark-textMuted">Amount Paid</span>
                <span className="font-semibold text-green-600">
                  KES {paymentStatus.amount.toLocaleString()}
                </span>
              </div>
              {paymentStatus.mpesaReceiptNumber && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-600 dark:text-dark-textMuted">M-Pesa Receipt</span>
                  <span className="font-mono text-slate-900 dark:text-dark-text">
                    {paymentStatus.mpesaReceiptNumber}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-dark-textMuted">Payment Time</span>
                <span className="text-slate-900 dark:text-dark-text">
                  {paymentStatus.paidAt ? new Date(paymentStatus.paidAt).toLocaleString() : "Just now"}
                </span>
              </div>
            </div>

            <div className="space-y-2 w-full">
              <Button
                className="w-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90"
                onClick={() => navigate(`/orders/${paymentStatus.orderGroup?.id}`)}
              >
                View Order Details
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/")}
              >
                Continue Shopping
              </Button>
            </div>

            <p className="mt-4 text-xs text-slate-500 dark:text-dark-textMuted">
              A confirmation email has been sent to your registered email address
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Failed status
  return (
    <div className="mx-auto max-w-2xl p-4">
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-8">
        <div className="flex flex-col items-center text-center">
          <XCircle className="h-16 w-16 text-red-600 mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-2">
            Payment Failed
          </h2>
          <p className="text-sm text-slate-600 dark:text-dark-textMuted mb-6">
            {paymentStatus.failureReason || "We couldn't process your payment. Please try again."}
          </p>

          <div className="w-full rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-600 dark:text-dark-textMuted">Transaction ID</span>
              <span className="font-mono text-slate-900 dark:text-dark-text">
                {paymentStatus.transactionId}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-dark-textMuted">Amount</span>
              <span className="font-semibold text-slate-900 dark:text-dark-text">
                KES {paymentStatus.amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2 w-full">
            <Button
              className="w-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90"
              onClick={() => navigate("/checkout")}
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/")}
            >
              Return Home
            </Button>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-dark-textMuted">
            If you continue to experience issues, please contact support
          </p>
        </div>
      </div>
    </div>
  );
}
