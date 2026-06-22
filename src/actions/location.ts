"use server";

import { cookies } from "next/headers";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { LOCATION_COOKIE, DEFAULT_DELIVERY_LOCATION } from "@/lib/constants";
import type { ActionResult } from "@/types";

export async function getDeliveryLocation(): Promise<string> {
  const session = await auth();

  if (session?.user?.id) {
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { deliveryLocation: true },
    });
    if (user?.deliveryLocation) return user.deliveryLocation;
  }

  const cookieStore = await cookies();
  return cookieStore.get(LOCATION_COOKIE)?.value || DEFAULT_DELIVERY_LOCATION;
}

export async function setDeliveryLocation(location: string): Promise<ActionResult> {
  try {
    const cookieStore = await cookies();
    cookieStore.set(LOCATION_COOKIE, location, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });

    const session = await auth();
    if (session?.user?.id) {
      await db.user.update({
        where: { id: session.user.id },
        data: { deliveryLocation: location },
      });
    }

    return { success: true, message: "Location updated" };
  } catch {
    return { success: false, error: "Failed to update location" };
  }
}
