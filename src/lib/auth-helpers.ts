import { auth } from "@/auth";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/account");
  }
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== Role.ADMIN) {
    redirect("/login?callbackUrl=/admin");
  }
  return user;
}

export async function requireCustomer() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  if (user.role === Role.ADMIN) {
    redirect("/admin");
  }
  return user;
}
