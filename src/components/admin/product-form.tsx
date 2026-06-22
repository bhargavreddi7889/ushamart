"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUpload } from "@/components/admin/image-upload";
import { createProduct, updateProduct } from "@/actions/admin/products";
import { toast } from "sonner";

interface ProductFormProps {
  categories: { id: string; name: string }[];
  brands: { id: string; name: string }[];
  product?: {
    id: string;
    name: string;
    description: string;
    images: string[];
    sku: string;
    categoryId: string;
    brandId: string | null;
    stock: number;
    mrp: number;
    sellingPrice: number;
    isActive: boolean;
    isFeatured: boolean;
    isDealOfDay: boolean;
    isNewArrival: boolean;
    isBestSelling: boolean;
  };
}

export function ProductForm({ categories, brands, product }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    sku: product?.sku || "",
    categoryId: product?.categoryId || "",
    brandId: product?.brandId || "",
    stock: product?.stock?.toString() || "0",
    mrp: product?.mrp?.toString() || "",
    sellingPrice: product?.sellingPrice?.toString() || "",
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured ?? false,
    isDealOfDay: product?.isDealOfDay ?? false,
    isNewArrival: product?.isNewArrival ?? false,
    isBestSelling: product?.isBestSelling ?? false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (typeof v === "boolean") formData.set(k, String(v));
      else formData.set(k, v as string);
    });
    formData.set("images", JSON.stringify(images));

    const result = product
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);

    setLoading(false);

    if (result.success) {
      toast.success(result.message);
      router.push("/admin/products");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const flags = [
    { key: "isActive", label: "Active" },
    { key: "isFeatured", label: "Featured" },
    { key: "isDealOfDay", label: "Deal of Day" },
    { key: "isNewArrival", label: "New Arrival" },
    { key: "isBestSelling", label: "Best Selling" },
  ] as const;

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{product ? "Edit Product" : "New Product"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <ImageUpload
              value={images}
              onChange={setImages}
              folder="usha-mart/products"
              label="Product Images (upload to Cloudinary)"
            />
          </div>
          <Input placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
          <div className="sm:col-span-2">
            <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required rows={4} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Category *
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium transition-colors focus:border-[#006837] focus:outline-none focus:ring-2 focus:ring-[#006837]/20"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              required
            >
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {categories.length === 0 && (
              <p className="mt-1 text-xs text-amber-600">
                No categories found. Add categories first in Admin → Categories.
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Brand (optional)
            </label>
            <select
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm transition-colors focus:border-[#006837] focus:outline-none focus:ring-2 focus:ring-[#006837]/20"
              value={form.brandId}
              onChange={(e) => setForm({ ...form, brandId: e.target.value })}
            >
              <option value="">Select brand (optional)</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
          <Input type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
          <Input type="number" step="0.01" placeholder="MRP" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: e.target.value })} required />
          <Input type="number" step="0.01" placeholder="Selling Price" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })} required />
          <div className="flex flex-wrap gap-4 sm:col-span-2">
            {flags.map((f) => (
              <label key={f.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form[f.key]}
                  onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })}
                />
                {f.label}
              </label>
            ))}
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
