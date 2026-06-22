import { getAdminBrands, createBrand, deleteBrand } from "@/actions/admin/brands";
import { AdminCrudForm } from "@/components/admin/crud-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Manage Brands" };

export default async function AdminBrandsPage() {
  const brands = await getAdminBrands();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Brands</h1>

      <AdminCrudForm
        title="Add Brand"
        fields={[
          { name: "name", label: "Brand Name", required: true },
          { name: "slug", label: "Slug (optional)" },
          { name: "image", label: "Image URL" },
        ]}
        onSubmit={createBrand}
      />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Slug</th>
              <th className="p-3 text-left">Products</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand.id} className="border-b">
                <td className="p-3 font-medium">{brand.name}</td>
                <td className="p-3 text-gray-500">{brand.slug}</td>
                <td className="p-3">{brand._count.products}</td>
                <td className="p-3">
                  <Badge variant={brand.isActive ? "default" : "destructive"}>
                    {brand.isActive ? "Active" : "Inactive"}
                  </Badge>
                </td>
                <td className="p-3">
                  <form
                    action={async () => {
                      await deleteBrand(brand.id);
                    }}
                  >
                    <Button type="submit" variant="ghost" size="sm" className="text-red-600">
                      Delete
                    </Button>
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
