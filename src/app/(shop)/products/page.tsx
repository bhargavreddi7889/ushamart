import { getProducts, getCategories, getBrands } from "@/actions/products";
import { ProductCard } from "@/components/products/product-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = { title: "Products" };

interface ProductsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const [{ products, total, page, totalPages }, categories, brands] = await Promise.all([
    getProducts(params),
    getCategories(),
    getBrands(),
  ]);

  const buildUrl = (updates: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { ...params, ...updates };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) p.set(k, v);
    });
    return `/products?${p.toString()}`;
  };

  return (
    <div className="py-6">
      <h1 className="mb-6 text-2xl font-bold">
        {params.search ? `Results for "${params.search}"` : "All Products"}
      </h1>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-56">
          <div className="space-y-6 rounded-xl border bg-white p-4">
            <div>
              <h3 className="mb-2 font-semibold">Categories</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link href={buildUrl({ category: undefined, page: "1" })} className="text-gray-600 hover:text-[#006837]">
                    All
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={buildUrl({ category: c.slug, page: "1" })}
                      className={params.category === c.slug ? "font-medium text-[#006837]" : "text-gray-600 hover:text-[#006837]"}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Brands</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link href={buildUrl({ brand: undefined, page: "1" })} className="text-gray-600 hover:text-[#006837]">
                    All
                  </Link>
                </li>
                {brands.map((b) => (
                  <li key={b.id}>
                    <Link
                      href={buildUrl({ brand: b.slug, page: "1" })}
                      className={params.brand === b.slug ? "font-medium text-[#006837]" : "text-gray-600 hover:text-[#006837]"}
                    >
                      {b.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-semibold">Sort By</h3>
              <ul className="space-y-1 text-sm">
                {[
                  { label: "Latest", value: "latest" },
                  { label: "Price: Low to High", value: "price_asc" },
                  { label: "Price: High to Low", value: "price_desc" },
                  { label: "Best Selling", value: "best_selling" },
                ].map((s) => (
                  <li key={s.value}>
                    <Link
                      href={buildUrl({ sort: s.value, page: "1" })}
                      className={params.sort === s.value ? "font-medium text-[#006837]" : "text-gray-600 hover:text-[#006837]"}
                    >
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <Link
                href={buildUrl({ inStock: "true", page: "1" })}
                className={params.inStock === "true" ? "text-sm font-medium text-[#006837]" : "text-sm text-gray-600"}
              >
                In Stock Only
              </Link>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <p className="mb-4 text-sm text-gray-500">{total} products found</p>

          {products.length === 0 ? (
            <div className="rounded-xl border bg-white p-12 text-center">
              <p className="text-gray-500">No products found</p>
              <Link href="/products">
                <Button className="mt-4">Browse All Products</Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-8 flex justify-center gap-2">
                  {page > 1 && (
                    <Link href={buildUrl({ page: String(page - 1) })}>
                      <Button variant="outline">Previous</Button>
                    </Link>
                  )}
                  <span className="flex items-center px-4 text-sm">
                    Page {page} of {totalPages}
                  </span>
                  {page < totalPages && (
                    <Link href={buildUrl({ page: String(page + 1) })}>
                      <Button variant="outline">Next</Button>
                    </Link>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
