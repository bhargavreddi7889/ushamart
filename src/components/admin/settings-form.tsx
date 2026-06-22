"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettings } from "@/actions/admin/management";
import { toast } from "sonner";

interface SettingsFormProps {
  settings: {
    storeName: string;
    tagline: string;
    contactPhone: string | null;
    whatsappNumber: string | null;
    storeAddress: string | null;
    businessHours: string | null;
    deliveryCharge: number;
    freeDeliveryThreshold: number;
    lowStockThreshold: number;
    showFeatured: boolean;
    showPopular: boolean;
    showDeals: boolean;
    showNewArrivals: boolean;
    showBestSelling: boolean;
    showCategories: boolean;
    showBanners: boolean;
    showAdvantages: boolean;
  };
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    ...settings,
    contactPhone: settings.contactPhone || "",
    whatsappNumber: settings.whatsappNumber || "",
    storeAddress: settings.storeAddress || "",
    businessHours: settings.businessHours || "",
    deliveryCharge: settings.deliveryCharge.toString(),
    freeDeliveryThreshold: settings.freeDeliveryThreshold.toString(),
    lowStockThreshold: settings.lowStockThreshold.toString(),
  });

  const sectionToggles = [
    { key: "showBanners", label: "Banners" },
    { key: "showCategories", label: "Categories" },
    { key: "showFeatured", label: "Featured Products" },
    { key: "showPopular", label: "Popular Products" },
    { key: "showDeals", label: "Deals of the Day" },
    { key: "showNewArrivals", label: "New Arrivals" },
    { key: "showBestSelling", label: "Best Selling" },
    { key: "showAdvantages", label: "Store Advantages" },
  ] as const;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (typeof v === "boolean") formData.set(k, String(v));
      else formData.set(k, v as string);
    });

    const result = await updateSettings(formData);
    setLoading(false);

    if (result.success) {
      toast.success("Settings saved");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Store Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} placeholder="Store Name" />
          <Input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} placeholder="Tagline" />
          <Input value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} placeholder="Contact Phone" />
          <Input value={form.whatsappNumber} onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })} placeholder="WhatsApp Number" />
          <div className="sm:col-span-2">
            <Textarea value={form.storeAddress} onChange={(e) => setForm({ ...form, storeAddress: e.target.value })} placeholder="Store Address" />
          </div>
          <Input value={form.businessHours} onChange={(e) => setForm({ ...form, businessHours: e.target.value })} placeholder="Business Hours" className="sm:col-span-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Delivery & Inventory</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Input type="number" value={form.deliveryCharge} onChange={(e) => setForm({ ...form, deliveryCharge: e.target.value })} placeholder="Delivery Charge" />
          <Input type="number" value={form.freeDeliveryThreshold} onChange={(e) => setForm({ ...form, freeDeliveryThreshold: e.target.value })} placeholder="Free Delivery Threshold" />
          <Input type="number" value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} placeholder="Low Stock Threshold" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Homepage Sections</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {sectionToggles.map((t) => (
              <label key={t.key} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form[t.key]}
                  onChange={(e) => setForm({ ...form, [t.key]: e.target.checked })}
                />
                {t.label}
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </form>
  );
}
