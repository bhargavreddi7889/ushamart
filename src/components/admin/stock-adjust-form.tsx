"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adjustStock } from "@/actions/admin/management";
import { toast } from "sonner";

interface StockAdjustFormProps {
  productId: string;
  productName: string;
  currentStock: number;
}

export function StockAdjustForm({ productId, productName, currentStock }: StockAdjustFormProps) {
  const router = useRouter();
  const [change, setChange] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await adjustStock(productId, parseInt(change), reason);
    setLoading(false);

    if (result.success) {
      toast.success("Stock updated");
      setChange("");
      setReason("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-2">
      <div>
        <p className="text-sm font-medium">{productName}</p>
        <p className="text-xs text-gray-500">Current: {currentStock}</p>
      </div>
      <Input
        type="number"
        placeholder="+/- qty"
        value={change}
        onChange={(e) => setChange(e.target.value)}
        className="w-24"
        required
      />
      <Input
        placeholder="Reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-40"
        required
      />
      <Button type="submit" size="sm" disabled={loading}>Adjust</Button>
    </form>
  );
}
