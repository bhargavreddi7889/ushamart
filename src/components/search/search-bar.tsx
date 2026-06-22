"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDebounce } from "@/hooks/use-debounce";
import { formatPrice } from "@/lib/utils";
import type { SearchSuggestion } from "@/types";
import Image from "next/image";
import Link from "next/link";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((res) => res.json())
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, [debouncedQuery]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  }

  function getSuggestionLink(s: SearchSuggestion) {
    if (s.type === "product") return `/products/${s.slug}`;
    if (s.type === "category") return `/products?category=${s.slug}`;
    return `/products?brand=${s.slug}`;
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search for products..."
            className="pl-10"
          />
        </div>
        <Button type="submit" className="shrink-0">
          Search
        </Button>
      </form>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-lg border bg-white shadow-lg">
          {suggestions.map((s) => (
            <Link
              key={`${s.type}-${s.id}`}
              href={getSuggestionLink(s)}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 border-b px-4 py-3 last:border-0 hover:bg-gray-50"
            >
              {s.image && (
                <Image
                  src={s.image}
                  alt={s.name}
                  width={40}
                  height={40}
                  className="rounded object-cover"
                />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{s.name}</p>
                <p className="text-xs capitalize text-gray-500">{s.type}</p>
              </div>
              {s.price && (
                <span className="text-sm font-semibold text-[#006837]">
                  {formatPrice(s.price)}
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
