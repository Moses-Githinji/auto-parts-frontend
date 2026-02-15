import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { usePaymentStore } from "../stores/paymentStore";
import { Button } from "../components/ui/button";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { apiClient } from "../lib/apiClient";

export function PaymentStatusPage() {
  const { transactionId, orderId } = useParams<{ transactionId?: string; orderId?: string }>();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");
  const id = transactionId || orderId || groupId;
  const navigate = useNavigate();
  const { paymentStatus, startPolling, stopPolling, isPolling, error: storeError } = usePaymentStore();
  const [timeoutReached, setTimeoutReached] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    // Start polling for payment status using the ID from URL
    // We treat it as an Order ID for C2B flow
    startPolling(id, (status) => {
      // Polling complete callback
      if (status.status === "PAID") {
        // Payment successful
        setTimeout(() => {
          // Redirect to the specific order page
          const finalOrderId = status.orderGroup?.id || id;
          navigate(`/orders/${finalOrderId}`);
        }, 3000);
      } else if (status.status === "FAILED") {
        // Payment failed
        setTimeoutReached(true);
      }
    }, true); // isOrderId = true

    // Cleanup on unmount
    return () => {
      stopPolling();
    };
  }, [id]);

  if (!paymentStatus && isPolling) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-8">
          <div className="flex flex-col items-center text-center">
            {storeError ? (
              <>
                <XCircle className="h-16 w-16 text-red-600 mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-2">
                  Failed to Load Status
                </h2>
                <p className="text-sm text-slate-600 dark:text-dark-textMuted mb-4">
                  {storeError}
                </p>
                <Button onClick={() => navigate("/")}>Return Home</Button>
              </>
            ) : (
              <>
                <Loader2 className="h-16 w-16 animate-spin text-[#FF9900] mb-4" />
                <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text mb-2">
                  Loading Payment Status...
                </h2>
                <p className="text-sm text-slate-600 dark:text-dark-textMuted">
                  Please wait while we check your payment status
                </p>
              </>
            )}
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
                ? "Pay with M-Pesa Paybill" 
                : "Processing Payment"}
            </h2>
            <div className="text-sm text-slate-600 dark:text-dark-textMuted mb-6">
              <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-lg text-left">
                <p className="font-semibold text-amber-900 dark:text-amber-200 mb-1">Order received!</p>
                <p className="text-sm text-amber-800 dark:text-amber-300/90 leading-relaxed font-medium">
                  We've sent an 'Awaiting Payment' email with your order details. Please complete the {paymentStatus.provider === "mpesa" ? "M-Pesa" : "Stripe"} payment below to finalize your purchase.
                </p>
              </div>

              {paymentStatus.provider === "mpesa" ? (
                <div className="space-y-4 text-left bg-slate-50 dark:bg-dark-bg p-4 rounded-lg border border-slate-200 dark:border-dark-border shadow-inner">
                  <p className="font-bold text-center text-slate-900 dark:text-dark-text tracking-tight uppercase text-xs">M-Pesa Payment Instructions:</p>
                  <ol className="list-decimal list-inside space-y-2.5 text-sm">
                    <li>Go to M-Pesa menu</li>
                    <li>Select <strong>Lipa na M-Pesa</strong> &rarr; <strong>Paybill</strong></li>
                    <li>Enter Business No: <strong>174379</strong></li>
                    <li>Enter Account No: <strong className="text-blue-600 font-mono tracking-wider">{paymentStatus.orderGroup?.paymentReference || paymentStatus.orderGroup?.orderNumber}</strong></li>
                    <li>Enter Amount: <strong>KES {paymentStatus.amount.toLocaleString()}</strong></li>
                    <li>Enter PIN and Send</li>
                  </ol>
                  <p className="text-[10px] text-slate-500 italic mt-4 text-center border-t border-slate-200 dark:border-dark-border pt-2 uppercase font-bold tracking-widest">Page will update automatically</p>
                  
                  <div className="mt-4 flex justify-center">
                    <Button 
                      onClick={() => id && startPolling(id, () => {}, true)}
                      disabled={isPolling && !!paymentStatus}
                      variant="outline"
                      size="sm"
                      className="text-xs font-bold uppercase tracking-wider border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100/50"
                    >
                      {isPolling ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin mr-2" />
                          Checking Status...
                        </>
                      ) : "Verify Payment"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-4">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                  <p>Your payment is being processed. Please wait...</p>
                </div>
              )}
            </div>

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

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-dark-textMuted mb-4">
              <Loader2 className="h-3 w-3 animate-spin" />
              Waiting for payment confirmation...
            </div>

            {/* Dev Simulation Button */}
            {import.meta.env.DEV && paymentStatus.provider === "mpesa" && (
              <div className="mt-4 pt-4 border-t border-blue-200 w-full text-center">
                <p className="text-[10px] text-blue-500 uppercase font-bold mb-2 tracking-wider">Developer Tools</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isPolling}
                  className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 gap-2 h-8 text-xs"
                  onClick={async (e) => {
                    const btn = e.currentTarget;
                    btn.disabled = true;
                    const originalText = btn.innerHTML;
                    btn.innerHTML = 'Simulating...';
                    try {
                      await apiClient.post('/api/payments/mpesa/simulate', {
                        amount: paymentStatus.amount,
                        phone: '254700000000',
                        orderNumber: paymentStatus.orderGroup?.paymentReference || paymentStatus.orderGroup?.orderNumber,
                        mock: true
                      });
                    } catch (err) {
                      console.error('Simulation failed', err);
                      btn.innerHTML = 'Failed';
                      setTimeout(() => { btn.innerHTML = originalText; btn.disabled = false; }, 2000);
                    }
                  }}
                >
                  Simulate Successful Payment
                </Button>
                <p className="mt-1 text-[10px] text-slate-400">Triggers backend callback simulation</p>
              </div>
            )}
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

            <p className="mt-4 text-sm font-bold text-green-600 dark:text-green-500">
              Payment Successful! Your official order confirmation email (receipt) has been sent.
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
