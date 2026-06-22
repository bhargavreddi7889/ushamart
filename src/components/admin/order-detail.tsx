"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW } from "@/lib/constants";
import { updateOrderStatus, updatePaymentStatus } from "@/actions/admin/orders";
import { toast } from "sonner";
import type { OrderStatus } from "@prisma/client";

interface AdminOrderDetailProps {
  order: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentMethod: string;
    paymentStatus: string;
    subtotal: number;
    deliveryCharge: number;
    discount: number;
    total: number;
    user: { name: string; email: string; phone: string | null };
    address: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      pincode: string;
    };
    items: {
      id: string;
      productName: string;
      productImage: string | null;
      quantity: number;
      sellingPrice: number;
      total: number;
    }[];
    statusHistory: { status: OrderStatus; note: string | null; createdAt: string }[];
  };
}

export function AdminOrderDetail({ order }: AdminOrderDetailProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const currentIndex = ORDER_STATUS_FLOW.indexOf(
    order.status as (typeof ORDER_STATUS_FLOW)[number]
  );
  const nextStatuses = ORDER_STATUS_FLOW.slice(currentIndex + 1, currentIndex + 2);

  async function handleStatusUpdate(status: OrderStatus) {
    setLoading(true);
    const result = await updateOrderStatus(order.id, status);
    setLoading(false);
    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handlePaymentUpdate(status: "PENDING" | "PAID" | "FAILED" | "REFUNDED") {
    const result = await updatePaymentStatus(order.id, status);
    if (result.success) {
      toast.success("Payment status updated");
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <Badge className="mt-1">{ORDER_STATUS_LABELS[order.status]}</Badge>
        </div>
        <Link href="/admin/orders" className="text-sm text-[#006837] hover:underline">
          ← Back to Orders
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {nextStatuses.map((status) => (
          <Button key={status} onClick={() => handleStatusUpdate(status)} disabled={loading}>
            Mark as {ORDER_STATUS_LABELS[status]}
          </Button>
        ))}
        {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
          <Button variant="destructive" onClick={() => handleStatusUpdate("CANCELLED")} disabled={loading}>
            Cancel Order
          </Button>
        )}
        {order.paymentMethod === "UPI" && order.paymentStatus !== "PAID" && (
          <Button variant="outline" onClick={() => handlePaymentUpdate("PAID")}>
            Mark Payment Received
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-xl border bg-white p-4">
              {item.productImage && (
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded">
                  <Image src={item.productImage} alt="" fill className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-500">
                  {formatPrice(item.sellingPrice)} × {item.quantity}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(item.total)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold">Customer</h3>
            <p className="text-sm">{order.user.name}</p>
            <p className="text-sm text-gray-500">{order.user.email}</p>
            <p className="text-sm text-gray-500">{order.user.phone}</p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold">Delivery Address</h3>
            <p className="text-sm">{order.address.name} - {order.address.phone}</p>
            <p className="text-sm text-gray-600">
              {order.address.address}, {order.address.city}, {order.address.state} - {order.address.pincode}
            </p>
          </div>
          <div className="rounded-xl border bg-white p-4">
            <h3 className="font-semibold">Summary</h3>
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>{formatPrice(order.deliveryCharge)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>
              )}
              <div className="flex justify-between border-t pt-1 font-bold"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
