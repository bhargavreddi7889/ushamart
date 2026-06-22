import { getAdminOffers, createOffer, deleteOffer } from "@/actions/admin/promotions";
import { getAdminProducts } from "@/actions/admin/products";
import { getAdminCategories } from "@/actions/admin/categories";
import { AdminCrudForm } from "@/components/admin/crud-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Manage Offers" };

export default async function AdminOffersPage() {
  const [offers, products, categories] = await Promise.all([
    getAdminOffers(),
    getAdminProducts(),
    getAdminCategories(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Offers</h1>

      <AdminCrudForm
        title="Create Offer"
        fields={[
          { name: "title", label: "Offer Title", required: true },
          { name: "description", label: "Description" },
          { name: "type", label: "PRODUCT, CATEGORY, or FESTIVAL", required: true },
          { name: "discountType", label: "PERCENTAGE or FLAT", required: true },
          { name: "discountValue", label: "Discount Value", type: "number", required: true },
          { name: "productId", label: "Product ID (for product offers)" },
          { name: "categoryId", label: "Category ID (for category offers)" },
          { name: "endsAt", label: "End Date", type: "date" },
        ]}
        onSubmit={createOffer}
      />

      <p className="text-sm text-gray-500">
        Products: {products.slice(0, 3).map((p) => `${p.name} (${p.id})`).join(", ")}...
        | Categories: {categories.slice(0, 3).map((c) => `${c.name} (${c.id})`).join(", ")}...
      </p>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Title</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Discount</th>
              <th className="p-3 text-left">Target</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id} className="border-b">
                <td className="p-3 font-medium">{offer.title}</td>
                <td className="p-3">{offer.type}</td>
                <td className="p-3">
                  {offer.discountType === "PERCENTAGE"
                    ? `${offer.discountValue}%`
                    : `₹${offer.discountValue}`}
                </td>
                <td className="p-3">
                  {offer.product?.name || offer.category?.name || "Festival"}
                </td>
                <td className="p-3">
                  <Badge variant={offer.isActive ? "default" : "destructive"}>
                    {offer.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="p-3">
                  <form
                    action={async () => {
                      await deleteOffer(offer.id);
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
