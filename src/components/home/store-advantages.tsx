import { BadgeCheck, Truck, ShieldCheck, Lock } from "lucide-react";
import { STORE_ADVANTAGES } from "@/lib/constants";

const icons = {
  badge: BadgeCheck,
  truck: Truck,
  shield: ShieldCheck,
  lock: Lock,
};

export function StoreAdvantages() {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {STORE_ADVANTAGES.map((item) => {
          const Icon = icons[item.icon as keyof typeof icons];
          return (
            <div key={item.title} className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
                <Icon className="h-6 w-6 text-[#006837]" />
              </div>
              <h3 className="text-xs font-semibold text-gray-900 sm:text-sm">{item.title}</h3>
              <p className="mt-0.5 text-[10px] text-gray-500 sm:text-xs">{item.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
