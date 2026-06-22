import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  specifications: z.record(z.string()).optional(),
  images: z.array(z.string().url()).min(1, "At least one image required"),
  sku: z.string().min(2),
  categoryId: z.string().min(1),
  brandId: z.string().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  mrp: z.coerce.number().positive(),
  sellingPrice: z.coerce.number().positive(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isDealOfDay: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isBestSelling: z.boolean().default(false),
});

export const categorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  image: z.string().url().optional().nullable(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

export const brandSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).optional(),
  image: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
});

export const productFilterSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  inStock: z.coerce.boolean().optional(),
  sort: z.enum(["price_asc", "price_desc", "latest", "best_selling"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
});

export type ProductInput = z.infer<typeof productSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type BrandInput = z.infer<typeof brandSchema>;
export type ProductFilterInput = z.infer<typeof productFilterSchema>;
