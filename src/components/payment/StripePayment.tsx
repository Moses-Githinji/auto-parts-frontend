import { useEffect, useState } from "react";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "../ui/button";
import { usePaymentStore } from "../../stores/paymentStore";
import { Loader2, CreditCard } from "lucide-react";

interface StripePaymentProps {
  orderGroupId: string;
  amount: number;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

// This will be loaded from environment variable
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ""
);

function CheckoutForm({ 
  orderGroupId, 
  amount, 
  onSuccess, 
  onError 
}: StripePaymentProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/status/${orderGroupId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        onError(error.message || "Payment failed");
        setIsProcessing(false);
      } else {
        // Payment succeeded
        onSuccess(orderGroupId);
      }
    } catch (err: any) {
      onError(err.message || "An error occurred during payment");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50 dark:bg-blue-900/20 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-600 p-2">
            <CreditCard className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-200">
              Pay with Card
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Secure payment via Stripe
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-bgLight p-4">
        <PaymentElement />
      </div>

      <div className="rounded-lg bg-slate-50 dark:bg-dark-bgLight p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600 dark:text-dark-textMuted">
            Amount to Pay
          </span>
          <span className="text-lg font-bold text-slate-900 dark:text-dark-text">
            KES {amount.toLocaleString()}
          </span>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-blue-600 text-white hover:bg-blue-700"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay KES ${amount.toLocaleString()}`
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-dark-textMuted">
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
        </svg>
        Secured by Stripe
      </div>
    </form>
  );
}

export function StripePayment(props: StripePaymentProps) {
  const [clientSecret, setClientSecret] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const { initiatePayment, error } = usePaymentStore();

  useEffect(() => {
    // Initiate Stripe payment to get client secret
    const initPayment = async () => {
      try {
        setIsLoading(true);
        const response = await initiatePayment(props.orderGroupId, "stripe");
        
        if (response.clientSecret) {
          setClientSecret(response.clientSecret);
        } else {
          props.onError("Failed to initialize payment");
        }
      } catch (err: any) {
        props.onError(err.message || "Failed to initialize payment");
      } finally {
        setIsLoading(false);
      }
    };

    initPayment();
  }, [props.orderGroupId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !clientSecret) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
        <p className="text-sm text-red-700 dark:text-red-400">
          {error || "Failed to load payment form"}
        </p>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe" as const,
      variables: {
        colorPrimary: "#2563eb",
      },
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm {...props} />
    </Elements>
  );
}
