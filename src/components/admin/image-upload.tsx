"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxImages?: number;
  folder?: string;
  label?: string;
}

async function uploadFile(file: File, folder?: string): Promise<string | null> {
  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const res = await fetch("/api/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ file: base64, folder }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url;
}

export function ImageUpload({
  value,
  onChange,
  maxImages = 5,
  folder = "usha-mart/products",
  label = "Product Images",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
      if (!fileArray.length) {
        toast.error("Please select image files only");
        return;
      }

      if (value.length + fileArray.length > maxImages) {
        toast.error(`Maximum ${maxImages} images allowed`);
        return;
      }

      setUploading(true);
      try {
        const newUrls: string[] = [];
        for (const file of fileArray) {
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`${file.name} is too large (max 5MB)`);
            continue;
          }
          const url = await uploadFile(file, folder);
          if (url) newUrls.push(url);
        }
        if (newUrls.length) {
          onChange([...value, ...newUrls]);
          toast.success(`${newUrls.length} image(s) uploaded to Cloudinary`);
        }
      } catch {
        toast.error("Upload failed. Check Cloudinary credentials.");
      } finally {
        setUploading(false);
      }
    },
    [value, onChange, maxImages, folder]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-semibold text-gray-700">{label}</label>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {value.map((url, i) => (
            <div
              key={`${url}-${i}`}
              className="group relative h-24 w-24 overflow-hidden rounded-xl border-2 border-gray-100 shadow-sm sm:h-28 sm:w-28"
            >
              <Image src={url} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 rounded-full bg-red-500 p-1 text-white opacity-0 shadow transition-opacity group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length < maxImages && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all",
            dragOver
              ? "border-[#006837] bg-green-50"
              : "border-gray-200 bg-gray-50/50 hover:border-[#006837]/50 hover:bg-green-50/30",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          <input
            type="file"
            accept="image/*"
            multiple={maxImages > 1}
            disabled={uploading}
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(e) => e.target.files && processFiles(e.target.files)}
          />
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-[#006837]" />
              <p className="mt-2 text-sm font-medium text-gray-600">Uploading to Cloudinary...</p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#006837]/10">
                <Upload className="h-6 w-6 text-[#006837]" />
              </div>
              <p className="mt-3 text-sm font-semibold text-gray-700">
                Drag & drop images here
              </p>
              <p className="mt-1 text-xs text-gray-500">or click to browse · PNG, JPG up to 5MB</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export function SingleImageUpload({
  value,
  onChange,
  folder = "usha-mart/categories",
  label = "Image",
}: {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}) {
  return (
    <ImageUpload
      value={value ? [value] : []}
      onChange={(urls) => onChange(urls[0] || "")}
      maxImages={1}
      folder={folder}
      label={label}
    />
  );
}

export function ImageUploadPlaceholder() {
  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
      <ImageIcon className="h-8 w-8 text-gray-300" />
    </div>
  );
}
