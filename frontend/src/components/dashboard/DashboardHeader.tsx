"use client";

import { motion } from "framer-motion";
import { titleVariants } from "@/lib/animations";
import { ReactNode } from "react";

interface ActionLink {
  href: string;
  icon: ReactNode;
  label: string;
  className?: string;
}

interface DashboardHeaderProps {
  greeting: string;
  subtitle: string;
  actionLinks: ActionLink[];
  avatarUrl?: string | null;
}

export function DashboardHeader({
  greeting,
  subtitle,
  actionLinks,
  avatarUrl,
}: DashboardHeaderProps) {
  return (
    <div className="text-center space-y-6 py-8">
      {avatarUrl && (
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <img
            src={avatarUrl}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-slate-700 shadow-2xl"
          />
        </motion.div>
      )}
      <div className="space-y-3">
        <motion.h1
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          className="text-5xl md:text-6xl font-bold text-gradient-trainly"
        >
          {greeting}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto"
        >
          {subtitle}
        </motion.p>
      </div>
      <motion.div
        className="flex flex-wrap items-center justify-center gap-3 pt-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        {actionLinks.map((link, index) => (
          <a
            key={index}
            href={link.href}
            className={
              link.className ||
              "px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all hover:scale-105 flex items-center gap-2 font-medium shadow-lg"
            }
          >
            {link.icon}
            {link.label}
          </a>
        ))}
      </motion.div>
    </div>
  );
}
