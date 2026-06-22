"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { slugify, serializeDecimal } from "@/lib/utils";
import { brandSchema } from "@/lib/validations/product";
import type { ActionResult } from "@/types";

export async function getAdminBrands() {
  await requireAdmin();
  const brands = await db.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
  return serializeDecimal(brands);
}

export async function createBrand(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const raw = {
      name: formData.get("name") as string,
      slug: (formData.get("slug") as string) || undefined,
      image: (formData.get("image") as string) || null,
      isActive: formData.get("isActive") !== "false",
    };

    const parsed = brandSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    await db.brand.create({
      data: {
        ...parsed.data,
        slug: parsed.data.slug || slugify(parsed.data.name),
      },
    });

    revalidatePath("/admin/brands");
    return { success: true, message: "Brand created" };
  } catch (error) {
    return { success: false, error: "Failed to create brand" };
  }
}

export async function updateBrand(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const raw = {
      name: formData.get("name") as string,
      slug: (formData.get("slug") as string) || undefined,
      image: (formData.get("image") as string) || null,
      isActive: formData.get("isActive") !== "false",
    };

    const parsed = brandSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    await db.brand.update({
      where: { id },
      data: {
        ...parsed.data,
        slug: parsed.data.slug || slugify(parsed.data.name),
      },
    });

    revalidatePath("/admin/brands");
    return { success: true, message: "Brand updated" };
  } catch (error) {
    return { success: false, error: "Failed to update brand" };
  }
}

export async function deleteBrand(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.brand.delete({ where: { id } });
    revalidatePath("/admin/brands");
    return { success: true, message: "Brand deleted" };
  } catch (error) {
    return { success: false, error: "Failed to delete brand" };
  }
}
