"use client";

import type { ReactNode } from "react";

interface NotificationItemProps {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

export function NotificationItem({
  icon,
  title,
  description,
  onClick,
}: NotificationItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      className="px-4 py-3 hover:bg-slate-800/50 transition-colors border-b border-slate-700/50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 focus-visible:ring-inset"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={title}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 p-1.5 rounded-full shrink-0">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white truncate">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
    </div>
  );
}
