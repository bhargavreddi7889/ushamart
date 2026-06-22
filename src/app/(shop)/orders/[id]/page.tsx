import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getOrderById } from "@/actions/orders";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, ORDER_STATUS_FLOW } from "@/lib/constants";
import { format } from "date-fns";
import { Check } from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrderById(id);

  if (!order) notFound();

  const currentIndex = ORDER_STATUS_FLOW.indexOf(
    order.status as (typeof ORDER_STATUS_FLOW)[number]
  );

  return (
    <div className="py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Order #{order.orderNumber}</h1>
          <p className="text-sm text-gray-500">
            Placed on {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
          </p>
        </div>
        <Badge>{ORDER_STATUS_LABELS[order.status]}</Badge>
      </div>

      {order.status !== "CANCELLED" && (
        <div className="mb-8 overflow-x-auto rounded-xl border bg-white p-6">
          <div className="flex min-w-max items-center gap-2">
            {ORDER_STATUS_FLOW.map((status, i) => {
              const isCompleted = i <= currentIndex;
              const isCurrent = i === currentIndex;
              return (
                <div key={status} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        isCompleted
                          ? "bg-[#006837] text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                    </div>
                    <span
                      className={`mt-1 text-[10px] sm:text-xs ${
                        isCurrent ? "font-semibold text-[#006837]" : "text-gray-500"
                      }`}
                    >
                      {ORDER_STATUS_LABELS[status]}
                    </span>
                  </div>
                  {i < ORDER_STATUS_FLOW.length - 1 && (
                    <div
                      className={`mx-2 h-0.5 w-8 sm:w-12 ${
                        i < currentIndex ? "bg-[#006837]" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-xl border bg-white p-4">
              {item.productImage && (
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                  <Image src={item.productImage} alt={item.productName} fill className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
              </div>
              <p className="font-semibold">{formatPrice(item.total)}</p>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-2 font-semibold">Delivery Address</h3>
            <p className="text-sm">{order.address.name}</p>
            <p className="text-sm text-gray-600">
              {order.address.address}, {order.address.city}
            </p>
            <p className="text-sm text-gray-600">
              {order.address.state} - {order.address.pincode}
            </p>
            <p className="text-sm text-gray-500">{order.address.phone}</p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-2 font-semibold">Payment</h3>
            <p className="text-sm">
              {order.paymentMethod === "COD" ? "Cash on Delivery" : "UPI Payment"}
            </p>
            <p className="text-sm text-gray-500">Status: {order.paymentStatus}</p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <h3 className="mb-2 font-semibold">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery</span>
                <span>{formatPrice(order.deliveryCharge)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t pt-1 font-bold">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Link href="/orders" className="mt-6 inline-block text-sm text-[#006837] hover:underline">
        ← Back to Orders
      </Link>
    </div>
  );
}
