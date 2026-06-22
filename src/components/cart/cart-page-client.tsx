"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { updateCartItemQuantity, removeFromCart, applyCoupon, type getCart } from "@/actions/cart";
import type { CartSummary } from "@/types";
import { useCart } from "@/contexts/cart-context";
import { toast } from "sonner";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface CartPageClientProps {
  cart: Awaited<ReturnType<typeof getCart>>;
  summary: CartSummary;
}

export function CartPageClient({ cart, summary }: CartPageClientProps) {
  const router = useRouter();
  const { refreshCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleQuantityChange(itemId: string, quantity: number) {
    const result = await updateCartItemQuantity(itemId, quantity);
    if (!result.success) toast.error(result.error);
    else {
      await refreshCart();
      router.refresh();
    }
  }

  async function handleRemove(itemId: string) {
    const result = await removeFromCart(itemId);
    if (result.success) {
      await refreshCart();
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleApplyCoupon() {
    setLoading(true);
    const result = await applyCoupon(couponCode);
    setLoading(false);
    if (result.success && result.data) {
      setDiscount(result.data.discount);
      toast.success("Coupon applied");
    } else if (!result.success) {
      toast.error(result.error);
    }
  }

  const total = summary.subtotal + summary.deliveryCharge - discount;

  if (cart.items.length === 0) {
    return (
      <div className="rounded-xl border bg-white p-12 text-center">
        <p className="text-gray-500">Your cart is empty</p>
        <Link href="/products">
          <Button className="mt-4">Start Shopping</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {cart.items.map((item) => (
          <div key={item.id} className="flex gap-4 rounded-xl border bg-white p-4">
            <Link href={`/products/${item.product.slug}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-50">
              {item.product.images[0] && (
                <Image src={item.product.images[0]} alt={item.product.name} fill className="object-contain p-1" />
              )}
            </Link>
            <div className="flex flex-1 flex-col">
              <Link href={`/products/${item.product.slug}`} className="font-medium hover:text-[#006837]">
                {item.product.name}
              </Link>
              <p className="text-sm font-semibold text-[#006837]">
                {formatPrice(item.product.sellingPrice)}
              </p>
              <div className="mt-auto flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemove(item.id)}>
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            <div className="text-right font-semibold">
              {formatPrice(item.product.sellingPrice * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div className="h-fit rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-bold">Order Summary</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Subtotal ({summary.itemCount} items)</span>
            <span>{formatPrice(summary.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{summary.deliveryCharge === 0 ? "FREE" : formatPrice(summary.deliveryCharge)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon Discount</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2 text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>

        {summary.deliveryCharge > 0 && (
          <p className="mt-2 text-xs text-gray-500">
            Add {formatPrice(summary.freeDeliveryThreshold - summary.subtotal)} more for free delivery
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Coupon code"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          />
          <Button variant="outline" onClick={handleApplyCoupon} disabled={loading}>
            Apply
          </Button>
        </div>

        <Link href="/checkout" className="mt-4 block">
          <Button className="w-full" size="lg">
            Proceed to Checkout
          </Button>
        </Link>
      </div>
    </div>
  );
}
