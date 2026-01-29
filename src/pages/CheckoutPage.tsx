import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useCartStore } from "../stores/cartStore";
import { useOrderStore } from "../stores/orderStore";
import type { Order } from "../types/order";

const PAYMENT_METHODS = [
  { id: "mpesa-stk", label: "M-Pesa STK" },
  { id: "paybill-till", label: "Paybill / Till" },
  { id: "card", label: "Card" },
  { id: "bank-transfer", label: "Bank transfer" },
] as const;

export function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore((s) => s.items);
  const totalAmount = useCartStore((s) => s.totalAmount());
  const clearCart = useCartStore((s) => s.clearCart);
  const addOrder = useOrderStore((s) => s.addOrder);

  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>(
    PAYMENT_METHODS[0].id,
  );
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    city: "",
    estate: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const SHIPPING_COST = 350;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.estate.trim())
      newErrors.estate = "Estate/Landmark is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsProcessing(true);

    // Mock payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create order
    const order: Order = {
      id: crypto.randomUUID(),
      items: items.map((item) => ({
        id: item.id,
        partName: item.partName,
        partNumber: item.partNumber,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        currency: item.currency,
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        fitmentVehicle: item.fitmentVehicle,
      })),
      totalAmount: totalAmount + SHIPPING_COST,
      shippingAddress: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        estate: formData.estate,
      },
      paymentMethod:
        PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label ??
        paymentMethod,
      orderDate: new Date().toISOString(),
      status: "processing",
    };

    addOrder(order);
    clearCart();
    toast.success("Payment successful! Order placed.");
    navigate("/orders");
    setIsProcessing(false);
  };

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-slate-900">Checkout</h1>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600">
          <p className="mb-4">Your cart is empty.</p>
          <Button onClick={() => navigate("/search")}>Browse parts</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-xs">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Checkout</h1>
        <Badge variant="outline">Mocked payment & logistics integration</Badge>
      </header>

      <section className="grid gap-4 md:grid-cols-[1.4fr,1fr]">
        <div className="space-y-3">
          <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Shipping address
            </h2>
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <Input
                  placeholder="First name *"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                />
                {errors.firstName && (
                  <p className="text-[10px] text-red-600 mt-0.5">
                    {errors.firstName}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Last name *"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                />
                {errors.lastName && (
                  <p className="text-[10px] text-red-600 mt-0.5">
                    {errors.lastName}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Phone (M-Pesa) *"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
                {errors.phone && (
                  <p className="text-[10px] text-red-600 mt-0.5">
                    {errors.phone}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
                {errors.email && (
                  <p className="text-[10px] text-red-600 mt-0.5">
                    {errors.email}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="City / Town *"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                />
                {errors.city && (
                  <p className="text-[10px] text-red-600 mt-0.5">
                    {errors.city}
                  </p>
                )}
              </div>
              <div>
                <Input
                  placeholder="Estate / Landmark *"
                  name="estate"
                  value={formData.estate}
                  onChange={handleInputChange}
                />
                {errors.estate && (
                  <p className="text-[10px] text-red-600 mt-0.5">
                    {errors.estate}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Payment method
            </h2>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS.map((method) => (
                <Badge
                  key={method.id}
                  variant={paymentMethod === method.id ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setPaymentMethod(method.id)}
                >
                  {method.label}
                </Badge>
              ))}
            </div>
            <p className="mt-1 text-[11px] text-slate-600">
              In this frontend, we will call your Render API endpoints that
              initiate payment and poll status; here it is shown as a stub.
            </p>
          </div>
        </div>

        <aside className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Order summary
          </h2>
          <div className="space-y-1 text-[11px] text-slate-700">
            <div className="flex justify-between">
              <span>Items total</span>
              <span>KES {totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>KES {SHIPPING_COST.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Platform fee</span>
              <span>KES 0</span>
            </div>
            <div className="mt-1 flex justify-between border-t border-slate-200 pt-2 text-xs font-semibold">
              <span>Total</span>
              <span>KES {(totalAmount + SHIPPING_COST).toLocaleString()}</span>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={handlePlaceOrder}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : "Place order"}
          </Button>
          <p className="text-[11px] text-slate-600">
            Placing an order will call your backend to create a multi-vendor
            order, split vendor orders, and create payment & shipment records.
          </p>
        </aside>
      </section>
    </div>
  );
}
