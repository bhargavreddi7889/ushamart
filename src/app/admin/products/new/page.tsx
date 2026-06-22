import { getAdminCategories } from "@/actions/admin/categories";
import { getAdminBrands } from "@/actions/admin/brands";
import { ProductForm } from "@/components/admin/product-form";

export const metadata = { title: "Add Product" };

export default async function NewProductPage() {
  const [categories, brands] = await Promise.all([
    getAdminCategories(),
    getAdminBrands(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Add Product</h1>
      <ProductForm categories={categories} brands={brands} />
    </div>
  );
}
