'use client';

import { motion } from 'framer-motion';
import { cardVariants } from '@/lib/animations';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  value: string | number;
  subtitle: string;
  delay?: number;
}

export function StatsCard({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  value,
  subtitle,
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      custom={delay}
      className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 hover:border-orange-500 rounded-xl p-6 cursor-pointer transition-colors duration-300"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 ${iconBgColor} rounded-lg`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </motion.div>
  );
}
