"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  ShoppingCart,
  User,
  Bell,
  Home,
  LayoutGrid,
  Package,
  LogOut,
  Shield,
  ChevronDown,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { SearchBar } from "@/components/search/search-bar";
import { LocationPicker } from "@/components/location/location-picker";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";
import { logoutUser } from "@/actions/auth";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/products", label: "Products", icon: Package },
  { href: "/categories", label: "Categories", icon: LayoutGrid },
  { href: "/orders", label: "Orders", icon: Package },
];

interface NavbarProps {
  user: {
    name: string;
    email: string;
    role: string;
  } | null;
  unreadCount: number;
  deliveryLocation: string;
}

export function Navbar({ user, unreadCount, deliveryLocation }: NavbarProps) {
  const pathname = usePathname();
  const { summary } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white shadow-sm">
      {/* ── MOBILE: reference-style compact header ── */}
      <div className="md:hidden">
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            type="button"
            className="shrink-0 rounded-lg p-2 hover:bg-gray-100"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-gray-700" />
          </button>

          <div className="flex flex-1 justify-center">
            <Logo size="sm" highlight href="/" />
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {user && (
              <Link href="/account?tab=notifications" className="relative rounded-lg p-2">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Link>
            )}
            <Link href="/cart" className="relative rounded-lg p-2">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              {summary.itemCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                  {summary.itemCount > 9 ? "9+" : summary.itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-50 px-3 py-1.5">
          <LocationPicker initialLocation={deliveryLocation} />
        </div>

        <div className="border-t border-gray-50 px-3 py-2">
          <SearchBar />
        </div>
      </div>

      {/* ── DESKTOP: compact header with logo left ── */}
      <div className="hidden md:block">
        <div className="border-b border-green-100/60 bg-gradient-to-r from-green-50/50 via-white to-orange-50/20">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-1">
            <LocationPicker initialLocation={deliveryLocation} />
            <p className="text-xs font-semibold text-[#006837]">
              Wholesale Prices — Delivered Anywhere
            </p>
          </div>
        </div>

        <div className="border-b border-gray-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-1">
            <Logo size="lg" highlight href="/" align="left" className="shrink-0" />

            <nav className="flex flex-1 items-center justify-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "rounded-lg px-4 py-2 text-sm font-bold transition-all duration-300",
                    isActive(link.href)
                      ? "bg-[#006837] text-white shadow-sm"
                      : "text-gray-600 hover:bg-green-50 hover:text-[#006837]"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-1.5">
              {user && (
                <Link
                  href="/account?tab=notifications"
                  className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              )}
              <Link
                href="/cart"
                className="relative rounded-lg p-2 text-gray-600 hover:bg-green-50 hover:text-[#006837]"
              >
                <ShoppingCart className="h-5 w-5" />
                {summary.itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F37021] px-1 text-[10px] font-bold text-white">
                    {summary.itemCount > 99 ? "99+" : summary.itemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setAccountOpen(!accountOpen)}
                    className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm font-semibold hover:border-[#006837]/30"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#006837] text-[10px] font-bold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="max-w-[72px] truncate">{user.name.split(" ")[0]}</span>
                    <ChevronDown className={cn("h-3.5 w-3.5 text-gray-400", accountOpen && "rotate-180")} />
                  </button>
                  {accountOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setAccountOpen(false)} />
                      <div className="absolute right-0 top-full z-50 mt-1 w-52 rounded-xl border bg-white py-1 shadow-xl">
                        <Link href="/account" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <User className="h-4 w-4" /> Account
                        </Link>
                        <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                          <Package className="h-4 w-4" /> Orders
                        </Link>
                        {user.role === "ADMIN" && (
                          <Link href="/admin" className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50">
                            <Shield className="h-4 w-4" /> Admin
                          </Link>
                        )}
                        <form action={logoutUser} className="border-t">
                          <button type="submit" className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <LogOut className="h-4 w-4" /> Logout
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-bold text-[#006837] hover:bg-green-50">
                    Sign In
                  </Link>
                  <Link href="/register" className="rounded-lg bg-[#006837] px-3 py-1.5 text-sm font-bold text-white">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-b bg-gray-50/40 px-4 py-1.5">
          <div className="mx-auto max-w-2xl">
            <SearchBar />
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="animate-slide-in-right absolute left-0 top-0 flex h-full w-[min(100vw-3rem,300px)] flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b p-3">
              <Logo size="sm" highlight href="/" />
              <button type="button" onClick={() => setMobileOpen(false)} className="rounded-lg p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold",
                      isActive(link.href) ? "bg-[#006837] text-white" : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {link.label}
                  </Link>
                );
              })}
              <Link href="/account" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100">
                <User className="h-5 w-5" /> Account
              </Link>
            </nav>
            <div className="border-t p-3">
              {user ? (
                <form action={logoutUser}>
                  <button type="submit" className="w-full rounded-xl border border-red-200 py-2.5 text-sm font-semibold text-red-600">
                    Logout
                  </button>
                </form>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link href="/login" className="rounded-xl bg-[#006837] py-2.5 text-center text-sm font-semibold text-white">
                    Sign In
                  </Link>
                  <Link href="/register" className="rounded-xl border py-2.5 text-center text-sm font-semibold text-[#006837]">
                    Create Account
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
