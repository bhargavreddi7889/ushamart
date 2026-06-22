import { auth } from "@/auth";
import { getUnreadNotificationCount } from "@/actions/admin/management";
import { getDeliveryLocation } from "@/actions/location";
import { Navbar } from "@/components/layout/navbar";

export async function Header() {
  const session = await auth();
  const [unreadCount, deliveryLocation] = await Promise.all([
    session?.user ? getUnreadNotificationCount() : Promise.resolve(0),
    getDeliveryLocation(),
  ]);

  return (
    <Navbar
      user={
        session?.user
          ? {
              name: session.user.name || "User",
              email: session.user.email || "",
              role: session.user.role,
            }
          : null
      }
      unreadCount={unreadCount}
      deliveryLocation={deliveryLocation}
    />
  );
}
