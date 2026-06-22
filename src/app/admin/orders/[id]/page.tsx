import { notFound } from "next/navigation";
import { getAdminOrder } from "@/actions/admin/orders";
import { AdminOrderDetail } from "@/components/admin/order-detail";

interface AdminOrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminOrderPage({ params }: AdminOrderPageProps) {
  const { id } = await params;
  const order = await getAdminOrder(id);

  if (!order) notFound();

  return (
    <AdminOrderDetail
      order={{
        ...order,
        statusHistory: order.statusHistory.map((h) => ({
          ...h,
          createdAt: h.createdAt.toISOString(),
        })),
      }}
    />
  );
}
