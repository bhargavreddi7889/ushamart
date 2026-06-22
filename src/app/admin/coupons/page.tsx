import { getAdminCoupons, createCoupon, deleteCoupon } from "@/actions/admin/promotions";
import { AdminCrudForm } from "@/components/admin/crud-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";

export const metadata = { title: "Manage Coupons" };

export default async function AdminCouponsPage() {
  const coupons = await getAdminCoupons();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Coupons</h1>

      <AdminCrudForm
        title="Create Coupon"
        fields={[
          { name: "code", label: "Coupon Code", required: true },
          { name: "description", label: "Description" },
          { name: "discountType", label: "PERCENTAGE or FLAT", required: true },
          { name: "discountValue", label: "Discount Value", type: "number", required: true },
          { name: "minOrderValue", label: "Min Order Value", type: "number" },
          { name: "maxDiscount", label: "Max Discount", type: "number" },
          { name: "usageLimit", label: "Usage Limit", type: "number" },
          { name: "expiresAt", label: "Expiry Date", type: "date", required: true },
        ]}
        onSubmit={createCoupon}
      />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Discount</th>
              <th className="p-3 text-left">Min Order</th>
              <th className="p-3 text-left">Used</th>
              <th className="p-3 text-left">Expires</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b">
                <td className="p-3 font-mono font-medium">{coupon.code}</td>
                <td className="p-3">
                  {coupon.discountType === "PERCENTAGE"
                    ? `${coupon.discountValue}%`
                    : formatPrice(coupon.discountValue)}
                </td>
                <td className="p-3">{formatPrice(coupon.minOrderValue)}</td>
                <td className="p-3">
                  {coupon.usedCount}
                  {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                </td>
                <td className="p-3">{format(new Date(coupon.expiresAt), "dd MMM yyyy")}</td>
                <td className="p-3">
                  <Badge variant={coupon.isActive ? "default" : "destructive"}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="p-3">
                  <form
                    action={async () => {
                      await deleteCoupon(coupon.id);
                    }}
                  >
                    <Button type="submit" variant="ghost" size="sm" className="text-red-600">Delete</Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
