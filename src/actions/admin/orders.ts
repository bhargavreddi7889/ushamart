"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { serializeDecimal } from "@/lib/utils";
import type { ActionResult } from "@/types";
import { NotificationType, OrderStatus } from "@prisma/client";

const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  CONFIRMED: [OrderStatus.PACKED, OrderStatus.CANCELLED],
  PACKED: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  SHIPPED: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
  OUT_FOR_DELIVERY: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  DELIVERED: [],
  CANCELLED: [],
};

export async function getAdminOrders(status?: OrderStatus) {
  await requireAdmin();
  const orders = await db.order.findMany({
    where: status ? { status } : undefined,
    include: {
      user: true,
      address: true,
      items: true,
      statusHistory: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });
  return serializeDecimal(orders);
}

export async function getAdminOrder(id: string) {
  await requireAdmin();
  const order = await db.order.findUnique({
    where: { id },
    include: {
      user: true,
      address: true,
      items: { include: { product: true } },
      statusHistory: { orderBy: { createdAt: "asc" } },
    },
  });
  return order ? serializeDecimal(order) : null;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  note?: string
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) return { success: false, error: "Order not found" };

    const allowed = STATUS_TRANSITIONS[order.status];
    if (!allowed.includes(status)) {
      return { success: false, error: `Cannot change status from ${order.status} to ${status}` };
    }

    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      await tx.orderStatusHistory.create({
        data: { orderId, status, note },
      });

      if (status === OrderStatus.CANCELLED) {
        const items = await tx.orderItem.findMany({ where: { orderId } });
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
              soldCount: { decrement: item.quantity },
            },
          });
        }
      }

      await tx.notification.create({
        data: {
          userId: order.userId,
          title: "Order Status Updated",
          message: `Your order #${order.orderNumber} is now ${status.replace(/_/g, " ").toLowerCase()}.`,
          type: NotificationType.ORDER,
          link: `/orders/${orderId}`,
        },
      });
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true, message: "Order status updated" };
  } catch (error) {
    console.error("Update order status error:", error);
    return { success: false, error: "Failed to update order status" };
  }
}

export async function updatePaymentStatus(
  orderId: string,
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.order.update({
      where: { id: orderId },
      data: { paymentStatus },
    });
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update payment status" };
  }
}
