"use server";

import { db } from "@/lib/db";
import { getStoreSettings } from "@/lib/store-settings";
import { serializeDecimal, slugify } from "@/lib/utils";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { productFilterSchema } from "@/lib/validations/product";
import type { Prisma } from "@prisma/client";

function buildProductWhere(filters: {
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
}): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { sku: { contains: filters.search, mode: "insensitive" } },
      { category: { name: { contains: filters.search, mode: "insensitive" } } },
      { brand: { name: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  if (filters.category) {
    where.category = { slug: filters.category };
  }

  if (filters.brand) {
    where.brand = { slug: filters.brand };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.sellingPrice = {};
    if (filters.minPrice !== undefined) {
      where.sellingPrice.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.sellingPrice.lte = filters.maxPrice;
    }
  }

  if (filters.inStock) {
    where.stock = { gt: 0 };
  }

  return where;
}

function buildProductOrder(sort?: string): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price_asc":
      return { sellingPrice: "asc" };
    case "price_desc":
      return { sellingPrice: "desc" };
    case "best_selling":
      return { soldCount: "desc" };
    case "latest":
    default:
      return { createdAt: "desc" };
  }
}

export async function getProducts(searchParams: Record<string, string | undefined>) {
  const parsed = productFilterSchema.safeParse(searchParams);
  const filters = parsed.success ? parsed.data : { page: 1 };

  const where = buildProductWhere(filters);
  const orderBy = buildProductOrder(filters.sort);
  const skip = (filters.page - 1) * PRODUCTS_PER_PAGE;

  const [products, total] = await Promise.all([
    db.product.findMany({
      where,
      include: { category: true, brand: true },
      orderBy,
      skip,
      take: PRODUCTS_PER_PAGE,
    }),
    db.product.count({ where }),
  ]);

  return {
    products: serializeDecimal(products),
    total,
    page: filters.page,
    totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
  };
}

export async function getProductBySlug(slug: string) {
  const product = await db.product.findFirst({
    where: { slug, isActive: true },
    include: { category: true, brand: true, offers: { where: { isActive: true } } },
  });

  return product ? serializeDecimal(product) : null;
}

export async function getFeaturedProducts(limit = 8) {
  const products = await db.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { category: true, brand: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return serializeDecimal(products);
}

export async function getPopularProducts(limit = 8) {
  const products = await db.product.findMany({
    where: { isActive: true },
    include: { category: true, brand: true },
    orderBy: { soldCount: "desc" },
    take: limit,
  });
  return serializeDecimal(products);
}

export async function getTickerProducts(limit = 60) {
  const products = await db.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      name: true,
      slug: true,
      images: true,
      sellingPrice: true,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return serializeDecimal(products);
}

export async function getDealsOfDay(limit = 8) {
  const products = await db.product.findMany({
    where: { isActive: true, isDealOfDay: true },
    include: { category: true, brand: true },
    orderBy: { discountPercentage: "desc" },
    take: limit,
  });
  return serializeDecimal(products);
}

export async function getNewArrivals(limit = 8) {
  const products = await db.product.findMany({
    where: { isActive: true, isNewArrival: true },
    include: { category: true, brand: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return serializeDecimal(products);
}

export async function getBestSellingProducts(limit = 8) {
  const products = await db.product.findMany({
    where: { isActive: true, isBestSelling: true },
    include: { category: true, brand: true },
    orderBy: { soldCount: "desc" },
    take: limit,
  });
  return serializeDecimal(products);
}

export async function getCategories() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { isActive: true } } } } },
  });
  return serializeDecimal(categories);
}

export async function getCategoryBySlug(slug: string) {
  const category = await db.category.findFirst({
    where: { slug, isActive: true },
  });
  return category ? serializeDecimal(category) : null;
}

export async function getBrands() {
  const brands = await db.brand.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
  return serializeDecimal(brands);
}

export async function getActiveBanners() {
  const banners = await db.banner.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return serializeDecimal(banners);
}

export async function getHomepageData() {
  const settings = await getStoreSettings();

  const [banners, categories, featured, popular, deals, newArrivals, bestSelling] =
    await Promise.all([
      settings.showBanners ? getActiveBanners() : Promise.resolve([]),
      settings.showCategories ? getCategories() : Promise.resolve([]),
      settings.showFeatured ? getFeaturedProducts() : Promise.resolve([]),
      settings.showPopular ? getPopularProducts() : Promise.resolve([]),
      settings.showDeals ? getDealsOfDay() : Promise.resolve([]),
      settings.showNewArrivals ? getNewArrivals() : Promise.resolve([]),
      settings.showBestSelling ? getBestSellingProducts() : Promise.resolve([]),
    ]);

  return {
    settings: serializeDecimal(settings),
    banners,
    categories,
    featured,
    popular,
    deals,
    newArrivals,
    bestSelling,
  };
}

export async function searchSuggestions(query: string) {
  if (!query || query.length < 2) return [];

  const [products, categories, brands] = await Promise.all([
    db.product.findMany({
      where: {
        isActive: true,
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { sku: { contains: query, mode: "insensitive" } },
        ],
      },
      select: { id: true, name: true, slug: true, images: true, sellingPrice: true },
      take: 5,
    }),
    db.category.findMany({
      where: {
        isActive: true,
        name: { contains: query, mode: "insensitive" },
      },
      select: { id: true, name: true, slug: true, image: true },
      take: 3,
    }),
    db.brand.findMany({
      where: {
        isActive: true,
        name: { contains: query, mode: "insensitive" },
      },
      select: { id: true, name: true, slug: true, image: true },
      take: 3,
    }),
  ]);

  return [
    ...products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0] || null,
      type: "product" as const,
      price: Number(p.sellingPrice),
    })),
    ...categories.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image: c.image,
      type: "category" as const,
    })),
    ...brands.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      image: b.image,
      type: "brand" as const,
    })),
  ];
}

export { slugify };
