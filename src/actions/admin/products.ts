"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { slugify, calculateDiscountPercentage, serializeDecimal } from "@/lib/utils";
import { productSchema } from "@/lib/validations/product";
import type { ActionResult } from "@/types";

export async function getAdminProducts() {
  await requireAdmin();
  const products = await db.product.findMany({
    include: { category: true, brand: true },
    orderBy: { createdAt: "desc" },
  });
  return serializeDecimal(products);
}

export async function getAdminProduct(id: string) {
  await requireAdmin();
  const product = await db.product.findUnique({
    where: { id },
    include: { category: true, brand: true },
  });
  return product ? serializeDecimal(product) : null;
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();

    const raw = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      specifications: formData.get("specifications")
        ? JSON.parse(formData.get("specifications") as string)
        : undefined,
      images: JSON.parse((formData.get("images") as string) || "[]"),
      sku: formData.get("sku") as string,
      categoryId: formData.get("categoryId") as string,
      brandId: (formData.get("brandId") as string) || null,
      stock: formData.get("stock") as string,
      mrp: formData.get("mrp") as string,
      sellingPrice: formData.get("sellingPrice") as string,
      isActive: formData.get("isActive") === "true",
      isFeatured: formData.get("isFeatured") === "true",
      isDealOfDay: formData.get("isDealOfDay") === "true",
      isNewArrival: formData.get("isNewArrival") === "true",
      isBestSelling: formData.get("isBestSelling") === "true",
    };

    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const slug = slugify(parsed.data.name);
    const discountPercentage = calculateDiscountPercentage(
      parsed.data.mrp,
      parsed.data.sellingPrice
    );

    await db.product.create({
      data: {
        ...parsed.data,
        slug: `${slug}-${Date.now().toString(36)}`,
        brandId: parsed.data.brandId || null,
        discountPercentage,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true, message: "Product created" };
  } catch (error) {
    console.error("Create product error:", error);
    return { success: false, error: "Failed to create product" };
  }
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const raw = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      specifications: formData.get("specifications")
        ? JSON.parse(formData.get("specifications") as string)
        : undefined,
      images: JSON.parse((formData.get("images") as string) || "[]"),
      sku: formData.get("sku") as string,
      categoryId: formData.get("categoryId") as string,
      brandId: (formData.get("brandId") as string) || null,
      stock: formData.get("stock") as string,
      mrp: formData.get("mrp") as string,
      sellingPrice: formData.get("sellingPrice") as string,
      isActive: formData.get("isActive") === "true",
      isFeatured: formData.get("isFeatured") === "true",
      isDealOfDay: formData.get("isDealOfDay") === "true",
      isNewArrival: formData.get("isNewArrival") === "true",
      isBestSelling: formData.get("isBestSelling") === "true",
    };

    const parsed = productSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const discountPercentage = calculateDiscountPercentage(
      parsed.data.mrp,
      parsed.data.sellingPrice
    );

    await db.product.update({
      where: { id },
      data: {
        ...parsed.data,
        brandId: parsed.data.brandId || null,
        discountPercentage,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    return { success: true, message: "Product updated" };
  } catch (error) {
    return { success: false, error: "Failed to update product" };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.product.delete({ where: { id } });
    revalidatePath("/admin/products");
    return { success: true, message: "Product deleted" };
  } catch (error) {
    return { success: false, error: "Failed to delete product" };
  }
}

export async function toggleProductStatus(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    const product = await db.product.findUnique({ where: { id } });
    if (!product) return { success: false, error: "Product not found" };

    await db.product.update({
      where: { id },
      data: { isActive: !product.isActive },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update status" };
  }
}
