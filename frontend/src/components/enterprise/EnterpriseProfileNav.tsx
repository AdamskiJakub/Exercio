"use client";

import {
  Info,
  Sparkles,
  Building2,
  DollarSign,
  Image as ImageIcon,
  Users,
  Calendar,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface EnterpriseProfileNavProps {
  items: NavItem[];
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function EnterpriseProfileNav({
  items,
  activeSection,
  onNavigate,
}: EnterpriseProfileNavProps) {
  return (
    <div className="sticky top-0 z-30 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-8">
        <nav className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-none">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? "true" : undefined}
                aria-label={item.label}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? "bg-emerald-600/20 text-emerald-400"
                    : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                }`}
              >
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
