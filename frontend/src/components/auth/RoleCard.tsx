import { ReactNode, ElementType } from "react";
import { Link } from "@/i18n/routing";

interface RoleCardFeature {
  text: string;
  accentColor: string;
}

interface RoleCardProps {
  href: string;
  ariaLabel: string;
  icon: ElementType;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  features: RoleCardFeature[];
  buttonText: string;
  hoverBorderColor: string;
  buttonGradient: string;
  buttonHoverGradient: string;
  hoverShadowColor?: string;
  badge?: string;
  badgeColor?: string;
  badgeBgColor?: string;
  children?: ReactNode;
}

export function RoleCard({
  href,
  ariaLabel,
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  description,
  features,
  buttonText,
  hoverBorderColor,
  buttonGradient,
  buttonHoverGradient,
  hoverShadowColor,
  badge,
  badgeColor,
  badgeBgColor,
  children,
}: RoleCardProps) {
  return (
    <Link
      href={href as any}
      aria-label={ariaLabel}
      className="group block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-xl"
    >
      <div
        className={`rounded-xl border-2 border-slate-700 p-8 transition-all duration-300 ${hoverBorderColor} ${hoverShadowColor || "hover:shadow-xl"} bg-slate-800/50 backdrop-blur-sm h-full flex flex-col relative`}
        role="button"
        tabIndex={-1}
      >
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center w-16 h-16 rounded-xl ${iconBgColor} mb-4`}
            aria-hidden="true"
          >
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>

          {badge && (
            <div className="mb-3">
              <span
                className={`inline-block text-xs font-medium ${badgeColor || "text-slate-400"} ${badgeBgColor || "bg-slate-800"} border border-slate-700/50 px-2.5 py-0.5 rounded-full`}
              >
                {badge}
              </span>
            </div>
          )}

          <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
          <p className="text-slate-300 mb-6">{description}</p>
        </div>

        {features.length > 0 && (
          <ul className="space-y-3 mb-8 flex-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span
                  className={`${feature.accentColor} mr-2 shrink-0 mt-0.5`}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <span className="text-slate-300">{feature.text}</span>
              </li>
            ))}
          </ul>
        )}

        <div
          className={`w-full bg-linear-to-r ${buttonGradient} text-white py-3 px-4 rounded-md font-medium transition-all duration-300 ${buttonHoverGradient} cursor-pointer text-center shadow-lg`}
        >
          {buttonText}
        </div>

        {children}
      </div>
    </Link>
  );
}
