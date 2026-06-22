"use server";

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { signIn, signOut } from "@/auth";
import { mergeGuestCartToUser } from "@/lib/cart-session";
import type { ActionResult } from "@/types";
import { AuthError } from "next-auth";

export async function registerUser(
  formData: FormData
): Promise<ActionResult<{ role: string }>> {
  try {
    const raw = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = registerSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const existing = await db.user.findUnique({
      where: { email: parsed.data.email },
    });
    if (existing) {
      return { success: false, error: "Email already registered" };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.password, 12);

    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        password: hashedPassword,
      },
    });

    await mergeGuestCartToUser(user.id);

    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });

    return { success: true, data: { role: user.role }, message: "Account created successfully" };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, error: "Failed to create account" };
  }
}

export async function loginUser(
  formData: FormData
): Promise<ActionResult<{ role: string }>> {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { success: false, error: "Invalid email or password" };
    }

    const user = await db.user.findUnique({ where: { email } });
    if (user) {
      await mergeGuestCartToUser(user.id);
      return { success: true, data: { role: user.role } };
    }

    return { success: false, error: "Login failed" };
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: "Invalid email or password" };
    }
    console.error("Login error:", error);
    return { success: false, error: "Login failed" };
  }
}

export async function logoutUser(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

export async function updateProfile(
  formData: FormData
): Promise<ActionResult> {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;

    await db.user.update({
      where: { id: session.user.id },
      data: { name, phone: phone || null },
    });

    return { success: true, message: "Profile updated" };
  } catch (error) {
    console.error("Update profile error:", error);
    return { success: false, error: "Failed to update profile" };
  }
}

export async function createAddress(
  formData: FormData
): Promise<ActionResult<{ id: string }>> {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const { addressSchema } = await import("@/lib/validations/auth");
    const raw = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      pincode: formData.get("pincode") as string,
      isDefault: formData.get("isDefault") === "true",
    };

    const parsed = addressSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    if (parsed.data.isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const address = await db.address.create({
      data: {
        ...parsed.data,
        userId: session.user.id,
      },
    });

    return { success: true, data: { id: address.id }, message: "Address saved" };
  } catch (error) {
    console.error("Create address error:", error);
    return { success: false, error: "Failed to save address" };
  }
}

export async function deleteAddress(addressId: string): Promise<ActionResult> {
  try {
    const { auth } = await import("@/auth");
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    await db.address.deleteMany({
      where: { id: addressId, userId: session.user.id },
    });

    return { success: true, message: "Address deleted" };
  } catch (error) {
    return { success: false, error: "Failed to delete address" };
  }
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  try {
    const { auth } = await import("@/auth");
    const { changePasswordSchema } = await import("@/lib/validations/auth");
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: "Unauthorized" };
    }

    const raw = {
      currentPassword: formData.get("currentPassword") as string,
      newPassword: formData.get("newPassword") as string,
      confirmPassword: formData.get("confirmPassword") as string,
    };

    const parsed = changePasswordSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
    }

    const user = await db.user.findUnique({ where: { id: session.user.id } });
    if (!user) return { success: false, error: "User not found" };

    const isValid = await bcrypt.compare(parsed.data.currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    const hashedPassword = await bcrypt.hash(parsed.data.newPassword, 12);
    await db.user.update({
      where: { id: session.user.id },
      data: { password: hashedPassword },
    });

    return { success: true, message: "Password changed successfully" };
  } catch (error) {
    console.error("Change password error:", error);
    return { success: false, error: "Failed to change password" };
  }
}
