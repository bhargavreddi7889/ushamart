"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SingleImageUpload } from "@/components/admin/image-upload";
import { createBanner } from "@/actions/admin/promotions";
import { toast } from "sonner";

export function BannerForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [form, setForm] = useState({ title: "", subtitle: "", link: "", sortOrder: "0" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!image) {
      toast.error("Please upload a banner image");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("title", form.title);
    formData.set("subtitle", form.subtitle);
    formData.set("image", image);
    formData.set("link", form.link);
    formData.set("sortOrder", form.sortOrder);
    formData.set("isActive", "true");

    const result = await createBanner(formData);
    setLoading(false);

    if (result.success) {
      toast.success("Banner created");
      setForm({ title: "", subtitle: "", link: "", sortOrder: "0" });
      setImage("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Banner</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input
            placeholder="Banner Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Input
            placeholder="Subtitle"
            value={form.subtitle}
            onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
          />
          <Input
            placeholder="Link URL (optional)"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
            className="sm:col-span-2"
          />
          <Input
            type="number"
            placeholder="Sort Order"
            value={form.sortOrder}
            onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          />
          <div className="sm:col-span-2">
            <SingleImageUpload
              value={image}
              onChange={setImage}
              folder="usha-mart/banners"
              label="Banner Image *"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading || !image}>
              {loading ? "Uploading..." : "Create Banner"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
