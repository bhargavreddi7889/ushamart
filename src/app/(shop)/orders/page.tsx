import Link from "next/link";
import { getUserOrders } from "@/actions/orders";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { format } from "date-fns";

export const metadata = { title: "My Orders" };

export default async function OrdersPage() {
  const orders = await getUserOrders();

  return (
    <div className="py-6">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center">
          <p className="text-gray-500">No orders yet</p>
          <Link href="/products" className="mt-4 inline-block text-[#006837] hover:underline">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">#{order.orderNumber}</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
                <Badge
                  variant={
                    order.status === "DELIVERED"
                      ? "default"
                      : order.status === "CANCELLED"
                        ? "destructive"
                        : "outline"
                  }
                >
                  {ORDER_STATUS_LABELS[order.status]}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {order.items.length} item{order.items.length > 1 ? "s" : ""}
                </p>
                <p className="font-bold text-[#006837]">{formatPrice(order.total)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
