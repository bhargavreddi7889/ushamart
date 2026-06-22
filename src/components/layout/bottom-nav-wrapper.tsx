"use client";

import { BottomNav } from "@/components/layout/bottom-nav";
import { useCart } from "@/contexts/cart-context";

export function BottomNavWrapper() {
  const { summary } = useCart();
  return <BottomNav cartCount={summary.itemCount} />;
}
