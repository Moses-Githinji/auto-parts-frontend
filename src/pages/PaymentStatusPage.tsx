import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { usePaymentStore } from "../stores/paymentStore";
import { Button } from "../components/ui/button";
import { Loader2, CheckCircle2, XCircle, Clock, Smartphone } from "lucide-react";
import { apiClient } from "../lib/apiClient";

export function PaymentStatusPage() {
  const { transactionId, orderId } = useParams<{ transactionId?: string; orderId?: string }>();
  const [searchParams] = useSearchParams();
  const groupId = searchParams.get("groupId");
  const id = transactionId || orderId || groupId;
  const navigate = useNavigate();
  const { paymentStatus, startPolling, stopPolling, isPolling, error: storeError } = usePaymentStore();
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);

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
        // Payment successful - no auto redirect
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
                <div className="h-10 w-10 border-4 border-slate-200 border-t-[#FF9900] rounded-full animate-spin mb-4" />
                <p className="text-sm text-slate-500 font-medium">Loading payment details...</p>
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
                <div className="space-y-4 text-left">
                  <div className="bg-green-50 dark:bg-green-900/10 border-2 border-green-200 dark:border-green-900/30 p-6 rounded-xl text-center shadow-lg transform transition-all animate-in zoom-in-95 duration-500">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                      <Smartphone className="h-8 w-8 text-green-600 dark:text-green-500 animate-bounce" />
                    </div>
                    <h3 className="text-lg font-bold text-green-900 dark:text-green-200 mb-2">
                      Please Check Your Phone!
                    </h3>
                    <p className="text-sm text-green-800 dark:text-green-300 mb-4 leading-relaxed font-medium">
                      An M-Pesa payment prompt (STK Push) has been sent to your phone. Please enter your PIN to complete the payment.
                    </p>
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-green-700 dark:text-green-400 bg-white/50 dark:bg-black/20 py-2 rounded-lg">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Waiting for your confirmation...
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-dark-border">
                    <p className="font-bold text-center text-slate-900 dark:text-dark-text tracking-tight uppercase text-[10px] mb-3 opacity-60">
                      Alternative: Manual Paybill Instructions
                    </p>
                    <div className="bg-slate-50 dark:bg-dark-bg p-4 rounded-lg border border-slate-200 dark:border-dark-border">
                      <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 dark:text-dark-textMuted">
                        <li>Go to M-Pesa menu &rarr; <strong>Lipa na M-Pesa</strong> &rarr; <strong>Paybill</strong></li>
                        <li>Enter Business No: <strong>174379</strong></li>
                        <li>Enter Account No: <strong className="text-blue-600 font-mono tracking-wider">{paymentStatus.orderGroup?.paymentReference || paymentStatus.orderGroup?.orderNumber}</strong></li>
                        <li>Enter Amount: <strong>KES {paymentStatus.amount.toLocaleString()}</strong></li>
                      </ol>
                    </div>
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

             {/* Polling feedback text - only show when simulating */}
            {isSimulating && (
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-dark-textMuted mb-4 animate-in fade-in duration-300">
                <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                Waiting for payment confirmation...
              </div>
            )}
 
             {/* Dev Simulation Button */}
             {import.meta.env.DEV && paymentStatus.provider === "mpesa" && (
               <div className="mt-4 pt-4 border-t border-blue-200 w-full text-center">
                 <p className="text-[10px] text-blue-500 uppercase font-bold mb-2 tracking-wider">Developer Tools</p>
                 <Button 
                   variant="outline" 
                   size="sm"
                   className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 gap-2 h-8 text-xs disabled:opacity-50"
                   onClick={async (e) => {
                     if (!id) return;
                     const btn = e.currentTarget;
                     if (btn.disabled) return;
                     
                     btn.disabled = true;
                     setIsSimulating(true);
                     const originalText = btn.innerHTML;
                     btn.innerHTML = '<span class="flex items-center gap-1"><svg class="animate-spin h-3 w-3 text-blue-600" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Simulating...</span>';
                     
                     try {
                       await apiClient.post('/api/payments/mpesa/simulate', {
                         amount: paymentStatus.amount,
                         phone: '254700000000',
                         orderNumber: paymentStatus.orderGroup?.paymentReference || paymentStatus.orderGroup?.orderNumber,
                         mock: true
                       });
                       
                       btn.innerHTML = 'Sent! Awaiting confirmation...';
                       
                       // Polling for simulation success (backend mock takes ~2s)
                       let checks = 0;
                       const checkInterval = setInterval(async () => {
                         checks++;
                         try {
                           const { checkOrderStatus } = usePaymentStore.getState();
                           const status = await checkOrderStatus(id);
                           if (status.status === 'PAID') {
                             clearInterval(checkInterval);
                             btn.innerHTML = 'Success!';
                             // Component will re-render automatically because store updated
                           } else if (checks > 10) { // Timeout after 10 checks (10s)
                             clearInterval(checkInterval);
                             btn.innerHTML = 'Still pending...';
                             setTimeout(() => { 
                               btn.innerHTML = originalText; 
                               btn.disabled = false;
                               setIsSimulating(false);
                             }, 2000);
                           }
                         } catch (err) {
                           console.error('Check failed', err);
                         }
                       }, 1000);
                     } catch (err) {
                       console.error('Simulation failed', err);
                       btn.innerHTML = 'Failed';
                       setIsSimulating(false);
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
                onClick={() => navigate(`/account/orders?id=${paymentStatus.orderGroup?.id}`)}
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
