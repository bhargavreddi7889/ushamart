"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CategoryEditDialog } from "@/components/admin/category-edit-dialog";
import { deleteCategory } from "@/actions/admin/categories";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  _count: { products: number };
  products: { id: string; name: string; sku: string; images: string[] }[];
}

interface CategoriesTableProps {
  categories: Category[];
  allProducts: {
    id: string;
    name: string;
    sku: string;
    categoryId: string;
    category: { name: string };
  }[];
}

export function CategoriesTable({ categories, allProducts }: CategoriesTableProps) {
  const router = useRouter();
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  async function handleDelete(category: Category) {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    const result = await deleteCategory(category.id);
    if (result.success) {
      toast.success("Category deleted");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="p-3 text-left">Image</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Slug</th>
                <th className="p-3 text-left">Products</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className="border-b hover:bg-gray-50/50">
                  <td className="p-3">
                    {cat.image ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border">
                        <Image src={cat.image} alt="" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-lg ring-1 ring-amber-200">
                        📦
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-medium">{cat.name}</td>
                  <td className="p-3 text-gray-500">{cat.slug}</td>
                  <td className="p-3">{cat._count.products}</td>
                  <td className="p-3">
                    <Badge variant={cat.isActive ? "default" : "destructive"}>
                      {cat.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingCategory(cat)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => handleDelete(cat)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingCategory && (
        <CategoryEditDialog
          category={editingCategory}
          allProducts={allProducts}
          onClose={() => setEditingCategory(null)}
        />
      )}
    </>
  );
}
