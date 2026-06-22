import { getLowStockProducts } from "@/actions/admin/dashboard";
import { getInventoryLogs } from "@/actions/admin/management";
import { getAdminProducts } from "@/actions/admin/products";
import { StockAdjustForm } from "@/components/admin/stock-adjust-form";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export const metadata = { title: "Inventory Management" };

export default async function AdminInventoryPage() {
  const [lowStock, logs, products] = await Promise.all([
    getLowStockProducts(),
    getInventoryLogs(),
    getAdminProducts(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Inventory</h1>

      {lowStock.length > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <h2 className="mb-3 font-semibold text-red-700">Low Stock Alert</h2>
          <div className="space-y-3">
            {lowStock.map((product) => (
              <StockAdjustForm
                key={product.id}
                productId={product.id}
                productName={product.name}
                currentStock={product.stock}
              />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border bg-white p-4">
        <h2 className="mb-4 font-semibold">Adjust Stock</h2>
        <div className="space-y-3">
          {products.slice(0, 10).map((product) => (
            <StockAdjustForm
              key={product.id}
              productId={product.id}
              productName={product.name}
              currentStock={product.stock}
            />
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <h2 className="border-b p-4 font-semibold">Recent Inventory Logs</h2>
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Change</th>
              <th className="p-3 text-left">Stock After</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b">
                <td className="p-3">{log.product.name}</td>
                <td className="p-3">
                  <Badge variant={log.change > 0 ? "default" : "destructive"}>
                    {log.change > 0 ? `+${log.change}` : log.change}
                  </Badge>
                </td>
                <td className="p-3">{log.stockAfter}</td>
                <td className="p-3 text-gray-500">{log.reason}</td>
                <td className="p-3">{format(new Date(log.createdAt), "dd MMM yyyy HH:mm")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
