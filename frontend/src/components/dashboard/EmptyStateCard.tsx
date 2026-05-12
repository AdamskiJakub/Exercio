'use client';

import { LucideIcon } from 'lucide-react';

interface EmptyStateCardProps {
  icon: LucideIcon;
  iconColor?: string;
  title: string;
  description: string;
}

export function EmptyStateCard({
  icon: Icon,
  iconColor = 'text-slate-600',
  title,
  description,
}: EmptyStateCardProps) {
  return (
    <div className="text-center py-8">
      <Icon className={`w-12 h-12 ${iconColor} mx-auto mb-3`} />
      <p className="text-slate-400 mb-2">{title}</p>
      <p className="text-sm text-slate-500">{description}</p>
    </div>
  );
}
