"use client";

import { Link } from "@/i18n/routing";
import { BottomNavBarProps } from "@/types/bottom-nav";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BottomNavBar({
  backText,
  backHref,
  backOnClick,
  actionButton,
}: BottomNavBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-slate-700 bg-slate-900/98 backdrop-blur-sm shadow-2xl">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center items-stretch">
          {/* Back Button */}
          {backOnClick ? (
            <Button
              variant="outline-slate"
              size="xl"
              onClick={backOnClick}
              className="flex-1 sm:flex-none sm:min-w-50 cursor-pointer"
            >
              <ArrowLeft className="size-4 sm:size-5 mr-1.5 sm:mr-2 shrink-0" />
              <span className="truncate">{backText}</span>
            </Button>
          ) : (
            <Button
              variant="outline-slate"
              size="xl"
              asChild
              className="flex-1 sm:flex-none sm:min-w-50 cursor-pointer"
            >
              <Link href={backHref as any}>
                <ArrowLeft className="size-4 sm:size-5 mr-1.5 sm:mr-2 shrink-0" />
                <span className="truncate">{backText}</span>
              </Link>
            </Button>
          )}

          {/* Optional Action Button */}
          {actionButton && (
            <Button
              type={actionButton.type || "button"}
              form={actionButton.form}
              onClick={actionButton.onClick}
              disabled={actionButton.disabled}
              variant={
                actionButton.variant === "secondary"
                  ? "secondary"
                  : actionButton.variant === "enterprise"
                    ? "default"
                    : "primary"
              }
              size="xl"
              className={`flex-1 sm:flex-none sm:min-w-50 cursor-pointer ${
                actionButton.variant === "enterprise"
                  ? "bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/20"
                  : ""
              }`}
            >
              {actionButton.icon && (
                <span className="mr-1.5 sm:mr-2 shrink-0">
                  {actionButton.icon}
                </span>
              )}
              <span className="truncate">{actionButton.text}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
