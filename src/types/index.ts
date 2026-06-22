import { Role, OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export type ActionResult<T = void> =
  | { success: true; data?: T; message?: string }
  | { success: false; error: string };

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  total: number;
  freeDeliveryThreshold: number;
}

export interface SearchSuggestion {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  type: "product" | "category" | "brand";
  price?: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  pendingOrders: number;
  recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: OrderStatus;
    createdAt: Date;
  }[];
  revenueChart: { date: string; revenue: number; orders: number }[];
}

export type { Role, OrderStatus, PaymentMethod, PaymentStatus };
