import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Decimal } from "@prisma/client/runtime/library";

export type ReplaceDecimal<T> = T extends Decimal
  ? number
  : T extends Date
    ? Date
    : T extends Array<infer U>
      ? ReplaceDecimal<U>[]
      : T extends object
        ? { [K in keyof T]: ReplaceDecimal<T[K]> }
        : T;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatPrice(amount: number | string | { toString(): string }): string {
  const value = Number(amount);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

export function calculateDiscountPercentage(mrp: number, sellingPrice: number): number {
  if (mrp <= 0) return 0;
  return Math.round(((mrp - sellingPrice) / mrp) * 100);
}

export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `UM${timestamp}${random}`;
}

export function serializeDecimal<T>(data: T): ReplaceDecimal<T> {
  return JSON.parse(
    JSON.stringify(data, (_, value) =>
      typeof value === "object" && value !== null && "toNumber" in value
        ? Number(value)
        : value
    )
  ) as ReplaceDecimal<T>;
}
