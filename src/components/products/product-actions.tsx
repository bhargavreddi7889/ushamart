"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addToCart } from "@/actions/cart";
import { useCart } from "@/contexts/cart-context";
import { toast } from "sonner";

interface ProductActionsProps {
  productId: string;
  inStock: boolean;
}

export function ProductActions({ productId, inStock }: ProductActionsProps) {
  const router = useRouter();
  const { refreshCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);

  async function handleAddToCart() {
    setLoading(true);
    const result = await addToCart(productId, quantity);
    setLoading(false);
    if (result.success) {
      toast.success("Added to cart");
      await refreshCart();
    } else {
      toast.error(result.error);
    }
  }

  async function handleBuyNow() {
    setLoading(true);
    const result = await addToCart(productId, quantity);
    if (result.success) {
      await refreshCart();
      router.push("/checkout");
    } else {
      toast.error(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Quantity:</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={!inStock}
          >
            -
          </Button>
          <Input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-16 text-center"
            disabled={!inStock}
          />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setQuantity(quantity + 1)}
            disabled={!inStock}
          >
            +
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          className="flex-1"
          onClick={handleAddToCart}
          disabled={!inStock || loading}
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </Button>
        <Button
          variant="secondary"
          className="flex-1"
          onClick={handleBuyNow}
          disabled={!inStock || loading}
        >
          <Zap className="h-4 w-4" />
          Buy Now
        </Button>
      </div>
    </div>
  );
}
