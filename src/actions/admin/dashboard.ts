"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { serializeDecimal } from "@/lib/utils";
import type { DashboardStats } from "@/types";
import { OrderStatus, Role } from "@prisma/client";
import { subDays, format } from "date-fns";

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();
  const settings = await db.storeSettings.findUnique({ where: { id: "default" } });
  const lowStockThreshold = settings?.lowStockThreshold ?? 10;

  const [
    totalOrders,
    revenueAgg,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    pendingOrders,
    recentOrders,
    last30DaysOrders,
  ] = await Promise.all([
    db.order.count(),
    db.order.aggregate({
      _sum: { total: true },
      where: { status: { not: OrderStatus.CANCELLED } },
    }),
    db.user.count({ where: { role: Role.CUSTOMER } }),
    db.product.count(),
    db.product.count({ where: { stock: { lt: lowStockThreshold }, isActive: true } }),
    db.order.count({ where: { status: OrderStatus.PENDING } }),
    db.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { user: true },
    }),
    db.order.findMany({
      where: {
        createdAt: { gte: subDays(new Date(), 30) },
        status: { not: OrderStatus.CANCELLED },
      },
      select: { total: true, createdAt: true },
    }),
  ]);

  const revenueMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 29; i >= 0; i--) {
    const date = format(subDays(new Date(), i), "MMM dd");
    revenueMap.set(date, { revenue: 0, orders: 0 });
  }

  for (const order of last30DaysOrders) {
    const date = format(order.createdAt, "MMM dd");
    const entry = revenueMap.get(date);
    if (entry) {
      entry.revenue += Number(order.total);
      entry.orders += 1;
    }
  }

  return {
    totalOrders,
    totalRevenue: Number(revenueAgg._sum.total ?? 0),
    totalCustomers,
    totalProducts,
    lowStockProducts,
    pendingOrders,
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customerName: o.user.name,
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt,
    })),
    revenueChart: Array.from(revenueMap.entries()).map(([date, data]) => ({
      date,
      ...data,
    })),
  };
}

export async function getLowStockProducts() {
  await requireAdmin();
  const settings = await db.storeSettings.findUnique({ where: { id: "default" } });
  const threshold = settings?.lowStockThreshold ?? 10;

  const products = await db.product.findMany({
    where: { stock: { lt: threshold }, isActive: true },
    include: { category: true },
    orderBy: { stock: "asc" },
    take: 20,
  });

  return serializeDecimal(products);
}
