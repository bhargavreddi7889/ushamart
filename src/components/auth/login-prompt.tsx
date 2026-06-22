"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function LoginPrompt({ message = "Please login to continue" }: { message?: string }) {
  const router = useRouter();

  function handleLogin() {
    toast.info(message);
    router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
  }

  return (
    <button onClick={handleLogin} className="text-[#006837] hover:underline">
      Login
    </button>
  );
}

export function CheckoutLoginGate() {
  return (
    <div className="rounded-xl border bg-amber-50 p-4 text-center">
      <p className="text-sm text-amber-800">
        Please{" "}
        <Link href="/login?callbackUrl=/checkout" className="font-medium underline">
          login
        </Link>{" "}
        or{" "}
        <Link href="/register" className="font-medium underline">
          sign up
        </Link>{" "}
        to place your order
      </p>
    </div>
  );
}
