"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getOrCreateCart } from "@/lib/cart-session";
import { getStoreSettings } from "@/lib/store-settings";
import { serializeDecimal } from "@/lib/utils";
import type { ActionResult, CartSummary } from "@/types";

export async function getCart() {
  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id);
  return serializeDecimal(cart);
}

export async function getCartSummary(): Promise<CartSummary> {
  const cart = await getCart();
  const settings = await getStoreSettings();

  const subtotal = cart.items.reduce(
    (sum, item) => sum + Number(item.product.sellingPrice) * item.quantity,
    0
  );

  const freeDeliveryThreshold = Number(settings.freeDeliveryThreshold);
  const deliveryCharge =
    subtotal >= freeDeliveryThreshold ? 0 : Number(settings.deliveryCharge);

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    itemCount,
    subtotal,
    deliveryCharge,
    discount: 0,
    total: subtotal + deliveryCharge,
    freeDeliveryThreshold,
  };
}

export async function addToCart(
  productId: string,
  quantity = 1
): Promise<ActionResult> {
  try {
    const session = await auth();
    const product = await db.product.findUnique({ where: { id: productId } });

    if (!product || !product.isActive) {
      return { success: false, error: "Product not available" };
    }

    if (product.stock < quantity) {
      return { success: false, error: "Insufficient stock" };
    }

    const cart = await getOrCreateCart(session?.user?.id);

    const existingItem = cart.items.find((item) => item.productId === productId);

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > product.stock) {
        return { success: false, error: "Insufficient stock" };
      }
      await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await db.cartItem.create({
        data: { cartId: cart.id, productId, quantity },
      });
    }

    revalidatePath("/cart");
    return { success: true, message: "Added to cart" };
  } catch (error) {
    console.error("Add to cart error:", error);
    return { success: false, error: "Failed to add to cart" };
  }
}

export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<ActionResult> {
  try {
    if (quantity < 1) {
      return removeFromCart(itemId);
    }

    const session = await auth();
    const cart = await getOrCreateCart(session?.user?.id);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    if (quantity > item.product.stock) {
      return { success: false, error: "Insufficient stock" };
    }

    await db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update quantity" };
  }
}

export async function removeFromCart(itemId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    const cart = await getOrCreateCart(session?.user?.id);
    const item = cart.items.find((i) => i.id === itemId);

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    await db.cartItem.delete({ where: { id: itemId } });
    revalidatePath("/cart");
    return { success: true, message: "Removed from cart" };
  } catch (error) {
    return { success: false, error: "Failed to remove item" };
  }
}

export async function clearCart(): Promise<void> {
  const session = await auth();
  const cart = await getOrCreateCart(session?.user?.id);
  await db.cartItem.deleteMany({ where: { cartId: cart.id } });
  revalidatePath("/cart");
}

export async function applyCoupon(
  code: string
): Promise<ActionResult<{ discount: number }>> {
  try {
    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.isActive || coupon.expiresAt < new Date()) {
      return { success: false, error: "Invalid or expired coupon" };
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, error: "Coupon usage limit reached" };
    }

    const summary = await getCartSummary();

    if (summary.subtotal < Number(coupon.minOrderValue)) {
      return {
        success: false,
        error: `Minimum order value is ₹${Number(coupon.minOrderValue)}`,
      };
    }

    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discount = (summary.subtotal * Number(coupon.discountValue)) / 100;
      if (coupon.maxDiscount) {
        discount = Math.min(discount, Number(coupon.maxDiscount));
      }
    } else {
      discount = Number(coupon.discountValue);
    }

    return { success: true, data: { discount }, message: "Coupon applied" };
  } catch (error) {
    return { success: false, error: "Failed to apply coupon" };
  }
}
