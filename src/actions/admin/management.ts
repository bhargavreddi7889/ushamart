"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { serializeDecimal } from "@/lib/utils";
import { settingsSchema } from "@/lib/validations/order";
import type { ActionResult } from "@/types";
import { Role } from "@prisma/client";

export async function getAdminCustomers(search?: string) {
  await requireAdmin();
  const customers = await db.user.findMany({
    where: {
      role: Role.CUSTOMER,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
            ],
          }
        : {}),
    },
    include: { _count: { select: { orders: true } } },
    orderBy: { createdAt: "desc" },
  });
  return serializeDecimal(customers);
}

export async function toggleCustomerBlock(userId: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || user.role !== Role.CUSTOMER) {
      return { success: false, error: "Customer not found" };
    }

    await db.user.update({
      where: { id: userId },
      data: { isBlocked: !user.isBlocked },
    });

    revalidatePath("/admin/customers");
    return { success: true, message: user.isBlocked ? "Customer unblocked" : "Customer blocked" };
  } catch (error) {
    return { success: false, error: "Failed to update customer" };
  }
}

export async function getCustomerOrders(userId: string) {
  await requireAdmin();
  const orders = await db.order.findMany({
    where: { userId },
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });
  return serializeDecimal(orders);
}

// Inventory
export async function getInventoryLogs(productId?: string) {
  await requireAdmin();
  const logs = await db.inventoryLog.findMany({
    where: productId ? { productId } : undefined,
    include: { product: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return serializeDecimal(logs);
}

export async function adjustStock(
  productId: string,
  change: number,
  reason: string
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const product = await db.product.findUnique({ where: { id: productId } });
    if (!product) return { success: false, error: "Product not found" };

    const newStock = product.stock + change;
    if (newStock < 0) {
      return { success: false, error: "Stock cannot be negative" };
    }

    await db.$transaction([
      db.product.update({
        where: { id: productId },
        data: { stock: newStock },
      }),
      db.inventoryLog.create({
        data: {
          productId,
          change,
          reason,
          stockAfter: newStock,
        },
      }),
    ]);

    revalidatePath("/admin/inventory");
    revalidatePath("/admin/products");
    return { success: true, message: "Stock updated" };
  } catch (error) {
    return { success: false, error: "Failed to adjust stock" };
  }
}

// Settings
export async function getAdminSettings() {
  await requireAdmin();
  let settings = await db.storeSettings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await db.storeSettings.create({ data: { id: "default" } });
  }
  return serializeDecimal(settings);
}

export async function updateSettings(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const raw = {
      storeName: formData.get("storeName") as string,
      tagline: formData.get("tagline") as string,
      contactPhone: (formData.get("contactPhone") as string) || null,
      whatsappNumber: (formData.get("whatsappNumber") as string) || null,
      storeAddress: (formData.get("storeAddress") as string) || null,
      businessHours: (formData.get("businessHours") as string) || null,
      deliveryCharge: formData.get("deliveryCharge") as string,
      freeDeliveryThreshold: formData.get("freeDeliveryThreshold") as string,
      lowStockThreshold: formData.get("lowStockThreshold") as string,
      showFeatured: formData.get("showFeatured") === "true",
      showPopular: formData.get("showPopular") === "true",
      showDeals: formData.get("showDeals") === "true",
      showNewArrivals: formData.get("showNewArrivals") === "true",
      showBestSelling: formData.get("showBestSelling") === "true",
      showCategories: formData.get("showCategories") === "true",
      showBanners: formData.get("showBanners") === "true",
      showAdvantages: formData.get("showAdvantages") === "true",
    };

    const parsed = settingsSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    await db.storeSettings.upsert({
      where: { id: "default" },
      create: { id: "default", ...parsed.data },
      update: parsed.data,
    });

    revalidatePath("/admin/settings");
    revalidatePath("/");
    return { success: true, message: "Settings updated" };
  } catch (error) {
    return { success: false, error: "Failed to update settings" };
  }
}

// Notifications
export async function getUserNotifications() {
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user) return [];

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  return serializeDecimal(notifications);
}

export async function markNotificationRead(id: string): Promise<ActionResult> {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    await db.notification.updateMany({
      where: { id, userId: session.user.id },
      data: { isRead: true },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark as read" };
  }
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    await db.notification.updateMany({
      where: { userId: session.user.id, isRead: false },
      data: { isRead: true },
    });

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to mark all as read" };
  }
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { auth } = await import("@/auth");
  const session = await auth();
  if (!session?.user) return 0;

  return db.notification.count({
    where: { userId: session.user.id, isRead: false },
  });
}
