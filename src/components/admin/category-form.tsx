"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SingleImageUpload } from "@/components/admin/image-upload";
import { createCategory } from "@/actions/admin/categories";
import { toast } from "sonner";

export function CategoryForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState("");
  const [form, setForm] = useState({ name: "", slug: "", sortOrder: "0" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.set("name", form.name);
    if (form.slug) formData.set("slug", form.slug);
    if (image) formData.set("image", image);
    formData.set("sortOrder", form.sortOrder);
    formData.set("isActive", "true");

    const result = await createCategory(formData);
    setLoading(false);

    if (result.success) {
      toast.success("Category created");
      setForm({ name: "", slug: "", sortOrder: "0" });
      setImage("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Add Category</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input
            placeholder="Category Name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            placeholder="Slug (optional)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
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
              folder="usha-mart/categories"
              label="Category Image"
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
