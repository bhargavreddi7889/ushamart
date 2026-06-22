import Link from "next/link";
import { getAdminOrders } from "@/actions/admin/orders";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { format } from "date-fns";

export const metadata = { title: "Manage Orders" };

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Orders</h1>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Customer</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Payment</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="p-3 font-medium">#{order.orderNumber}</td>
                <td className="p-3">
                  <p>{order.user.name}</p>
                  <p className="text-xs text-gray-500">{order.user.phone}</p>
                </td>
                <td className="p-3">{formatPrice(order.total)}</td>
                <td className="p-3">
                  <p>{order.paymentMethod}</p>
                  <p className="text-xs text-gray-500">{order.paymentStatus}</p>
                </td>
                <td className="p-3">
                  <Badge variant="outline">{ORDER_STATUS_LABELS[order.status]}</Badge>
                </td>
                <td className="p-3 text-gray-500">
                  {format(new Date(order.createdAt), "dd MMM yyyy")}
                </td>
                <td className="p-3">
                  <Link href={`/admin/orders/${order.id}`} className="text-[#006837] hover:underline">
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
