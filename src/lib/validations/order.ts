import { z } from "zod";

export const checkoutSchema = z.object({
  addressId: z.string().optional(),
  name: z.string().min(2).optional(),
  phone: z.string().regex(/^[6-9]\d{9}$/).optional(),
  address: z.string().min(5).optional(),
  city: z.string().min(2).optional(),
  state: z.string().min(2).optional(),
  pincode: z.string().regex(/^\d{6}$/).optional(),
  paymentMethod: z.enum(["COD", "UPI"]),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const couponSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(["PERCENTAGE", "FLAT"]),
  discountValue: z.coerce.number().positive(),
  minOrderValue: z.coerce.number().min(0).default(0),
  maxDiscount: z.coerce.number().positive().optional().nullable(),
  usageLimit: z.coerce.number().int().positive().optional().nullable(),
  isActive: z.boolean().default(true),
  expiresAt: z.coerce.date(),
});

export const offerSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  type: z.enum(["PRODUCT", "CATEGORY", "FESTIVAL"]),
  discountType: z.enum(["PERCENTAGE", "FLAT"]),
  discountValue: z.coerce.number().positive(),
  productId: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
  startsAt: z.coerce.date().optional(),
  endsAt: z.coerce.date().optional().nullable(),
});

export const bannerSchema = z.object({
  title: z.string().min(2),
  subtitle: z.string().optional(),
  image: z.string().url(),
  link: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const settingsSchema = z.object({
  storeName: z.string().min(2),
  tagline: z.string().min(2),
  contactPhone: z.string().optional().nullable(),
  whatsappNumber: z.string().optional().nullable(),
  storeAddress: z.string().optional().nullable(),
  businessHours: z.string().optional().nullable(),
  deliveryCharge: z.coerce.number().min(0),
  freeDeliveryThreshold: z.coerce.number().min(0),
  lowStockThreshold: z.coerce.number().int().min(1),
  showFeatured: z.boolean(),
  showPopular: z.boolean(),
  showDeals: z.boolean(),
  showNewArrivals: z.boolean(),
  showBestSelling: z.boolean(),
  showCategories: z.boolean(),
  showBanners: z.boolean(),
  showAdvantages: z.boolean(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type CouponInput = z.infer<typeof couponSchema>;
export type OfferInput = z.infer<typeof offerSchema>;
export type BannerInput = z.infer<typeof bannerSchema>;
export type SettingsInput = z.infer<typeof settingsSchema>;
