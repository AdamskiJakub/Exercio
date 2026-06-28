"use client";

import type { ReactNode, ComponentProps } from "react";
import { Link } from "@/i18n/routing";

interface NavItemProps {
  href: ComponentProps<typeof Link>["href"];
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "dropdown" | "sheet";
  className?: string;
}

export function NavItem({
  href,
  icon,
  label,
  onClick,
  variant = "dropdown",
  className = "",
}: NavItemProps) {
  if (variant === "sheet") {
    return (
      <Link
        href={href}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 text-slate-200 hover:bg-slate-800 hover:text-white rounded-lg transition-colors ${className}`}
      >
        <span className="h-5 w-5 text-slate-400 flex items-center">{icon}</span>
        <span className="font-medium">{label}</span>
      </Link>
    );
  }

  return (
    <Link href={href} className={`flex items-center gap-2 ${className}`}>
      <span className="text-slate-400 flex items-center">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}
