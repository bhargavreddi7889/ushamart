import { getAdminBanners, deleteBanner } from "@/actions/admin/promotions";
import { BannerForm } from "@/components/admin/banner-form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export const metadata = { title: "Manage Banners" };

export default async function AdminBannersPage() {
  const banners = await getAdminBanners();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Banners</h1>
      <BannerForm />

      <div className="grid gap-4 sm:grid-cols-2">
        {banners.map((banner) => (
          <div key={banner.id} className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <div className="relative aspect-[2.5/1] sm:aspect-[3/1]">
              <Image src={banner.image} alt={banner.title} fill className="object-cover" />
            </div>
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold">{banner.title}</p>
                {banner.subtitle && <p className="text-sm text-gray-500">{banner.subtitle}</p>}
                <p className="text-xs text-gray-400">Order: {banner.sortOrder}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={banner.isActive ? "default" : "destructive"}>
                  {banner.isActive ? "Active" : "Inactive"}
                </Badge>
                <form
                  action={async () => {
                    await deleteBanner(banner.id);
                  }}
                >
                  <Button type="submit" variant="ghost" size="sm" className="text-red-600">
                    Delete
                  </Button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
