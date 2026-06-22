"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { addToCart } from "@/actions/cart";
import { useCart } from "@/contexts/cart-context";
import { toast } from "sonner";
import { useState } from "react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    mrp: number;
    sellingPrice: number;
    discountPercentage: number;
    stock: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [loading, setLoading] = useState(false);
  const { refreshCart } = useCart();

  async function handleAddToCart() {
    setLoading(true);
    const result = await addToCart(product.id);
    setLoading(false);
    if (result.success) {
      toast.success(result.message || "Added to cart");
      await refreshCart();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="product-card-hover group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white">
      <Link
        href={`/products/${product.slug}`}
        className="relative aspect-square overflow-hidden bg-gradient-to-b from-gray-50 to-white"
      >
        {product.discountPercentage > 0 && (
          <Badge className="absolute left-2 top-2 z-10 shadow-sm" variant="secondary">
            {product.discountPercentage}% OFF
          </Badge>
        )}
        <button
          type="button"
          className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2 opacity-0 shadow-sm backdrop-blur transition-all group-hover:opacity-100 hover:scale-110"
          onClick={(e) => e.preventDefault()}
          aria-label="Add to wishlist"
        >
          <Heart className="h-4 w-4 text-gray-400 hover:text-red-500" />
        </button>
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="product-image-pop object-contain p-4"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-300">No Image</div>
        )}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-[#006837]/90 to-transparent p-3 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <span className="flex items-center justify-center gap-1 text-xs font-semibold text-white">
            <Zap className="h-3.5 w-3.5" /> Quick View
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <Link href={`/products/${product.slug}`}>
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors group-hover:text-[#006837] sm:text-base">
            {product.name}
          </h3>
        </Link>

        <div className="mt-2 flex flex-wrap items-baseline gap-2">
          <span className="text-base font-bold text-[#006837] sm:text-lg">
            {formatPrice(product.sellingPrice)}
          </span>
          {product.mrp > product.sellingPrice && (
            <span className="text-xs text-gray-400 line-through sm:text-sm">
              {formatPrice(product.mrp)}
            </span>
          )}
        </div>

        {product.stock > 0 && product.stock < 10 && (
          <p className="mt-1 text-[10px] font-medium text-amber-600 sm:text-xs">Only {product.stock} left!</p>
        )}

        <Button
          size="sm"
          className="mt-3 w-full transition-transform active:scale-95 sm:mt-4"
          onClick={handleAddToCart}
          disabled={loading || product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock === 0 ? "Out of Stock" : loading ? "Adding..." : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
}
