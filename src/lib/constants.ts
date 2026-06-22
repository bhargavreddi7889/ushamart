export const BRAND = {
  name: "USHA MART WHOLESALE",
  tagline: "No Middlemen - Wholesale Prices For Everyone",
  logo: "/logo.png.jpeg",
  colors: {
    green: "#006837",
    orange: "#F37021",
    navy: "#001F5C",
  },
} as const;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PACKED: "Packed",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_FLOW = [
  "PENDING",
  "CONFIRMED",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
] as const;

export const PRODUCTS_PER_PAGE = 12;
export const LOW_STOCK_DEFAULT = 10;
export const CART_SESSION_COOKIE = "usha_cart_session";
export const LOCATION_COOKIE = "usha_delivery_location";

export const DELIVERY_LOCATIONS = [
  "Anywhere in India",
  "Hyderabad & Secunderabad",
  "Telangana",
  "Andhra Pradesh",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
  "Delhi NCR",
  "Other States",
] as const;

export const DEFAULT_DELIVERY_LOCATION = "Anywhere in India";

export const STORE_ADVANTAGES = [
  {
    title: "Wholesale Prices for Everyone",
    description: "Direct wholesale pricing without middlemen",
    icon: "badge",
  },
  {
    title: "Fast & Reliable Delivery",
    description: "Pan-India delivery to your doorstep",
    icon: "truck",
  },
  {
    title: "Best Quality Products",
    description: "Curated products from trusted brands",
    icon: "shield",
  },
  {
    title: "100% Secure Payments",
    description: "Safe COD and UPI payment options",
    icon: "lock",
  },
] as const;
