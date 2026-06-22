"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  updateProfile,
  createAddress,
  deleteAddress,
  logoutUser,
  changePassword,
} from "@/actions/auth";
import { LocationPicker } from "@/components/location/location-picker";
import { DELIVERY_LOCATIONS } from "@/lib/constants";
import { toast } from "sonner";
import { User, MapPin, Package, Bell, LogOut, Lock, Navigation } from "lucide-react";

interface AccountClientProps {
  user: { name: string; email: string; phone?: string | null };
  deliveryLocation: string;
  addresses: {
    id: string;
    name: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    isDefault: boolean;
  }[];
  notifications: {
    id: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    link?: string | null;
  }[];
}

type Tab = "profile" | "security" | "location" | "addresses" | "notifications";

export function AccountClient({
  user,
  deliveryLocation,
  addresses,
  notifications,
}: AccountClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get("tab") as Tab) || "profile";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [profile, setProfile] = useState({ name: user.name, phone: user.phone || "" });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressForm, setAddressForm] = useState({
    name: user.name,
    phone: user.phone || "",
    address: "",
    city: "Hyderabad",
    state: "Telangana",
    pincode: "",
  });

  useEffect(() => {
    const t = searchParams.get("tab") as Tab;
    if (t) setTab(t);
  }, [searchParams]);

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("name", profile.name);
    formData.set("phone", profile.phone);
    const result = await updateProfile(formData);
    if (result.success) toast.success("Profile updated");
    else toast.error(result.error);
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(passwords).forEach(([k, v]) => formData.set(k, v));
    const result = await changePassword(formData);
    if (result.success) {
      toast.success("Password changed successfully");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      toast.error(result.error);
    }
  }

  async function handleAddressCreate(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    Object.entries(addressForm).forEach(([k, v]) => formData.set(k, v));
    formData.set("isDefault", "false");
    const result = await createAddress(formData);
    if (result.success) {
      toast.success("Address saved");
      setShowAddressForm(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDeleteAddress(id: string) {
    const result = await deleteAddress(id);
    if (result.success) {
      toast.success("Address deleted");
      router.refresh();
    }
  }

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Password", icon: Lock },
    { id: "location", label: "Location", icon: Navigation },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "notifications", label: "Alerts", icon: Bell },
  ];

  return (
    <div className="py-4 sm:py-6">
      <h1 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl">My Account</h1>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold sm:px-4 sm:text-sm ${
                tab === t.id ? "bg-[#006837] text-white shadow-md" : "bg-gray-100 text-gray-600"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
        <Link
          href="/orders"
          className="flex shrink-0 items-center gap-2 rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 sm:px-4 sm:text-sm"
        >
          <Package className="h-4 w-4" />
          Orders
        </Link>
      </div>

      {tab === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="max-w-md space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input value={user.email} disabled className="mt-1 bg-gray-50" />
              </div>
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Mobile Number</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="mt-1"
                  placeholder="10-digit mobile"
                />
              </div>
              <Button type="submit">Save Changes</Button>
            </form>
            <form action={logoutUser} className="mt-6">
              <Button type="submit" variant="outline" className="text-red-600">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === "security" && (
        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="max-w-md space-y-4">
              <div>
                <label className="text-sm font-medium">Current Password</label>
                <Input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">New Password</label>
                <Input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                  className="mt-1"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>
              <Button type="submit">Update Password</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {tab === "location" && (
        <Card>
          <CardHeader>
            <CardTitle>Delivery Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Choose your preferred delivery area. This is saved to your account and used across the store.
            </p>
            <LocationPicker initialLocation={deliveryLocation} />
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-gray-500">Available areas</p>
              <ul className="grid gap-1 sm:grid-cols-2">
                {DELIVERY_LOCATIONS.map((loc) => (
                  <li key={loc} className="text-sm text-gray-700">• {loc}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === "addresses" && (
        <div className="space-y-4">
          {addresses.map((addr) => (
            <Card key={addr.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold">{addr.name}</p>
                  <p className="text-sm text-gray-600">
                    {addr.address}, {addr.city}, {addr.state} - {addr.pincode}
                  </p>
                  <p className="text-sm text-gray-500">{addr.phone}</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDeleteAddress(addr.id)}>
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}

          {showAddressForm ? (
            <Card>
              <CardContent className="p-4">
                <form onSubmit={handleAddressCreate} className="grid gap-3 sm:grid-cols-2">
                  <Input placeholder="Name" value={addressForm.name} onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })} required />
                  <Input placeholder="Phone" value={addressForm.phone} onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })} required />
                  <div className="sm:col-span-2">
                    <Input placeholder="Full Address" value={addressForm.address} onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })} required />
                  </div>
                  <Input placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })} required />
                  <Input placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })} required />
                  <Input placeholder="Pincode" value={addressForm.pincode} onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })} required />
                  <div className="flex gap-2 sm:col-span-2">
                    <Button type="submit">Save Address</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddressForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Button variant="outline" onClick={() => setShowAddressForm(true)}>
              + Add New Address
            </Button>
          )}
        </div>
      )}

      {tab === "notifications" && (
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">No notifications yet</CardContent>
            </Card>
          ) : (
            notifications.map((n) => (
              <Card key={n.id} className={!n.isRead ? "border-[#006837]/30 bg-green-50/30" : ""}>
                <CardContent className="p-4">
                  <p className="font-semibold">{n.title}</p>
                  <p className="text-sm text-gray-600">{n.message}</p>
                  {n.link && (
                    <Link href={n.link} className="mt-1 text-sm text-[#006837] hover:underline">
                      View details
                    </Link>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
