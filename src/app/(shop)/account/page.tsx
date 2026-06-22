import { redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { getUserNotifications } from "@/actions/admin/management";
import { getDeliveryLocation } from "@/actions/location";
import { AccountClient } from "@/components/account/account-client";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  const [addresses, notifications, deliveryLocation] = await Promise.all([
    db.address.findMany({
      where: { userId: session.user.id },
      orderBy: { isDefault: "desc" },
    }),
    getUserNotifications(),
    getDeliveryLocation(),
  ]);

  return (
    <Suspense fallback={<div className="py-12 text-center">Loading account...</div>}>
      <AccountClient
        user={{
          name: session.user.name || "",
          email: session.user.email || "",
          phone: session.user.phone,
        }}
        deliveryLocation={deliveryLocation}
        addresses={addresses}
        notifications={notifications.map((n) => ({
          ...n,
          createdAt: n.createdAt.toISOString(),
        }))}
      />
    </Suspense>
  );
}
