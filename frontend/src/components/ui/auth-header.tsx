import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  /** Main title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Optional icon to display above title */
  icon?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Header component for authentication pages
 * Always centered with title and optional subtitle
 */
export function AuthHeader({
  title,
  subtitle,
  icon,
  className,
}: AuthHeaderProps) {
  return (
    <div className={cn("text-center mb-10", className)}>
      {/* Optional Icon */}
      {icon && (
        <div className="flex items-center justify-center mb-6">
          <div className="bg-orange-500/10 p-5 rounded-full border border-orange-500/50">
            {icon}
          </div>
        </div>
      )}

      {/* Title */}
      <p className="text-2xl text-slate-100 font-semibold">{title}</p>

      {/* Subtitle */}
      {subtitle && <p className="text-base text-slate-300 mt-3">{subtitle}</p>}
    </div>
  );
}
