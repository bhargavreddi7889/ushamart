"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  image: string;
  link?: string | null;
}

export function HeroSlider({ banners }: { banners: Banner[] }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  if (banners.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#006837] to-[#008844] px-4 py-6 text-white md:py-3">
        <h2 className="text-base font-bold md:text-base">EVERYONE GETS WHOLESALE PRICES</h2>
        <p className="mt-1 text-xs opacity-90 md:mt-0.5 md:text-xs">No Middlemen - Wholesale Prices For Everyone</p>
        <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-0.5 text-xs font-medium md:mt-1.5">
          FREE DELIVERY on orders above ₹499
        </span>
      </div>
    );
  }

  const banner = banners[current];
  const content = (
    <div className="relative h-[170px] overflow-hidden rounded-xl sm:h-[185px] md:h-[105px] lg:h-[115px]">
      <Image
        src={banner.image}
        alt={banner.title}
        fill
        className="object-cover"
        priority
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent" />
      <div className="absolute bottom-0 left-0 p-3 text-white sm:p-4 md:p-2.5">
        <h2 className="text-sm font-bold sm:text-base md:text-sm">{banner.title}</h2>
        {banner.subtitle && (
          <p className="mt-0.5 text-xs opacity-90 sm:text-sm md:text-[11px]">{banner.subtitle}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="relative">
      {banner.link ? <Link href={banner.link}>{content}</Link> : content}

      {banners.length > 1 && (
        <>
          <button
            onClick={() => setCurrent((prev) => (prev - 1 + banners.length) % banners.length)}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrent((prev) => (prev + 1) % banners.length)}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1 shadow"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
            {banners.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? "w-5 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
