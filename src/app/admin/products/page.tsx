import Link from "next/link";
import Image from "next/image";
import { getAdminProducts } from "@/actions/admin/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Plus } from "lucide-react";

export const metadata = { title: "Manage Products" };

export default async function AdminProductsPage() {
  const products = await getAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Link href="/admin/products/new">
          <Button><Plus className="h-4 w-4" /> Add Product</Button>
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">SKU</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    {product.images[0] && (
                      <div className="relative h-10 w-10 overflow-hidden rounded">
                        <Image src={product.images[0]} alt="" fill className="object-cover" />
                      </div>
                    )}
                    <span className="font-medium">{product.name}</span>
                  </div>
                </td>
                <td className="p-3 text-gray-500">{product.sku}</td>
                <td className="p-3">{product.category.name}</td>
                <td className="p-3">{formatPrice(product.sellingPrice)}</td>
                <td className="p-3">
                  <span className={product.stock < 10 ? "text-red-600 font-medium" : ""}>
                    {product.stock}
                  </span>
                </td>
                <td className="p-3">
                  <Badge variant={product.isActive ? "default" : "destructive"}>
                    {product.isActive ? "Active" : "Disabled"}
                  </Badge>
                </td>
                <td className="p-3">
                  <Link href={`/admin/products/${product.id}`} className="text-[#006837] hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
