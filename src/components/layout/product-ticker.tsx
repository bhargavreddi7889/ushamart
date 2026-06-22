"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

interface TickerProduct {
  id: string;
  name: string;
  slug: string;
  images: string[];
  sellingPrice: number;
}

export function ProductTicker({ products }: { products: TickerProduct[] }) {
  if (products.length === 0) return null;

  const items = [...products, ...products];

  return (
    <div className="relative overflow-hidden border-t border-green-100/80 bg-gradient-to-r from-green-50/40 via-white to-orange-50/30">
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-12 bg-gradient-to-r from-white to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-white to-transparent" />
      <div className="flex animate-scroll-products py-1.5">
        {items.map((product, i) => (
          <Link
            key={`${product.id}-${i}`}
            href={`/products/${product.slug}`}
            className="pointer-events-auto mx-2 flex shrink-0 items-center gap-2 rounded-lg border border-gray-100 bg-white px-2.5 py-1 shadow-sm transition-transform hover:scale-105"
          >
            <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md bg-gray-50">
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain p-0.5"
                  sizes="32px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs">📦</div>
              )}
            </div>
            <div className="min-w-0">
              <p className="max-w-[140px] truncate text-xs font-semibold text-gray-800">
                {product.name}
              </p>
              <p className="text-[10px] font-bold text-[#006837]">
                {formatPrice(product.sellingPrice)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
