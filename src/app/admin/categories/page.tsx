import {
  getAdminCategories,
  getAllProductsForMapping,
} from "@/actions/admin/categories";
import { CategoryForm } from "@/components/admin/category-form";
import { CategoriesTable } from "@/components/admin/categories-table";

export const metadata = { title: "Manage Categories" };

export default async function AdminCategoriesPage() {
  const [categories, allProducts] = await Promise.all([
    getAdminCategories(),
    getAllProductsForMapping(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Categories</h1>
      <CategoryForm />
      <CategoriesTable categories={categories} allProducts={allProducts} />
    </div>
  );
}
