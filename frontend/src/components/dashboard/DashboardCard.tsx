"use client";

import { motion } from "framer-motion";
import { cardVariants } from "@/lib/animations";
import { DashboardCardProps } from "@/types/dashboard";

export function DashboardCard({
  icon: Icon,
  iconColor = "text-emerald-400",
  iconBgColor,
  title,
  children,
  delay = 0,
  className = "",
  hoverable = true,
  hoverColor = "hover:border-emerald-500",
}: DashboardCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      className={`bg-slate-800/50 backdrop-blur-sm border border-slate-700 ${
        hoverable ? hoverColor : ""
      } rounded-xl p-6 transition-colors duration-300 flex flex-col ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        {Icon && (
          <div
            className={`p-2 ${iconBgColor || "bg-emerald-500/10"} rounded-lg`}
          >
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>
      <div className="flex-1 flex flex-col">{children}</div>
    </motion.div>
  );
}
