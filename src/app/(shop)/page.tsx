import { HeroSlider } from "@/components/home/hero-slider";
import { CategoryGrid, ProductSection } from "@/components/home/sections";
import { StoreAdvantages } from "@/components/home/store-advantages";
import { getHomepageData } from "@/actions/products";

export const revalidate = 60;

export default async function HomePage() {
  const data = await getHomepageData();

  return (
    <div className="space-y-4 py-2 sm:space-y-5 sm:py-3">
      {data.settings.showBanners && <HeroSlider banners={data.banners} />}
      {data.settings.showCategories && <CategoryGrid categories={data.categories} />}

      {data.settings.showDeals && (
        <ProductSection
          title="Deals of the Day"
          products={data.deals}
          viewAllHref="/products?sort=best_selling"
        />
      )}

      {data.settings.showPopular && (
        <ProductSection
          title="Popular Products"
          products={data.popular}
          viewAllHref="/products?sort=best_selling"
        />
      )}

      {data.settings.showFeatured && (
        <ProductSection title="Featured Products" products={data.featured} viewAllHref="/products" />
      )}

      {data.settings.showNewArrivals && (
        <ProductSection title="New Arrivals" products={data.newArrivals} viewAllHref="/products?sort=latest" />
      )}

      {data.settings.showBestSelling && (
        <ProductSection
          title="Best Selling"
          products={data.bestSelling}
          viewAllHref="/products?sort=best_selling"
        />
      )}

      {data.settings.showAdvantages && <StoreAdvantages />}
    </div>
  );
}
