"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X } from "lucide-react";

interface WelcomeModalProps {
  /** ISO date string of when the account was created */
  createdAt?: string;
}

const STORAGE_KEY = "exercio_welcome_modal_dismissed";

export function WelcomeModal({ createdAt }: WelcomeModalProps) {
  const t = useTranslations("Dashboard.instructor");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!createdAt) return;

    // Check if already dismissed
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed === "true") return;

    // Check sessionStorage flag set during registration
    const showWelcome = sessionStorage.getItem("showWelcomeModal");
    if (showWelcome !== "true") return;

    // Only show for accounts created within the last 7 days
    const accountAgeDays =
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAgeDays > 7) return;

    // Clear the sessionStorage flag so it only shows once
    sessionStorage.removeItem("showWelcomeModal");

    // Small delay so the dashboard loads first
    const timer = setTimeout(() => setIsOpen(true), 500);
    return () => clearTimeout(timer);
  }, [createdAt]);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-slate-800 border border-orange-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer"
              aria-label={t("close")}
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 flex items-center justify-center">
                <Gift className="w-8 h-8 text-orange-400" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white text-center mb-3">
              {t("welcomeModalTitle")}
            </h2>

            {/* Description */}
            <p className="text-slate-300 text-center leading-relaxed mb-8">
              {t("welcomeModalDescription")}
            </p>

            {/* CTA */}
            <button
              onClick={handleDismiss}
              className="w-full py-3 px-6 bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all cursor-pointer"
            >
              {t("welcomeModalCta")}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
