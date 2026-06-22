"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, ChevronDown, Check } from "lucide-react";
import { DELIVERY_LOCATIONS } from "@/lib/constants";
import { setDeliveryLocation } from "@/actions/location";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function LocationPicker({ initialLocation }: { initialLocation: string }) {
  const [location, setLocation] = useState(initialLocation);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocation(initialLocation);
  }, [initialLocation]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSelect(loc: string) {
    setLocation(loc);
    setOpen(false);
    const result = await setDeliveryLocation(loc);
    if (result.success) toast.success("Delivery location updated");
    else toast.error(result.error);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 rounded-xl bg-green-50/80 px-3 py-2 text-left transition-colors hover:bg-green-50 sm:w-auto"
      >
        <MapPin className="h-4 w-4 shrink-0 text-[#006837]" />
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
            Deliver to
          </p>
          <p className="truncate text-sm font-semibold text-gray-800">{location}</p>
        </div>
        <ChevronDown
          className={cn("h-4 w-4 shrink-0 text-gray-400 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-xl border bg-white py-1 shadow-xl sm:left-0 sm:right-auto sm:min-w-[280px]">
          {DELIVERY_LOCATIONS.map((loc) => (
            <button
              key={loc}
              type="button"
              onClick={() => handleSelect(loc)}
              className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-green-50"
            >
              <span className={location === loc ? "font-semibold text-[#006837]" : "text-gray-700"}>
                {loc}
              </span>
              {location === loc && <Check className="h-4 w-4 text-[#006837]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
