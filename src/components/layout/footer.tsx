import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { Logo } from "@/components/layout/logo";

export function Footer() {
  return (
    <footer className="mt-12 border-t bg-[#001F5C] text-white">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex justify-center">
          <Logo size="md" highlight href="/" />
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold">{BRAND.name}</h3>
            <p className="mt-2 text-sm text-gray-300">{BRAND.tagline}</p>
            <p className="mt-1 text-sm text-green-300">Delivered anywhere in India</p>
          </div>
          <div className="text-center md:text-left">
            <h4 className="font-semibold">Quick Links</h4>
            <ul className="mt-2 space-y-1 text-sm text-gray-300">
              <li><Link href="/products" className="hover:text-white">All Products</Link></li>
              <li><Link href="/categories" className="hover:text-white">Categories</Link></li>
              <li><Link href="/orders" className="hover:text-white">Track Order</Link></li>
              <li><Link href="/account" className="hover:text-white">My Account</Link></li>
            </ul>
          </div>
          <div className="text-center md:text-left">
            <h4 className="font-semibold">Contact</h4>
            <ul className="mt-2 space-y-1 text-sm text-gray-300">
              <li>Pan-India Delivery</li>
              <li>Phone: +91 98765 43210</li>
              <li>WhatsApp: +91 98765 43210</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-white/10 pt-4 text-center text-sm text-gray-400">
          © {new Date().getFullYear()} {BRAND.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
