"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { serializeDecimal } from "@/lib/utils";
import { couponSchema, offerSchema, bannerSchema } from "@/lib/validations/order";
import type { ActionResult } from "@/types";

// Coupons
export async function getAdminCoupons() {
  await requireAdmin();
  return serializeDecimal(await db.coupon.findMany({ orderBy: { createdAt: "desc" } }));
}

export async function createCoupon(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const raw = {
      code: (formData.get("code") as string).toUpperCase(),
      description: (formData.get("description") as string) || undefined,
      discountType: formData.get("discountType") as string,
      discountValue: formData.get("discountValue") as string,
      minOrderValue: (formData.get("minOrderValue") as string) || "0",
      maxDiscount: (formData.get("maxDiscount") as string) || null,
      usageLimit: (formData.get("usageLimit") as string) || null,
      isActive: formData.get("isActive") !== "false",
      expiresAt: formData.get("expiresAt") as string,
    };

    const parsed = couponSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    await db.coupon.create({ data: parsed.data });
    revalidatePath("/admin/coupons");
    return { success: true, message: "Coupon created" };
  } catch (error) {
    return { success: false, error: "Failed to create coupon" };
  }
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.coupon.delete({ where: { id } });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete coupon" };
  }
}

// Offers
export async function getAdminOffers() {
  await requireAdmin();
  return serializeDecimal(
    await db.offer.findMany({
      include: { product: true, category: true },
      orderBy: { createdAt: "desc" },
    })
  );
}

export async function createOffer(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const raw = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      type: formData.get("type") as string,
      discountType: formData.get("discountType") as string,
      discountValue: formData.get("discountValue") as string,
      productId: (formData.get("productId") as string) || null,
      categoryId: (formData.get("categoryId") as string) || null,
      isActive: formData.get("isActive") !== "false",
      startsAt: (formData.get("startsAt") as string) || undefined,
      endsAt: (formData.get("endsAt") as string) || null,
    };

    const parsed = offerSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    await db.offer.create({
      data: {
        ...parsed.data,
        productId: parsed.data.productId || null,
        categoryId: parsed.data.categoryId || null,
      },
    });

    revalidatePath("/admin/offers");
    return { success: true, message: "Offer created" };
  } catch (error) {
    return { success: false, error: "Failed to create offer" };
  }
}

export async function deleteOffer(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.offer.delete({ where: { id } });
    revalidatePath("/admin/offers");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete offer" };
  }
}

// Banners
export async function getAdminBanners() {
  await requireAdmin();
  return serializeDecimal(await db.banner.findMany({ orderBy: { sortOrder: "asc" } }));
}

export async function createBanner(formData: FormData): Promise<ActionResult> {
  try {
    await requireAdmin();
    const raw = {
      title: formData.get("title") as string,
      subtitle: (formData.get("subtitle") as string) || undefined,
      image: formData.get("image") as string,
      link: (formData.get("link") as string) || null,
      sortOrder: (formData.get("sortOrder") as string) || "0",
      isActive: formData.get("isActive") !== "false",
    };

    const parsed = bannerSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    await db.banner.create({ data: parsed.data });
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true, message: "Banner created" };
  } catch (error) {
    return { success: false, error: "Failed to create banner" };
  }
}

export async function updateBanner(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  try {
    await requireAdmin();
    const raw = {
      title: formData.get("title") as string,
      subtitle: (formData.get("subtitle") as string) || undefined,
      image: formData.get("image") as string,
      link: (formData.get("link") as string) || null,
      sortOrder: (formData.get("sortOrder") as string) || "0",
      isActive: formData.get("isActive") !== "false",
    };

    const parsed = bannerSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    await db.banner.update({ where: { id }, data: parsed.data });
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true, message: "Banner updated" };
  } catch (error) {
    return { success: false, error: "Failed to update banner" };
  }
}

export async function deleteBanner(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.banner.delete({ where: { id } });
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete banner" };
  }
}

export async function reorderBanners(
  orderedIds: string[]
): Promise<ActionResult> {
  try {
    await requireAdmin();
    await db.$transaction(
      orderedIds.map((id, index) =>
        db.banner.update({ where: { id }, data: { sortOrder: index } })
      )
    );
    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to reorder banners" };
  }
}
