"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import { titleVariants, fadeInUp } from "@/lib/animations";

interface NotFoundContentProps {
  title?: string;
  description?: string;
  goHome?: string;
  browseTrainers?: string;
}

export function NotFoundContent({
  title = "Page not found",
  description = "The page you are looking for does not exist or has been moved.",
  goHome = "Go home",
  browseTrainers = "Browse trainers",
}: NotFoundContentProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-100 bg-orange-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative text-center px-4 md:px-6">
          {/* Error code */}
          <motion.div
            variants={titleVariants}
            initial="hidden"
            animate="visible"
          >
            <h1 className="text-8xl md:text-9xl font-bold bg-linear-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-4">
              404
            </h1>
          </motion.div>

          {/* Title */}
          <motion.h2
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-2xl md:text-3xl font-bold text-white mb-3"
          >
            {title}
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-slate-400 text-sm md:text-base max-w-md mx-auto mb-8 leading-relaxed"
          >
            {description}
          </motion.p>

          {/* Actions */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button variant="primary" size="xl" asChild>
              <Link href="/">
                <Home className="size-4" />
                {goHome}
              </Link>
            </Button>
            <Button variant="outline-slate" size="xl" asChild>
              <Link href="/instructors">
                <ArrowRight className="size-4" />
                {browseTrainers}
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
