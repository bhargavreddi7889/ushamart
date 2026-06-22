"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { slugify, serializeDecimal } from "@/lib/utils";
import { categorySchema } from "@/lib/validations/product";
import type { ActionResult } from "@/types";

export async function getAdminCategories() {
  await requireAdmin();
  const categories = await db.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
      products: {
        select: { id: true, name: true, sku: true, images: true },
        orderBy: { name: "asc" },
      },
    },
  });
  return serializeDecimal(categories);
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const raw = {
      name: formData.get("name") as string,
      slug: (formData.get("slug") as string) || undefined,
      image: (formData.get("image") as string) || null,
      description: (formData.get("description") as string) || undefined,
      isActive: formData.get("isActive") !== "false",
      sortOrder: (formData.get("sortOrder") as string) || "0",
    };

    const parsed = categorySchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    await db.category.create({
      data: {
        ...parsed.data,
        slug: parsed.data.slug || slugify(parsed.data.name),
      },
    });

    revalidatePath("/admin/categories");
    return { success: true, message: "Category created" };
  } catch (error) {
    return { success: false, error: "Failed to create category" };
  }
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const raw = {
      name: formData.get("name") as string,
      slug: (formData.get("slug") as string) || undefined,
      image: (formData.get("image") as string) || null,
      description: (formData.get("description") as string) || undefined,
      isActive: formData.get("isActive") !== "false",
      sortOrder: (formData.get("sortOrder") as string) || "0",
    };

    const parsed = categorySchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    await db.category.update({
      where: { id },
      data: {
        ...parsed.data,
        slug: parsed.data.slug || slugify(parsed.data.name),
      },
    });

    revalidatePath("/admin/categories");
    return { success: true, message: "Category updated" };
  } catch (error) {
    return { success: false, error: "Failed to update category" };
  }
}

export async function getCategoryById(id: string) {
  await requireAdmin();
  const category = await db.category.findUnique({
    where: { id },
    include: {
      products: {
        select: { id: true, name: true, sku: true, images: true },
        orderBy: { name: "asc" },
      },
      _count: { select: { products: true } },
    },
  });
  return category ? serializeDecimal(category) : null;
}

export async function getAllProductsForMapping() {
  await requireAdmin();
  const products = await db.product.findMany({
    select: {
      id: true,
      name: true,
      sku: true,
      categoryId: true,
      category: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });
  return serializeDecimal(products);
}

export async function assignProductsToCategory(
  categoryId: string,
  productIds: string[]
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const category = await db.category.findUnique({ where: { id: categoryId } });
    if (!category) return { success: false, error: "Category not found" };

    if (productIds.length > 0) {
      await db.product.updateMany({
        where: { id: { in: productIds } },
        data: { categoryId },
      });
    }

    const currentInCategory = await db.product.findMany({
      where: { categoryId },
      select: { id: true },
    });
    const toRemove = currentInCategory
      .map((p) => p.id)
      .filter((id) => !productIds.includes(id));

    if (toRemove.length > 0) {
      let general = await db.category.findFirst({ where: { slug: "general" } });
      if (!general) {
        general = await db.category.create({
          data: { name: "General", slug: "general", sortOrder: 999 },
        });
      }
      if (general.id !== categoryId) {
        await db.product.updateMany({
          where: { id: { in: toRemove } },
          data: { categoryId: general.id },
        });
      }
    }

    revalidatePath("/admin/categories");
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/categories");
    return { success: true, message: "Products mapped to category" };
  } catch (error) {
    console.error("Assign products error:", error);
    return { success: false, error: "Failed to map products" };
  }
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const count = await db.product.count({ where: { categoryId: id } });
    if (count > 0) {
      return { success: false, error: "Cannot delete category with products. Reassign products first." };
    }
    await db.category.delete({ where: { id } });
    revalidatePath("/admin/categories");
    return { success: true, message: "Category deleted" };
  } catch (error) {
    return { success: false, error: "Failed to delete category" };
  }
}
