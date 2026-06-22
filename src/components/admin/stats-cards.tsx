import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import {
  ShoppingBag,
  IndianRupee,
  Users,
  Package,
  AlertTriangle,
  Clock,
} from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
}

export function StatCard({ title, value, icon, description }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        <div className="rounded-lg bg-green-50 p-2 text-[#006837]">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-gray-500">{description}</p>}
      </CardContent>
    </Card>
  );
}

export function DashboardStatsCards({
  stats,
}: {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    lowStockProducts: number;
    pendingOrders: number;
  };
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        title="Total Orders"
        value={stats.totalOrders}
        icon={<ShoppingBag className="h-4 w-4" />}
      />
      <StatCard
        title="Total Revenue"
        value={formatPrice(stats.totalRevenue)}
        icon={<IndianRupee className="h-4 w-4" />}
      />
      <StatCard
        title="Customers"
        value={stats.totalCustomers}
        icon={<Users className="h-4 w-4" />}
      />
      <StatCard
        title="Products"
        value={stats.totalProducts}
        icon={<Package className="h-4 w-4" />}
      />
      <StatCard
        title="Low Stock"
        value={stats.lowStockProducts}
        icon={<AlertTriangle className="h-4 w-4" />}
        description="Below threshold"
      />
      <StatCard
        title="Pending Orders"
        value={stats.pendingOrders}
        icon={<Clock className="h-4 w-4" />}
      />
    </div>
  );
}
