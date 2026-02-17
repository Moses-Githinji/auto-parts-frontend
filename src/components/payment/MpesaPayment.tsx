import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { usePaymentStore } from "../../stores/paymentStore";
import { Loader2, Smartphone } from "lucide-react";

interface MpesaPaymentProps {
  orderGroupId: string;
  amount: number;
  onSuccess: (transactionId: string) => void;
  onError: (error: string) => void;
}

export function MpesaPayment({
  orderGroupId,
  amount,
  onSuccess,
  onError,
}: MpesaPaymentProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { initiatePayment, error, clearError } = usePaymentStore();

  // Format phone number as user types
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
    
    // Limit to 10 digits
    if (value.length > 10) {
      value = value.slice(0, 10);
    }
    
    setPhoneNumber(value);
    clearError();
  };

  // Validate phone number format
  const isValidPhone = (phone: string): boolean => {
    // Must be 10 digits starting with 07 or 01
    return /^(07|01)\d{8}$/.test(phone);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValidPhone(phoneNumber)) {
      onError("Please enter a valid phone number (07XXXXXXXX or 01XXXXXXXX)");
      return;
    }

    try {
      setIsProcessing(true);
      const response = await initiatePayment(
        orderGroupId, 
        "mpesa", 
        phoneNumber, 
        import.meta.env.DEV
      );
      
      // Navigate to payment status page
      onSuccess(response.transactionId);
    } catch (err: any) {
      onError(err.message || "Failed to initiate M-Pesa payment");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-green-200 bg-green-50 dark:bg-green-900/20 p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-green-600 p-2">
            <Smartphone className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-200">
              Pay with M-Pesa
            </h3>
            <p className="text-sm text-green-700 dark:text-green-300">
              You'll receive an STK push on your phone
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-dark-text">
            M-Pesa Phone Number
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500 dark:text-dark-textMuted">
              +254
            </span>
            <Input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="712345678"
              className="pl-14"
              disabled={isProcessing}
              maxLength={10}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-dark-textMuted">
            Enter your Safaricom number (07XX or 01XX)
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-3">
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

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
          className="w-full bg-green-600 text-white hover:bg-green-700"
          disabled={!isValidPhone(phoneNumber) || isProcessing}
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
      </form>

      <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-slate-50 dark:bg-dark-bgLight p-4">
        <h4 className="mb-2 text-sm font-semibold text-slate-900 dark:text-dark-text">
          How it works:
        </h4>
        <ol className="space-y-1 text-xs text-slate-600 dark:text-dark-textMuted">
          <li>1. Enter your M-Pesa phone number</li>
          <li>2. Click "Pay" to receive an STK push</li>
          <li>3. Enter your M-Pesa PIN on your phone</li>
          <li>4. Wait for confirmation</li>
        </ol>
      </div>
    </div>
  );
}
