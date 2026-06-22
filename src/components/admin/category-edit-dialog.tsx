"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SingleImageUpload } from "@/components/admin/image-upload";
import {
  updateCategory,
  assignProductsToCategory,
} from "@/actions/admin/categories";
import { toast } from "sonner";

interface CategoryEditDialogProps {
  category: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
    description: string | null;
    isActive: boolean;
    sortOrder: number;
    products: { id: string; name: string; sku: string; images: string[] }[];
  };
  allProducts: {
    id: string;
    name: string;
    sku: string;
    categoryId: string;
    category: { name: string };
  }[];
  onClose: () => void;
}

export function CategoryEditDialog({ category, allProducts, onClose }: CategoryEditDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(category.image || "");
  const [form, setForm] = useState({
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    sortOrder: String(category.sortOrder),
    isActive: category.isActive,
  });
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    category.products.map((p) => p.id)
  );
  const [productSearch, setProductSearch] = useState("");

  const filteredProducts = allProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.sku.toLowerCase().includes(productSearch.toLowerCase())
  );

  function toggleProduct(productId: string) {
    setSelectedProducts((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.set("name", form.name);
    formData.set("slug", form.slug);
    formData.set("description", form.description);
    formData.set("sortOrder", form.sortOrder);
    formData.set("isActive", String(form.isActive));
    if (image) formData.set("image", image);

    const updateResult = await updateCategory(category.id, formData);
    if (!updateResult.success) {
      setLoading(false);
      toast.error(updateResult.error);
      return;
    }

    const assignResult = await assignProductsToCategory(category.id, selectedProducts);
    setLoading(false);

    if (assignResult.success) {
      toast.success("Category updated successfully");
      router.refresh();
      onClose();
    } else {
      toast.error(assignResult.error);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4">
      <Card className="max-h-[92vh] w-full max-w-2xl overflow-hidden sm:rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <CardTitle>Edit Category — {category.name}</CardTitle>
          <button type="button" onClick={onClose} className="rounded-lg p-2 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </CardHeader>
        <CardContent className="max-h-[calc(92vh-80px)] overflow-y-auto p-4">
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Category Name *</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Slug</label>
                <Input
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Sort Order</label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium">Description</label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <SingleImageUpload
              value={image}
              onChange={setImage}
              folder="usha-mart/categories"
              label="Category Image (upload or replace)"
            />

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Map Products to this Category ({selectedProducts.length} selected)
              </label>
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products by name or SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border p-2">
                {filteredProducts.map((product) => {
                  const isSelected = selectedProducts.includes(product.id);
                  const isInThisCategory = product.categoryId === category.id;
                  return (
                    <label
                      key={product.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-gray-50 ${
                        isSelected ? "bg-green-50 ring-1 ring-[#006837]/20" : ""
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleProduct(product.id)}
                      />
                      <Package className="h-4 w-4 shrink-0 text-gray-400" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          SKU: {product.sku}
                          {!isInThisCategory && isSelected && (
                            <span className="ml-1 text-amber-600">(from {product.category.name})</span>
                          )}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3 border-t pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
