import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useCartStore } from "../stores/cartStore";
import { useOrderStore } from "../stores/orderStore";
import type { OrderAddress } from "../types/order";

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
  const createOrder = useOrderStore((s) => s.createOrder);

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

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);

    try {
      // Group items by vendor
      const itemsByVendor = new Map<string, typeof items>();
      for (const item of items) {
        const vendorItems = itemsByVendor.get(item.vendorId) ?? [];
        vendorItems.push(item);
        itemsByVendor.set(item.vendorId, vendorItems);
      }

      // Create order for the first vendor (simplified - in production, create separate orders per vendor)
      const firstVendor = items[0].vendorId;
      const vendorItems = itemsByVendor.get(firstVendor) || [];

      // Ensure all shipping address fields are populated
      const shippingAddress: OrderAddress = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        street: formData.estate.trim(),
        city: formData.city.trim(),
        state: formData.city.trim(), // Use city as state for Kenya
        zipCode: "00100", // Default Nairobi zip code
      };

      const orderData = {
        vendorId: firstVendor,
        items: vendorItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod,
      };

      console.log(
        "Creating order with data:",
        JSON.stringify(orderData, null, 2),
      );

      await createOrder(orderData);

      // Clear cart after successful order
      await clearCart();
      toast.success("Payment successful! Order placed.");
      navigate("/orders");
    } catch (error) {
      console.error("Order creation error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to place order. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
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
