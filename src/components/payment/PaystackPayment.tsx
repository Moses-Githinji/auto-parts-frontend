import { Button } from "../ui/button";
import { usePaymentStore } from "../../stores/paymentStore";
import { useAuthStore } from "../../stores/authStore";
import { Loader2, CreditCard } from "lucide-react";
import { useState } from 'react';

interface PaystackPaymentProps {
  orderGroupId: string;
  orderNumber: string;
  amount: number;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export function PaystackPayment({
  orderGroupId,
  orderNumber,
  amount,
  onSuccess,
  onError
}: PaystackPaymentProps) {
  const { user } = useAuthStore();
  const { initiatePayment, verifyPaystackPayment } = usePaymentStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // Paystack config
  const config = {
    reference: orderNumber, // Using backend-provided orderNumber as reference
    email: user?.email || '',
    amount: Math.round(amount * 100), // Convert to subunits (cents)
    key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_sandbox_key",
    currency: 'KES',
    metadata: {
      orderGroupId,
      custom_fields: [
        {
          display_name: "Customer Name",
          variable_name: "customer_name",
          value: `${user?.firstName} ${user?.lastName}`
        }
      ]
    }
  };


  const handlePayment = async () => {
    try {
      setIsProcessing(true);
      
      // 1. Mark the transaction as pending on the backend & get the Public Key
      const response = await initiatePayment(orderGroupId, "paystack");
      
      const dynamicConfig = {
        ...config,
        key: response.publicKey || config.key,
        reference: response.reference || response.transactionId || config.reference,
        email: response.email || config.email,
        amount: response.amount ? Math.round(response.amount * 100) : config.amount
      };

      // 2. Open Paystack Popup with the dynamic config
      const handler = (window as any).PaystackPop.setup({
        ...dynamicConfig,
        callback: (reference: any) => {
          console.log("Paystack Reference:", reference);
          
          // Use an internal async function to handle verification
          const verify = async () => {
            try {
              // 3. Verify on backend
              const result = await verifyPaystackPayment(reference.reference);
              if (result.success) {
                console.log("Paystack verification success, calling onSuccess with:", orderGroupId);
                onSuccess(orderGroupId);
              } else {
                onError(result.message || "Payment verification failed");
              }
            } catch (err: any) {
              onError(err.message || "Failed to verify payment on server");
            } finally {
              setIsProcessing(false);
            }
          };
          
          verify();
        },
        onClose: () => {
          console.log("Paystack closed");
          setIsProcessing(false);
        }
      });

      handler.openIframe();
    } catch (err: any) {
      onError(err.message || "Failed to initiate payment");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-teal-200 bg-teal-50 dark:bg-teal-900/20 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-teal-600 p-2 text-white">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold text-teal-900 dark:text-teal-200">
              Pay with Card (Paystack)
            </h3>
            <p className="text-sm text-teal-700 dark:text-teal-300">
              Securely powered by Paystack
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg bg-slate-50 dark:bg-dark-bgLight p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-dark-textMuted">
            Amount Due
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-dark-text">
            KES {amount.toLocaleString()}
          </span>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        className="w-full bg-teal-600 text-white hover:bg-teal-700 h-10 shadow-sm transition-colors"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Initializing...
          </>
        ) : (
          `Secure Checkout: KES ${amount.toLocaleString()}`
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 dark:text-dark-textMuted mt-2 italic">
        🔒 Encrypted & Locked 
      </div>
    </div>
  );
}
