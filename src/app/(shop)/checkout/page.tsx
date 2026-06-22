import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getCartSummary } from "@/actions/cart";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/checkout");
  }

  const [summary, addresses] = await Promise.all([
    getCartSummary(),
    db.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    }),
  ]);

  if (summary.itemCount === 0) {
    redirect("/cart");
  }

  return (
    <div className="py-6">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      <CheckoutClient
        summary={summary}
        addresses={addresses}
        user={{ name: session.user.name || "", phone: session.user.phone }}
      />
    </div>
  );
}
