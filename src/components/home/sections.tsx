import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";

interface ProductSectionProps {
  title: string;
  products: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    mrp: number;
    sellingPrice: number;
    discountPercentage: number;
    stock: number;
  }[];
  viewAllHref?: string;
}

export function ProductSection({ title, products, viewAllHref }: ProductSectionProps) {
  if (products.length === 0) return null;

  return (
    <section className="py-2 sm:py-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-bold text-gray-900 sm:text-xl">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[#006837] hover:underline sm:text-sm"
          >
            View All <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <div key={product.id} className="relative">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}

interface CategoryGridProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  }[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  if (categories.length === 0) return null;

  return (
    <section className="py-2 sm:py-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-gray-900 sm:text-xl">Shop by Category</h2>
        <Link href="/categories" className="text-xs font-semibold text-[#006837] sm:text-sm">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3 md:grid-cols-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/products?category=${cat.slug}`}
            className="group category-card-hover flex flex-col items-center rounded-2xl border border-gray-100 bg-white p-2.5 sm:p-4"
          >
            <div className="relative mb-2 h-14 w-14 overflow-hidden rounded-xl bg-gray-50 sm:h-16 sm:w-16">
              {cat.image ? (
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-2xl">📦</div>
              )}
            </div>
            <span className="line-clamp-2 text-center text-[10px] font-semibold text-gray-700 sm:text-xs">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
