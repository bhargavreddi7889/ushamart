import { notFound } from "next/navigation";
import { getAdminProduct } from "@/actions/admin/products";
import { getAdminCategories } from "@/actions/admin/categories";
import { getAdminBrands } from "@/actions/admin/brands";
import { ProductForm } from "@/components/admin/product-form";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  const [product, categories, brands] = await Promise.all([
    getAdminProduct(id),
    getAdminCategories(),
    getAdminBrands(),
  ]);

  if (!product) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>
      <ProductForm categories={categories} brands={brands} product={product} />
    </div>
  );
}
