'use client';

import { Link } from '@/i18n/routing';
import { BottomNavBarProps } from '@/types/bottom-nav';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';


export function BottomNavBar({ backText, backHref, actionButton }: BottomNavBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-800/95 backdrop-blur-sm border-t border-slate-700 p-4 z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        {/* Back Button */}
        <Link
          href={backHref}
          className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          <motion.div
            initial={{ x: 0 }}
            whileHover={{ x: -4 }}
            transition={{ duration: 0.2 }}
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.div>
          {backText}
        </Link>

        {/* Optional Action Button */}
        {actionButton && (
          <button
            onClick={actionButton.onClick}
            disabled={actionButton.disabled}
            className={`px-8 py-3 rounded-lg transition-colors flex items-center gap-2 font-semibold disabled:opacity-50 disabled:cursor-not-allowed ${
              actionButton.variant === 'secondary'
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
            }`}
          >
            {actionButton.text}
          </button>
        )}
      </div>
    </div>
  );
}
