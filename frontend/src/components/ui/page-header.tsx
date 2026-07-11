import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PageHeaderVariant =
  | "gradient-orange"
  | "gradient-full"
  | "white-accent"
  | "white";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: PageHeaderVariant;
  align?: "left" | "center";
  className?: string;
  showBlur?: boolean;
}

/**
 * Unified page header component for all main pages
 *
 * @example
 * // Listing page (center, gradient)
 * <PageHeader
 *   title="Przeglądaj Trenerów"
 *   subtitle="Znajdź idealnego trenera dla siebie"
 *   variant="gradient-orange"
 *   align="center"
 *   showBlur
 * />
 *
 * @example
 * // Availability page (left, with icon)
 * <PageHeader
 *   title="Dostępność"
 *   subtitle="Zarządzaj swoją dostępnością i godzinami pracy"
 *   icon={<Calendar className="w-8 h-8" />}
 *   variant="white"
 *   align="left"
 * />
 *
 * @example
 * // Profile page (center, partial gradient)
 * <PageHeader
 *   title="Profil Instruktora"
 *   subtitle="Jakub Adamski"
 *   variant="gradient-orange"
 *   align="center"
 * />
 */
export function PageHeader({
  title,
  subtitle,
  icon,
  variant = "gradient-orange",
  align = "left",
  className,
  showBlur = false,
}: PageHeaderProps) {
  const variantStyles = {
    "gradient-orange":
      "bg-linear-to-r from-orange-500 via-red-500 to-orange-600 bg-clip-text text-transparent",
    "gradient-full":
      "bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent",
    "white-accent": "text-white",
    white: "text-white",
  };

  const alignStyles = {
    left: "text-left",
    center: "text-center",
  };

  const containerAlign = {
    left: "",
    center: "mx-auto max-w-3xl",
  };

  // With icon - horizontal layout (like Availability page)
  if (icon) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded-lg shrink-0">{icon}</div>
          <div>
            <h1
              className={cn("text-4xl font-bold mb-2", variantStyles[variant])}
            >
              {title}
            </h1>
            {subtitle && <p className="text-slate-400 text-base">{subtitle}</p>}
          </div>
        </div>
      </div>
    );
  }

  // Center aligned with optional blur (like Listing page)
  if (align === "center" && showBlur) {
    return (
      <div className={cn("relative mb-8 text-center", className)}>
        <div className="absolute inset-0 bg-linear-to-r from-orange-500/10 via-red-500/10 to-orange-500/10 blur-3xl -z-10" />
        <div className={containerAlign[align]}>
          <h1
            className={cn(
              "text-4xl md:text-5xl font-bold mb-3",
              variantStyles[variant],
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-slate-400 text-lg md:text-xl">{subtitle}</p>
          )}
        </div>
      </div>
    );
  }

  // Standard layout
  return (
    <div
      className={cn(
        "space-y-3",
        alignStyles[align],
        containerAlign[align],
        className,
      )}
    >
      <h1
        className={cn("text-4xl md:text-5xl font-bold", variantStyles[variant])}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-slate-400 text-lg md:text-xl">{subtitle}</p>
      )}
    </div>
  );
}
