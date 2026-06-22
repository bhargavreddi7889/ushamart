"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import type { ActionResult } from "@/types";

interface AdminCrudFormProps {
  title: string;
  fields: {
    name: string;
    label: string;
    type?: string;
    required?: boolean;
  }[];
  onSubmit: (formData: FormData) => Promise<ActionResult>;
  initialData?: Record<string, string>;
}

export function AdminCrudForm({ title, fields, onSubmit, initialData }: AdminCrudFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const result = await onSubmit(formData);
    setLoading(false);

    if (result.success) {
      toast.success(result.message || "Saved");
      router.refresh();
      if (!initialData) (e.target as HTMLFormElement).reset();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="mb-4 font-semibold">{title}</h3>
        <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2">
          {fields.map((field) => (
            <Input
              key={field.name}
              name={field.name}
              type={field.type || "text"}
              placeholder={field.label}
              defaultValue={initialData?.[field.name] || ""}
              required={field.required}
            />
          ))}
          <div className="sm:col-span-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
