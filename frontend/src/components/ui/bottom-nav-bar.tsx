'use client';

import { Link } from '@/i18n/routing';
import { BottomNavBarProps } from '@/types/bottom-nav';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';


export function BottomNavBar({ backText, backHref, backOnClick, actionButton }: BottomNavBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-slate-700 bg-slate-900/98 backdrop-blur-sm shadow-2xl">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-6xl">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4 justify-center items-stretch">
          {/* Back Button */}
          {backOnClick ? (
            <Button
              variant="outline"
              size="lg"
              onClick={backOnClick}
              className="flex-1 sm:flex-none sm:min-w-50 border-2 border-slate-600 bg-slate-800 text-white hover:bg-slate-700 hover:border-slate-500 font-semibold text-sm sm:text-base h-11 sm:h-12 py-2.5 sm:py-3"
            >
              <ArrowLeft className="size-4 sm:size-5 mr-1.5 sm:mr-2 shrink-0" />
              <span className="truncate">{backText}</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              asChild
              className="flex-1 sm:flex-none sm:min-w-50 border-2 border-slate-600 bg-slate-800 text-white hover:bg-slate-700 hover:border-slate-500 font-semibold text-sm sm:text-base h-11 sm:h-12 py-2.5 sm:py-3"
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
              type={actionButton.type || 'button'}
              form={actionButton.form}
              onClick={actionButton.onClick}
              disabled={actionButton.disabled}
              size="lg"
              className={`flex-1 sm:flex-none sm:min-w-50 font-bold text-sm sm:text-base h-11 sm:h-12 py-2.5 sm:py-3 shadow-lg ${
                actionButton.variant === 'secondary'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-linear-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-500/20'
              }`}
            >
              {actionButton.icon && <span className="mr-1.5 sm:mr-2 shrink-0">{actionButton.icon}</span>}
              <span className="truncate">{actionButton.text}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
