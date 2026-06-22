"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { placeOrder } from "@/actions/orders";
import { toast } from "sonner";

interface CheckoutClientProps {
  summary: {
    subtotal: number;
    deliveryCharge: number;
    total: number;
    itemCount: number;
  };
  addresses: {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }[];
  user: { name: string; phone?: string | null };
}

export function CheckoutClient({ summary, addresses, user }: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0);
  const [selectedAddress, setSelectedAddress] = useState(
    addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "UPI">("COD");
  const [form, setForm] = useState({
    name: user.name,
    phone: user.phone || "",
    address: "",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "",
    notes: "",
    couponCode: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    if (!useNewAddress && selectedAddress) {
      formData.set("addressId", selectedAddress);
    } else {
      formData.set("name", form.name);
      formData.set("phone", form.phone);
      formData.set("address", form.address);
      formData.set("city", form.city);
      formData.set("state", form.state);
      formData.set("pincode", form.pincode);
    }
    formData.set("paymentMethod", paymentMethod);
    formData.set("notes", form.notes);
    if (form.couponCode) formData.set("couponCode", form.couponCode);

    const result = await placeOrder(formData);
    setLoading(false);

    if (result.success && result.data) {
      toast.success("Order placed successfully!");
      router.push(`/orders/${result.data.orderId}`);
    } else if (!result.success) {
      toast.error(result.error);
    } else {
      toast.error("Failed to place order");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {addresses.length > 0 && (
              <div className="space-y-2">
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 ${
                      !useNewAddress && selectedAddress === addr.id
                        ? "border-[#006837] bg-green-50"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="address"
                      checked={!useNewAddress && selectedAddress === addr.id}
                      onChange={() => {
                        setUseNewAddress(false);
                        setSelectedAddress(addr.id);
                      }}
                      className="mt-1"
                    />
                    <div>
                      <p className="font-medium">{addr.name}</p>
                      <p className="text-sm text-gray-600">
                        {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                      </p>
                      <p className="text-sm text-gray-500">{addr.phone}</p>
                    </div>
                  </label>
                ))}
                <button
                  type="button"
                  onClick={() => setUseNewAddress(true)}
                  className="text-sm text-[#006837] hover:underline"
                >
                  + Add new address
                </button>
              </div>
            )}

            {(useNewAddress || addresses.length === 0) && (
              <div className="grid gap-3 sm:grid-cols-2">
                <Input placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
                <Input placeholder="Mobile Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
                <div className="sm:col-span-2">
                  <Textarea placeholder="Full Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
                </div>
                <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
                <Input placeholder="Pincode" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(["COD", "UPI"] as const).map((method) => (
              <label
                key={method}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 ${
                  paymentMethod === method ? "border-[#006837] bg-green-50" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === method}
                  onChange={() => setPaymentMethod(method)}
                />
                <div>
                  <p className="font-medium">
                    {method === "COD" ? "Cash on Delivery" : "UPI Payment"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {method === "COD"
                      ? "Pay when your order is delivered"
                      : "Pay via UPI (GPay, PhonePe, Paytm)"}
                  </p>
                </div>
              </label>
            ))}
          </CardContent>
        </Card>

        <Textarea
          placeholder="Order notes (optional)"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Subtotal ({summary.itemCount} items)</span>
            <span>{formatPrice(summary.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Delivery</span>
            <span>{summary.deliveryCharge === 0 ? "FREE" : formatPrice(summary.deliveryCharge)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>Total</span>
            <span>{formatPrice(summary.total)}</span>
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Placing Order..." : "Place Order"}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
