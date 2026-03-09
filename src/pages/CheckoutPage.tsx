import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";
import { useAuthStore } from "../stores/authStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { MpesaPayment } from "../components/payment/MpesaPayment";
import { PaystackPayment } from "../components/payment/PaystackPayment";
import { apiClient } from "../lib/apiClient";
import { Loader2, ShoppingCart, MapPin, CreditCard } from "lucide-react";

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

interface OrderGroup {
  id: string;
  orderNumber: string;
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

export function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCartStore();
  const total = useCartStore((state) => state.totalAmount());
  const { user } = useAuthStore();

  const [step, setStep] = useState<"address" | "payment">("address");
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "paystack" | null>(null);
  const [orderGroup, setOrderGroup] = useState<OrderGroup | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [outOfStockItems, setOutOfStockItems] = useState<{ name: string; available: number; requested: number }[]>([]);
  const [shippingQuote, setShippingQuote] = useState<{ fee: number; estimatedMinutes: number } | null>(null);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  const [shippingAddress, setShippingAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: user?.phone || "",
  });

  const [billingAddress, setBillingAddress] = useState<Address>({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    phone: user?.phone || "",
  });

  const [useSameAddress, setUseSameAddress] = useState(true);

  useEffect(() => {
    // Redirect if cart is empty, but ONLY if we haven't started an order yet
    if (items.length === 0 && !orderGroup && step === "address") {
      console.log("Empty cart redirect in CheckoutPage");
      navigate("/cart");
    }
  }, [items.length, orderGroup, step, navigate]);

  useEffect(() => {
    // Redirect if not logged in
    if (!user) {
      navigate("/login?redirect=/checkout");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isAddressValid(shippingAddress) && items.length > 0) {
      fetchShippingQuote();
    }
  }, [shippingAddress, items.length]);

  const fetchShippingQuote = async () => {
    try {
      setIsCalculatingShipping(true);
      setError(null);
      const response = await apiClient.post<{ fee: number; estimatedMinutes: number }>("/api/shipping/calculate", {
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        })),
        address: shippingAddress
      });
      setShippingQuote(response);
    } catch (err: any) {
      console.error("Failed to calculate shipping:", err);
      // Fallback to 0 if calculation fails, but keep error visible
      setShippingQuote({ fee: 0, estimatedMinutes: 0 });
      setError("Unable to calculate shipping for this address. Please try again or contact support.");
    } finally {
      setIsCalculatingShipping(false);
    }
  };

  const calculateTotals = () => {
    const subtotal = total;
    const shipping = shippingQuote?.fee || 0;
    const vat = Math.ceil((subtotal + shipping) * 0.16);
    const grandTotal = subtotal + shipping + vat;
    return { subtotal, shipping, vat, grandTotal };
  };

  const { subtotal, shipping, vat, grandTotal } = calculateTotals();

  const handleContinueToPayment = () => {
    if (isAddressValid(shippingAddress)) {
      setStep("payment");
    }
  };

  const handlePlaceOrder = async (selectedPaymentMethod: "mpesa" | "paystack") => {
    try {
      setIsCreatingOrder(true);
      setError(null);

      const response = await apiClient.post<{ orderGroup: OrderGroup }>("/api/orders", {
        items: items.map((item) => ({
          productId: item.productId,
          productType: "auto_part",
          quantity: item.quantity,
        })),
        shippingAddress,
        billingAddress: useSameAddress ? shippingAddress : billingAddress,
        paymentMethod: selectedPaymentMethod,
      });

      setOrderGroup(response.orderGroup);
      
      // Redirect to payment status page immediately only for M-Pesa (C2B flow)
      if (selectedPaymentMethod === "mpesa") {
        // Clear cart immediately for M-Pesa
        clearCart();
        navigate(`/payment/status/${response.orderGroup.id}`);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to place order");
      setOutOfStockItems(err.response?.data?.outOfStockItems || []);
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handlePaymentSuccess = (transactionId: string) => {
    console.log("Payment success handled in CheckoutPage for ID:", transactionId);
    clearCart();
    navigate(`/payment/status/${transactionId}`);
  };

  const handlePaymentError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // E.164 Phone format validation standard (Starts with +, followed by 10-15 numbers)
  const isValidPhone = (phone: string) => /^\+[1-9]\d{9,14}$/.test(phone);

  const isAddressValid = (address: Address): boolean => {
    return !!(address.street && address.city && address.state && address.zipCode && isValidPhone(address.phone));
  };

  const getMissingFields = (address: Address): string[] => {
    const missing = [];
    if (!address.street) missing.push("Street Address");
    if (!address.city) missing.push("City");
    if (!address.state) missing.push("County/State");
    if (!address.zipCode) missing.push("Postal Code");
    if (!address.phone) missing.push("Phone Number");
    else if (!isValidPhone(address.phone)) missing.push("Valid Phone (e.g. +254700000000)");
    return missing;
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-6xl p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-dark-text">Checkout</h1>
        <p className="text-sm text-slate-600 dark:text-dark-textMuted">
          Complete your order in {step === "address" ? "2" : "1"} step{step === "address" ? "s" : ""}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Step Indicator */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step === "address" ? "text-[#FF9900]" : "text-green-600"}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "address" ? "bg-[#FF9900]" : "bg-green-600"} text-white`}>
                {step === "payment" ? "✓" : "1"}
              </div>
              <span className="text-sm font-medium">Address</span>
            </div>
            <div className="h-px flex-1 bg-slate-200 dark:bg-dark-border" />
            <div className={`flex items-center gap-2 ${step === "payment" ? "text-[#FF9900]" : "text-slate-400"}`}>
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step === "payment" ? "bg-[#FF9900]" : "bg-slate-200 dark:bg-dark-border"} text-white`}>
                2
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
          </div>

          {/* Address Step */}
          {step === "address" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6">
                <div className="mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#FF9900]" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
                    Shipping Address
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      placeholder="Nairobi"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                      County/State <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={shippingAddress.state}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                      placeholder="Nairobi"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={shippingAddress.zipCode}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                      placeholder="00100"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      placeholder="+254712345678"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={useSameAddress}
                      onChange={(e) => setUseSameAddress(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[#FF9900] focus:ring-[#FF9900]"
                    />
                    <span className="text-sm text-slate-700 dark:text-dark-text">
                      Billing address same as shipping
                    </span>
                  </label>
                </div>
              </div>

              {!useSameAddress && (
                <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6">
                  <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-dark-text">
                    Billing Address
                  </h2>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={billingAddress.street}
                        onChange={(e) => setBillingAddress({ ...billingAddress, street: e.target.value })}
                        placeholder="123 Main Street"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                        City <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={billingAddress.city}
                        onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                        placeholder="Nairobi"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                        County/State <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={billingAddress.state}
                        onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                        placeholder="Nairobi"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                        Postal Code <span className="text-red-500">*</span>
                      </label>
                      <Input
                        value={billingAddress.zipCode}
                        onChange={(e) => setBillingAddress({ ...billingAddress, zipCode: e.target.value })}
                        placeholder="00100"
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-dark-text">
                        Phone Number <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="tel"
                        value={billingAddress.phone}
                        onChange={(e) => setBillingAddress({ ...billingAddress, phone: e.target.value })}
                        placeholder="+254712345678"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
                  {outOfStockItems.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {outOfStockItems.map((item, idx) => (
                        <li key={idx} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                          <span className="font-medium">{item.name}</span>
                          {item.available === 0
                            ? " — currently out of stock"
                            : ` — only ${item.available} in stock (you requested ${item.requested})`
                          }
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Button
                  className="w-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90"
                  onClick={handleContinueToPayment}
                  disabled={
                    !isAddressValid(shippingAddress) ||
                    (!useSameAddress && !isAddressValid(billingAddress))
                  }
                >
                  Continue to Payment
                </Button>

                {(!isAddressValid(shippingAddress) || (!useSameAddress && !isAddressValid(billingAddress))) && (
                  <p className="text-xs text-slate-500 italic text-center">
                    Please provide {getMissingFields(shippingAddress).join(", ")}
                    {!useSameAddress && isAddressValid(shippingAddress) && ` for billing: ${getMissingFields(billingAddress).join(", ")}`}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Payment Step */}
          {step === "payment" && (
            <div className="space-y-6">
              <div className="rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6">
                <div className="mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-[#FF9900]" />
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
                    Select Payment Method
                  </h2>
                </div>

                {!orderGroup && (
                  <>
                    <div className="grid gap-4 md:grid-cols-2">
                      <button
                        onClick={() => setPaymentMethod("mpesa")}
                        className={`rounded-lg border-2 p-4 text-left transition-all ${
                          paymentMethod === "mpesa"
                            ? "border-green-600 bg-green-50 dark:bg-green-900/20"
                            : "border-slate-200 dark:border-dark-border hover:border-slate-300"
                        }`}
                      >
                        <div className="mb-2 text-2xl">📱</div>
                        <h3 className="font-semibold text-slate-900 dark:text-dark-text">M-Pesa</h3>
                        <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                          Pay with your Safaricom number
                        </p>
                      </button>

                      <button
                        onClick={() => setPaymentMethod("paystack")}
                        className={`rounded-lg border-2 p-4 text-left transition-all ${
                          paymentMethod === "paystack"
                            ? "border-teal-600 bg-teal-50 dark:bg-teal-900/20"
                            : "border-slate-200 dark:border-dark-border hover:border-slate-300"
                        }`}
                      >
                        <div className="mb-2 text-2xl">⚡</div>
                        <h3 className="font-semibold text-slate-900 dark:text-dark-text">Paystack</h3>
                        <p className="text-xs text-slate-600 dark:text-dark-textMuted">
                          Secure Card / Mobile Payment
                        </p>
                      </button>
                    </div>

                    {paymentMethod && (
                      <div className="mt-8 rounded-lg border border-[#FF9900]/20 bg-[#FF9900]/5 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <h4 className="font-semibold text-slate-900 dark:text-dark-text mb-2">Order Review</h4>
                        <div className="space-y-1 text-sm text-slate-600 dark:text-dark-textMuted">
                          <div className="flex justify-between">
                            <span>Items:</span>
                            <span className="font-medium">{items.length} product(s)</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Payment Method:</span>
                            <span className="font-medium capitalize text-[#FF9900]">{paymentMethod}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 dark:border-dark-border mt-2 pt-2">
                             <span>Subtotal:</span>
                             <span className="font-medium">KES {subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                             <span>Shipping:</span>
                             <span className="font-medium">KES {shipping.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                             <span>VAT (16%):</span>
                             <span className="font-medium">KES {vat.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-200 dark:border-dark-border mt-2 pt-2 text-slate-900 dark:text-dark-text font-bold">
                            <span>Total to Pay:</span>
                            <span>KES {grandTotal.toLocaleString()}</span>
                          </div>
                        </div>
                        {paymentMethod === "mpesa" && (
                          <p className="mt-4 text-xs bg-white dark:bg-dark-surface p-2 rounded border border-slate-200 dark:border-dark-border">
                            <span className="font-bold text-green-600">Note:</span> After clicking below, you'll be shown manual Paybill instructions to complete your payment.
                          </p>
                        )}
                      </div>
                    )}

                    <div className="mt-6">
                      <Button
                        className="w-full bg-[#FF9900] text-white hover:bg-[#FF9900]/90 h-12 text-lg font-bold shadow-md"
                        onClick={() => paymentMethod && handlePlaceOrder(paymentMethod)}
                        disabled={!paymentMethod || isCreatingOrder}
                      >
                        {isCreatingOrder ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Placing Order...
                          </>
                        ) : (
                          `Place Order & Pay KES ${grandTotal.toLocaleString()}`
                        )}
                      </Button>
                    </div>
                  </>
                )}


                {/* Mpesa Payment Element (Shown after order creation) */}
                {orderGroup && paymentMethod === "mpesa" && (
                  <div className="mt-8 pt-8 border-t border-slate-200 dark:border-dark-border">
                    <MpesaPayment
                      orderGroupId={orderGroup.id}
                      amount={orderGroup.totalAmount}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </div>
                )}

                {/* Paystack Payment Element (Shown after order creation) */}
                {orderGroup && paymentMethod === "paystack" && (
                  <div className="mt-8 pt-8 border-t border-slate-200 dark:border-dark-border">
                    <PaystackPayment
                      orderGroupId={orderGroup.id}
                      orderNumber={orderGroup.orderNumber}
                      amount={orderGroup.totalAmount}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </div>
                )}
              </div>


              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-900/20 p-4">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400">{error}</p>
                  {outOfStockItems.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {outOfStockItems.map((item, idx) => (
                        <li key={idx} className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                          <span className="font-medium">{item.name}</span>
                          {item.available === 0
                            ? " — currently out of stock"
                            : ` — only ${item.available} in stock (you requested ${item.requested})`
                          }
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className={`lg:col-span-1 transition-all duration-500 ${orderGroup ? "opacity-0 invisible pointer-events-none" : "opacity-100 visible"}`}>
          <div className="sticky top-4 rounded-lg border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-[#FF9900]" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-dark-text">
                Order Summary
              </h2>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-dark-text">{item.name}</p>
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

            <div className="my-4 border-t border-slate-200 dark:border-dark-border" />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-dark-textMuted">Subtotal</span>
                <span className="font-medium text-slate-900 dark:text-dark-text">
                  KES {subtotal.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-dark-textMuted">Shipping</span>
                <span className="font-medium text-slate-900 dark:text-dark-text">
                  {isCalculatingShipping ? (
                    <Loader2 className="h-3 w-3 animate-spin inline mr-1" />
                  ) : shippingQuote ? (
                    `KES ${shipping.toLocaleString()}`
                  ) : (
                    "Calculated at delivery"
                  )}
                </span>
              </div>
              {shippingQuote && (
                <div className="flex justify-between text-[10px] text-green-600 font-medium">
                  <span>Estimated Delivery</span>
                  <span>{shippingQuote.estimatedMinutes > 60 
                    ? `~${Math.round(shippingQuote.estimatedMinutes / 60)} hours` 
                    : `~${shippingQuote.estimatedMinutes} mins`}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-dark-textMuted">VAT (16%)</span>
                <span className="font-medium text-slate-900 dark:text-dark-text">
                  KES {vat.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="my-4 border-t border-slate-200 dark:border-dark-border" />

            <div className="flex justify-between">
              <span className="text-lg font-semibold text-slate-900 dark:text-dark-text">Total</span>
              <span className="text-lg font-bold text-[#FF9900]">
                KES {grandTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
