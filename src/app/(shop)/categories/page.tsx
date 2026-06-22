import { getCategories } from "@/actions/products";
import Link from "next/link";
import Image from "next/image";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="py-6">
      <h1 className="mb-6 text-2xl font-bold">All Categories</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="flex flex-col items-center rounded-xl border bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="relative mb-3 h-20 w-20 overflow-hidden rounded-xl bg-gray-50">
              {cat.image ? (
                <Image src={cat.image} alt={cat.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-3xl">📦</div>
              )}
            </div>
            <h3 className="text-center font-medium">{cat.name}</h3>
            <p className="text-xs text-gray-500">{cat._count.products} products</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
