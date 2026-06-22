import { NextResponse } from "next/server";
import { getCartSummary } from "@/actions/cart";

export async function GET() {
  const summary = await getCartSummary().catch(() => ({
    itemCount: 0,
    subtotal: 0,
    deliveryCharge: 0,
    discount: 0,
    total: 0,
    freeDeliveryThreshold: 499,
  }));

  return NextResponse.json(summary);
}
