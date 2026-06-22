import { cookies } from "next/headers";
import { CART_SESSION_COOKIE } from "@/lib/constants";
import { db } from "@/lib/db";
import { randomUUID } from "crypto";

export async function getCartSessionId(): Promise<string> {
  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;

  if (!sessionId) {
    sessionId = randomUUID();
    cookieStore.set(CART_SESSION_COOKIE, sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });
  }

  return sessionId;
}

export async function getOrCreateCart(userId?: string | null) {
  const sessionId = userId ? undefined : await getCartSessionId();

  if (userId) {
    let cart = await db.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: { category: true, brand: true },
            },
          },
        },
      },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: {
                include: { category: true, brand: true },
              },
            },
          },
        },
      });
    }

    return cart;
  }

  let cart = await db.cart.findUnique({
    where: { sessionId: sessionId! },
    include: {
      items: {
        include: {
          product: {
            include: { category: true, brand: true },
          },
        },
      },
    },
  });

  if (!cart) {
    cart = await db.cart.create({
      data: { sessionId: sessionId! },
      include: {
        items: {
          include: {
            product: {
              include: { category: true, brand: true },
            },
          },
        },
      },
    });
  }

  return cart;
}

export async function mergeGuestCartToUser(userId: string) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(CART_SESSION_COOKIE)?.value;
  if (!sessionId) return;

  const guestCart = await db.cart.findUnique({
    where: { sessionId },
    include: { items: true },
  });

  if (!guestCart || guestCart.items.length === 0) return;

  const userCart = await getOrCreateCart(userId);

  for (const item of guestCart.items) {
    const existing = userCart.items.find((i) => i.productId === item.productId);
    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
    } else {
      await db.cartItem.create({
        data: {
          cartId: userCart.id,
          productId: item.productId,
          quantity: item.quantity,
        },
      });
    }
  }

  await db.cart.delete({ where: { id: guestCart.id } });
  cookieStore.delete(CART_SESSION_COOKIE);
}
