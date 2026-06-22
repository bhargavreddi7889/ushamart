"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { clearCart } from "@/actions/cart";
import { getOrCreateCart } from "@/lib/cart-session";
import { getStoreSettings } from "@/lib/store-settings";
import { generateOrderNumber, serializeDecimal } from "@/lib/utils";
import { sendTelegramOrderNotification } from "@/lib/telegram";
import { checkoutSchema } from "@/lib/validations/order";
import type { ActionResult } from "@/types";
import { DiscountType, NotificationType, OrderStatus } from "@prisma/client";

async function calculateCouponDiscount(
  code: string | undefined,
  subtotal: number
): Promise<{ discount: number; couponId?: string }> {
  if (!code) return { discount: 0 };

  const coupon = await db.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });

  if (!coupon || !coupon.isActive || coupon.expiresAt < new Date()) {
    throw new Error("Invalid or expired coupon");
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("Coupon usage limit reached");
  }

  if (subtotal < Number(coupon.minOrderValue)) {
    throw new Error(`Minimum order value is ₹${Number(coupon.minOrderValue)}`);
  }

  let discount = 0;
  if (coupon.discountType === DiscountType.PERCENTAGE) {
    discount = (subtotal * Number(coupon.discountValue)) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, Number(coupon.maxDiscount));
    }
  } else {
    discount = Number(coupon.discountValue);
  }

  return { discount, couponId: coupon.id };
}

export async function placeOrder(
  formData: FormData
): Promise<ActionResult<{ orderId: string; orderNumber: string }>> {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Please login to place order" };
    }

    const raw = Object.fromEntries(formData.entries());
    const parsed = checkoutSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const cart = await getOrCreateCart(session.user.id);
    if (cart.items.length === 0) {
      return { success: false, error: "Your cart is empty" };
    }

    for (const item of cart.items) {
      if (!item.product.isActive || item.product.stock < item.quantity) {
        return {
          success: false,
          error: `${item.product.name} is out of stock`,
        };
      }
    }

    let addressId = parsed.data.addressId;

    if (!addressId) {
      if (!parsed.data.name || !parsed.data.phone || !parsed.data.address) {
        return { success: false, error: "Delivery address is required" };
      }

      const address = await db.address.create({
        data: {
          userId: session.user.id,
          name: parsed.data.name,
          phone: parsed.data.phone,
          address: parsed.data.address,
          city: parsed.data.city!,
          state: parsed.data.state!,
          pincode: parsed.data.pincode!,
          isDefault: false,
        },
      });
      addressId = address.id;
    }

    const settings = await getStoreSettings();
    const subtotal = cart.items.reduce(
      (sum, item) => sum + Number(item.product.sellingPrice) * item.quantity,
      0
    );

    const freeDeliveryThreshold = Number(settings.freeDeliveryThreshold);
    const deliveryCharge =
      subtotal >= freeDeliveryThreshold ? 0 : Number(settings.deliveryCharge);

    const { discount, couponId } = await calculateCouponDiscount(
      parsed.data.couponCode,
      subtotal
    ).catch((err: Error) => {
      throw err;
    });

    const total = Math.max(0, subtotal + deliveryCharge - discount);
    const orderNumber = generateOrderNumber();

    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session.user.id,
          addressId: addressId!,
          paymentMethod: parsed.data.paymentMethod,
          subtotal,
          deliveryCharge,
          discount,
          couponCode: parsed.data.couponCode?.toUpperCase() || null,
          total,
          notes: parsed.data.notes || null,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              productImage: item.product.images[0] || null,
              quantity: item.quantity,
              mrp: item.product.mrp,
              sellingPrice: item.product.sellingPrice,
              total: Number(item.product.sellingPrice) * item.quantity,
            })),
          },
          statusHistory: {
            create: { status: OrderStatus.PENDING, note: "Order placed" },
          },
        },
        include: {
          items: true,
          user: true,
          address: true,
        },
      });

      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });

        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        await tx.inventoryLog.create({
          data: {
            productId: item.productId,
            change: -item.quantity,
            reason: `Order #${orderNumber}`,
            stockAfter: product!.stock,
          },
        });
      }

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        });
      }

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      await tx.notification.create({
        data: {
          userId: session.user.id,
          title: "Order Placed",
          message: `Your order #${orderNumber} has been placed successfully.`,
          type: NotificationType.ORDER,
          link: `/orders/${newOrder.id}`,
        },
      });

      return newOrder;
    });

    await sendTelegramOrderNotification({
      orderNumber: order.orderNumber,
      customerName: order.address.name,
      customerPhone: order.address.phone,
      total: Number(order.total),
      items: order.items.map((i) => ({ name: i.productName, quantity: i.quantity })),
      status: "Pending",
    });

    revalidatePath("/orders");
    revalidatePath("/cart");
    revalidatePath("/admin/orders");

    return {
      success: true,
      data: { orderId: order.id, orderNumber: order.orderNumber },
      message: "Order placed successfully",
    };
  } catch (error) {
    console.error("Place order error:", error);
    const message = error instanceof Error ? error.message : "Failed to place order";
    return { success: false, error: message };
  }
}

export async function getUserOrders() {
  const session = await auth();
  if (!session?.user) return [];

  const orders = await db.order.findMany({
    where: { userId: session.user.id },
    include: {
      items: true,
      address: true,
      statusHistory: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return serializeDecimal(orders);
}

export async function getOrderById(orderId: string) {
  const session = await auth();
  if (!session?.user) return null;

  const order = await db.order.findFirst({
    where: {
      id: orderId,
      userId: session.user.role === "ADMIN" ? undefined : session.user.id,
    },
    include: {
      items: { include: { product: true } },
      address: true,
      user: true,
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });

  return order ? serializeDecimal(order) : null;
}

export async function buyNow(
  productId: string,
  quantity = 1
): Promise<void> {
  const session = await auth();
  if (!session?.user) {
    redirect(`/login?callbackUrl=/products`);
  }

  const { addToCart } = await import("@/actions/cart");
  await clearCart();
  const result = await addToCart(productId, quantity);

  if (!result.success) {
    redirect(`/products?error=${encodeURIComponent(result.error)}`);
  }

  redirect("/checkout");
}
