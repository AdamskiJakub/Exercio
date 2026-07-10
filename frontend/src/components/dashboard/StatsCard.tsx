"use client";

import { motion } from "framer-motion";
import { cardVariants } from "@/lib/animations";
import { LucideIcon } from "lucide-react";
import { Link } from "@/i18n/routing";

interface StatsCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string | number;
  subtitle: string;
  delay?: number;
  href?: string;
  onClick?: () => void;
  hoverColor?: string;
}

export function StatsCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  value,
  subtitle,
  delay = 0,
  href,
  onClick,
  hoverColor = "hover:border-emerald-500",
}: StatsCardProps) {
  const content = (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${hoverColor} rounded-xl p-6 cursor-pointer transition-colors duration-300`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${iconBgColor} rounded-lg`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-white mb-1.5">{value}</p>
      <p className="text-sm text-slate-400">{subtitle}</p>
    </motion.div>
  );

  if (href) {
    return <Link href={href as any}>{content}</Link>;
  }

  return content;
}
