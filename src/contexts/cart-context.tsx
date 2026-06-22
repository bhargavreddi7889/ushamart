"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface CartSummary {
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  freeDeliveryThreshold: number;
}

interface CartContextValue {
  summary: CartSummary;
  refreshCart: () => Promise<void>;
}

const defaultSummary: CartSummary = {
  itemCount: 0,
  subtotal: 0,
  deliveryCharge: 0,
  discount: 0,
  total: 0,
  freeDeliveryThreshold: 499,
};

const CartContext = createContext<CartContextValue>({
  summary: defaultSummary,
  refreshCart: async () => {},
});

export function CartProvider({
  children,
  initialSummary,
}: {
  children: React.ReactNode;
  initialSummary?: CartSummary;
}) {
  const router = useRouter();
  const [summary, setSummary] = useState<CartSummary>(initialSummary ?? defaultSummary);

  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { cache: "no-store" });
      const data = await res.json();
      setSummary(data);
      router.refresh();
    } catch {
      // keep existing summary
    }
  }, [router]);

  useEffect(() => {
    if (initialSummary) setSummary(initialSummary);
  }, [initialSummary]);

  return (
    <CartContext.Provider value={{ summary, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
