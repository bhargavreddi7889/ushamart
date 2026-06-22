import { getCart, getCartSummary } from "@/actions/cart";
import { CartPageClient } from "@/components/cart/cart-page-client";

export const metadata = { title: "Shopping Cart" };

export default async function CartPage() {
  const [cart, summary] = await Promise.all([getCart(), getCartSummary()]);

  return (
    <div className="py-6">
      <h1 className="mb-6 text-2xl font-bold">Shopping Cart</h1>
      <CartPageClient cart={cart} summary={summary} />
    </div>
  );
}
