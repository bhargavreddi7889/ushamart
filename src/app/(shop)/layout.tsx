import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BottomNavWrapper } from "@/components/layout/bottom-nav-wrapper";
import { CartProvider } from "@/contexts/cart-context";
import { getCartSummary } from "@/actions/cart";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cartSummary = await getCartSummary().catch(() => ({
    itemCount: 0,
    subtotal: 0,
    deliveryCharge: 0,
    discount: 0,
    total: 0,
    freeDeliveryThreshold: 499,
  }));

  return (
    <CartProvider initialSummary={cartSummary}>
      <Header />
      <main className="mx-auto min-h-screen max-w-7xl px-3 pb-24 sm:px-4 md:pb-10">
        {children}
      </main>
      <Footer />
      <BottomNavWrapper />
    </CartProvider>
  );
}
