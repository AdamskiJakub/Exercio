import { ReactNode } from "react";
import { Link } from "@/i18n/routing";
import { DumbbellIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthHeaderProps {
  /** Main title */
  title: string;
  /** Subtitle/description */
  subtitle: string;
  /** Optional icon to display above title */
  icon?: ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Header component for authentication pages
 * Always centered with Exercio logo, title, and subtitle
 *
 * @example
 * // Login page
 * <AuthHeader
 *   title="Zaloguj się"
 *   subtitle="Zaloguj się do swojego konta"
 * />
 *
 * @example
 * // Verify email (with icon)
 * <AuthHeader
 *   title="Potwierdź swój email"
 *   subtitle="Wysłaliśmy 6-cyfrowy kod na Twój adres email"
 *   icon={<Mail className="w-8 h-8 text-orange-500" />}
 * />
 */
export function AuthHeader({
  title,
  subtitle,
  icon,
  className,
}: AuthHeaderProps) {
  return (
    <div className={cn("text-center mb-10", className)}>
      {/* Logo */}
      <Link
        href="/"
        className="inline-flex items-center gap-3 mb-6"
        aria-label="Exercio home"
      >
        <DumbbellIcon
          className="w-12 h-12 text-orange-500"
          aria-hidden="true"
        />
        <h1 className="text-6xl font-bold bg-linear-to-r from-orange-400 via-orange-500 to-red-500 bg-clip-text text-transparent cursor-pointer hover:opacity-90 transition-opacity">
          Exercio
        </h1>
      </Link>

      {/* Optional Icon */}
      {icon && (
        <div className="flex items-center justify-center mb-6">
          <div className="bg-orange-500/10 p-5 rounded-full border border-orange-500/50">
            {icon}
          </div>
        </div>
      )}

      {/* Title */}
      <p className="text-2xl text-slate-100 font-semibold mt-3">{title}</p>

      {/* Subtitle */}
      <p className="text-base text-slate-300 mt-3">{subtitle}</p>
    </div>
  );
}
