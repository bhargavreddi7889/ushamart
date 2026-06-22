import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/constants";
import { cn } from "@/lib/utils";

type LogoSize = "sm" | "md" | "lg" | "xl";

const sizeMap: Record<LogoSize, { width: number; height: number; padding: string }> = {
  sm: { width: 140, height: 52, padding: "p-1" },
  md: { width: 200, height: 72, padding: "p-1.5" },
  lg: { width: 240, height: 96, padding: "p-2" },
  xl: { width: 300, height: 120, padding: "p-2.5" },
};

interface LogoProps {
  size?: LogoSize;
  className?: string;
  href?: string;
  highlight?: boolean;
  align?: "left" | "center";
}

export function Logo({
  size = "md",
  className = "",
  href = "/",
  highlight = false,
  align = "center",
}: LogoProps) {
  const dims = sizeMap[size];

  const content = (
    <div
      className={cn(
        "relative inline-flex items-center justify-center transition-transform duration-300 hover:scale-[1.02]",
        highlight &&
          "rounded-2xl bg-gradient-to-b from-white to-green-50/80 shadow-lg shadow-green-900/10 ring-2 ring-[#006837]/10",
        highlight && dims.padding,
        className
      )}
    >
      <Image
        src={BRAND.logo}
        alt={BRAND.name}
        width={dims.width}
        height={dims.height}
        className="h-auto w-auto max-w-full object-contain"
        style={{ maxHeight: dims.height }}
        priority={size === "lg" || size === "xl"}
      />
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn("inline-flex", align === "left" ? "justify-start" : "justify-center", className)}
      >
        {content}
      </Link>
    );
  }

  return content;
}
